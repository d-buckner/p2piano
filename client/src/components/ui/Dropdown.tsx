import { createSignal, onCleanup, Show, type JSX } from 'solid-js';
import * as styles from './Dropdown.css';


type DropdownProps = {
  trigger: JSX.Element;
  children: JSX.Element;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function Dropdown(props: DropdownProps) {
  const [internalOpen, setInternalOpen] = createSignal(false);
  let dropdownRef: HTMLDivElement | undefined;

  const isOpen = () => props.open !== undefined ? props.open : internalOpen();
  
  const setOpen = (value: boolean) => {
    if (props.onOpenChange) {
      props.onOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  const handleTriggerClick = () => {
    setOpen(!isOpen());
  };

  onCleanup(() => {
    document.removeEventListener('mousedown', handleClickOutside);
  });

  return (
    <div ref={dropdownRef} class={styles.dropdownContainer}>
      <div onClick={handleTriggerClick}>
        {props.trigger}
      </div>
      <Show when={isOpen()}>
        {(() => {
          document.addEventListener('mousedown', handleClickOutside);
          return (
            <div class={styles.dropdownContent}>
              {props.children}
            </div>
          );
        })()}
      </Show>
    </div>
  );
}

export default Dropdown;
