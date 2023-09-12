const http = require('http');
const fs = require('fs');
const port = 3000;
const { saveContact, deleteContact, listContacts, handleUserInput } = require('./contactFunctions');

http.createServer((req,res)=>{
    const url = req.url;
    console.log(url);

    // Fungsi untuk menyajikan halaman HTML
    function serveHtmlPage(res, filename, errorMessage) {
        fs.readFile(filename, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.write(`<h1>${errorMessage}</h1>`);
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(data);
            }
            res.end();
        });
    }

    if(url==='/about'){
        serveHtmlPage(res, 'about.html', 'Error the about page');
       } else if (url === '/contact') {
        if (req.method === 'GET') {
            fs.readFile('contact.html', 'utf8', (err, data) => {
                if (err) {
                    serveHtmlPage(res, 'contact.html', '<h1>Error the contact page</h1>');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(data);
                    res.end();
                }
            });
        } else if (req.method === 'POST') {
            // Menangani permintaan POST dari contact.html
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                const formData = new URLSearchParams(body);
                const action = formData.get('action');

                if (action === 'saveContact') {
                    const name = formData.get('name');
                    const hp = formData.get('hp');
                    const email = formData.get('email');
                    saveContact(name, hp, email);
                } else if (action === 'deleteContact') {
                    const name = formData.get('nameToDelete');
                    deleteContact(name);
                } else if (action === 'listContacts') {
                    listContacts();
                }

                // Redirect kembali ke halaman contact setelah memproses aksi
                res.writeHead(302, { 'Location': '/contact' });
                res.end();
            });
        }
    } else if (url === '/') {
        serveHtmlPage(res, 'home.html', 'Error the home page');
    } 
})
    .listen(3000, () => {
        console.log('Server is listening on port 3000');
    });
