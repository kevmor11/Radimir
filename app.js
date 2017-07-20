var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var auth = require('basic-auth-connect');
var cookieSession = require("cookie-session");

var app = express();

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'radimir'
});

// connection.query('SELECT username, password FROM admins WHERE id = 1', function(err, rows, fields) {
//     if (err) throw err;

//     var username = rows[0].username;
//     var password = rows[0].password;
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieSession({
  name: 'session',
  keys: ['user_id'],
  // Cookie Options (session cookies expire after 24 hours)
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/upload");
  } else {
    res.render("login", {user: req.session["user_id"]})
  }
});

app.post("/login", (req, res) => {

  var queryUsername = '';
  var queryPassword = '';

  connection.query('SELECT username, password FROM admins WHERE id = 1', function(err, rows, fields) {
    if (err) throw err;

    queryUsername = rows[0].username;
    queryPassword = rows[0].password;
  });

  function authenticated(username, password) {
    if (queryUsername === username && bcrypt.compareSync(password, queryPassword, 10)) {
      return;
    // Break up the if statement into multiple if statements to be able to respond with relevant messages depending on if the email or password does not match
    }
  }

  const authenticatedUser = authenticated(req.body.username, req.body.password)

  if (authenticatedUser) {
    req.session["user_id"] = (authenticatedUser.id)
    res.redirect("/upload");
  } else {
    res.status(403).send("Woops, try again.<br><a href='/register'>Sign Up</a><br><a href='/login'>Login</a>")
  }
});

app.get('/upload', function(req, res, next) {
  if (req.session.user_id) {
    res.render('upload');
  } else {
    res.redirect('/upload');
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
