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

  return Shelf;
};
