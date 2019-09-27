const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");

//Routes
router.get("/", (req, res) => {
  if (req.session.user) {
    res.render("dashboard", { content: "dashboardRentals" });
  } else {
    let errors = [];
    errors.push({ msg: "please login first" });
    res.render("index", {
      errors
    });
  }
});

router.post("/rentvehicle", (req, res) => {
  if (req.session.user) {
    rentVehicle(res);
  } else {
    let errors = [];
    errors.push({ msg: "please login first" });
    res.render("index", {
      errors
    });
  }
});

router.post("/saverental", (req, res) => {
  if (req.session.user) {
    const { veh, cust } = req.body;

    saveRental(res, cust, veh);
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
    res.render("dashboard", { content: "rentalsShow" });
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
    showRentals(res, sortBy);
  } else {
    let errors = [];
    errors.push({ msg: "please login first" });
    res.render("index", {
      errors
    });
  }
});

router.post("/end", (req, res) => {
  if (req.session.user) {
    const { end } = req.body;
    endRental(end, res);
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

async function rentVehicle(res) {
  let errors = [];
  try {
    connection = await oracledb.getConnection(dbConfig);
    let resultVehicles = await connection.execute(
      `SELECT reg, mark, model, vehid 
          FROM cars WHERE customerid IS NULL AND status=1 ORDER BY vehid`,
      [],
      { outFormat: oracledb.OUT_FORMAT_ARRAY }
    );
    let resultCustomers = await connection.execute(
      `SELECT name, surname, customerid FROM customers WHERE vehicle IS NULL ORDER BY customerid`,
      [],
      { outFormat: oracledb.OUT_FORMAT_ARRAY }
    );
    if (resultVehicles.rows.length != 0 && resultCustomers.rows.length != 0) {
      vehiclesCount = resultVehicles.rows.length;
      customersCount = resultCustomers.rows.length;
      res.render("dashboard", {
        content: "rentalsExecute",
        vehiclesCount,
        resultVehicles,
        customersCount,
        resultCustomers
      });
    } else {
      errors.push({ msg: "no vehicles or customers available" });
      res.render("dashboard", { content: "dashboardRentals", errors });
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
async function saveRental(res, cust, veh) {
  let errors = [];
  try {
    connection = await oracledb.getConnection(dbConfig);
    let resultVehicleRent = await connection.execute(
      `UPDATE cars 
        SET  
        customerid=:cust,
        status=2
        WHERE vehid=:veh`,
      { cust, veh }
    );
    let resultCustomerRent = await connection.execute(
      `UPDATE customers SET vehicle=:veh WHERE customerid=:cust`,
      { veh, cust }
    );
    if (
      resultVehicleRent.rowsAffected != 0 &&
      resultCustomerRent.rowsAffected != 0
    ) {
      errors.push({ msg: "vehicle rented - success" });
      res.render("dashboard", { content: "dashboardRentals", errors });
    }
    if (
      resultVehicleRent.rowsAffected == 0 ||
      resultCustomerRent.rowsAffected == 0
    ) {
      errors.push({ msg: "failed - some of rows not updated - please check" });
      res.render("dashboard", { content: "dashboardRentals", errors });
    }
    if (
      resultVehicleRent.rowsAffected == 0 &&
      resultCustomerRent.rowsAffected == 0
    ) {
      errors.push({ msg: "failed - vehicle not rented" });
      res.render("dashboard", { content: "dashboardRentals", errors });
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
async function showRentals(res, sortBy) {
  try {
    connection = await oracledb.getConnection(dbConfig);
    let resultRentalsSearch = await connection.execute(
      `select cars.reg, cars.mark, cars.model, cars.vehid, customers.surname, customers.name, customers.customerid FROM cars inner join customers ON cars.vehid=customers.vehicle ORDER BY ` +
        sortBy,
      [],
      {
        outFormat: oracledb.OUT_FORMAT_ARRAY
      }
    );

    let rowsCount = resultRentalsSearch.rows.length;
    if (resultRentalsSearch.rows.length > 0) {
      res.render("dashboard", {
        content: "rentalsShowAll",
        resultRentalsSearch,
        rowsCount
      });
    } else {
      let errors = [];
      errors.push({ msg: "no ongoing rentals" });
      res.render("dashboard", {
        content: "rentalsShow",
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
async function endRental(end, res) {
  let errors = [];
  try {
    let connection = await oracledb.getConnection(dbConfig);
    let resultEndVehicle = await connection.execute(
      `UPDATE cars SET customerid= NULL, status = 1 WHERE customerid=:end`,
      { end }
    );
    let resultEndCustomer = await connection.execute(
      `UPDATE customers SET vehicle= NULL WHERE customerid=:end`,
      { end }
    );

    if (
      resultEndVehicle.rowsAffected != 0 &&
      resultEndCustomer.rowsAffected != 0
    ) {
      errors.push({ msg: "rental ended - success" });
      res.render("dashboard", { content: "rentalsShow", errors });
    }
    if (
      resultEndVehicle.rowsAffected == 0 ||
      resultEndCustomer.rowsAffected == 0
    ) {
      errors.push({ msg: "failed - some of rows not updated - please check" });
      res.render("dashboard", { content: "rentalsShow", errors });
    }
    if (
      resultEndVehicle.rowsAffected == 0 &&
      resultEndCustomer.rowsAffected == 0
    ) {
      errors.push({ msg: "failed - could not end rental" });
      res.render("dashboard", { content: "rentalsShow", errors });
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
