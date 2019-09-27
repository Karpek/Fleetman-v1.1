const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");
const bcrypt = require("bcrypt");

//Routes
router.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("dashboard");
  } else {
    res.render("index");
  }
});

router.post("/", (req, res) => {
  const { username, password } = req.body;
  let errors = [];
  if (!username || !password) {
    errors.push({ msg: "please fill in all fields" });
  }
  if (errors.length > 0) {
    res.render("index", {
      errors
    });
  } else {
    async function logIn(username, password) {
      let connection;
      let hash;
      try {
        connection = await oracledb.getConnection(dbConfig);

        let result = await connection.execute(
          `SELECT * FROM Users WHERE username=:username`,
          [username],
          { outFormat: oracledb.OUT_FORMAT_ARRAY }
        );

        if (result.rows.length > 0) {
          hash = result.rows[0][2];
          bcrypt.compare(password, hash, (err, same) => {
            if (same) {
              req.session.user = username;
              let name = req.session.user;
              res.render("dashboard", {
                content: "main",
                name: name
              });
            } else {
              errors.push({ msg: "no such user or wrong password" });
              res.render("index", {
                errors
              });
            }
          });
        } else {
          errors.push({ msg: "no such user or wrong password" });
          res.render("index", {
            errors
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (connection) {
          try {
            await connection.close();
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
    logIn(username, password);
  }
});

module.exports = router;
