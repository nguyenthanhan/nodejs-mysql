"use strict";
module.exports = (sequelize, Sequelize) => {
  const Products = sequelize.define(
    "Product",
    {
      PID: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(80),
      },
      barcode: {
        type: Sequelize.STRING(20),
      },
      img_url: {
        type: Sequelize.TEXT,
      },
      W_curr_qtt: {
        type: Sequelize.INTEGER,
      },
      W_max_qtt: {
        type: Sequelize.INTEGER,
      },
      W_min_qtt: {
        type: Sequelize.INTEGER,
      },
      S_curr_qtt: {
        type: Sequelize.INTEGER,
      },
      S_max_qtt: {
        type: Sequelize.INTEGER,
      },
      S_min_qtt: {
        type: Sequelize.INTEGER,
      },
      sell_price: {
        type: Sequelize.BIGINT(20),
      },
      import_price: {
        type: Sequelize.BIGINT(20),
      },
      brand: {
        type: Sequelize.STRING(80),
      },
      catID: {
        type: Sequelize.BIGINT(20),
      },
    },
    {
      // don't add the timestamp attributes (updatedAt, createdAt)
      timestamps: false,

      // don't delete database entries but set the newly added attribute deletedAt
      // to the current date (when deletion was done). paranoid will only work if
      // timestamps are enabled
      // paranoid: true,

      // don't use camelcase for automatically added attributes but underscore style
      // so updatedAt will be updated_at
      // underscored: true,

      // disable the modification of tablenames; By default, sequelize will automatically
      // transform all passed model names (first parameter of define) into plural.
      // if you don't want that, set the following
      freezeTableName: true,

      // define the table's name
      // tableName: "my_very_custom_table_name",
    }
  );

  return Products;
};
