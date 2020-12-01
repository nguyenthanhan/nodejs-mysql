"use strict";
module.exports = (sequelize, Sequelize) => {
  const Supplier = sequelize.define(
    "Supplier",
    {
      SupID: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(80),
      },
      Address: {
        type: Sequelize.STRING(80),
      },
      Tax_ID: {
        type: Sequelize.INTEGER(20),
      },
      Email: {
        type: Sequelize.STRING(40),
      },
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  );

  return Supplier;
};
