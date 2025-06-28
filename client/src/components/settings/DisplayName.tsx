import * as styles from './DisplayName.css';
import Label from './Label';




interface Props {
  name: string,
  onChange(displayName: string): void,
  hasError: boolean,
}

export default function DisplayName(props: Props) {
  const onChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    props.onChange(target.value);
  };

  return (
    <fieldset class={styles.fieldset}>
      <Label label='display name' />
      <input
        class={`${styles.input} ${props.hasError ? styles.inputError : ''}`}
        value={props.name}
        onInput={onChange}
      />
    </fieldset>
  );
}
