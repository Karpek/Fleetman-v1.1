const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");
oracledb.autoCommit = true;
const bcrypt = require("bcrypt");
dbConfig = require("../config/db-config");

//Routes
router.get("/", (req, res) => {
  if (req.session.user) {
    res.render("register");
  } else {
    res.render("index");
  }
});

router.post("/", (req, res) => {
  if (req.session.user) {
    const { username, password, password2 } = req.body;
    let errors = [];
    const name = req.session.user;
    if (!username || !password || !password2) {
      errors.push({ msg: "please fill in all fields" });
    }
    if (password !== password2) {
      errors.push({ msg: "passwords do not match" });
    }
    if (password.length < 6) {
      errors.push({ msg: "password should be at least 6 characters" });
    }
    if (errors.length > 0) {
      res.render("register", {
        errors
      });
    } else {
      registerFirstStep(username, password, name, req, res);
    }
  } else {
    errors.push({ msg: "please log in first" });
    res.render("index");
  }
});

module.exports = router;

//register logic
async function registerFirstStep(username, password, name, req, res) {
  let connection;
  let errors = [];
  try {
    connection = await oracledb.getConnection(dbConfig);
    if (connection) {
    }
    let result = await connection.execute(
      `SELECT * FROM Users WHERE username=:username`,
      [username],
      { outFormat: oracledb.OBJECT }
    );
    if (result.rows.length > 0) {
      errors.push({ msg: "user with this username already exists" });
      res.render("register", {
        errors
      });
    } else {
      bcrypt.hash(req.body.password, 10, function(err, hash) {
        if (hash) {
          registerSecondStep(username, hash, res, name);
        }
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
async function registerSecondStep(username, password, res, name) {
  let connection;
  let errors = [];
  try {
    connection = await oracledb.getConnection(dbConfig);

    let result = await connection.execute(
      `INSERT INTO Users (USERNAME, PASSWORD) VALUES (:username, :password)`,
      [username, password]
    );
    if (result.rowsAffected) {
      errors.push({ msg: "user created! you can now login" });
      res.render("dashboard", {
        errors,
        name: name,
        content: "main"
      });
    } else {
      errors.push({ msg: "error occured" });
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
