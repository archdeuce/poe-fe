import './Modal.style.scss';

import React, { FC, ReactNode, useEffect, useRef, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  onConfirm?: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  title = 'Modal Title',
  children,
  onConfirm,
  confirmButtonText = 'Ок',
  cancelButtonText = 'Отмена',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMouseDownInsideModal, setIsMouseDownInsideModal] = useState(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleGlobalMouseUp = () => {
      setIsMouseDownInsideModal(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isOpen, onClose]);

  const handleOverlayMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (
      modalRef.current &&
      !modalRef.current.contains(event.target as Node) &&
      !isMouseDownInsideModal
    ) {
      onClose();
    }
  };

  const handleModalContentMouseDown = () => {
    setIsMouseDownInsideModal(true);
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onMouseDown={handleOverlayMouseDown}>
      <div
        className="modal-content"
        ref={modalRef}
        onMouseDown={handleModalContentMouseDown}
      >
        <div className="modal-header">
          <h2>{title}</h2>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          {onConfirm && (
            <button
              className="modal-button modal-button-confirm"
              onClick={handleConfirm}
            >
              {confirmButtonText}
            </button>
          )}
          <button
            className="modal-button modal-button-cancel"
            onClick={onClose}
          >
            {cancelButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
