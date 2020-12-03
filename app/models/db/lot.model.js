"use strict";
module.exports = (sequelize, Sequelize) => {
  const Managers = sequelize.define(
    "Manager",
    {
      MngID: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
      },
      FName: {
        type: Sequelize.STRING(80),
      },
      LName: {
        type: Sequelize.STRING(80),
      },
      accountName: {
        type: Sequelize.STRING(80),
      },
      password: {
        type: Sequelize.TEXT,
      },
      Address: {
        type: Sequelize.STRING(80),
      },
      BDay: {
        type: Sequelize.DATE,
      },
      gender: {
        type: Sequelize.ENUM("male", "female", "other"),
        defaultValue: "male",
      },
      salary: {
        type: Sequelize.BIGINT(20),
      },
      avt_url: {
        type: Sequelize.TEXT,
      },
      date_start_working: {
        type: Sequelize.DATE,
      },
      createdDay: {
        type: Sequelize.DATE,
      },
      managerType: {
        type: Sequelize.ENUM("normal", "prime"),
        defaultValue: "normal",
      },
      creatorID: {
        type: Sequelize.BIGINT(20),
      },
      deleterID: {
        type: Sequelize.BIGINT(20),
      },
      deletedDay: {
        type: Sequelize.DATE,
      },
      salt: {
        type: Sequelize.STRING(20),
      },
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  );

  return Managers;
};
