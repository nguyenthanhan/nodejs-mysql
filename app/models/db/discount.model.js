"use strict";
module.exports = (sequelize, Sequelize) => {
  const Discount = sequelize.define(
    "Discount",
    {
      discountId: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      discount_code: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      rate: {
        type: Sequelize.INTEGER(5),
        allowNull: false,
        validate: { min: 1, max: 100 },
      },
      description: {
        type: Sequelize.TEXT,
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
    }
  );

  return Discount;
};
