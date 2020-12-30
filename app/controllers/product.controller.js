'use strict';
const common = require('../utils/common');
const db = require('../models/db');
const lang = require('../lang');
const cloudinary = require('../models/cloudinary.model');
const _ = require('lodash');
const {
  product: Product,
  category: Category,
  discount: Discount,
  lot: Lot,
  productInImport: ProductInImport,
  // productOnBill: ProductOnBill,
} = db;
const Op = db.Sequelize.Op;
const LogController = require('./log.controller');
const { Table, ActionOnTable } = require('../constants');

// Create and Save a new product
exports.create = async (req, res, next) => {
  console.log(req.body);
  // Validate request
  if (
    !req.body.name ||
    !req.body.W_max_qtt ||
    !req.body.W_min_qtt ||
    !req.body.S_max_qtt ||
    !req.body.S_min_qtt ||
    // !req.body.qtt_per_unit ||
    !req.body.brand
  ) {
    next({
      status: 400,
      message: lang.general.error._400,
    });
    return;
  }

  // if (req.body.W_max_qtt > req.body.W_min_qtt) {
  //   next({
  //     status: 400,
  //     message: 'Số lượng hàng tối đa trong kho hàng nên lớn hơn số lượng hàng tối thiểu',
  //   });
  //   return;
  // }

  // if (req.body.S_max_qtt > req.body.S_min_qtt) {
  //   next({
  //     status: 400,
  //     message: 'Số lượng hàng tối đa trên cửa hàng nên lớn hơn số lượng hàng tối thiểu',
  //   });
  //   return;
  // }

  // Create a product
  let product = {
    name: req.body.name,
    barcode: req.body.barcode,
    W_curr_qtt: parseInt(req.body.W_curr_qtt) ? parseInt(req.body.W_curr_qtt) : 0,
    W_max_qtt: parseInt(req.body.W_max_qtt),
    W_min_qtt: parseInt(req.body.W_min_qtt),
    S_curr_qtt: parseInt(req.body.S_curr_qtt) ? parseInt(req.body.S_curr_qtt) : 0,
    S_max_qtt: parseInt(req.body.S_max_qtt),
    S_min_qtt: parseInt(req.body.S_min_qtt),
    // sell_price: req.body.sell_price,
    // import_price: req.body.import_price,
    brand: req.body.brand,
    categoryId: parseInt(req.body.categoryId),
    otherDetail: req.body.otherDetail,
    description: req.body.description,
    vat: req.body.vat && parseInt(req.body.vat, 10) === 5 ? 5 : 10,
  };

  let imageMessage = 'Tạo sản phẩm thành công nhưng không có hình ảnh sản phẩm';

  if (req.body.img_url && validator.isUrl(req.body.img_url)) {
    product = { ...product, img_url: req.body.img_url };
    imageMessage = 'Tạo sản phẩm thành công';
  } else if (req.file) {
    const convertImageResult = await cloudinary.uploadSingle(req.file.path, 'product');

    if (convertImageResult && convertImageResult.url) {
      product = { ...product, img_url: convertImageResult.url };
      imageMessage = 'Tạo sản phẩm thành công';
    }
  }

  // Save product in the database
  Product.create(product)
    .then(data => {
      res.send(common.returnAPIData(data, imageMessage));
      LogController.createLog({
        MngID: req.userId,
        action: ActionOnTable.ADD,
        tableOfAction: Table.PRODUCT,
        affectedRowID: data.PID,
        nameInRow: data.name,
      });
    })
    .catch(err => {
      next({
        status: 400,
        message: err.message,
        method: 'post',
        name: 'sản phẩm',
        id: 0,
      });
      return;
    });
};

// Retrieve all products from the database.
exports.findAll = async (req, res, next) => {
  try {
    //pagination
    const limit = parseInt(req.query.per_page) || 10;
    const offset = (parseInt(req.query.page) - 1) * limit || 0;

    //sort by createdAt
    const sortByCreatedAt = common.checkValidSortString(req.query.sortByCreatedAt)
      ? ['createdAt', req.query.sortByCreatedAt]
      : null;

    //sort by updatedAt
    const sortByUpdatedAt = common.checkValidSortString(req.query.sortByUpdatedAt)
      ? ['updatedAt', req.query.sortByUpdatedAt]
      : null;

    const defaultSort = sortByCreatedAt || sortByUpdatedAt ? null : ['name', 'ASC'];
    //sort name product
    const sortName = common.checkValidSortString(req.query.sortName) ? ['name', req.query.sortName] : defaultSort;

    //search name products
    const name = req.query.nameKeyword;

    const condition = {
      [Op.and]: [
        name ? { name: { [Op.like]: `%${name}%` } } : null,
        req.query.categoryId ? { categoryId: parseInt(req.query.categoryId) } : null,
      ],
    };

    const data = await Product.findAndCountAll({
      // limit,
      // offset,
      where: condition,
      order: _.compact([sortName, sortByCreatedAt, sortByUpdatedAt]), //remove null, false
      include: [
        {
          model: Category,
          as: 'category',
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
        },
        {
          model: Lot,
          as: 'lots',
          attributes: {
            exclude: ['productId', 'deletedAt'],
          },
        },
        // {
        //   model: Discount,
        //   as: 'discount',
        //   attributes: { exclude: ['deletedAt'] },
        // },
      ],
    });

    const message = data.rows.length === 0 ? 'Không có sản phẩm nào' : 'Lấy danh sách sản phẩm thành công';
    const productsList = data.rows.map(product => product.get({ plain: true }));

    const newProductList = productsList.map(product => {
      const { lots, ...remain } = product;
      let warehouse_curr_qtt = 0;
      let store_curr_qtt = 0;

      lots.forEach(lot => {
        if (lot.qttLotInWarehouse) {
          warehouse_curr_qtt = warehouse_curr_qtt + lot.qttLotInWarehouse;
        }

        if (lot.qttProductInStore) {
          store_curr_qtt = store_curr_qtt + lot.qttProductInStore;
        }
      });

      return {
        ...remain,
        warehouse_curr_qtt,
        store_curr_qtt,
        lots: common.sortedByDate(lots, true),
      };
    });

    res.send(
      common.returnAPIData(newProductList, message, {
        // page: parseInt(req.query.page),
        // per_page: parseInt(req.query.per_page),
        // total_page: Math.ceil(
        //   parseInt(data.count) / parseInt(req.query.per_page)
        // ),
        total_products: parseInt(productsList.length),
      })
    );
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: 'get',
      name: 'sản phẩm',
      id: 0,
    });
    return;
  }
};

