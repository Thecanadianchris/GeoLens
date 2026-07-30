require("dotenv").config();

const Sequelize = require("sequelize");

if (process.env.DB_PASSWORD === "ChangeMe!") {
  console.error("Please update the .env file with your database password.");
  process.exit(1);
}


const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT,
    logging: false,


    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }


  
);

module.exports = sequelize;


