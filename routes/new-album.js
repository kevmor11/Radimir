const express = require('express'),
      router = express.Router(),
      mysql = require('mysql');

const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME
});

router.get('/new-album', (req, res) => {
  if (req.session.user_id) {
    res.render('new-album');
  } else {
    res.redirect('login');
  }
});

router.post('/new-album', (req, res) => {
  const title = req.body.title,
        description = req.body.description;
    connection.query(`INSERT INTO albums (title, description, cover) VALUES (${mysql.escape(title)}, ${mysql.escape(description)}, 0)`,
      (err) => {
        if (err) throw err;
        res.redirect('/success');
      }
    );
});

module.exports = router;