require('dotenv').load();

const express = require('express'),
      mysql = require('mysql'),
      mkdirp = require('mkdirp'),
      fs = require('fs'),
      pool = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
      }),
      router = express.Router()

.get('/', (req, res) => {
  pool.getConnection((error, connection) => {
    if (error) throw error;
    connection.query('SELECT * FROM albums ORDER BY id DESC', (err, albums) => {
      if (err) throw err;

      if (req.session.user_id) {
        res.render('upload', { albums: albums });
      } else {
        res.redirect('login');
      }
    });
  });
})

.post('/', (req, res) => {
  pool.getConnection((error, connection) => {
    if (error) throw error;
    const album = req.body.album,
          title = req.body.title,
          description = req.body.description,
          file = req.files.image,
          fileName = file.name;

    if (!fs.existsSync(`public/uploads/${album}`)) {
      mkdirp(`public/uploads/${album}`, (err) => {
          if (err) console.error(err)
      });
    }

    // Use the mv() method to place the file somewhere on your server if it doesn't already exist
    if (!fs.existsSync(`public/uploads/${album}/${fileName}`)) {
      file.mv(`public/uploads/${album}/${fileName}`, (err) => {
        if (err) throw err;

        connection.query(`INSERT INTO images (file_name, title, description, cover, album_id) VALUES (${mysql.escape(fileName)}, ${mysql.escape(title)}, ${mysql.escape(description)}, 0, ${mysql.escape(album)})`,
          (err) => {
            if (err) throw err;
            res.redirect('/success');
          }
        );
      });
      // else if file name already exists, append a hash at the end before the file format
    } else {

      function randomString(len) {
        const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomString = '';
        for (let i = 0; i < len; i++) {
          const randomPoz = Math.floor(Math.random() * charSet.length);
          randomString += charSet.substring(randomPoz,randomPoz+1);
        }
        return randomString;
      }

      const index = fileName.lastIndexOf("."),  // Gets the last index where a period occours
            newName = [fileName.slice(0, index), randomString(5), fileName.slice(index)].join('');

      file.mv(`public/uploads/${album}/${newName}`, (err) => {
        if (err) throw err;

        connection.query(`INSERT INTO images (file_name, title, description, cover, album_id) VALUES (${mysql.escape(newName)}, ${mysql.escape(title)}, ${mysql.escape(description)}, 0, ${mysql.escape(album)})`,
          (err) => {
            if (err) throw err;
            res.redirect('/success');
          }
        );
      });
    }
  });
});

module.exports = router;