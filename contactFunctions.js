const validator = require('validator');
const readline = require("readline");
const fs = require('fs');
const dataPath = './data/contacts.json';


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}

if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, '[]', 'utf-8');
}

function loadContact(){
    const file = fs.readFileSync(dataPath, 'utf8');
    const contacts = JSON.parse(file);
    return contacts;
}

function isContactAlreadyExists(contacts, newContact) {
    return contacts.some(contact =>
        contact.name.toLowerCase() === newContact.name.toLowerCase() ||
        contact.hp === newContact.hp ||
        contact.email.toLowerCase() === newContact.email.toLowerCase()
    );
}
function isPhoneNumberAlreadyExists(contacts, newPhoneNumber) {
    return contacts.some(contact => contact.hp === newPhoneNumber);
}

function saveContact(name, hp, email) {
    const allowedPatterns = /^08\d{9,10}$/;

    try {
        if (!validator.matches(hp, allowedPatterns)) {
            console.log('Nomor telepon tidak valid.');
            return;
        }

        if (!validator.isEmail(email)) {
            console.log('Email tidak valid.');
            return;
        }

        // Cek email memiliki domain ".com"
        const emailParts = email.split('@');
        const domain = emailParts[1].toLowerCase(); // bagian domain email
        if (!domain.endsWith('.com')) {
            console.log('Ekstensi domain email harus .com');
            return;
        }

        const contact = { name, hp, email };
        const file = fs.readFileSync(dataPath, 'utf8');
        const contacts = JSON.parse(file);

        if (isContactAlreadyExists(contacts, contact)) {
            console.log('Kontak sudah ada dalam daftar.');
        } else if (contacts.some(existingContact => existingContact.name.toLowerCase() === name.toLowerCase())) {
            console.log('Nama kontak sudah ada dalam daftar.');
        } else {
            contacts.push(contact);
            fs.writeFileSync(dataPath, JSON.stringify(contacts)); // Menggunakan dataPath
            console.log('Kontak berhasil ditambahkan.');
        }
    } catch (err) {
        console.error('Error:', err);
    }finally {
        rl.close();
    }
}

function deleteContact(name) {
    try {
        const contacts = loadContact();
        const filteredContacts = contacts.filter(contact => contact.name.toLowerCase() !== name.toLowerCase());

        fs.writeFileSync(dataPath, JSON.stringify(filteredContacts), 'utf8');
        console.log(`${name} berhasil dihapus`);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        rl.close();
    }
}

function listContacts() {
    try {
        const contacts = loadContact();

        if (contacts.length === 0) {
            console.log('Daftar kontak kosong.');
        } else {
            console.log('Daftar Kontak:');
            contacts.forEach((contact, index) => {
                console.log(`${index + 1}. Nama: ${contact.name}`);
                console.log(`   Nomor Telepon: ${contact.hp}`);
                console.log(`   Email: ${contact.email}`);
            });
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        rl.close();
    }
}

function handleUserInput() {
    rl.question('Pilih aksi (1. Tambah kontak, 2. Hapus kontak, 3. List kontak): ', (choice) => {
        if (choice === '1') {
            rl.question('Nama: ', (name) => {
                rl.question('Nomor Telepon: ', (hp) => {
                    rl.question('Email: ', (email) => {
                        saveContact(name, hp, email);
                    });
                });
            });
        } else if (choice === '2') {
            rl.question('Pilih field untuk menghapus (name, email, hp): ', (field) => {
                rl.question('Masukkan nilai: ', (value) => {
                    deleteContact(field, value);
                });
            });
        } else if (choice === '3') {
            listContacts();
        } else {
            console.log('Pilihan tidak valid.');
            rl.close();
        }
    });
}

module.exports = { saveContact, deleteContact, listContacts, handleUserInput };

