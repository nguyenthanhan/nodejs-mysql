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
      telephoneNumber: {
        type: Sequelize.INTEGER(10),
      },
      Email: {
        type: Sequelize.STRING(40),
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
      freezeTableName: true,
    }
  );

  return Supplier;
};
