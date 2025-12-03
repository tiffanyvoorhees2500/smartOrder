import { useState, useMemo, useEffect, useRef } from "react";
import "./universalDropdown.css";

export default function UniversalDropdown({
  label,
  id,
  name,
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  required = false,
  loading = false,
  error = null,
  displayKey = "name",
  valueKey = "id",
  inputRef
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const wrapperRef = useRef(null);

  // Keep input display in sync with selected value
  useEffect(() => {
    const selectedItem = options.find((item) => item[valueKey] === value);
    setQuery(selectedItem ? selectedItem[displayKey] : "");
  }, [value, options, displayKey, valueKey]);

  const filteredOptions = useMemo(() => {
    if (!query) return options;
    return options.filter((item) =>
      item[displayKey].toLowerCase().includes(query.toLowerCase())
    );
  }, [options, query, displayKey]);

  const handleSelect = (item) => {
    onChange(item[valueKey]);
    setQuery(item[displayKey]);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const item = filteredOptions[highlightedIndex];
      if (item) handleSelect(item);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="comboBoxWrapper"
      style={{ position: "relative" }}
      ref={wrapperRef}
    >
      {label && <label htmlFor={id}>{label}</label>}

      <input
        id={id}
        name={name}
        required={required}
        type="text"
        value={query}
        placeholder={loading ? "Loading..." : placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlightedIndex(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />

      {open && !loading && !error && (
        <ul className="dropdownSelector">
          {filteredOptions.length === 0 ? (
            <li style={{ padding: "8px" }}>No results found</li>
          ) : (
            filteredOptions.map((item, index) => (
              <li
                key={item[valueKey]}
                onMouseDown={() => handleSelect(item)}
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  backgroundColor:
                    index === highlightedIndex ? "#ddd" : "transparent"
                }}
              >
                {item[displayKey].length > 100
                  ? item[displayKey].slice(0, 100) + "..."
                  : item[displayKey]}
              </li>
            ))
          )}
        </ul>
      )}

      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}
