const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host:'localhost',
    database: 'pnb',
    user:'root',
    password1:'abcd123',
});

module.exports = pool;