require('dotenv').load();

const express = require('express'),
      mysql = require('mysql'),
      fs = require('fs'),
      pool = mysql.createPool({
        connectionLimit : 10,
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
      }),
      router = express.Router()

.get('/', (req, res) => {
  pool.getConnection((error, connection) => {
    if (error) throw error;
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
})

.post('/', (req, res) => {
  pool.getConnection((error, connection) => {
    if (error) throw error;
    const imageID = req.body.image_id,
          fileName = req.body.image_filename,
          albumID = req.body.album_id;
    connection.query('SELECT id FROM images WHERE cover=1', (err, covers) => {
      if (err) throw err;
      covers.forEach((cover) => {
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
})

.post('/album', (req, res) => {
  pool.getConnection((error, connection) => {
    if (error) throw error;
    const albumID = req.body.album_id;
    connection.query(`DELETE FROM images WHERE album_id=${albumID}`, (err) => {
      if (err) throw err;
      connection.query(`DELETE FROM albums WHERE ID=${albumID}`, (err) => {
        if (err) throw err;
        if (fs.existsSync(`public/uploads/${albumID}`)) {
          deleteFolderRecursive(`public/uploads/${albumID}`);
        }
        res.redirect('/delete');
      });
    });
  });
});

var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

module.exports = router;
