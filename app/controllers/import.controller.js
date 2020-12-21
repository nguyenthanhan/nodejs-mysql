"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const {
  import: Import,
  manager: Manager,
  product: Product,
  productInImport: ProductInImport,
  supplier: Supplier,
  lot: Lot,
} = db;
const Op = db.Sequelize.Op;
const moment = require("moment");
const _ = require("lodash");

// Create and Save a new import
exports.create = async (req, res, next) => {
  console.log(req.body);
  // Validate request
  if (
    !req.body.total &&
    !req.body.checkerId &&
    !req.body.import_number &&
    !req.body.supplierId
  ) {
    next({
      status: 400,
      message: lang.general.error._400,
    });
    return;
  }

  if (_.isEmpty(req.body.importProducts)) {
    next({
      status: 400,
      message: "Không có sản phẩm được nhập vào!",
    });
    return;
  }

  try {
    const total_cost = req.body.importProducts.reduce((sum, importProduct) => {
      return (
        sum + importProduct.real_total_unit * importProduct.import_price_unit
      );
    }, 0);

    // Create a import
    const newImport = {
      import_action_date: req.body.import_action_date
        ? moment(req.body.import_action_date)
        : new Date(),
      import_number: req.body.import_number,
      total_cost: total_cost,
      state: req.body.state ? req.body.state : "request",
      urgent_level: req.body.urgent_level ? req.body.urgent_level : "normal",
      checkerId: parseInt(req.body.checkerId),
      bonus: req.body.bonus ? req.body.bonus : "",
      mngID: req.userId,
      supplierId: parseInt(req.body.supplierId),
    };

    // Save import in the database
    const tExcImport = await Import.create(newImport);
    const excImport = tExcImport.get({ plain: true });

    if (excImport && excImport.ImID) {
      if (
        req.body.importProducts &&
        _.isArray(req.body.importProducts) &&
        req.body.importProducts.length > 0
      ) {
        const productsInImport = await createItemsWithProducts(
          req.body.importProducts,
          excImport.ImID
        );
        console.log("productsInImport", productsInImport);

        // update W_curr_qtt in product
        const updateProducts = await Promise.all(
          req.body.importProducts.map(async (importProduct) => {
            const { conversionRate, real_total_unit } = importProduct;

            const oldProduct = await Product.findByPk(importProduct.productId);
            const newUpdate = await Product.update(
              {
                W_curr_qtt:
                  oldProduct.W_curr_qtt + real_total_unit * conversionRate,
              },
              {
                where: { PID: importProduct.productId },
              }
            );
            return parseInt(newUpdate);
          })
        );
        console.log("updateProducts", updateProducts);

        if (productsInImport) {
          res.send(
            common.returnAPIData(
              {
                ...excImport,
                productsInImport,
                countUpdatedProducts: updateProducts.reduce(
                  (acum, number) => acum + number,
                  0
                ),
              },
              "Tạo đơn nhập hàng thành công"
            )
          );
        } else {
          next({
            status: 400,
            message: "Thông tin sản phẩm không đúng!",
          });
          return;
        }
      } else {
        next({
          status: 400,
          message: "Không có sản phẩm trong đơn nhập hàng",
        });
        return;
      }
    }
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: "post",
      name: "thông tin nhập hàng",
      id: 0,
    });
    return;
  }
};

const createItemsWithProducts = (importProducts, importId) => {
  return Promise.all(
    importProducts.map(async (importProduct) => {
      const {
        import_price_unit,
        conversionRate,
        real_total_unit,
        productId,
      } = importProduct;

      const _productInImport = await ProductInImport.create({
        productId: productId,
        request_total_unit: importProduct.request_total_unit,
        real_total_unit: real_total_unit,
        expires: moment(importProduct.expires),
        unit_name: importProduct.unit_name,
        conversionRate: conversionRate,
        import_price_unit: import_price_unit,
        importId: importId,
        import_price_product: Math.ceil(import_price_unit / conversionRate),
      });

      const productInImport = _productInImport.get({ plain: true });

      const _createLot = await Lot.create({
        qttLotProductInWarehouse: real_total_unit * conversionRate,
        importId: importId,
        productId: productId,
      });

      let isCreateLot = false;
      const createLot = _createLot.get({ plain: true });
      if (!_.isEmpty(createLot)) {
        console.log("createLot", createLot);
        isCreateLot = true;
      }

      return {
        productInImport,
        isCreateLot,
      };
    })
  );
};

