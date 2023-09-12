const { json } = require("express");
const express = require("express")
const app = express()
const fs = require('fs');
const port = 3000
const path = require('path');
const { saveContact, deleteContact, updateContact, loadContact, findContactByName} = require('./contact');
const conn = require("./dbconfig");


const options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html'],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now())
  }
}

// Direktori tampilan
app.set('view engine', 'ejs')

app.get('/', (req, res)=>{
  res.render('home',{nama:'syalza', title:`home page`})
}) 

app.get('/about', (req, res)=>{
  res.render('about',{title:`about page`})
})

// Mengonfigurasi express.static
app.use(express.static('public')); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json())


app.get('/addsync', async (req,res)=>{
  try{
    const name = "salsa"
    const mobile = "08766654543"
    const email = "mnm@gmail.com"
    const newCont = await conn.query(`SELECT * FROM contacts `)
    // console.log(newCont);
    res.json(newCont)
  } catch (err) {
    console.error(err.message)
  }
})

// Rute untuk menampilkan kontak berdasarkan nama
app.get('/detail-contact/:name', async (req, res) => {
  const contactName = req.params.name;
  try {
    const contact = await findContactByName(contactName);
    if (!contact) {
      res.status(404).send('Contact not found');
      return;
    }
   res.render('detailContact', { contact: contact, title:`details-contact page` });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Rute untuk menghapus kontak berdasarkan nama
app.post('/delete-contact/:name', async (req, res) => {
  const name = req.params.name; // Mengambil nama kontak dari permintaan POST
  await deleteContact(name); // Menghapus kontak dengan nama yang diberikan
  console.log(`Menghapus kontak dengan nama: ${name}`);
  res.redirect('/contact'); // Mengarahkan kembali ke halaman /contact
});


app.get('/contact/edit/:name', async (req, res) => {
  const contactName = req.params.name;
    const contact = await findContactByName(contactName);
    if (!contact) {
      res.status(404).send('Contact not found');
      return;
    }
    res.render('editContact', { contact: contact, title: 'Edit Contact page' });
});
  
// Rute update contact
app.post('/update-contact/:name', async (req, res) => {
  const contactName = req.params.name;
  const { name, hp, email } = req.body;
  const updatedData = { name, hp, email };  

  const success = await updateContact(contactName, updatedData);
  if (success) {
    res.redirect(`/detail-contact/${name}`);
  } else {
    res.status(404).send('Contact not found or update failed.');
  }
});

// Rute untuk halaman tambah kontak
app.get('/contact/add', async (req, res) => {
  res.render('addContact', { title: 'Add New Contact' });
});
app.post('/contact/add', async (req, res) => {
  const { name, hp, email } = req.body;
  await saveContact(name, hp, email);
  res.redirect('/contact');
});
  
// Rute untuk menampilkan semua data kontak
app.get('/contact', async (req, res) => {
  const contacts = await loadContact();
  console.log(contacts)
  res.render('contact', { 
    title:`contact page`,
    cont : contacts
  });
});


app.get('/product/:id', (req, res)=>{
  res.send(`product id : ${req.params.id} <br> category id: ${req.query.category}`)
})

// Menggunakan app.use untuk penanganan 404
app.use('/', (req, res)=>{
  res.status(404)
  res.send('page not found :404')
})
app.listen(port, () =>{
  console.log(`Example app listening on port ${port}`)
})




// const validator=require('validator');

// const readline = require("readline");
// const fs = require ('fs');
// const contactsFile = 'contacts.json';
// const allowedPatterns = /^08\d{9,10}$/;
// const func = require('./contact');
// const yargs = require("yargs");

// yargs
//   .command({
//   command:'add',
//   describe:'add new contact',
//   builder:{
//     name:{
//       describe:'Contact Name',
//       demandOption: true,
//       type:'string',
//     },
//     email:{
//       describe:'Contact Email',
//       demandOption: false,
//       type:'string',
//     },
//     hp:{
//       describe:'Contact ',
//       demandOption: true,
//       type:'string',
//     },
//   },
//   handler(argv){
//     func.saveContact(argv.name, argv.hp, argv.email)
//   },
//   })
//   .command({
//     command:'delete',
//     describe:'delete a contact',
//     builder:{
//       name:{
//         describe:'delete a contact name',
//         demandOption: true,
//         type:'string',
//       },
//     },
//     handler(argv) {
//       func.deleteContact(argv.name);
//     },
//   })
//   .command({
//     command: 'list',
//     describe: 'list all contacts',
//     handler() {
//       func.listContacts();
//     },
//   })
//   .command({
//     command: 'input',
//     describe: 'input menu',
//     handler() {
//       func.handleUserInput();
//     },
//   })
//   .parse();


// // async function main(){
// //    let name, hp, email;
    
// //      name = await func.askQuestion('Masukkan Nama Anda : ');
// //      hp = await func.askQuestion('Masukkan Nomor Anda : ');

// //     while (!validator.matches(hp, allowedPatterns)) {
// //       console.log('Nomor telepon tidak valid.');
// //       hp = await func.askQuestion('Masukkan Nomor Anda : ');
// //     }
// //     email = await func.askQuestion('Masukkan Email Anda : ');
// //     while (!validator.isEmail(email)) {
// //       console.log('Email tidak valid.');
// //       email = await func.askQuestion('Masukkan Email Anda : ');
// //     }
// //     func.saveContact(name, hp, email);
// // }
// // main();