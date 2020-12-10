"use strict";
module.exports = (sequelize, Sequelize) => {
  const Managers = sequelize.define(
    "Manager",
    {
      MngID: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      FName: {
        type: Sequelize.STRING(80),
        allowNull: false,
        defaultValue: "",
      },
      LName: {
        type: Sequelize.STRING(80),
        allowNull: false,
        defaultValue: "",
      },
      accountName: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },
      password: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      Address: {
        type: Sequelize.STRING(80),
        defaultValue: "",
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
      email: {
        type: Sequelize.STRING(80),
      },
      avt_url: {
        type: Sequelize.TEXT,
      },
      date_start_working: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      managerType: {
        type: Sequelize.ENUM("normal", "prime"),
        defaultValue: "normal",
      },
      telephoneNumber: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "",
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  return Managers;
};
