const mysql = require('mysql2');

const pool = mysql.createPool({
  host: '203.146.170.155',
  user: 'zgolf4_mlm',
  password: 'mWxHMaxJM6xYJjVEN8hy',
  database: 'zgolf4_mlm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.on('connection', (connection) => {
  console.log('New connection established:', connection.threadId);
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
  process.exit(-1);
});

module.exports = pool.promise(); // Use promise-based pool