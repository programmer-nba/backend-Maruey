const mysql = require('mysql2');

let connection;

const handleDisconnect = () => {
  connection = mysql.createConnection({
    host: '203.146.170.155',
    user: 'zgolf4_mlm',
    password: 'mWxHMaxJM6xYJjVEN8hy',
    database: 'zgolf4_mlm'
  });
  
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      setTimeout(handleDisconnect, 2000); // Retry connection after 2 seconds
    } else {
      console.log('Connected to the MySQL database.');
    }
  });

  connection.on('error', (err) => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.');
      handleDisconnect();
    } else if (err.code === 'ECONNRESET') {
      console.error('Connection was reset.');
      handleDisconnect();
    } else {
      console.error('Database error:', err);
      throw err;
    }
  });
};

handleDisconnect();

module.exports = connection;
