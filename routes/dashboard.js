const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");
dbConfig = require("../config/db-config");
oracledb.autoCommit = true;

//Routes
router.get("/", (req, res) => {
  if (req.session.user) {
    let name = req.session.user;
    res.render("dashboard", { content: "main", name: name });
  } else {
    let errors = [];
    errors.push({ msg: "please login first" });
    res.render("index", {
      errors
    });
  }
});

router.get("/loadnotes/", (req, res) => {
  if (req.session.user) {
    let name = req.session.user;
    loadNotes(name, res);
  } else {
    let errors = [];
    errors.push({ msg: "please login first" });
    res.render("index", {
      errors
    });
  }
});

router.post("/savenotes/", (req, res) => {
  if (req.session.user) {
    const { notes } = req.body;
    let name = req.session.user;

    saveNotes(name, notes, res);
  } else {
    let errors = [];
    errors.push({ msg: "please login first" });
    res.render("index", {
      errors
    });
  }
});

module.exports = router;

//notes function
async function loadNotes(name, res) {
  try {
    connection = await oracledb.getConnection(dbConfig);
    let resultNotes = await connection.execute(
      `SELECT notes
          FROM users WHERE username=:name`,
      [name],
      { outFormat: oracledb.OUT_FORMAT_ARRAY }
    );
    if (resultNotes.rows[0][0] != null) {
      notes = resultNotes.rows[0][0];
      res.render("dashboard", {
        content: "loadnotes",
        name: name,
        notes: notes
      });
    } else {
      notes = "NO NOTES ADDED";
      res.render("dashboard", {
        content: "loadnotes",
        name: name,
        notes: notes
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
async function saveNotes(name, notes, res) {
  let errors = [];
  try {
    connection = await oracledb.getConnection(dbConfig);
    let resultNotesSave = await connection.execute(
      `UPDATE USERS 
        SET  
        notes=:notes
        WHERE username=:name`,
      {
        notes,
        name
      }
    );

    if (resultNotesSave.rowsAffected) {
      errors.push({ msg: "notes saved" });
      res.render("dashboard", { content: "main", name: name, errors });
    } else {
      errors.push({ msg: "error occured" });
      res.render("dashboard", { content: "main", name: name, errors });
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
