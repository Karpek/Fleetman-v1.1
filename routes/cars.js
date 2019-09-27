const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

//Routes
router.get("/", (req, res) => {
  if (req.session.user) {
    res.render("dashboard", { content: "manageCars" });
  } else {
    let errors = [];
    errors.push({ msg: "please login first" });
    res.render("index", {
      errors
    });
  }
});

router.get("/search", (req, res) => {
  if (req.session.user) {
    res.render("dashboard", { content: "manageCars" });
  } else {
    let errors = [];
    errors.push({ msg: "please login first" });
    res.render("index", {
      errors
    });
  }
});

router.post("/search", (req, res) => {
  if (req.session.user) {
    const { reg } = req.body;
    if (reg === "") {
      let errors = [];
      errors.push({ msg: "please fill in registration number" });
      res.render("dashboard", {
        content: "manageCars",
        errors
      });
    }
    searchCar(reg, res);
  } else {
    let errors = [];
    errors.push({ msg: "please login first" });
    res.render("index", {
      errors
    });
  }
});

router.get("/add", (req, res) => {
  if (req.session.user) {
    res.render("dashboard", { content: "carAdd" });
  } else {
    let errors = [];
    errors.push({ msg: "please login first" });
    res.render("index", {
      errors
    });
  }
});

router.post("/add", (req, res) => {
  if (req.session.user) {
    const {
      addReg,
      addMark,
      addModel,
      addFuel,
      addGearbox,
      addStatus
    } = req.body;

    if (addReg == "" || addMark == "" || addModel == "") {
      let errors = [];
      errors.push({ msg: "please fill in all fields" });
      res.render("dashboard", {
        content: "carAdd",
        errors
      });
    } else {
      addCar(addReg, addMark, addModel, addFuel, addGearbox, addStatus, res);
    }
  } else {
    let errors = [];
    errors.push({ msg: "please login first" });
    res.render("index", {
      errors
    });
  }
});

router.post("/edit/search", (req, res) => {
  if (req.session.user) {
    const { editReg } = req.body;
    if (editReg == "") {
      let errors = [];
      errors.push({ msg: "please fill in registration field" });
      res.render("dashboard", {
        content: "carAdd",
        errors
      });
    } else {
      editCarSearch(editReg, res);
    }
  } else {
    let errors = [];
    errors.push({ msg: "please login first" });
    res.render("index", {
      errors
    });
  }
});

router.post("/edit/save", (req, res) => {
  if (req.session.user) {
    vehicleData = {
      editReg,
      editMark,
      editModel,
      editFuel,
      editGearbox,
      editStatus
    } = req.body;

    if (editReg == "" || editMark == "" || editModel == "") {
      let errors = [];
      errors.push({ msg: "please fill in all fields" });
      res.render("dashboard", {
        content: "carAdd",
        errors
      });
    } else {
      editCarEdit(vehicleData, res);
    }
  } else {
    let errors = [];
    errors.push({ msg: "please login first" });
    res.render("index", {
      errors
    });
  }
});

router.get("/show", (req, res) => {
  if (req.session.user) {
    res.render("dashboard", { content: "carsShow" });
  } else {
    let errors = [];
    errors.push({ msg: "please login first" });
    res.render("index", {
      errors
    });
  }
});

router.post("/show", (req, res) => {
  if (req.session.user) {
    const { sortBy } = req.body;
    searchCarsSorted(res, sortBy);
  } else {
    let errors = [];
    errors.push({ msg: "please login first" });
    res.render("index", {
      errors
    });
  }
});

module.exports = router;

