export default function SelectField({
  label,
  name,
  id,
  value,
  options = [],
  onChange,
  loading,
  error,
  required = false,
  placeholder = "Select an option"
}) {
  return (
    <label htmlFor={id}>
      {label}
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option value="">
          {loading
            ? "Loading users..."
            : error
              ? error
              : "Select a user..."}
        </option>
        {!loading &&
          !error &&
          options.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name.length > 100
                ? user.name.slice(0, 100) + "..."
                : user.name}
            </option>
          ))}
      </select>
    </label>
  );
}
