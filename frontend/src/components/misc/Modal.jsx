import { IoClose } from "react-icons/io5";
import "./Modal.css";

export default function Modal({
  children,
  isVisible,
  setIsVisible,
  className = ""
}) {
  return (
    isVisible && (
      <div className="modal">
        <div
          className="modal-backdrop"
          onClick={() => {
            setIsVisible(false);
          }}
        ></div>
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
