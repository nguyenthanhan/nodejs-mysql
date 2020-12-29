'use strict';
const cloudinary = require('../models/cloudinary.model');
const common = require('../utils/common');
const db = require('../models/db');
const lang = require('../lang');
const { category: Category, product: Product, shelf: Shelf, categoryShelf: CategoryShelf } = db;
const Op = db.Sequelize.Op;
const LogController = require('./log.controller');
const { Table, ActionOnTable } = require('../constants');
const _ = require('lodash');

// Create and Save a new Category
exports.create = async (req, res, next) => {
  console.log(req.body);
  console.log(req.file);
  // Validate request
  if (!req.body.name) {
    next({
      status: 400,
      message: lang.general.error._400,
    });
    return;
  }

  try {
    // Create a Category
    let category = {
      name: req.body.name,
    };
    let message = 'Tạo được ngành hàng nhưng không có hình ảnh minh hoạ';

    if (req.file) {
      const convertImageResult = await cloudinary.uploadSingle(req.file.path, 'category');
      if (convertImageResult && convertImageResult.url) {
        category = { ...category, img_url: convertImageResult.url };
        message = 'Đã tạo ngành hàng';
      }
    }

    // Save category in the database
    const _newCategory = await Category.create(category);
    const newCategory = _newCategory.get({ plain: true });

    if (newCategory && newCategory.CID) {
      let newCategoryShelf;

      if (!req.body.shelfIds) {
        newCategoryShelf = null;
      } else if (_.isArray(req.body.shelfIds)) {
        const newBulkCreate = req.body.shelfIds.map(id => ({
          shelfId: parseInt(id),
          categoryId: newCategory.CID,
        }));

        if (newBulkCreate) {
          newCategoryShelf = await CategoryShelf.bulkCreate(newBulkCreate);
        }
      } else if (_.isString(req.body.shelfIds) || _.isNumber(req.body.shelfIds)) {
        newCategoryShelf = await CategoryShelf.create({
          shelfId: parseInt(req.body.shelfIds),
          categoryId: newCategory.CID,
        });
      }

      res.send(common.returnAPIData({ ...newCategory, newCategoryShelf }, message));

      LogController.createLog({
        MngID: req.userId,
        action: ActionOnTable.ADD,
        tableOfAction: Table.CATEGORY,
        affectedRowID: newCategory.CID,
        nameInRow: newCategory.name,
      });
    }
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: 'post',
      name: 'phân ngành hàng',
      id: 0,
    });
    return;
  }
};

// Retrieve all shelves from the database.
exports.findAll = async (req, res, next) => {
  try {
    const name = req.query.nameKeyword;
    let condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

    const categories = await Category.findAll({
      where: condition,
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['PID', 'name'],
        },
        {
          model: Shelf,
          as: 'shelves',
          attributes: ['ShID'],
        },
      ],
    });

    if (categories) {
      res.send(common.returnAPIData(categories));
    }
  } catch (err) {
    next({
      status: 400,
      message: err.message,
      method: 'get',
      name: 'phân ngành hàng',
      id: 0,
    });
    return;
  }
};

// Find a single category with an id
exports.findOne = async (req, res, next) => {
  const id = req.params.id;

  Category.findByPk(id, {
    include: [
      {
        model: Product,
        as: 'products',
        attributes: ['PID', 'name'],
      },
      {
        model: Shelf,
        as: 'shelves',
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
      },
    ],
  })
    .then(data => {
      if (data) {
        res.send(common.returnAPIData(data));
      } else {
        next({
          status: 400,
          message: 'Không tìm thấy danh mục hàng này',
        });
        return;
      }
    })
    .catch(err => {
      next({
        status: 400,
        message: err.message,
        method: 'get',
        name: 'phân ngành hàng',
        id: req.params.id,
      });
      return;
    });
};

// Update a category by the id in the request
exports.update = async (req, res, next) => {
  const id = req.params.id;
  let body = {};

  console.log(req.body);
  console.log(req.file);

  if (req.file) {
    const convertImageResult = await cloudinary.uploadSingle(req.file.path, 'category');
    if (convertImageResult.url) {
      body = { ...body, img_url: convertImageResult.url };
    }
  }

  if (req.body.name && _.isString(req.body.name)) {
    body = { ...body, name: req.body.name };
  }

  if (!_.isEmpty(body)) {
    body = { ...body, updatedAt: new Date() };
  } else {
    next({
      status: 400,
      message: 'Nội dung trống',
    });
    return;
  }

  Category.update(body, {
    where: { CID: id },
  })
    .then(num => {
      if (num == 1) {
        res.send(common.returnAPIData({}, 'Cập nhật ngành hàng này thành công'));
      } else {
        next({
          status: 400,
          message: `Không thể cập nhật phân ngành hàng này. Phân ngành hàng không thể tìm thấy!`,
        });
        return;
      }

      Category.findByPk(id, { raw: true }).then(data => {
        LogController.createLog({
          MngID: req.userId,
          action: ActionOnTable.EDIT,
          tableOfAction: Table.CATEGORY,
          affectedRowID: data.BID,
          nameInRow: data.cus_name,
        });
      });
    })
    .catch(err => {
      next({
        status: 400,
        message: err.message,
        method: 'put',
        name: 'phân ngành hàng',
        id: id,
      });
      return;
    });
};

// Delete a category with the specified id in the request
exports.delete = async (req, res, next) => {
  try {
    const { arrayIds = [] } = req.body;

    const deleteCategoryInShelf = await CategoryShelf.destroy({
      where: { categoryId: { [Op.or]: arrayIds } },
      raw: true,
    });

    const deleteCategory = await Category.destroy({
      where: { CID: { [Op.or]: arrayIds } },
      raw: true,
    });

    res.send(
      common.returnAPIData(
        {
          deleteCategory: parseInt(deleteCategory),
          deleteCategoryInShelf: parseInt(deleteCategoryInShelf),
        },
        `${parseInt(deleteCategory)} phân loại hàng đã bị xoá!`
      )
    );

    Category.findAll({
      where: { CID: { [Op.or]: arrayIds } },
      raw: true,
      paranoid: false,
    }).then(data => {
      data.forEach(item => {
        LogController.createLog({
          MngID: req.userId,
          action: ActionOnTable.DELETE,
          tableOfAction: Table.CATEGORY,
          affectedRowID: item.CID,
          nameInRow: item.name,
        });
      });
    });
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: 'delete',
      name: 'phân ngành hàng',
      id: 0,
    });
    return;
  }
};
