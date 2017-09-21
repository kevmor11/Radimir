const express = require('express'),
      router = express.Router();

router.get('/cover-success', (req, res) => {
  res.render('cover-success');
});

module.exports = router;
