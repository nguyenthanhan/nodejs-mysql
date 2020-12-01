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
      // don't add the timestamp attributes (updatedAt, createdAt)
      timestamps: false,

      // don't delete database entries but set the newly added attribute deletedAt
      // to the current date (when deletion was done). paranoid will only work if
      // timestamps are enabled
      // paranoid: true,

      // don't use camelcase for automatically added attributes but underscore style
      // so updatedAt will be updated_at
      // underscored: true,

      // disable the modification of tablenames; By default, sequelize will automatically
      // transform all passed model names (first parameter of define) into plural.
      // if you don't want that, set the following
      freezeTableName: true,

      // define the table's name
      // tableName: "my_very_custom_table_name",
    }
  );

  return Shelf;
};
