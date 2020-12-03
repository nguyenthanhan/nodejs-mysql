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
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  );

  return Import;
};
