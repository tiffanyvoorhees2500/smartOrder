"use strict";

const db = require("../models");
const { User } = db;

exports.getAlphabeticalUserListOptions = async () => {
  try {
    const usersList = await User.findAll({
      attributes: ["id", "name", "defaultShipToState"],
      order: [["name", "ASC"]],
      raw: true
    });

    return usersList;
  } catch (error) {
    console.error("Error fetching user dropdown options:", error);
    throw error;
  }
};
