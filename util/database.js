const Sequelize = require("sequelize");

const sequelize = new Sequelize("practiceaql", "root", "123Amogh@", {
  dialect: "mysql",
  host: "localhost",
});


module.exports=sequelize

