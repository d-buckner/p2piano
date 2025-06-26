import * as styles from './Label.css';


interface Props {
  label: string
}

export default function Label(props: Props) {
  return (
    <label class={styles.label}>
      {props.label}
    </label>
  );
}
