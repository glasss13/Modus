import Portal from "./portal";
import { Modal as DaisyModal, ModalProps } from "react-daisyui";
import { useEffect } from "react";

const Modal = (props: ModalProps & { onClickEscape?: () => void }) => {
  const { onClickEscape, ...modalProps } = props;

  useEffect(() => {
    const func = (e: KeyboardEvent) => {
      if (modalProps.open && e.key === "Escape") onClickEscape?.();
    };
    window.addEventListener("keydown", func);

    return () => {
      window.removeEventListener("keydown", func);
    };
  });

  useEffect(() => {
    if (modalProps.open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [modalProps.open]);

  return (
    <Portal>
      <DaisyModal {...modalProps}>{modalProps.children}</DaisyModal>
    </Portal>
  );
};

Modal.Header = DaisyModal.Header;
Modal.Body = DaisyModal.Body;
Modal.Actions = DaisyModal.Actions;

export default Modal;
