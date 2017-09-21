const express = require('express'),
router = express.Router();

router.get('/success', (req, res) => {
  res.render('success');
});

module.exports = router;