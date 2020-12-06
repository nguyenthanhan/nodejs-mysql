"use strict";
module.exports = (sequelize, Sequelize) => {
  const Import = sequelize.define(
    "Import",
    {
      ImID: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
      },
      mngID: {
        type: Sequelize.BIGINT(20),
      },
      total: {
        type: Sequelize.BIGINT(20),
      },
      date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      state: {
        type: Sequelize.ENUM("ready", "executed", "close"),
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

  return Import;
};
