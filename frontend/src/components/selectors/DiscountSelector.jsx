import { toWholePercent } from "../../utils/normalize";

export default function DiscountSelector({ value, onChange, options, id }) {
  return (
    <select
      name={id}
      id={id}
      value={value ?? ""}
      onChange={(e) => {
        const selectedValue = parseFloat(e.target.value);
        onChange(selectedValue);
      }}
    >
      {options.map((opt) => {
        const pct = toWholePercent(opt);
        return (
          <option key={opt.title || pct} value={pct}>
            {opt.title}
          </option>
        );
      })}
    </select>
  );
}
