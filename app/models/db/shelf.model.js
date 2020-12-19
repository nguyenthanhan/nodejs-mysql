"use strict";
module.exports = (sequelize, Sequelize) => {
  const Shelf = sequelize.define(
    "Shelf",
    {
      ShID: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(80),
        allowNull: false,
        defaultValue: "",
      },
      type: {
        type: Sequelize.ENUM("small", "medium", "large"),
        defaultValue: "small",
      },
      location: {
        type: Sequelize.ENUM("warehouse", "store"),
        defaultValue: "warehouse",
      },
      state: {
        type: Sequelize.ENUM("full", "available"),
        defaultValue: "available",
      },
    },
    {
      paranoid: true,
      freezeTableName: true,
    }
  );

  return Shelf;
};
