import Modal from "../misc/Modal";

export default function AdminOrderModal({ isVisible, setIsVisible }) {
  return (
    <Modal {...{ isVisible, setIsVisible }}>
      <h2>FinalizeOrder</h2>
    </Modal>
  );
}
