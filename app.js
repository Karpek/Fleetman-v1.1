const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const session = require("express-session");
const cookieParser = require("cookie-parser");

//app.use
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  })
);

//Routes
const homeRoute = require("./routes/index");
const registerRoute = require("./routes/register");
const dashboardRoute = require("./routes/dashboard");
const logoutRoute = require("./routes/logout");
const carsRoute = require("./routes/cars");
const usersRoute = require("./routes/users");
const rentalsRoute = require("./routes/rentals");
app.use("/", homeRoute);
app.use("/register", registerRoute);
app.use("/dashboard", dashboardRoute);
app.use("/logout", logoutRoute);
app.use("/cars", carsRoute);
app.use("/users", usersRoute);
app.use("/rentals", rentalsRoute);

//set view engine
app.set("view engine", "ejs");

//app.listen
app.listen(process.env.PORT);
