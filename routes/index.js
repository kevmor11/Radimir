const express = require('express'),
      pool = require('../public/js/db'),
      router = express.Router()

.get("/", (req, res) => {
  let start = 0;
  // Pagination function tied to AJAX call on frontend
  const x = Number(req.query.start);
  if(x) start = x;
  console.log("X", start);

  pool.getConnection((error, connection) => {
    if (error) throw error;
    connection.query(`SELECT * FROM albums ORDER BY id DESC LIMIT 6 OFFSET ${connection.escape(start)}`, (err, albums) => {
      if (err) throw err;
      const albumIDs = albums.map((album) => album.id);
      connection.query('SELECT * FROM images WHERE album_id IN (?)', [albumIDs], (err, images) => {
        if (err) throw err;
        connection.query('SELECT * FROM images WHERE cover=1 AND album_id IN (?) ORDER BY album_id DESC', [albumIDs], (err, covers) => {
          if (err) throw err;
          res.render('index', {
            albums,
            covers,
            images,
            start
          });
        });
      });
    });
    connection.release();
  });
});

module.exports = router;
