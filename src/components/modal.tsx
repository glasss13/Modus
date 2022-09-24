import Portal from "./portal";
import { Modal as DaisyModal, ModalProps } from "react-daisyui";
import { useEffect } from "react";

const Modal = (props: ModalProps) => {
  useEffect(() => {
    if (props.open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [props.open]);

  return (
    <Portal>
      <DaisyModal {...props}>{props.children}</DaisyModal>
    </Portal>
  );
};

Modal.Header = DaisyModal.Header;
Modal.Body = DaisyModal.Body;
Modal.Actions = DaisyModal.Actions;

export default Modal;
