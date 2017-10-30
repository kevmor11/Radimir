const express = require('express'),
      pool = require('../public/js/db'),
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
    connection.release();
  })
});

module.exports = router;
