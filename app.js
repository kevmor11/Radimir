var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var cookieSession = require("cookie-session");
var bcrypt = require('bcrypt');
var fileUpload = require('express-fileupload');
var mkdirp = require('mkdirp');
var fs = require('fs');
require('dotenv').config();

var app = express();

var connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// TODO get Rad to design a Favicon
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieSession({
                        name: 'session',
                        keys: ['user_id'],
                        // Cookie Options (session cookies expire after 24 hours)
                        maxAge: 24 * 60 * 60 * 1000 // 24 hours
                      }));
app.use(fileUpload());

app.get('/', (req, res) => {
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

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/upload");
  } else {
    res.render("login", {
      user: req.session["user_id"]
    })
  }
});

app.post("/login", (req, res) => {

  var query = connection.query('SELECT username, password FROM admins WHERE id = 1', (err, rows) => {
    if (err) throw err;

    var queryUsername = rows[0].username;
    var queryPassword = rows[0].password;

    function authenticated(username, password) {
      if (queryUsername === username && bcrypt.compareSync(password, queryPassword, 10)) {
        return true;
        // Break up the if statement into multiple if statements to be able to respond with relevant messages depending on if the email or password does not match
      }
    }

    const authenticatedUser = authenticated(req.body.username, req.body.password);

    if (authenticatedUser) {
      req.session["user_id"] = 1;
      res.redirect("/upload");
    } else {
      res.status(403).send("Woops, try again.<br><a href='/login'>Login</a>");
    }
  });

});

app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  // Give the user a message telling them they have successfully logged out
  res.redirect("/login");
});

app.get('/upload', (req, res) => {
  connection.query('SELECT * FROM albums ORDER BY id DESC', (err, albums) => {
    if (err) throw err;

    if (req.session.user_id) {
      res.render('upload', { albums: albums });
    } else {
      res.redirect('login');
    }
  });
});

app.post('/upload', (req, res) => {
  const album = req.body.album;
  const title = req.body.title;
  const description = req.body.description;
  const file = req.files.image;

  if (!fs.existsSync(`public/uploads/${album}`)) {
    mkdirp(`public/uploads/${album}`, (err) => {
        if (err) console.error(err)
    });
  }

  // Use the mv() method to place the file somewhere on your server
  if (!fs.existsSync(`public/uploads/${album}/${file.name}`)) {
    file.mv(`public/uploads/${album}/${file.name}`, (err) => {
      if (err) {
        throw err;
        return res.status(500).send(err);
      }

      connection.query(`INSERT INTO images (file_name, title, description, cover, album_id) VALUES (${mysql.escape(file.name)}, ${mysql.escape(title)}, ${mysql.escape(description)}, 0, ${mysql.escape(album)})`,
        (err, result) => {
          if (err) throw err;
          res.redirect('/success');
        }
      );
    });
  } else {

    function randomString(len, input) {
      var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var randomString = '';
      for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
      }
      return input + randomString;
    }

    var newName = randomString(5, file.name);

    // TODO else if filename already exists, add an hash onto the end
    // TODO use a regex check and .replace() on the filename to be able to append a random hash before the .png or .jpg and then reattach that .png or .jpg onto the end
    file.mv(`public/uploads/${album}/${newName}`, (err) => {
      if (err) {
        throw err;
        return res.status(500).send(err);
      }

      connection.query(`INSERT INTO images (file_name, title, description, cover, album_id) VALUES (${mysql.escape(newName + '1')}, ${mysql.escape(title)}, ${mysql.escape(description)}, 0, ${mysql.escape(album)})`,
        (err, result) => {
          if (err) throw err;

          res.redirect('/success');
        }
      );
    });
  }
});

app.get('/new-album', (req, res) => {
  if (req.session.user_id) {
    res.render('new-album');
  } else {
    res.redirect('login');
  }
});

app.post('/new-album', (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
    connection.query(`INSERT INTO albums (title, description, cover) VALUES (${mysql.escape(title)}, ${mysql.escape(description)}, 0)`,
      (err) => {
        if (err) throw err;
        res.redirect('/success');
      }
    );
});

app.get('/cover', (req, res) => {
  if (req.session.user_id) {
    connection.query('SELECT * FROM albums ORDER BY id DESC', (err, albums) => {
      if (err) throw err;

      connection.query('SELECT * FROM images', (err, images) => {
        if (err) throw err;
        res.render('cover', {
          albums: albums,
          images: images
        });
      });
    });
  } else {
    res.redirect('login');
  }
});

app.post('/cover', (req, res) => {
  const albumID = req.body.album;
  const imageID = req.body.cover;
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
});

// TODO figure out editing of album and image titles
// TODO figure out deleting of albums

app.get('/delete', (req, res) => {
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

app.post('/delete', (req, res) => {
  const imageID = req.body.image_id;
  const fileName = req.body.image_filename;
  const albumID = req.body.album_id;
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

app.get('/success', (req, res) => {
  res.render('success');
});

app.get('/cover-success', (req, res) => {
  res.render('cover-success');
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;