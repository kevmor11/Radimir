var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var auth = require('basic-auth-connect');
var cookieSession = require("cookie-session");
var gm = require('gm').subClass({
  imageMagick: true
});
var bcrypt = require('bcrypt');
const fileUpload = require('express-fileupload');

var app = express();

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'radimir'
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

app.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express'
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

  var query = connection.query('SELECT username, password FROM admins WHERE id = 1', function (err, rows, fields) {
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
      console.log("SUCCESS");
      // TODO set cookie-session properly
      // TODO create logout button that destroys session cookie and redirects to Login
      req.session["user_id"] = (authenticatedUser.id);
      res.redirect("/upload");
    } else {
      console.log("FAIL");
      res.status(403).send("Woops, try again.<br><a href='/login'>Login</a>");
    }
  });

});

app.get('/upload', function (req, res, next) {
  // if (req.session.user_id) {
  res.render('upload');
  // } else {
  //   res.redirect('/upload');
  // }
});

app.post('/upload', function(req, res) {
  const album = req.body.album;
  const title = req.body.title;
  const description = req.body.description;

  const file = req.files.image;
  console.log("FILE", req.files);

  // Use the mv() method to place the file somewhere on your server
  file.mv(`public/uploads/${file.name}`, function(err) {
    if (err) {
      console.log("ERROR:", err);
      return res.status(500).send(err);
    }

    // TODO Figure out how to capture album_id foreign key
    // TODO Figure out if I need to link the database row with the file stored locally - assuming I need some correlation?
    connection.query(`INSERT INTO images (file_name, title, description, cover) VALUES (${mysql.escape(file.name)}, ${mysql.escape(title)}, ${mysql.escape(description)}, 0)`,
      function (err, result) {
        if (err) throw err;
        res.redirect('/upload');
      }
    );

    // res.send("SUCCESS<br><a href='/upload'>Return to Upload Page</a>");
  });
});

// app.get('/image.png', function (req, res) {
//     res.sendfile(path.resolve('./uploads/image.png'));
// });

app.get('/new-album', function (req, res, next) {
  res.render('new-album');
});

app.post('/new-album', function (req, res) {
  const title = req.body.title;
  const description = req.body.description;
    connection.query(`INSERT INTO albums (title, description) VALUES (${mysql.escape(title)}, ${mysql.escape(description)})`,
      function (err, result) {
        if (err) throw err;
        res.redirect('/new-album');
      }
    );
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set local  s, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;