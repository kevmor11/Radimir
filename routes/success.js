const express = require('express'),
      router = express.Router()

.get('/', (req, res) => {
  res.render('success');
});

module.exports = router;