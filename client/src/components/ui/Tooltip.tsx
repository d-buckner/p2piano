import { createSignal, Show, type JSX } from 'solid-js';
import * as styles from './Tooltip.css';

type TooltipProps = {
  children: JSX.Element;
  text: string;
  shortcut?: string;
};

function Tooltip(props: TooltipProps) {
  const [show, setShow] = createSignal(false);

  return (
    <div class={styles.tooltipContainer}>
      <div
        class={styles.tooltipTrigger}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {props.children}
      </div>
      <Show when={show()}>
        <div class={styles.tooltip}>
          <span>{props.text}</span>
          <Show when={props.shortcut}>
            <span class={styles.shortcut}>({props.shortcut})</span>
          </Show>
          <div class={styles.tooltipArrow} />
        </div>
      </Show>
    </div>
  );
}

export default Tooltip;