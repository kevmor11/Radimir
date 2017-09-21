require('dotenv').load();

const express = require('express'),
      router = express.Router(),
      mysql = require('mysql'),
      fs = require('fs'),
      connection = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
      });

router.get('/', (req, res) => {
  if (req.session.user_id) {
    connection.query('SELECT * FROM albums ORDER BY id DESC', (err, albums) => {
      if (err) throw err;

      connection.query('SELECT * FROM images', (err, images) => {
        if (err) throw err;
        res.render('delete', {
          albums: albums,
          images: images
        });
      });
    });
  } else {
    res.redirect('login');
  }
});

router.post('/', (req, res) => {
  const imageID = req.body.image_id,
        fileName = req.body.image_filename,
        albumID = req.body.album_id;
  connection.query('SELECT id FROM images WHERE cover=1', (err, covers) => {
    if (err) throw err;
    covers.forEach((cover, i) => {
      if (cover.id == imageID) {
        connection.query(`UPDATE albums SET cover=0 WHERE id=${albumID}`, (err) => {
          if (err) throw err;
        });
      }
    });
    connection.query(`DELETE FROM images WHERE ID=${imageID}`, (err) => {
      if (err) throw err;
      fs.unlink(`./public/uploads/${albumID}/${fileName}`, (err) => {
        if (err) throw err;
      });
    });
    res.redirect('delete');
  });
});

module.exports = router;
