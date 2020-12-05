"use strict";
const lang = require("../lang");

const returnAPIData = (data, message = "", props) => {
  return {
    status: 200,
    success: true,
    error: message,
    ...props,
    data,
  };
};

const returnAPIError = (status, method, name, id, message) => {
  const tID = id || 0;
  const _message = message || returnMessage(method, name, tID);
  return {
    status,
    success: status === 200,
    error: _message,
  };
};

const returnMessage = (method, name, id) => {
  switch (method) {
    case "put":
      return lang.general.error.update
        .replace(`%{name}`, name)
        .replace(`%{id}`, id);
      break;
    case "post":
      return lang.general.error.create.replace(`%{name}`, name);
      break;
    case "get":
      return id === 0
        ? lang.general.error.getAll.replace(`%{name}`, name)
        : lang.general.error.getId
            .replace(`%{name}`, name)
            .replace(`%{id}`, id);
      break;
    case "delete":
      return id === 0
        ? lang.general.error.deleteAll.replace(`%{name}`, name)
        : lang.general.error.delete
            .replace(`%{name}`, name)
            .replace(`%{id}`, id);
      break;
    default:
      break;
  }
};

const randomString = (l) => {
  let s = "";
  let randomChar = function () {
    let n = Math.floor(Math.random() * 62);
    if (n < 10) return n; //1-10
    if (n < 36) return String.fromCharCode(n + 55); //A-Z
    return String.fromCharCode(n + 61); //a-z
  };
  while (s.length < l) s += randomChar();
  return s;
};

const createImageName = (originalName) => {
  const array = originalName.split(".");
  const imageName = randomString(40) + "." + array[array.length - 1];
  return imageName;
};

module.exports = {
  returnAPIData,
  returnAPIError,
  randomString,
  createImageName,
};
