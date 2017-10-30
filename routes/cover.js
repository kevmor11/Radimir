const express = require('express'),
      pool = require('../public/js/db'),
      router = express.Router()

.get('/', (req, res) => {
  pool.getConnection((error, connection) => {
    if (error) throw error;
    if (req.session.user_id) {
      connection.query('SELECT * FROM albums ORDER BY id DESC', (err, albums) => {
        if (err) throw err;

        connection.query('SELECT * FROM images', (err, images) => {
          if (err) throw err;
          res.render('cover', {
            albums,
            images
          });
        });
      });
    } else {
      res.redirect('login');
    }
    connection.release();
  })
})

.post('/', (req, res) => {
  pool.getConnection((error, connection) => {
    if (error) throw error;
    const albumID = req.body.album,
          imageID = req.body.cover;
    connection.query(`UPDATE images SET cover=0 WHERE album_id=${albumID}`, (err) => {
      if (err) throw err;
      connection.query(`UPDATE images SET cover=1 WHERE (album_id=${albumID} AND id=${imageID})`, (err) => {
        if (err) throw err;
        connection.query(`UPDATE albums SET cover=1 WHERE id=${albumID}`, (err) => {
          if (err) throw err;
          res.redirect('/cover-success');
        });
      });
    });
    connection.release();
  });
});

module.exports = router;
