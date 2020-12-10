"use strict";
module.exports = (sequelize, Sequelize) => {
  const Import = sequelize.define(
    "Import",
    {
      ImID: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      mngID: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
      },
      total: {
        type: Sequelize.BIGINT(20),
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      state: {
        type: Sequelize.ENUM("ready", "executed", "close"),
      },
      urgent_level: {
        type: Sequelize.ENUM("normal", "prior"),
      },
      checkerID: {
        type: Sequelize.BIGINT(20),
      },
      bonus: {
        type: Sequelize.TEXT,
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
