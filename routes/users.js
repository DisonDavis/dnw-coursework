const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("database.db");

// Display all users
router.get("/list-users", (req, res, next) => {
  const query = "SELECT * FROM users";
  db.all(query, [], function (err, rows) {
    if (err) {
      next(err);
    } else {
      res.json(rows);
    }
  });
});

// Form to add user
router.get("/add-user", (req, res) => {
  res.render("settings.ejs");
});

// Insert user
router.post("/add-user", (req, res, next) => {
  const query = "INSERT INTO users (user_name) VALUES(?)";
  const query_parameters = [req.body.user_name];

  db.run(query, query_parameters, function (err) {
    if (err) {
      next(err);
    } else {
      res.send(`New data inserted @ id ${this.lastID}!`);
    }
  });
});

module.exports = router;
