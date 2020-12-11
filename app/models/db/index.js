"use strict";
const dbConfig = require("../../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.manager = require("./manager.model.js")(sequelize, Sequelize);
db.shelf = require("./shelf.model.js")(sequelize, Sequelize);
db.category = require("./category.model.js")(sequelize, Sequelize);
db.product = require("./product.model.js")(sequelize, Sequelize);
db.bill = require("./bill.model.js")(sequelize, Sequelize);
db.discount = require("./discount.model")(sequelize, Sequelize);
db.supplier = require("./supplier.model.js")(sequelize, Sequelize);
db.import = require("./import.model.js")(sequelize, Sequelize);
db.export = require("./export.model.js")(sequelize, Sequelize);
db.lot = require("./lot.model.js")(sequelize, Sequelize);
db.log = require("./log.model.js")(sequelize, Sequelize);

//Associations
//one to one
db.import.belongsTo(db.manager, { foreignKey: "checkerId", as: "checker" });

//one to many
db.lot.hasMany(db.product, { foreignKey: "lotId", as: "product" });
db.product.belongsTo(db.lot, { foreignKey: "lotId", as: "lots" });

db.category.hasMany(db.product, { foreignKey: "categoryId", as: "products" });
db.product.belongsTo(db.category, {
  foreignKey: "categoryId",
  as: "category",
});

// db.manager.hasMany(db.bill, {
//   foreignKey: "MngID",
//   as: "bills",
// });
db.bill.belongsTo(db.manager, {
  foreignKey: "MngID",
  as: "manager",
});

// db.manager.hasMany(db.import, {
//   foreignKey: "mngID",
//   as: "imports",
// });
db.import.belongsTo(db.manager, {
  foreignKey: "mngID",
  as: "manager",
});

// db.manager.hasMany(db.export, {
//   foreignKey: "mngID",
//   as: "exports",
// });
db.export.belongsTo(db.manager, {
  foreignKey: "mngID",
  as: "manager",
});

//many to many
// db.import.belongsToMany(db.product, { through: "ImportProduct" });
// db.product.belongsToMany(db.import, { through: "ImportProduct" });
//hook
db.lot.afterUpdate(async (lot, options) => {
  console.log("update lot");
  //check quantity ==0 delete
});

module.exports = db;
