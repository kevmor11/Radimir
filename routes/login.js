const express = require('express'),
      bcrypt = require('bcrypt'),
      pool = require('../public/js/db'),
      router = express.Router()

.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/upload");
  } else {
    res.render("login", {
      user: req.session["user_id"]
    })
  }
})

.post("/", (req, res) => {
  pool.getConnection((error, connection) => {
    if (error) throw error;
    connection.query('SELECT username, password FROM admins WHERE id = 1', (err, result) => {
      if (err) throw err;

      const queryUsername = result[0].username,
            queryPassword = result[0].password;

      function authenticated(username, password) {
        if (queryUsername === username && bcrypt.compareSync(password, queryPassword, 10)) {
          return true;
          // Break up the if statement into multiple if statements to be able to respond with relevant messages depending on if the email or password does not match
        }
      }

      const authenticatedUser = authenticated(req.body.username, req.body.password);

      if (authenticatedUser) {
        req.session["user_id"] = 1;
        res.redirect("/upload");
      } else {
        res.status(403).send("<div style='margin: 16em;'><h1>Woops, try again.</h1><br><a href='/login'><h1>Login</h1></a></div>");
      }
    });
    connection.release();
  });
});

module.exports = router;
