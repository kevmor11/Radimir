require('dotenv').load();

const express = require('express'),
      router = express.Router(),
      mysql = require('mysql'),
      connection = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
      });

router.get("/", (req, res) => {
  connection.query('SELECT * FROM albums ORDER BY id DESC', (err, albums) => {
    if (err) throw err;
    connection.query('SELECT * FROM images', (err, images) => {
      if (err) throw err;
      connection.query('SELECT * FROM images WHERE cover=1 ORDER BY album_id DESC', (err, covers) => {
        if (err) throw err;
        res.render('index', {
          albums: albums,
          covers: covers,
          images: images
        });
      });
    });
  });
});

module.exports = router;
