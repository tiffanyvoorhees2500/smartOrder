const DISCOUNT_OPTIONS = [
  { title: "0-14 Bottles [0% Off]", min: 0, max: 14, discount: 0.0 },
  { title: "15-34 Bottles [10% Off]", min: 15, max: 34, discount: 0.1 },
  { title: "35-69 Bottles [15% Off]", min: 35, max: 69, discount: 0.15 },
  { title: "70+ Bottles [18% Off]", min: 70, max: Infinity, discount: 0.18 },
  {
    title: "20% Phone Discount",
    min: null,
    max: null,
    discount: 0.2,
    manualOnly: true
  }
];

/**
 * Determines the discount percentage based on bottle count
 * @param {number} bottleCount - Total number of bottles in the admin bulk order
 * @returns {object} Discount tier {title, discount}
 */

function getDiscountByBottleCount(bottleCount) {
  return (
    DISCOUNT_OPTIONS.find(
      (tier) =>
        !tier.manualOnly && // <-- ignore manual-only discounts
        bottleCount >= tier.min &&
        bottleCount <= tier.max
    ) || DISCOUNT_OPTIONS[0]
  );
}

module.exports = { DISCOUNT_OPTIONS, getDiscountByBottleCount };
