import * as styles from './DisplayName.css';
import Label from './Label';
import type { ChangeEvent } from 'react';




interface Props {
  name: string,
  onChange(displayName: string): void,
  hasError: boolean,
}

export default function DisplayName(props: Props) {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    props.onChange(e.target.value);
  };

  return (
    <fieldset className={styles.fieldset}>
      <Label label='display name' />
      <input
        className={`${styles.input} ${props.hasError ? styles.inputError : ''}`}
        value={props.name}
        onChange={onChange}
      />
    </fieldset>
  );
}
