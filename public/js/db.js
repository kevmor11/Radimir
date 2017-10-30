require('dotenv').load();

const mysql = require('mysql'),
      connection = mysql.createPool({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
      })

// .connect((err) => {
//     if (err) throw err;
// });

module.exports = connection;