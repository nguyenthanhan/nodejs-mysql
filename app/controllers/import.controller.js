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
    !req.body.total_cost
  ) {
    next({
      status: 400,
      message: lang.general.error._400,
    });
    return;
  }

  try {
    // Create a import
    const newImport = {
      import_action_date: req.body.import_action_date
        ? moment(req.body.import_action_date)
        : new Date(),
      import_number: req.body.import_number,
      total_cost: req.body.total_cost,
      state: req.body.state ? req.body.state : "request",
      urgent_level: req.body.urgent_level ? req.body.urgent_level : "normal",
      checkerId: parseInt(req.body.checkerId),
      bonus: req.body.bonus ? req.body.bonus : "",
      mngID: req.userId,
      supplierId: parseInt(req.body.supplierId),
    };

    // Save import in the database
    const excImport = await Import.create(newImport, { raw: true });

    if (excImport && excImport.ImID) {
      if (
        req.body.importProducts &&
        _.isArray(req.body.importProducts) &&
        req.body.importProducts.length > 0
      ) {
        const createProductsInImport = await createItemsWithProducts(
          req.body.importProducts,
          excImport.ImID
        );

        console.log("createProductsInImport", createProductsInImport);
        const productsInImport = createProductsInImport.map((el) =>
          el.get({ plain: true })
        );
        if (!_.isEmpty(productsInImport)) {
          res.send(
            common.returnAPIData(
              { ...excImport, productsInImport },
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

const createItemsWithProducts = async (importProducts, importId) => {
  const configImportProducts = importProducts.map((importProduct) => {
    const { import_price_unit, conversionRate } = importProduct;
    return {
      productId: importProduct.productId,
      request_total_unit: importProduct.request_total_unit,
      real_total_unit: importProduct.real_total_unit,
      expires: moment(importProduct.expires),
      unit_name: importProduct.unit_name,
      conversionRate: conversionRate,
      import_price_unit: import_price_unit,
      importId: importId,
      import_price_product: Math.ceil(import_price_unit / conversionRate),
    };
  });

  return ProductInImport.bulkCreate(configImportProducts, { raw: true });
};

// Retrieve all imports from the database.
exports.findAll = async (req, res, next) => {
  //TODO: need find by other exp: accountName, not id
  // const mngID = req.query.mngID;
  // let condition = mngID ? { mngID: { [Op.like]: `%${mngID}%` } } : null;

  Import.findAll({
    // where: condition,
    include: [
      {
        model: Manager,
        as: "checker",
        attributes: ["accountName", "LName", "FName"],
      },
      {
        model: Manager,
        as: "manager",
        attributes: ["accountName", "LName", "FName"],
      },
      {
        model: Supplier,
        as: "supplier",
        attributes: { exclude: ["SupID", "createdAt", "updatedAt"] },
      },
      {
        model: Product,
        as: "products",
        // attributes: { exclude: ["createdAt", "updatedAt"] },
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
        id: 0,
      });
      return;
    });
};

// Find a single import with an id
exports.findOne = async (req, res, next) => {
  const id = req.params.id;

  Import.findByPk(id, {
    include: [
      {
        model: Manager,
        as: "checker",
        attributes: ["accountName", "LName", "FName"],
      },
      {
        model: Manager,
        as: "manager",
        attributes: ["accountName", "LName", "FName"],
      },
      {
        model: Supplier,
        as: "supplier",
        attributes: { exclude: ["SupID", "createdAt", "updatedAt"] },
      },
      {
        model: Product,
        as: "products",
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
    const newBody = { ...req.body, updatedAt: new Date() };

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

    if (deleteProductInImport) {
      const numberDelete = await Import.destroy({
        where: { ImID: { [Op.or]: arrayIds } },
      });

      res.send(
        common.returnAPIData({}, `${numberDelete} phiếu nhập đã bị xoá!`)
      );
    } else {
      common.returnAPIData({}, `Không có phiếu nhập bị xoá!`);
    }
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
