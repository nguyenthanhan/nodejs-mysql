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
const LogController = require('./log.controller');
const { Table, ActionOnTable } = require('../constants');

// Create and Save a new import
exports.create = async (req, res, next) => {
  console.log(req.body);
  // Validate request

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
      request_import_date: moment(req.body.request_import_date) || new Date(),
      urgent_level: req.body.urgent_level ? req.body.urgent_level : 'normal',
      bonus: req.body.bonus ? req.body.bonus : undefined,
      requesterId: req.userId,
      supplierId: parseInt(req.body.supplierId) || undefined,
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
          importId: parseInt(excImport.ImID),
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

        LogController.createLog({
          MngID: req.userId,
          action: ActionOnTable.ADD,
          tableOfAction: Table.IMPORT,
          affectedRowID: excImport.ImID,
          nameInRow: null,
        });
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
      productId: parseInt(product.PID),
      importId: parseInt(product.ProductInImport.importId),
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
      lot => product.PID === lot.productId && parseInt(product.ProductInImport.importId) === parseInt(lot.importId)
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
      attributes: { exclude: ['deletedAt'] },
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['PID', 'name'],
        },
      ],
    });
    if (_data) {
      const data = _data.get({ plain: true });

      const newData = await processEachData(data);

      res.send(common.returnAPIData(newData));
    } else {
      next({
        status: 400,
        message: 'Không tìm thấy thông tin của đơn nhập hàng này',
      });
      return;
    }
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

const log = () => {
  LogController.createLog({
    MngID: req.userId,
    action: ActionOnTable.EDIT,
    tableOfAction: Table.IMPORT,
    affectedRowID: req.params.id,
    nameInRow: null,
  });
};

// Update a import by the id in the request
exports.update = async (req, res, next) => {
  try {
    const _findImport = await Import.findByPk(req.params.id);
    const findImport = _findImport.get({ plain: true });

    if (!findImport) {
      next({
        status: 400,
        message: 'Không tìm thấy đơn xuất hàng này!',
      });
      return;
    }

    if (findImport.state === 'close') {
      return res.send(common.returnAPIData({}, `Tình trạng đơn này đã đóng, không thể cập nhập!`));
    }

    if (
      !req.body.import_date &&
      !findImport.import_date &&
      findImport.state === 'request' &&
      req.body.state === 'executed'
    ) {
      next({
        status: 400,
        message: 'Thiếu ngày thực hiện nhập hàng',
      });
      return;
    }

    if (
      (findImport.state === 'request' && req.body.state === 'request') ||
      (findImport.state === 'executed' && req.body.state === 'request') ||
      (findImport.state === 'request' && !req.body.state)
    ) {
      const body = {
        request_import_date: moment(req.body.request_import_date) || undefined,
        updatedAt: new Date(),
        state: 'request',
        urgent_level: req.body.urgent_level ? req.body.urgent_level : undefined,
        requesterId: parseInt(req.body.supplierId) || undefined,
        supplierId: parseInt(req.body.supplierId) || undefined,
        bonus: req.body.bonus || undefined,
      };

      const updateImport = await Import.update(body, {
        where: { ImID: req.params.id },
      });

      let updateProductsInImport = 0;
      if (parseInt(updateImport) === 1 && _.isArray(req.body.importProducts) && req.body.importProducts.length > 0) {
        const _updateProductsInImport = await Promise.all(
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
        console.log(`req.body.state === 'request'`, _updateProductsInImport);
        updateProductsInImport = _updateProductsInImport.reduce((sum, item) => sum + parseInt(item), 0);
      }

      res.send(common.returnAPIData({ updateProductsInImport }, `Cập nhật thông tin nhập hàng thành công`));
      log();
      return;
    }

    const body = {
      request_import_date: moment(req.body.request_import_date) || undefined,
      state: req.body.state,
      import_date: moment(req.body.import_date) || moment(),
      updatedAt: new Date(),
      urgent_level: req.body.urgent_level ? req.body.urgent_level : undefined,
      requesterId: parseInt(req.body.supplierId) || undefined,
      checkerId: parseInt(req.body.supplierId) || undefined,
      executorId: parseInt(req.body.supplierId) || undefined,
      supplierId: parseInt(req.body.supplierId) || undefined,
      bonus: req.body.bonus || undefined,
    };

    const updateImport = await Import.update(body, {
      where: { ImID: req.params.id },
    });

    if (parseInt(updateImport, 10) === 1 && _.isArray(req.body.importProducts) && req.body.importProducts.length > 0) {
      const updateProductsInImportAndLot = await Promise.all(
        req.body.importProducts.map(async importProduct => {
          const newProductInImport = {
            request_total_unit: importProduct.request_total_unit
              ? parseInt(importProduct.request_total_unit)
              : undefined,
            real_total_unit: importProduct.real_total_unit ? parseInt(importProduct.real_total_unit) : undefined,
            updatedAt: new Date(),
          };

          const updateProductsInImport = await ProductInImport.update(newProductInImport, {
            where: { importId: req.params.id, productId: importProduct.productId },
            silent: true,
          });

          if (
            (findImport.state === 'request' && req.body.state === 'executed') ||
            (findImport.state === 'executed' && req.body.state === 'executed') ||
            (findImport.state === 'request' && !req.body.state)
          ) {
            return {
              productId: importProduct.productId,
              isUpdatedImport: true,
              isUpdatedProductInImport: parseInt(updateProductsInImport) === 1,
            };
          }

          const newLot = {
            expires: importProduct.expires ? moment(importProduct.expires) : undefined,
            unit_name: importProduct.unit_name || undefined,
            conversionRate: parseInt(importProduct.conversionRate),
            import_price_unit: parseInt(importProduct.import_price_unit) || undefined,
            qttLotInWarehouse: parseInt(importProduct.real_total_unit),
            importId: parseInt(req.params.id),
            productId: parseInt(importProduct.productId),
            import_price_product: Math.ceil(
              parseInt(importProduct.import_price_unit) / parseInt(importProduct.conversionRate)
            ),
          };
          const _createLot = await Lot.create(newLot);
          const createdLot = _createLot.get({ plain: true });

          //update count product
          const _oldProduct = await Product.findByPk(importProduct.productId, {
            attributes: ['PID'],
            include: [
              {
                model: Lot,
                as: 'lots',
                attributes: ['qttLotInWarehouse', 'conversionRate'],
              },
            ],
          });
          let updatedProductCount;
          if (_oldProduct) {
            const oldProduct = _oldProduct.get({ plain: true });
            const warehouse_curr_qtt = oldProduct.lots.reduce((sum, productLot) => {
              return sum + parseInt(productLot.qttLotInWarehouse) * parseInt(productLot.conversionRate);
            }, 0);

            updatedProductCount = await Product.update(
              { warehouse_curr_qtt },
              { where: { PID: importProduct.productId } }
            );
          }
          //-----

          return {
            productId: importProduct.productId,
            isUpdatedImport: true,
            isUpdatedProductInImport: parseInt(updateProductsInImport) === 1,
            isUpdatedProductCount: parseInt(updatedProductCount) === 1,
            createdLot,
          };
        })
      );

      res.send(common.returnAPIData(updateProductsInImportAndLot, `Cập nhật thông tin nhập hàng thành công`));
      log();
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

    arrayIds.forEach(id => {
      LogController.createLog({
        MngID: req.userId,
        action: ActionOnTable.DELETE,
        tableOfAction: Table.IMPORT,
        affectedRowID: id,
        nameInRow: null,
      });
    });
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
