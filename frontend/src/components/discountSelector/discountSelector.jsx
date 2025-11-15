export default function DiscountSelector({ value, onChange, options }) {
  return (
    <select
      value={value?.discount ?? ""}
      onChange={(e) => {
        const selected = options.find(
          (opt) => opt.discount === parseFloat(e.target.value)
        );
        onChange(selected); // Pass full object to parent
      }}
    >
      {options.map((opt) => (
        <option key={opt.title} value={opt.discount}>
          {opt.title}
        </option>
      ))}
    </select>
  );
}
