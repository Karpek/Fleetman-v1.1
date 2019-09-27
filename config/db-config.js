const dotenv = require("dotenv").config();

module.exports = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_HOST,
  poolMax: 150,
  poolMin: 150,
  poolIncrement: 5
};
