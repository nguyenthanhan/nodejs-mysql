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
        allowNull: false,
        defaultValue: "",
      },
      quantity: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },
      Exp: {
        type: Sequelize.DATE,
      },
    },
    {
      freezeTableName: true,
    }
  );

  return Lots;
};
