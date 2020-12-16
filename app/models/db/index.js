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
db.shelf.hasMany(db.category, { foreignKey: "shelfId", as: "categories" });
db.category.belongsTo(db.shelf, {
  foreignKey: "shelfId",
  as: "shelf",
});

// db.lot.hasMany(db.product, { foreignKey: "lotId", as: "product" });
// db.product.belongsTo(db.lot, { foreignKey: "lotId", as: "lots" });

db.category.hasMany(db.product, { foreignKey: "categoryId", as: "products" });
db.product.belongsTo(db.category, {
  foreignKey: "categoryId",
  as: "category",
});

db.bill.belongsTo(db.manager, {
  foreignKey: "MngID",
  as: "manager",
});

db.import.belongsTo(db.manager, {
  foreignKey: "mngID",
  as: "manager",
});

db.export.belongsTo(db.manager, {
  foreignKey: "mngID",
  as: "manager",
});

//many to many
const ProductOnBill = sequelize.define(
  "ProductOnBill",
  {
    quantity: {
      type: Sequelize.INTEGER(20),
    },
    // ProductId: {
    //   type: Sequelize.BIGINT(20),
    //   references: {
    //     model: db.product,
    //     key: "PID",
    //   },
    // },
    // BillId: {
    //   type: Sequelize.BIGINT(20),
    //   references: {
    //     model: db.bill,
    //     key: "BID",
    //   },
    // },
  },
  {
    timestamps: true,
    freezeTableName: true,
  }
);
db.productOnBill = ProductOnBill;
db.bill.belongsToMany(db.product, {
  through: ProductOnBill,
  as: "products",
  foreignKey: "billId",
});
db.product.belongsToMany(db.bill, {
  through: ProductOnBill,
  as: "bills",
  foreignKey: "productId",
});

//----------

// db.discount.hasMany(db.product, { foreignKey: "discountId", as: "products" });
// db.product.belongsTo(db.discount, {
//   foreignKey: "discountId",
//   as: "discount",
// });

//-------
const ProductOnDiscount = sequelize.define(
  "ProductOnDiscount",
  {
    requirementQuantity: {
      type: Sequelize.BIGINT(20),
    },
  },
  {
    timestamps: true,
    freezeTableName: true,
  }
);
db.productOnDiscount = ProductOnDiscount;
db.discount.belongsToMany(db.product, {
  through: ProductOnDiscount,
  as: "products",
  foreignKey: "discountId",
});
db.product.belongsToMany(db.discount, {
  through: ProductOnDiscount,
  as: "discounts",
  foreignKey: "productId",
});
//----------

//hook
db.lot.afterUpdate(async (lot, options) => {
  console.log("update lot");
  //check quantity ==0 delete
});

module.exports = db;
