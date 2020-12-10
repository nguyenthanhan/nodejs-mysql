"use strict";
module.exports = (sequelize, Sequelize) => {
  const Bill = sequelize.define(
    "Bill",
    {
      BID: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      cus_name: {
        type: Sequelize.STRING(80),
      },
      total: {
        type: Sequelize.BIGINT(20),
      },
      M_ID: {
        type: Sequelize.BIGINT(20),
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  return Bill;
};
