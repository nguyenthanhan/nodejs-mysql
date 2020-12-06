"use strict";
module.exports = (sequelize, Sequelize) => {
  const Category = sequelize.define(
    "Category",
    {
      CID: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(80),
      },
      shelfID: {
        type: Sequelize.BIGINT(20),
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

  return Category;
};
