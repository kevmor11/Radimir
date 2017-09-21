const express = require('express'),
      router = express.Router();

router.post("/", (req, res) => {
  req.session["user_id"] = null;
  // Give the user a message telling them they have successfully logged out
  res.redirect("/login");
});

module.exports = router;