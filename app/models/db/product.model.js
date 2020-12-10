"use strict";
module.exports = (sequelize, Sequelize) => {
  const Products = sequelize.define(
    "Product",
    {
      PID: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(80),
        allowNull: false,
        defaultValue: "",
      },
      description: {
        type: Sequelize.STRING(80),
        allowNull: false,
        defaultValue: "",
      },
      otherDetail: {
        type: Sequelize.STRING(80),
        allowNull: false,
        defaultValue: "",
      },
      barcode: {
        type: Sequelize.STRING(40),
        allowNull: false,
        defaultValue: "",
      },
      img_url: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: "",
      },
      W_curr_qtt: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      W_max_qtt: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      W_min_qtt: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      S_curr_qtt: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      S_max_qtt: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      S_min_qtt: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      qtt_per_unit: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      sell_price: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        defaultValue: 0,
      },
      import_price: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        defaultValue: 0,
      },
      brand: {
        type: Sequelize.STRING(80),
        allowNull: false,
        defaultValue: "",
      },
      catID: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        defaultValue: 0,
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
