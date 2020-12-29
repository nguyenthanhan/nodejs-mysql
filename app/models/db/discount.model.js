'use strict';
module.exports = (sequelize, Sequelize) => {
  const Discount = sequelize.define(
    'Discount',
    {
      discountId: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      rate: {
        type: Sequelize.INTEGER(5),
        allowNull: false,
        validate: { min: 1, max: 100 },
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      title: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
    },
    {
      paranoid: true,
      freezeTableName: true,
    }
  );

  return Discount;
};
