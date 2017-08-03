var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var auth = require('basic-auth-connect');
var cookieSession = require("cookie-session");
// TODO create thumbnails of all the images (or maybe just the cover images)
var gm = require('gm').subClass({
  imageMagick: true
});
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

app.get('/', (req, res, next) => {
  connection.query('SELECT * FROM albums', (err, rows, fields) => {
    if (err) throw err;
    console.log('ROWS', rows);
    res.render('index', { albums: rows });
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

  var queryUsername = '';
  var queryPassword = '';

  var query = connection.query('SELECT username, password FROM admins WHERE id = 1', (err, rows, fields) => {
    if (err) throw err;

    queryUsername = rows[0].username;
    queryPassword = rows[0].password;

    function authenticated(username, password) {
      if (queryUsername === username && bcrypt.compareSync(password, queryPassword, 10)) {
        return true;
        // Break up the if statement into multiple if statements to be able to respond with relevant messages depending on if the email or password does not match
      }
    }

    const authenticatedUser = authenticated(req.body.username, req.body.password);

    if (authenticatedUser) {
      console.log("SUCCESS", req.body);
      req.session["user_id"] = 1;
      res.redirect("/upload");
    } else {
      console.log("FAIL");
      res.status(403).send("Woops, try again.<br><a href='/login'>Login</a>");
    }
  });

});

app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  // Give the user a message telling them they have successfully logged out
  res.redirect("/login");
});

app.get('/upload', (req, res, next) => {
  connection.query('SELECT * FROM albums', (err, rows, fields) => {
    if (err) throw err;

    if (req.session.user_id) {
      res.render('upload', { albums: rows });
    } else {
      res.redirect('login');
    }
  });
});

app.post('/upload', (req, res) => {
  const album = req.body.album;
  const title = req.body.title;
  const description = req.body.description;

  // console.log("ID", req.body);

  const file = req.files.image;

  if (!fs.existsSync(`public/uploads/${album}`)) {
    mkdirp(`public/uploads/${album}`, (err) => {
        if (err) console.error(err)
        else console.log('Directory created successfully!')
    });
  }

  // Use the mv() method to place the file somewhere on your server
  if (!fs.existsSync(`public/uploads/${album}/${file.name}`)) {
    file.mv(`public/uploads/${album}/${file.name}`, (err) => {
      if (err) {
        throw err;
        return res.status(500).send(err);
      }

      // TODO Figure out if I need to link the database row with the file stored locally - assuming I need some correlation?
      connection.query(`INSERT INTO images (file_name, title, description, cover, album_id) VALUES (${mysql.escape(file.name)}, ${mysql.escape(title)}, ${mysql.escape(description)}, 0, ${mysql.escape(album)})`,
        (err, result) => {
          if (err) throw err;

          res.redirect('/success');
        }
      );
    });
  } else {
    // TODO else if filename already exists, add an incrementing number onto the end
    file.mv(`public/uploads/${album}/${file.name}`, (err) => {
      if (err) {
        throw err;
        return res.status(500).send(err);
      }

      // TODO Figure out if I need to link the database row with the file stored locally - assuming I need some correlation?
      connection.query(`INSERT INTO images (file_name, title, description, cover, album_id) VALUES (${mysql.escape(file.name)}, ${mysql.escape(title)}, ${mysql.escape(description)}, 0, ${mysql.escape(album)})`,
        (err, result) => {
          if (err) throw err;

          res.redirect('/success');
        }
      );
    });
  }

});

app.get('/new-album', (req, res, next) => {
  if (req.session.user_id) {
    res.render('new-album');
  } else {
    res.redirect('login');
  }
});

app.post('/new-album', (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
    connection.query(`INSERT INTO albums (title, description) VALUES (${mysql.escape(title)}, ${mysql.escape(description)})`,
      (err, result) => {
        if (err) throw err;
        res.redirect('/success');
      }
    );
});

app.get('/success', (req, res) => {
  res.render('success');
});

// make photo gallery work based on my setup, not the demo setup
app.get('/albums/:album_id/photos', (req, res) => {
  res.render('albums-show');
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;