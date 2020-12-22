'use strict';
const common = require('../utils/common');
const db = require('../models/db');
const lang = require('../lang');
const {
  import: Import,
  manager: Manager,
  product: Product,
  productInImport: ProductInImport,
  supplier: Supplier,
  lot: Lot,
} = db;
const Op = db.Sequelize.Op;
const moment = require('moment');
const _ = require('lodash');

// Create and Save a new import
exports.create = async (req, res, next) => {
  console.log(req.body);
  // Validate request
  if (!req.body.requesterId && !req.body.request_import_date) {
    next({
      status: 400,
      message: lang.general.error._400,
    });
    return;
  }

  if (_.isEmpty(req.body.importProducts)) {
    next({
      status: 400,
      message: 'Không có sản phẩm được nhập vào!',
    });
    return;
  }

  try {
    // Create a import
    const newImport = {
      request_import_date: req.body.request_import_date ? moment(req.body.request_import_date) : new Date(),
      urgent_level: req.body.urgent_level ? req.body.urgent_level : 'normal',
      bonus: req.body.bonus ? req.body.bonus : undefined,
      requesterId: parseInt(req.body.requesterId) || undefined,
      supplierId: req.body.supplierId ? parseInt(req.body.supplierId) : undefined,
    };

    // Save import in the database
    const tExcImport = await Import.create(newImport);
    const excImport = tExcImport.get({ plain: true });
    if (!excImport) {
      next({
        status: 400,
        message: 'Không tạo được đơn xuất hàng!',
      });
      return;
    }

    if (req.body.importProducts && _.isArray(req.body.importProducts) && req.body.importProducts.length > 0) {
      const prepareImportProducts = req.body.importProducts.map(importProduct => {
        return {
          productId: importProduct.productId,
          request_total_unit: parseInt(importProduct.request_total_unit),
          importId: excImport.ImID,
        };
      });

      // const productsInImport = await createItemsWithProducts(req.body.importProducts, excImport.ImID);
      const productsInImport = await ProductInImport.bulkCreate(prepareImportProducts);
      //return result
      if (productsInImport) {
        res.send(
          common.returnAPIData(
            {
              ...excImport,
              productsInImport,
            },
            'Tạo đơn nhập hàng thành công'
          )
        );
      } else {
        next({
          status: 400,
          message: 'Thông tin sản phẩm không đủ!',
        });
        return;
      }
    }
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: 'post',
      name: 'thông tin nhập hàng',
      id: 0,
    });
    return;
  }
};

// const createItemsWithProducts = (importProducts, importId) => {
//   return Promise.all(
//     importProducts.map(async importProduct => {
//       const { productId } = importProduct;

//       const _productInImport = await ProductInImport.create({
//         productId: productId,
//         request_total_unit: parseInt(importProduct.request_total_unit),
//         importId: importId,
//       });
//       const productInImport = _productInImport.get({ plain: true });

//       return {
//         productInImport,
//       };
//     })
//   );
// };

// Retrieve all imports from the database.
exports.findAll = async (req, res, next) => {
  try {
    // const mngID = req.query.mngID;
    // let condition = mngID ? { mngID: { [Op.like]: `%${mngID}%` } } : null;

    const _data = await Import.findAll({
      // where: condition,
      attributes: { exclude: ['deletedAt'] },
      include: [
        {
          model: Manager,
          as: 'checker',
          attributes: ['MngID', 'accountName', 'LName', 'FName'],
        },
        {
          model: Manager,
          as: 'manager',
          attributes: ['MngID', 'accountName', 'LName', 'FName'],
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
        },
        {
          model: Product,
          as: 'products',
          attributes: ['PID', 'name'],
        },
      ],
    });
    const data = _data.map(el => el.get({ plain: true }));

    const newData = await Promise.all(
      data.map(async eachData => {
        return processEachData(eachData);
      })
    );

    res.send(common.returnAPIData(newData));
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: 'get',
      name: 'thông tin nhập hàng',
      id: 0,
    });
    return;
  }
};

const processEachData = async data => {
  const { products, ...remain } = data;
  const importAndProductIds = products.map(product => {
    return {
      productId: product.PID,
      importId: product.ProductInImport.importId,
    };
  });

  const _lots = await Lot.findAll({
    where: { [Op.or]: importAndProductIds },
    attributes: {
      exclude: ['deletedAt'],
    },
  });
  const lots = _lots.map(el => el.get({ plain: true }));

  const newProducts = products.map(product => {
    const selectedLot = lots.find(
      lot => product.PID === lot.productId && product.ProductInImport.importId === lot.importId
    );
    if (selectedLot) {
      return {
        ...product,
        isHasLot: true,
        lot: _.omit(selectedLot, 'deletedAt', 'productId', 'importId'),
      };
    } else {
      return { ...product, isHasLot: false };
    }
  });

  return { ...remain, products: newProducts };
};

