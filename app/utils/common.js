"use strict";
const lang = require("../lang");

const returnAPIData = (status, method, name, id, message, data) => {
  const tID = id || 0;
  return {
    status,
    success: status === 200,
    message: message || returnMessage(method, name, tID),
    data,
  };
};

const returnMessage = (method, name, id) => {
  switch (method) {
    case "put":
      return lang.products.error.update
        .replace(`%{name}`, name)
        .replace(`%{id}`, id);
      break;
    case "post":
      return lang.products.error.create.replace(`%{name}`, name);
      break;
    case "get":
      return id === 0
        ? lang.products.error.getAll.replace(`%{name}`, name)
        : lang.products.error.getId
            .replace(`%{name}`, name)
            .replace(`%{id}`, id);
      break;
    case "delete":
      return lang.products.error.create
        .replace(`%{name}`, name)
        .replace(`%{id}`, id);
      break;
    default:
      break;
  }
};

module.exports = {
  returnAPIData,
};
