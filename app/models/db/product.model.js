'use strict';
module.exports = (sequelize, Sequelize) => {
  const Products = sequelize.define(
    'Product',
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
        defaultValue: '',
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      otherDetail: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      barcode: {
        type: Sequelize.STRING(40),
        allowNull: false,
        defaultValue: '',
      },
      img_url: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
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
      warehouse_curr_qtt: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      store_curr_qtt: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      sell_price: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
      },
      unit_name: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      vat: {
        type: Sequelize.INTEGER(2),
      },
      brand: {
        type: Sequelize.STRING(80),
        allowNull: false,
        defaultValue: '',
      },
    },
    {
      paranoid: true,
      freezeTableName: true,
      // tableName: "my_very_custom_table_name",
    }
  );

  return Products;
};
