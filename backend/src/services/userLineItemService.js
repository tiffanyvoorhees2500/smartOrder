"use strict";

const db = require("../models");
const { UserLineItem, User } = db;

exports.currentBulkUserLineItemsWithUser = async (shipToState) => {
    // We need to get all userLineItems where adminOrderId is null and that are in the same location as shipToState
    const lineItems = await UserLineItem.findAll({
      where: { adminOrderId: null, saveForLater: false },
      include: {
        model: User,
        as: "user",
        where: { defaultShipToState: shipToState }
      }
    });
    return lineItems;
}

exports.currentBulkUserLineItemsWithUserAndProducts = async (shipToState) => {
    // We need to get all userLineItems where adminOrderId is null and that are in the same location as shipToState
    const lineItems = await UserLineItem.findAll({
        where: { adminOrderId: null, saveForLater: false },
        include: [
            {
                model: User,
                as: "user",
                where: { defaultShipToState: shipToState }
            },
            {
                model: Product,
                as: "product"
            }
        ]
    });
    return lineItems;
}