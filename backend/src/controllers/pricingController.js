'use strict';

const { calculateUserDiscount } = require('../services/pricingService');

exports.getDiscountData = async (req, res) => {
  try {
    const discountData = await calculateUserDiscount(req.user);
    res.json(discountData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch discount data' });
  }
};
