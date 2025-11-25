import { IoClose } from "react-icons/io5";
import "./Modal.css";
import { useEffect } from "react";

export default function Modal({
  children,
  isVisible,
  setIsVisible,
  className = ""
}) {
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isVisible]);

  return (
    isVisible && (
      <div className="modal">
        {/* Modal backdrop */}
        <div
          className="modal-backdrop"
          onClick={() => {
            setIsVisible(false);
          }}
        ></div>

        {/* Modal content and close button */}
        <div className="modal-content">
          <IoClose
            className="modal-cancel"
            onClick={() => setIsVisible(false)}
            type="button"
          />
          <div className={className}>{children}</div>
        </div>
      </div>
    )
  );
}
