import { normalizePercent } from "../../utils/normalize";

export default function DiscountSelector({ value, onChange, options }) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => {
        const selectedValue = parseFloat(e.target.value);
        onChange(selectedValue);
      }}
    >
      {options.map((opt) => {
        const pct = normalizePercent(opt);
        return (
          <option key={opt.title || pct} value={pct}>
            {opt.title}
          </option>
        );
      })}
    </select>
  );
}
