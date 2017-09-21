const express = require('express'),
      router = express.Router();

router.get('/', (req, res) => {
  res.render('cover-success');
});

module.exports = router;
