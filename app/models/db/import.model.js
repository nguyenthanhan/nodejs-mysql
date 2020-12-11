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
      bonus: {
        type: Sequelize.TEXT,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  return Import;
};
