const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  database: 'contact_db',
  port: 3306
});

connection.connect((err)=> {
if (err) {
  console.error('Error connect to MySQL:', err);
return;
}
  console.log('Connect to MySQL');
});

module.exports = connection;


