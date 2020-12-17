"use strict";
module.exports = (sequelize, Sequelize) => {
  const Export = sequelize.define(
    "Export",
    {
      ExID: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      state: {
        type: Sequelize.ENUM("request", "executed", "close"),
      },
      urgent_level: {
        type: Sequelize.ENUM("normal", "prior"),
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      freezeTableName: true,
    }
  );

  return Export;
};
