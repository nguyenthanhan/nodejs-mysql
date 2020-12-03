"use strict";
module.exports = (sequelize, Sequelize) => {
  const Shelf = sequelize.define(
    "Shelf",
    {
      ShID: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(80),
      },
      type: {
        type: Sequelize.ENUM("ware_house", "store"),
      },
      capacity: {
        type: Sequelize.BIGINT(20),
      },
      state: {
        type: Sequelize.ENUM("full", "available"),
      },
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  );

  return Shelf;
};
