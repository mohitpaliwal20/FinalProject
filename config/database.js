const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.HOST,  // Assuming MySQL is running locally
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

const connect = () => {
  promisePool.query('SELECT 1')
    .then(() => {
      console.log('Database connected successfully');
    })
    .catch(err => {
      console.error('Database connection failed:', err);
    });
};

module.exports = { connect };
