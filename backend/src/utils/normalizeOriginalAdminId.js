const BigNumber = require("bignumber.js");

function normalizeOriginalId(idStr) {
  if (!idStr) return null;
  idStr = idStr.trim();

  // Convert any scientific notation or number to exact string
  return new BigNumber(idStr).toFixed();
}

module.exports = normalizeOriginalId;
