'use strict';
const common = require('../utils/common');
const db = require('../models/db');
const lang = require('../lang');
const { shelf: Shelf, category: Category } = db;
const Op = db.Sequelize.Op;
const LogController = require('./log.controller');
const { Table, ActionOnTable } = require('../constants');

// Create and Save a new Shelf
exports.create = async (req, res, next) => {
  console.log(req.body);
  // Validate request
  if (!req.body.name) {
    next({
      status: 400,
      message: lang.general.error._400,
    });
    return;
  }

  try {
    // Create a shelf
    const shelf = {
      name: req.body.name,
      type: req.body.type ? req.body.type : 'small',
      state: req.body.state ? req.body.state : 'available',
      location: req.body.location === 'store' ? 'store' : 'warehouse',
    };

    // Save shelf in the database
    const shelfQuery = Shelf.create(shelf);
    if (shelfQuery) {
      res.send(common.returnAPIData(shelfQuery, 'Tạo kệ hàng thành công'));
      LogController.createLog({
        MngID: req.userId,
        action: ActionOnTable.ADD,
        tableOfAction: Table.SHELF,
        affectedRowID: shelfQuery.ShID,
        nameInRow: shelfQuery.name,
      });
    }
  } catch (error) {
    next({
      status: 400,
      message: err.message,
      method: 'post',
      name: 'kệ hàng',
      id: 0,
    });
    return;
  }
};

// Retrieve all shelves from the database.
exports.findAll = async (req, res, next) => {
  const name = req.query.name;
  let condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

  Shelf.findAll({
    where: condition,
    include: [
      {
        model: Category,
        as: 'categories',
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
      },
    ],
  })
    .then(data => {
      const message = data.length === 0 ? 'Không có kệ hàng nào' : '';
      res.send(common.returnAPIData(data, message));
    })
    .catch(err => {
      next({
        status: 400,
        message: err.message,
        method: 'get',
        name: 'kệ hàng',
        id: 0,
      });
      return;
    });
};

// Find a single shelf with an id
exports.findOne = async (req, res, next) => {
  const id = req.params.id;

  Shelf.findByPk(id, { includes: ['categories'] })
    .then(data => {
      if (data) {
        res.send(common.returnAPIData(data));
      } else {
        next({
          status: 400,
          message: 'Không tìm thấy thông tin kệ hàng',
        });
        return;
      }
    })
    .catch(err => {
      next({
        status: 400,
        message: err.message,
        method: 'get',
        name: 'kệ hàng',
        id: id,
      });
      return;
    });
};

// Update a Shelf by the id in the request
exports.update = async (req, res, next) => {
  const id = req.params.id;
  const newBody = { ...req.body, updatedAt: new Date() };

  Shelf.update(newBody, {
    where: { ShID: id },
  })
    .then(num => {
      if (num == 1) {
        res.send(common.returnAPIData({}, 'Cập nhật kệ hàng thành công'));
        Shelf.findByPk(id, { raw: true }).then(data => {
          LogController.createLog({
            MngID: req.userId,
            action: ActionOnTable.EDIT,
            tableOfAction: Table.SHELF,
            affectedRowID: data.ShID,
            nameInRow: data.name,
          });
        });
      } else {
        next({
          status: 400,
          message: `Không thể update kệ hàng này. Có thể kệ hàng không thể tìm thấy!`,
        });
        return;
      }
    })
    .catch(err => {
      next({
        status: 400,
        message: err.message,
        method: 'put',
        name: 'kệ hàng',
        id: id,
      });
      return;
    });
};

// Delete a Shelf with the specified id in the request
exports.delete = async (req, res, next) => {
  try {
    const { arrayIds = [] } = req.body;

    const deleteCategoryInShelf = await CategoryShelf.destroy({
      where: { categoryId: { [Op.or]: arrayIds } },
      raw: true,
    });

    const deleteShelf = await Shelf.destroy({
      where: { ShID: { [Op.or]: arrayIds } },
    });

    res.send(
      common.returnAPIData(
        {
          deletedCount: parseInt(deleteShelf),
          deletedCategoryInShelfCount: parseInt(deleteCategoryInShelf),
        },
        `${parseInt(deleteShelf)} kệ hàng đã bị xoá!`
      )
    );

    Shelf.findAll({
      where: { ShID: { [Op.or]: arrayIds } },
      raw: true,
      paranoid: false,
    }).then(data => {
      data.forEach(item => {
        LogController.createLog({
          MngID: req.userId,
          action: ActionOnTable.DELETE,
          tableOfAction: Table.SHELF,
          affectedRowID: item.ShID,
          nameInRow: item.name,
        });
      });
    });
  } catch (error) {
    next({
      status: 400,
      message: err.message,
      method: 'delete',
      name: 'kệ hàng',
      id: id,
    });
    return;
  }
};
