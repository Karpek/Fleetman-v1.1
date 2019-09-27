const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const oracledb = require("oracledb");

//Routes
router.get("/", (req, res) => {
  if (req.session.user) {
    res.render("dashboard", { content: "usersSearch" });
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
    res.render("dashboard", { content: "usersSearch" });
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
    const { customerID } = req.body;
    if (customerID === "") {
      let errors = [];
      errors.push({ msg: "please fill in customer number" });
      res.render("dashboard", {
        content: "usersSearch",
        errors
      });
    } else {
      customerSearch(res, customerID);
    }
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
    res.render("dashboard", { content: "usersAdd" });
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
    customerData = { addFirstName, addLastName, addPhone, addEMail } = req.body;

    if (
      customerData.addFirstName == "" ||
      customerData.addLastName == "" ||
      customerData.addPhone == "" ||
      customerData.addEMail == ""
    ) {
      let errors = [];
      errors.push({ msg: "please fill in all fields" });
      res.render("dashboard", {
        content: "usersAdd",
        errors
      });
    } else {
      addUser(res, customerData);
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
    const { editID } = req.body;
    if (editID == "") {
      let errors = [];
      errors.push({ msg: "enter customer ID" });
      res.render("dashboard", {
        content: "usersAdd",
        errors
      });
    } else {
      editUserSearch(editID, res);
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
    customerData = {
      editID,
      editName,
      editSurname,
      editPhone,
      editMail
    } = req.body;

    if (
      editID == "" ||
      editName == "" ||
      editSurname == "" ||
      editPhone == "" ||
      editMail == ""
    ) {
      let errors = [];
      errors.push({ msg: "please fill in all fields" });
      res.render("dashboard", {
        content: "usersAdd",
        errors
      });
    } else {
      editUserEdit(customerData, res);
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
    res.render("dashboard", { content: "usersShow" });
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
    searchCustomersSorted(res, sortBy);
  } else {
    let errors = [];
    errors.push({ msg: "please login first" });
    res.render("index", {
      errors
    });
  }
});

router.post("/passchange", (req, res) => {
  const { newPassword, newPasswordConfirm } = req.body;
  let errors = [];
  let username = req.session.user;

  if (!newPassword || !newPasswordConfirm) {
    errors.push({ msg: "please fill in all fields" });
  }
  if (newPassword !== newPasswordConfirm) {
    errors.push({ msg: "passwords do not match" });
  }
  if (newPassword.length < 6) {
    errors.push({ msg: "password should be at least 6 characters" });
  }
  if (errors.length > 0) {
    res.render("dashboard", {
      content: "main",
      errors,
      name: username
    });
  } else {
    changePassword(username, newPassword, res);
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
async function customerSearch(res, customerID) {
  if (isNaN(customerID)) {
    let errors = [];
    errors.push({ msg: "given ID is not a number" });
    res.render("dashboard", {
      content: "usersSearch",
      errors
    });
  } else {
    try {
      connection = await oracledb.getConnection(dbConfig);
      let resultCustomer = await connection.execute(
        `SELECT name, surname, email, phone, vehicle
          FROM CUSTOMERS WHERE customerid=:customerID`,
        [customerID],
        { outFormat: oracledb.OUT_FORMAT_ARRAY }
      );
      if (!resultCustomer.rows.length) {
        let errors = [];
        errors.push({ msg: "no such customer in database" });
        res.render("dashboard", { content: "usersSearch", errors });
      } else {
        const customerData = {
          name: "",
          surname: "",
          email: "",
          phone: "",
          vehicle: ""
        };
        customerData.name = resultCustomer.rows[0][0];
        customerData.surname = resultCustomer.rows[0][1];
        customerData.email = resultCustomer.rows[0][2];
        customerData.phone = resultCustomer.rows[0][3];
        customerData.vehicle = "NONE";
        if (resultCustomer.rows[0][4] !== null) {
          let vehid = resultCustomer.rows[0][4];
          let resultCar = await connection.execute(
            `SELECT reg
          FROM CARS WHERE vehid=:vehid`,
            [vehid],
            { outFormat: oracledb.OUT_FORMAT_ARRAY }
          );
          customerData.vehicle = resultCar.rows[0][0];
        }
        res.render("dashboard", {
          content: "customerSearchExecute",
          customerData
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
}
async function addUser(res, vehicleData) {
  let connection;
  addLastName = vehicleData.addLastName.toUpperCase();
  addFirstName = vehicleData.addFirstName.toUpperCase();
  addPhone = vehicleData.addPhone.toUpperCase();
  addEMail = vehicleData.addEMail;

  try {
    connection = await oracledb.getConnection(dbConfig);

    let resultCustomerSearch = await connection.execute(
      `SELECT * FROM CUSTOMERS WHERE (name=:addFirstName AND surname=:addLastName AND phone=:addPhone AND email=:addEMail)`,
      [addFirstName, addLastName, addPhone, addEMail],
      { outFormat: oracledb.OUT_FORMAT_ARRAY }
    );

    if (resultCustomerSearch.rows.length) {
      let errors = [];
      errors.push({ msg: "customer already exists" });
      res.render("dashboard", {
        content: "usersAdd",
        errors
      });
    } else {
      let resultCustomerAdd = await connection.execute(
        `INSERT INTO CUSTOMERS (name, surname, phone, email) VALUES (:name, :surname, :phone, :email)`,
        [addFirstName, addLastName, addPhone, addEMail],
        { outFormat: oracledb.OUT_FORMAT_ARRAY }
      );
      if (resultCustomerAdd.rowsAffected) {
        let errors = [];
        errors.push({ msg: "customer added!" });
        res.render("dashboard", {
          content: "usersAdd",
          errors
        });
      } else {
        let errors = [];
        errors.push({ msg: "problem occured" });
        res.render("dashboard", {
          content: "usersAdd",
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
async function editUserSearch(editID, res) {
  if (isNaN(editID)) {
    let errors = [];
    errors.push({ msg: "given ID is not a number" });
    res.render("dashboard", {
      content: "usersAdd",
      errors
    });
  } else {
    const customerData = {
      name: "",
      surname: "",
      phone: "",
      mail: ""
    };
    let connection;
    try {
      connection = await oracledb.getConnection(dbConfig);
      let resultCustomer = await connection.execute(
        `SELECT name, surname, email, phone, customerID  
          FROM CUSTOMERS WHERE customerid=:editID`,
        [editID],
        { outFormat: oracledb.OUT_FORMAT_ARRAY }
      );
      if (resultCustomer.rows.length) {
        customerData.name = resultCustomer.rows[0][0];
        customerData.surname = resultCustomer.rows[0][1];
        customerData.mail = resultCustomer.rows[0][2];
        customerData.phone = resultCustomer.rows[0][3];
        customerData.customerID = resultCustomer.rows[0][4];
        res.render("dashboard", {
          content: "customerEditExecute",
          customerData
        });
      } else {
        let errors = [];
        errors.push({ msg: "no customer found" });
        res.render("dashboard", {
          content: "usersAdd",
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
}
async function editUserEdit(customerData, res) {
  editID = customerData.editID;
  editName = customerData.editName.toUpperCase();
  editSurname = customerData.editSurname.toUpperCase();
  editPhone = customerData.editPhone.toUpperCase();
  editMail = customerData.editMail;

  try {
    connection = await oracledb.getConnection(dbConfig);
    let resultCustomerEdit = await connection.execute(
      `UPDATE CUSTOMERS 
        SET  
        name=:editName,
        surname=:editSurname,
        email=:editMail, 
        phone=:editPhone
        WHERE customerID=:editID`,
      {
        editName,
        editSurname,
        editMail,
        editPhone,
        editID
      }
    );

    if (resultCustomerEdit.rowsAffected) {
      let errors = [];
      errors.push({ msg: "success - customer edited" });
      res.render("dashboard", {
        content: "usersAdd",
        errors
      });
    } else {
      let errors = [];
      errors.push({ msg: "error occured" });
      res.render("dashboard", {
        content: "usersAdd",
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
async function searchCustomersSorted(res, sortBy) {
  try {
    connection = await oracledb.getConnection(dbConfig);
    let resultSearchAll = await connection.execute(
      `SELECT name, surname, email, phone, customerID FROM CUSTOMERS ORDER BY ` +
        sortBy,
      [],
      {
        outFormat: oracledb.OUT_FORMAT_ARRAY
      }
    );

    let rowsCount = resultSearchAll.rows.length;
    if (resultSearchAll.rows.length > 0) {
      res.render("dashboard", {
        content: "customersShowAll",
        resultSearchAll,
        rowsCount
      });
    } else {
      let errors = [];
      errors.push({ msg: "problem occured" });
      res.render("dashboard", {
        content: "usersShow",
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
async function changePassword(username, newPassword, res) {
  let errors = [];
  connection = await oracledb.getConnection(dbConfig);
  bcrypt.hash(newPassword, 10, function(err, hash) {
    if (hash) {
      change(hash);
    } else {
      errors.push({ msg: "error occured" });
      res.render("dashboard", {
        content: "main",
        errors,
        name: username
      });
    }
  });
  async function change(password) {
    try {
      let resultPasswordChange = await connection.execute(
        `UPDATE USERS
         SET
         password=:password
         WHERE username=:username`,
        { password, username }
      );
      if (resultPasswordChange.rowsAffected) {
        errors.push({ msg: "password sucesfully changed" });
        res.render("dashboard", {
          content: "main",
          errors,
          name: username
        });
      } else {
        errors.push({ msg: "error occured" });
        res.render("dashboard", {
          content: "main",
          errors,
          name: username
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
}
