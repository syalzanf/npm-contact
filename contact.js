const validator = require('validator');
const readline = require("readline");
const fs = require('fs');
const conn = require('./dbconfig');

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

async function runQuery(query, values = []) {
    return new Promise((resolve, reject) => {
      conn.query(query, values, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

async function loadContact(){
    try{
        const query = 'SELECT name, hp, email FROM contacts';

        const result = await runQuery(query);
        return result;
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

async function findContactByName(name) {
    const query = 'SELECT name, hp, email FROM contacts WHERE name = ?';
    const values = [name];
    const result = await runQuery(query, values);
    return result[0];
}
async function isContactAlreadyExists(newContact) {
    const query = 'SELECT * FROM contacts WHERE name = ? OR hp = ? OR email = ?';
    const values = [newContact.name, newContact.hp, newContact.email];
    const result = await runQuery(query, values);
    return result.length > 0;
}

async function saveContact(name, hp, email) {
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
        const domain = emailParts[1].toLowerCase();
        if (!domain.endsWith('.com')) {
            console.log('Ekstensi domain email harus .com');
            return;
        }

        // Periksa apakah kontak dengan nama yang sama sudah ada dalam database
        const existingContact = await findContactByName(name);
        if (existingContact) {
            console.log('Kontak sudah ada dalam daftar.');
            return;
        }

        const query = 'INSERT INTO contacts (name, hp, email) VALUES (?, ?, ?)';
        const values = [name, hp, email];

        // Jalankan query SQL untuk menyimpan data ke dalam database
        await runQuery(query, values);

        console.log('Kontak berhasil ditambahkan.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        rl.close();
    }
}

async function updateContact(name, updatedContact) {
    try {
        // Periksa apakah kontak dengan nama yang ingin diperbarui ada
        const existingContact = await findContactByName(name);
        if (!existingContact) {
            console.log('Kontak tidak ditemukan.');
            return false;
        }

        // Validasi nomor telepon
        if (!validator.matches(updatedContact.hp, /^08\d{9,10}$/)) {
            console.log('Nomor telepon tidak valid.');
            return false;
        }
        // Validasi alamat email
        if (!validator.isEmail(updatedContact.email)) {
            console.log('Email tidak valid.');
            return false;
        }

        // Jalankan query SQL untuk mengupdate informasi kontak
        const query = 'UPDATE contacts SET name = ?, hp = ?, email = ? WHERE name = ?';
        const values = [updatedContact.name, updatedContact.hp, updatedContact.email, name];
        const result = await runQuery(query, values);

        // Pastikan hasil update berhasil (gunakan affectedRows jika Anda menggunakan MySQL)
        if (result.affectedRows > 0) {
            console.log('Kontak berhasil diperbarui.');
            return true;
        } else {
            console.log('Kontak gagal diperbarui.');
            return false;
        }
    } catch (err) {
        console.error('Error:', err);
        return false; // Terjadi kesalahan
    }
}

async function deleteContact(name) {
    try {
        // Periksa apakah kontak dengan nama yang ingin dihapus ada
        const existingContact = await findContactByName(name);
        if (!existingContact) {
            console.log('Kontak tidak ditemukan.');
            return;
        }
        const query = 'DELETE FROM contacts WHERE name = ?';
        const values = [name];
        await runQuery(query, values);
        console.log(`Kontak dengan nama ${name} berhasil dihapus.`);
    } catch (err) {
        console.error('Error:', err);
    }
}


async function listContacts() {
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
module.exports = { 
    saveContact,
    deleteContact,
    updateContact,
    listContacts,
    loadContact,
    findContactByName,
    isContactAlreadyExists };