// Retrieve all imports from the database.
exports.findAll = async (req, res, next) => {
  try {
    // const mngID = req.query.mngID;
    // let condition = mngID ? { mngID: { [Op.like]: `%${mngID}%` } } : null;

    const data = await Import.findAll({
      // where: condition,
      include: [
        {
          model: Manager,
          as: "checker",
          attributes: ["MngID", "accountName", "LName", "FName"],
        },
        {
          model: Manager,
          as: "manager",
          attributes: ["MngID", "accountName", "LName", "FName"],
        },
        {
          model: Supplier,
          as: "supplier",
          attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
        },
        {
          model: Product,
          as: "products",
          attributes: ["PID", "W_curr_qtt"],
        },
      ],
    });

    res.send(common.returnAPIData(data));
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: "get",
      name: "thông tin nhập hàng",
      id: 0,
    });
    return;
  }
};

// Find a single import with an id
exports.findOne = async (req, res, next) => {
  const id = req.params.id;

  Import.findByPk(id, {
    include: [
      {
        model: Manager,
        as: "checker",
        attributes: ["MngID", "accountName", "LName", "FName"],
      },
      {
        model: Manager,
        as: "manager",
        attributes: ["MngID", "accountName", "LName", "FName"],
      },
      {
        model: Supplier,
        as: "supplier",
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
      },
      {
        model: Product,
        as: "products",
        attributes: ["PID", "W_curr_qtt"],
      },
    ],
  })
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "get",
        name: "thông tin nhập hàng",
        id: id,
      });
      return;
    });
};

// Update a import by the id in the request
exports.update = async (req, res, next) => {
  try {
    const { import_number, supplierId, ...body } = req.body;

    const newBody = { ...body, updatedAt: new Date() };

    const numbersUpdateImport = await Import.update(newBody, {
      where: { ImID: req.params.id },
    });

    if (parseInt(numbersUpdateImport, 10) === 1) {
      if (
        req.body.importProducts &&
        _.isArray(req.body.importProducts) &&
        req.body.importProducts.length > 0
      ) {
        const updateProductsInImport = await updateItemsWithProducts(
          req.body.importProducts,
          req.params.id
        );
        console.log("createProductsInImport", updateProductsInImport);
        let numberRowUpdated = 0;
        let numberRowNotUpdate = 0;

        updateProductsInImport.forEach((updateDiscounts) => {
          if (parseInt(updateDiscounts, 10) === 1) {
            numberRowUpdated = numberRowUpdated + 1;
          } else {
            numberRowNotUpdate = numberRowNotUpdate + 1;
          }
        });

        res.send(
          common.returnAPIData(
            { numberRowUpdated, numberRowNotUpdate },
            `Cập nhật thông tin nhập hàng thành công`
          )
        );
      } else {
        next({
          status: 400,
          message: "Không có sản phẩm trong đơn nhập hàng",
        });
        return;
      }
    }
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: "put",
      name: "thông tin nhập hàng",
      id: id,
    });
    return;
  }
};

const asyncUpdateItemProductOnImport = (importProduct, importId) => {
  return ProductInImport.update(
    {
      ...importProduct,
      importId: importId,
      updatedAt: moment(),
    },
    {
      where: { importId: importId, productId: importProduct.productId },
      silent: true,
    }
  );
};

const updateItemsWithProducts = async (importProducts, importId) => {
  return Promise.all(
    importProducts.map((importProduct) =>
      asyncUpdateItemProductOnImport(importProduct, importId)
    )
  );
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
      method: "delete",
      name: "thông tin nhập hàng",
      id: 0,
    });
    return;
  }
};
