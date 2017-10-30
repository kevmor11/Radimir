const express = require('express'),
      mysql = require('mysql'),
      pool = require('../public/js/db'),
      router = express.Router()

.get('/', (req, res) => {
  if (req.session.user_id) {
    res.render('new-album');
  } else {
    res.redirect('login');
  }
})

.post('/', (req, res) => {
  pool.getConnection((error, connection) => {
    if (error) throw error;
    const title = req.body.title,
          description = req.body.description;
    connection.query(`INSERT INTO albums (title, description, cover) VALUES (${mysql.escape(title)}, ${mysql.escape(description)}, 0)`,
      (err) => {
        if (err) throw err;
        res.redirect('/success');
      }
    );
    connection.release();
  });
});

module.exports = router;