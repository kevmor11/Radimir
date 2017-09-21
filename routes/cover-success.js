const express = require('express'),
      router = express.Router()

.get('/', (req, res) => {
  res.render('cover-success');
});

module.exports = router;
