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
      date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  );

  return Export;
};
