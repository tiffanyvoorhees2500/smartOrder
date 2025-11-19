/**
 * Convert a discount value to a percentage number for UI and calculations.
 * Accepts:
 *   - fraction (0.1)
 *   - percent (10)
 *   - object with `.discount` property (legacy)
 */
export function normalizePercent(value) {
  if (value == null) return 0;

  if (typeof value === "object" && value.discount != null) {
    return value.discount < 1 ? value.discount * 100 : value.discount;
  }

  return value < 1 ? value * 100 : value;
}