// Find a single import with an id
exports.findOne = async (req, res, next) => {
  try {
    const id = req.params.id;

    const _data = await Import.findByPk(id, {
      include: [
        {
          model: Manager,
          as: 'checker',
          attributes: ['MngID', 'accountName', 'LName', 'FName'],
        },
        {
          model: Manager,
          as: 'manager',
          attributes: ['MngID', 'accountName', 'LName', 'FName'],
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
        },
        {
          model: Product,
          as: 'products',
          attributes: ['PID', 'name'],
        },
      ],
    });
    const data = _data.get({ plain: true });

    const newData = await processEachData(data);

    res.send(common.returnAPIData(newData));
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: 'get',
      name: 'thông tin nhập hàng',
      id: req.params.id,
    });
    return;
  }
};

// Update a import by the id in the request
exports.update = async (req, res, next) => {
  try {
    // const total_cost =
    //   req.body.importProducts && req.body.importProducts.length > 0
    //     ? req.body.importProducts.reduce((sum, importProduct) => {
    //         return sum + importProduct.real_total_unit * importProduct.import_price_unit;
    //       }, 0)
    //     : null;

    const _findImport = await Import.findByPk(req.params.id);
    const findImport = _findImport.get({ plain: true });

    if (findImport.state === 'close') {
      return res.send(common.returnAPIData({}, `Tình trạng đơn này đã đóng, không thể cập nhập!`));
    }

    const body = {
      ..._.omit(req.body, 'importProducts', 'request_import_date', 'mngID'),
      request_export_date: req.body.request_export_date ? moment(req.body.request_export_date) : new Date(),
      state: req.body.state === 'request' && findImport.state === 'executed' ? undefined : req.body.state,
      updatedAt: new Date(),
    };

    const updateImport = await Import.update(body, {
      where: { ImID: req.params.id },
    });

    if (parseInt(updateImport, 10) === 1 && req.body.state === 'close') {
      res.send(common.returnAPIData({}, `Cập nhật thông tin nhập hàng thành công`));
      return;
    }

    if (
      parseInt(updateImport, 10) === 1 &&
      req.body.importProducts &&
      _.isArray(req.body.importProducts) &&
      req.body.importProducts.length > 0
    ) {
      if (req.body.state === 'request') {
        const updateProductsInImportAndLot = await Promise.all(
          req.body.importProducts.map(async importProduct => {
            return ProductInImport.update(
              {
                request_total_unit: parseInt(importProduct.request_total_unit),
                updatedAt: moment(),
              },
              {
                where: { importId: req.params.id, productId: importProduct.productId },
                silent: true,
              }
            );
          })
        );
        console.log(`req.body.state === 'request'`, updateProductsInImportAndLot);
        return res.send(common.returnAPIData({}, `Cập nhật thông tin nhập hàng thành công`));
      }

      const updateProductsInImportAndLot = await Promise.all(
        req.body.importProducts.map(async importProduct => {
          const newProductInImport = {
            request_total_unit: importProduct.request_total_unit
              ? parseInt(importProduct.request_total_unit)
              : undefined,
            real_total_unit: importProduct.real_total_unit ? parseInt(importProduct.real_total_unit) : undefined,
          };

          const updateProductsInImport = await ProductInImport.update(
            {
              ...newProductInImport,
              updatedAt: moment(),
            },
            {
              where: { importId: req.params.id, productId: importProduct.productId },
              silent: true,
            }
          );

          const newLot = {
            real_total_unit: importProduct.real_total_unit ? parseInt(importProduct.real_total_unit) : undefined,
            expires: importProduct.expires ? moment(importProduct.expires) : undefined,
            unit_name: importProduct.unit_name || undefined,
            conversionRate: parseInt(importProduct.conversionRate),
            import_price_unit: importProduct.import_price_unit ? parseInt(importProduct.import_price_unit) : undefined,
            qttLotInWarehouse: importProduct.real_total_unit,
            importId: req.params.id,
            productId: importProduct.productId,
            import_price_product: Math.ceil(importProduct.import_price_unit / importProduct.conversionRate),
          };
          const _createLot = await Lot.create(newLot);
          const createdLot = _createLot.get({ plain: true });

          return {
            isUpdatedImport: true,
            isUpdatedProductsInImport: parseInt(updateProductsInImport) === 1,
            createdLot,
          };
        })
      );

      res.send(common.returnAPIData(updateProductsInImportAndLot, `Cập nhật thông tin nhập hàng thành công`));
    } else {
      next({
        status: 400,
        message: 'Không có sản phẩm trong đơn nhập hàng',
      });
      return;
    }
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: 'put',
      name: 'thông tin nhập hàng',
      id: 1,
    });
    return;
  }
};

// Delete a import with the specified id in the request
exports.delete = async (req, res, next) => {
  try {
    const { arrayIds = [] } = req.body;

    const deleteProductInImport = await ProductInImport.destroy({
      where: { importId: { [Op.or]: arrayIds } },
    });

    const numberDelete = await Import.destroy({
      where: { ImID: { [Op.or]: arrayIds } },
    });

    res.send(
      common.returnAPIData(
        {
          numberDelete: parseInt(numberDelete),
          deleteProductInImport: parseInt(deleteProductInImport),
        },
        `${parseInt(numberDelete)} phiếu nhập đã bị xoá!`
      )
    );
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: 'delete',
      name: 'thông tin nhập hàng',
      id: 0,
    });
    return;
  }
};