//
//
//
//
// FUNCTIONS
//
//
//
//
async function addCar(
  addReg,
  addMark,
  addModel,
  addFuel,
  addGearbox,
  addStatus,
  res
) {
  let connection;
  addReg = addReg.toUpperCase();
  addMark = addMark.toUpperCase();
  addModel = addModel.toUpperCase();
  oracledb.autoCommit = true;
  try {
    connection = await oracledb.getConnection(dbConfig);
    let resultCarSearch = await connection.execute(
      `SELECT * FROM CARS WHERE reg=:addReg`,
      [addReg],
      { outFormat: oracledb.OUT_FORMAT_ARRAY }
    );
    if (resultCarSearch.rows.length) {
      let errors = [];
      errors.push({ msg: "vehicle already exists" });
      res.render("dashboard", {
        content: "carAdd",
        errors
      });
    } else {
      let resultCarAdd = await connection.execute(
        `INSERT INTO CARS (reg, mark, model, fuel, gearbox, status) VALUES (:addReg, :addMark, :addModel, :addFuel, :addGearbox, :addStatus)`,
        [addReg, addMark, addModel, addFuel, addGearbox, addStatus],
        { outFormat: oracledb.OUT_FORMAT_ARRAY }
      );

      if (resultCarAdd.rowsAffected) {
        let errors = [];
        errors.push({ msg: "vehicle added!" });
        res.render("dashboard", {
          content: "carAdd",
          errors
        });
      } else {
        let errors = [];
        errors.push({ msg: "problem occured" });
        res.render("dashboard", {
          content: "carAdd",
          errors
        });
      }
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
async function searchCar(reg, res) {
  const vehicleData = {
    reg: "",
    mark: "",
    model: "",
    fuel: "",
    gearbox: "",
    status: "",
    vehicleID: ""
  };
  let customer;
  let connection;
  registration = reg.toUpperCase();
  try {
    connection = await oracledb.getConnection(dbConfig);
    let resultCar = await connection.execute(
      `SELECT reg, mark, model, fuel, gearbox, status, customerid, vehid
          FROM CARS WHERE reg=:reg`,
      [registration],
      { outFormat: oracledb.OUT_FORMAT_ARRAY }
    );

    if (resultCar.rows.length) {
      vehicleData.reg = resultCar.rows[0][0];
      vehicleData.mark = resultCar.rows[0][1];
      vehicleData.model = resultCar.rows[0][2];
      vehicleData.fuel = resultCar.rows[0][3];
      vehicleData.gearbox = resultCar.rows[0][4];
      vehicleData.status = resultCar.rows[0][5];
      let customerID = resultCar.rows[0][6];
      vehicleData.vehicleID = resultCar.rows[0][7];
      if (customerID === null) {
        customer = false;
        res.render("dashboard", {
          content: "carSearchExecute",
          vehicleData,
          customer
        });
      } else {
        let resultCustomer = await connection.execute(
          `SELECT name, surname, email, phone
          FROM CUSTOMERS WHERE customerid=:customerID`,
          [customerID],
          { outFormat: oracledb.OUT_FORMAT_ARRAY }
        );

        const customerData = {
          name: "",
          surname: "",
          email: "",
          phone: ""
        };
        customerData.name = resultCustomer.rows[0][0];
        customerData.surname = resultCustomer.rows[0][1];
        customerData.email = resultCustomer.rows[0][2];
        customerData.phone = resultCustomer.rows[0][3];

        customer = true;
        res.render("dashboard", {
          content: "carSearchExecute",
          vehicleData,
          customerData,
          customer
        });
      }
    } else {
      let errors = [];
      errors.push({ msg: "no such vehicle in fleet" });
      res.render("dashboard", {
        content: "manageCars",
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
async function editCarSearch(reg, res) {
  const vehicleData = {
    reg: "",
    mark: "",
    model: "",
    fuel: "",
    gearbox: "",
    status: ""
  };
  let customer;
  let connection;
  registration = reg.toUpperCase();
  try {
    connection = await oracledb.getConnection(dbConfig);
    let resultCar = await connection.execute(
      `SELECT reg, mark, model, fuel, gearbox, status 
          FROM CARS WHERE reg=:reg`,
      [registration],
      { outFormat: oracledb.OUT_FORMAT_ARRAY }
    );
    if (resultCar.rows.length) {
      vehicleData.reg = resultCar.rows[0][0];
      vehicleData.mark = resultCar.rows[0][1];
      vehicleData.model = resultCar.rows[0][2];
      vehicleData.fuel = resultCar.rows[0][3];
      vehicleData.gearbox = resultCar.rows[0][4];
      vehicleData.status = resultCar.rows[0][5];
      res.render("dashboard", {
        content: "carEditExecute",
        vehicleData
      });
    } else {
      let errors = [];
      errors.push({ msg: "no such vehicle in fleet" });
      res.render("dashboard", {
        content: "carAdd",
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
async function editCarEdit(vehicleData, res) {
  let connection;

  editReg = vehicleData.editReg;
  editMark = vehicleData.editMark.toUpperCase();
  editModel = vehicleData.editModel.toUpperCase();
  editFuel = vehicleData.editFuel;
  editGearbox = vehicleData.editGearbox;
  editStatus = vehicleData.editStatus;

  try {
    connection = await oracledb.getConnection(dbConfig);
    let resultCarEdit = await connection.execute(
      `UPDATE CARS 
        SET  
        mark=:editMark,
        model=:editModel,
        fuel=:editFuel, 
        gearbox=:editGearbox, 
        status=:editStatus 
        WHERE reg=:editReg`,
      {
        editMark,
        editModel,
        editFuel,
        editGearbox,
        editStatus,
        editReg
      }
    );
    if (resultCarEdit.rowsAffected) {
      let errors = [];
      errors.push({ msg: "success - car edited" });
      res.render("dashboard", {
        content: "carAdd",
        errors
      });
    } else {
      let errors = [];
      errors.push({ msg: "error occured" });
      res.render("dashboard", {
        content: "carAdd",
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
async function searchCarsSorted(res, sortBy) {
  try {
    connection = await oracledb.getConnection(dbConfig);
    let resultSearchAll = await connection.execute(
      `SELECT * FROM CARS ORDER BY ` + sortBy,
      [],
      {
        outFormat: oracledb.OUT_FORMAT_ARRAY
      }
    );

    let rowsCount = resultSearchAll.rows.length;
    if (resultSearchAll.rows.length > 0) {
      res.render("dashboard", {
        content: "carsShowAll",
        resultSearchAll,
        rowsCount
      });
    } else {
      let errors = [];
      errors.push({ msg: "problem occured" });
      res.render("dashboard", {
        content: "carsShow",
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
