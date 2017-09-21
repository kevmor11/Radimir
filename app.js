const express = require('express'),
      path = require('path'),
      favicon = require('serve-favicon'),
      logger = require('morgan'),
      cookieParser = require('cookie-parser'),
      bodyParser = require('body-parser'),
      cookieSession = require("cookie-session"),
      fileUpload = require('express-fileupload');

const index = require('./routes/index'),
      login = require('./routes/login'),
      logout = require('./routes/logout'),
      cover = require('./routes/cover'),
      deleteImage = require('./routes/delete'),
      newAlbum = require('./routes/new-album'),
      success = require('./routes/success'),
      upload = require('./routes/upload');

const app = express();

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

app.use('/', index);
app.use('/login', login);
app.use('/logout', logout);
app.use('/new-album', newAlbum);
app.use('/upload', upload);
app.use('/cover', cover);
app.use('/delete', deleteImage);
app.use('/success', success);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
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