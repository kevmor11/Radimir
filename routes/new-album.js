require('dotenv').load();

const express = require('express'),
      mysql = require('mysql'),
      connection = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
      }),
      router = express.Router()

.get('/', (req, res) => {
  if (req.session.user_id) {
    res.render('new-album');
  } else {
    res.redirect('login');
  }
})

.post('/', (req, res) => {
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