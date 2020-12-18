"use strict";
module.exports = (sequelize, Sequelize) => {
  const Lots = sequelize.define(
    "Lot",
    {
      lotID: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(80),
      },
      number_of_products: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },
      expires: {
        type: Sequelize.DATEONLY,
      },
      sell_price_product: {
        type: Sequelize.BIGINT(20),
      },
      import_price_product: {
        type: Sequelize.BIGINT(20),
      },
      import_price_lot: {
        type: Sequelize.BIGINT(20),
      },
    },
    {
      freezeTableName: true,
    }
  );

  return Lots;
};
