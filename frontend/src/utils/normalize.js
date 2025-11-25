
export function toWholePercent(value) {
  if (value == null) return 0;

  if (typeof value === "object" && value.discount != null) {
    return value.discount < 1 ? value.discount * 100 : value.discount;
  }

  return value < 1 ? value * 100 : value;
}

export function toDecimalPercent(value) {
  if (value == null) return 0;

  const num = typeof value === "object" ? value.discount : value;

  if (num == null) return 0;

  // Already decimal (0–1)
  if (num > 0 && num < 1) return num;

  // Whole percent (ex: 15 → 0.15)
  return num / 100;
}

