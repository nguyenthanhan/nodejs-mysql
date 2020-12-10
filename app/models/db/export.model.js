"use strict";
module.exports = (sequelize, Sequelize) => {
  const Export = sequelize.define(
    "Export",
    {
      ExID: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
      },
      mngID: {
        type: Sequelize.BIGINT(20),
      },
      state: {
        type: Sequelize.ENUM("ready", "executed", "close"),
      },
      urgent_level: {
        type: Sequelize.ENUM("normal", "prior"),
      },
      date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
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

  return Export;
};
