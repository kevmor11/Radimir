var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('upload', { password: req.app.locals.password });
});

module.exports = router;
