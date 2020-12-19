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
      import_number: {
        type: Sequelize.STRING(40),
      },
      total_cost: {
        type: Sequelize.BIGINT(20),
      },
      import_action_date: {
        type: Sequelize.DATE,
      },
      state: {
        type: Sequelize.ENUM("request", "executed", "close"),
        defaultValue: "request",
      },
      urgent_level: {
        type: Sequelize.ENUM("normal", "priority"),
        defaultValue: "normal",
      },
      bonus: {
        type: Sequelize.TEXT,
      },
    },
    {
      paranoid: true,
      freezeTableName: true,
    }
  );

  return Import;
};
