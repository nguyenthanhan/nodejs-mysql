"use strict";
module.exports = (sequelize, Sequelize) => {
  const Category = sequelize.define(
    "Category",
    {
      CID: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },
      img_url: {
        type: Sequelize.TEXT,
      },
    },
    {
      freezeTableName: true,
    }
  );

  return Category;
};
