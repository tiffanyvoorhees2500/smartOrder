export default function DiscountSelector({ value, onChange, options }) {
  // `value` is numeric percent (like 10), but options provide objects with `discount` maybe as fraction
  // Normalize option discount display value (use percent number in UI)
  const normalize = (opt) => {
    if (opt == null) return 0;
    const d = opt.discount ?? 0;
    return d < 1 ? d * 100 : d;
  };

  return (
    <select
      value={value ?? ''}
      onChange={(e) => {
        const selectedValue = parseFloat(e.target.value);
        onChange(selectedValue);
      }}
    >
      {options.map((opt) => {
        const pct = normalize(opt);
        return (
          <option key={opt.title || pct} value={pct}>
            {opt.title}
          </option>
        );
      })}
    </select>
  );
}
