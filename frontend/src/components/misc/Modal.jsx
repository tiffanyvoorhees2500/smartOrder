import "./Modal.css";

export default function Modal({ children, isVisible, setIsVisible }) {
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
          <button
            className="modal-cancel"
            onClick={() => setIsVisible(false)}
            type="button"
          >
            Cancel
          </button>
          <div>{children}</div>
        </div>
      </div>
    )
  );
}
