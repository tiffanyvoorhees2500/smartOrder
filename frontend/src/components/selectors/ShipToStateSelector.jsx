export default function SelectField({
  label,
  name,
  value,
  options = [],
  onChange,
  required = false,
  placeholder = "Select an option"
}) {
  return (
    <label>
      {label}
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
