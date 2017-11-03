"use strict";

// TODO change lightgallery arrow icons out for different more minimal looking icons

// TODO delete extra lightGallery .js files that I don't need (like autoplay etc)

const express = require('express'),
      path = require('path'),
      // favicon = require('serve-favicon'),
      logger = require('morgan'),
      cookieParser = require('cookie-parser'),
      bodyParser = require('body-parser'),
      cookieSession = require("cookie-session"),
      fileUpload = require('express-fileupload'),
      compression = require('compression'),

      // TODO make a new page where Rad can add upcoming art show dates
        // display only dates that have not passed yet using moment.js to determine date
      // Routes
      index = require('./routes/index'),
      login = require('./routes/login'),
      logout = require('./routes/logout'),
      cover = require('./routes/cover'),
      coverSuccess = require('./routes/cover-success'),
      deleteImage = require('./routes/delete'),
      newAlbum = require('./routes/new-album'),
      success = require('./routes/success'),
      upload = require('./routes/upload'),

   app = express()

// view engine setup
   .set('views', path.join(__dirname, 'views'))
   .set('view engine', 'ejs')

// uncomment after placing your favicon in /public
// TODO get Rad to design a Favicon
  //  .use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
   .use(logger('dev'))
   .use(bodyParser.json())
   .use(bodyParser.urlencoded({
     extended: false
   }))
   .use(cookieParser())
   .use(express.static(path.join(__dirname, 'public')))
   .use(cookieSession({
     name: 'session',
     keys: ['user_id'],
     // Cookie Options (session cookies expire after 24 hours)
     maxAge: 24 * 60 * 60 * 1000 // 24 hours
   }))
   .use(fileUpload())
   .use(compression({
    level: 9,
    memLevel: 9
}))

   .use('/', index)
   .use('/login', login)
   .use('/logout', logout)
   .use('/new-album', newAlbum)
   .use('/upload', upload)
   .use('/cover', cover)
   .use('/cover-success', coverSuccess)
   .use('/delete', deleteImage)
   .use('/success', success)

// catch 404 and forward to error handler
   .use((req, res, next) => {
     let err = new Error('Not Found');
     err.status = 404;
     next(err);
   })

// error handler
   .use((err, req, res) => {
     // set locals, only providing error in development
     res.locals.message = err.message;
     res.locals.error = req.app.get('env') === 'development' ? err : {};

     // render the error page
     res.status(err.status || 500);
     res.render('error');
   });

module.exports = app;