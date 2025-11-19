import "./InlayInputBox.css";
export default function InlayInputBox({
  children,
  htmlFor,
  title,
  ariaLabel = "",
  labelClass = ""
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={"inlayInput " + labelClass}
      aria-label={ariaLabel}
    >
      <span>{title}</span>
      {children}
    </label>
  );
}
