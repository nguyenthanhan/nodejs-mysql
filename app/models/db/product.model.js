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
      description: {
        type: Sequelize.STRING(80),
      },
      otherDetail: {
        type: Sequelize.STRING(80),
      },
      barcode: {
        type: Sequelize.STRING(40),
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
      qtt_per_unit: {
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
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        updatedAt: Sequelize.NOW,
      },
    },
    {
      timestamps: true,

      // don't delete database entries but set the newly added attribute deletedAt
      // to the current date (when deletion was done). paranoid will only work if
      // timestamps are enabled
      // paranoid: true,

      freezeTableName: true,

      // tableName: "my_very_custom_table_name",
    }
  );

  return Products;
};
