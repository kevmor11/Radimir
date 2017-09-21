const express = require('express'),
  router = express.Router(),
  bcrypt = require('bcrypt'),
  mysql = require('mysql');

const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME
});

router.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/upload");
  } else {
    res.render("login", {
      user: req.session["user_id"]
    })
  }
});

router.post("/login", (req, res) => {
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
        res.status(403).send("Woops, try again.<br><a href='/login'>Login</a>");
      }
    });
  });

module.exports = router;
