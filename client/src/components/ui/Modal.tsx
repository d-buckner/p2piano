import { Show, type JSX } from 'solid-js';
import { Portal } from 'solid-js/web';
import * as styles from './Modal.css';


type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: JSX.Element;
};

function Modal(props: ModalProps) {
  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      props.onClose();
    }
  };

  return (
    <Show when={props.open}>
      <Portal>
        <div class={styles.backdrop} onClick={handleBackdropClick}>
          <div class={styles.modal}>
            <Show when={props.title}>
              <div class={styles.header}>
                <h2 class={styles.title}>{props.title}</h2>
                <button 
                  class={styles.closeButton} 
                  onClick={() => props.onClose()}
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
            </Show>
            <div class={styles.content}>
              {props.children}
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
}

export default Modal;