// Find a single product with an id
exports.findOne = async (req, res, next) => {
  try {
    const id = req.params.id;
    const _data = await Product.findByPk(id, {
      attributes: { exclude: ['deletedAt'] },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
        },
        {
          model: Lot,
          as: 'lots',
          attributes: {
            exclude: ['productId', 'deletedAt'],
          },
        },
        // {
        //   model: Discount,
        //   as: 'discount',
        //   attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
        // },
      ],
    });
    if (_data) {
      const productInfo = _data.get({ plain: true });

      if (productInfo.lots.length === 0) {
        res.send(common.returnAPIData(productInfo));
      }

      const { lots, ...newProduct } = productInfo;
      let warehouse_curr_qtt = 0;
      let store_curr_qtt = 0;

      lots.forEach(lot => {
        if (lot.qttLotInWarehouse) {
          warehouse_curr_qtt = warehouse_curr_qtt + newLot.qttLotInWarehouse;
        }

        if (lot.qttProductInStore) {
          store_curr_qtt = store_curr_qtt + newLot.qttProductInStore;
        }
      });

      res.send(
        common.returnAPIData({
          ...newProduct,
          warehouse_curr_qtt,
          store_curr_qtt,
          lots: common.sortedByDate(lots, true),
        })
      );
    } else {
      next({
        status: 400,
        message: 'Không tìm thấy thông tin của sản phẩm này',
      });
      return;
    }
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: 'get',
      name: 'sản phẩm',
      id: req.params.id,
    });
    return;
  }
};

// Update a product by the id in the request
exports.update = async (req, res, next) => {
  const id = req.params.id;
  let body = { ...req.body, updatedAt: new Date() };

  if (req.file) {
    const convertImageResult = await cloudinary.uploadSingle(req.file.path, 'product');
    if (convertImageResult.url) {
      body = { ...body, img_url: convertImageResult.url };
    }
  }

  Product.update(body, {
    where: { PID: id },
  })
    .then(num => {
      if (num == 1) {
        res.send(common.returnAPIData({}, 'Cập nhật sản phẩm thành công '));
        Product.findByPk(id, { raw: true }).then(data => {
          LogController.createLog({
            MngID: req.userId,
            action: ActionOnTable.EDIT,
            tableOfAction: Table.PRODUCT,
            affectedRowID: data.PID,
            nameInRow: data.name,
          });
        });
      } else {
        next({
          status: 400,
          message: `Không thể update sản phẩm này. Có thể sản phẩm không thể tìm thấy!`,
        });
        return;
      }
    })
    .catch(err => {
      next({
        status: 400,
        message: err.message,
        method: 'put',
        name: 'sản phẩm',
        id: req.params.id,
      });
      return;
    });
};

// Delete a product with the specified id in the request
exports.delete = async (req, res, next) => {
  try {
    const { arrayIds = [] } = req.body;

    // const deleteProductOnBill = await ProductOnBill.destroy({
    //   where: { productId: { [Op.or]: arrayIds } },
    // });

    // const deleteProductInImport = await ProductInImport.destroy({where: { productId: { [Op.or]: arrayIds } },})

    const deleteProducts = await Product.destroy({
      where: { PID: { [Op.or]: arrayIds } },
    });

    res.send(
      common.returnAPIData(
        {
          deleteProducts: parseInt(deleteProducts),
        },
        `${parseInt(deleteProducts)} sản phẩm đã bị xoá!`
      )
    );

    Product.findAll({
      where: { PID: { [Op.or]: arrayIds } },
      raw: true,
      paranoid: false,
    }).then(data => {
      data.forEach(item => {
        LogController.createLog({
          MngID: req.userId,
          action: ActionOnTable.DELETE,
          tableOfAction: Table.PRODUCT,
          affectedRowID: item.PID,
          nameInRow: item.name,
        });
      });
    });
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: 'delete',
      name: 'sản phẩm',
      id: 0,
    });
    return;
  }
};

// Delete all products from the database.
// exports.deleteAll = async (req, res, next) => {
//   try {
//     const deleteProduct = await Product.destroy({
//       where: {},
//       truncate: false,
//     });

//     res.send(
//       common.returnAPIData(
//         {
//           deleteProduct: parseInt(deleteProduct),
//         },
//         `${parseInt(deleteProduct)} sản phẩm đã bị xoá!`
//       )
//     );
//   } catch (error) {
//     next({
//       status: 400,
//       message: err.message || "Xảy ra lỗi khi xoá tất cả sản phẩm",
//       method: "delete",
//       name: "sản phẩm",
//       id: 0,
//     });
//   }
// };
