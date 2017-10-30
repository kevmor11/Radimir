require('dotenv').load();

const express = require('express'),
      mysql = require('mysql'),
      pool = mysql.createPool({
        connectionLimit : 10,
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
      }),
      router = express.Router()

.get("/", (req, res) => {
  pool.getConnection((error, connection) => {
    if (error) throw error;
    connection.query('SELECT * FROM albums ORDER BY id DESC', (err, albums) => {
      if (err) throw err;
      connection.query('SELECT * FROM images', (err, images) => {
        if (err) throw err;
        connection.query('SELECT * FROM images WHERE cover=1 ORDER BY album_id DESC', (err, covers) => {
          if (err) throw err;
          res.render('index', {
            albums,
            covers,
            images
          });
        });
      });
    });
  })
});

module.exports = router;
