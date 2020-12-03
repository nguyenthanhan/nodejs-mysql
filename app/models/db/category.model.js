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
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  );

  return Category;
};
