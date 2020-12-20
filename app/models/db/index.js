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

db.export.belongsTo(db.manager, { foreignKey: "checkerId", as: "checker" });

//one to many

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

//----------
db.categoryShelf = sequelize.define(
  "CategoryShelf",
  {},
  {
    freezeTableName: true,
  }
);

db.shelf.belongsToMany(db.category, {
  through: db.categoryShelf,
  as: "categories",
  foreignKey: "shelfId",
});
db.category.belongsToMany(db.shelf, {
  through: db.categoryShelf,
  as: "shelves",
  foreignKey: "categoryId",
});
//--------

const ProductInImport = sequelize.define(
  "ProductInImport",
  {
    request_total_unit: {
      type: Sequelize.INTEGER(20),
      allowNull: false,
    },
    real_total_unit: {
      type: Sequelize.INTEGER(20),
      allowNull: false,
    },
    expires: {
      type: Sequelize.DATE,
    },
    unit_name: {
      type: Sequelize.STRING(20),
    },
    conversionRate: {
      type: Sequelize.INTEGER(20),
    },
    import_price_unit: {
      type: Sequelize.BIGINT(20),
      allowNull: false,
    },
    import_price_product: {
      type: Sequelize.BIGINT(20),
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);
db.productInImport = ProductInImport;
db.import.belongsToMany(db.product, {
  through: ProductInImport,
  as: "products",
  foreignKey: "importId",
});
db.product.belongsToMany(db.import, {
  through: ProductInImport,
  as: "imports",
  foreignKey: "productId",
});

// //----------
// const ProductInExport = sequelize.define(
//   "ProductInExport",
//   {
//     request_total_unit: {
//       type: Sequelize.INTEGER(20),
//       allowNull: false,
//     },
//     real_total_unit: {
//       type: Sequelize.INTEGER(20),
//       allowNull: false,
//     },
//     expires: {
//       type: Sequelize.DATE,
//     },
//     unit_name: {
//       type: Sequelize.STRING(20),
//     },
//     conversionRate: {
//       type: Sequelize.INTEGER(20),
//     },
//     import_price_unit: {
//       type: Sequelize.BIGINT(20),
//       allowNull: false,
//     },
//   },
//   {
//     freezeTableName: true,
//   }
// );
// db.productInImport = ProductInImport;
// db.import.belongsToMany(db.product, {
//   through: ProductInImport,
//   as: "products",
//   foreignKey: "importId",
// });
// db.product.belongsToMany(db.import, {
//   through: ProductInImport,
//   as: "imports",
//   foreignKey: "productId",
// });
// //----------

db.supplier.hasMany(db.import, { foreignKey: "supplierId", as: "imports" });
db.import.belongsTo(db.supplier, {
  foreignKey: "supplierId",
  as: "supplier",
});
//----------

db.export.belongsTo(db.manager, {
  foreignKey: "mngID",
  as: "manager",
});

//---------
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
const ProductOnDiscount = sequelize.define(
  "ProductOnDiscount",
  {
    requirementQuantity: {
      type: Sequelize.BIGINT(20),
    },
  },
  {
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
// db.lot.afterUpdate(async (lot, options) => {
//   console.log("update lot");
//check quantity ==0 delete
// });

module.exports = db;
