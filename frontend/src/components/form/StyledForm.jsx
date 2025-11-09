import { useState } from "react";

/**
 * A styled form component that can be used to create a form with a title and a submit button.
 *
 * The `onSubmit` function is wrapped in a try/catch block to handle any errors that occur during the form submission.
 *
 * Props:
 * @param {JSX.Element} children - Any elements that should be inside the form
 * @param {String} title - The title of the form
 * @param {Function} onSubmit - An async function that will be called when the form is submitted
 * @param {string} className - (Optional) A class name for additional styling
 * @returns {JSX.Element}
 */
export function StyledForm({
  children,
  title = "Untitled",
  onSubmit,
  className = "",
}) {
  const [error, setError] = useState("");

  return (
    <form
      className={`edgeless ${className}`}
      method="post"
      onSubmit={async (e) => {
        e.preventDefault();

        try {
          await onSubmit(e);
          setError("");
        } catch (err) {
          const errorMessage =
            err.response.data?.error || "Internal Server Error";
          setError(errorMessage);
        }
      }}
    >
      {/* == Logo == */}
      <div className="form-logo">
        <img src="/logo512.png" alt="Smart Order Logo" width="100" height="100"/>
      </div>
      
      {/* == Form Title == */}
      <h2>{title}</h2>

      {/* == Any onSubmit Errors == */}
      {error.length > 0 && (
        <span className="formError" role="alert">
          {error}
        </span>
      )}

      {/* == Children == */}
      <div className="formChildren">{children}</div>
    </form>
  );
}
