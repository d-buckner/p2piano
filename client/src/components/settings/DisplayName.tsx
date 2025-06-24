import { FormControl, Input } from '@chakra-ui/react';
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
    <FormControl
      as='fieldset'
      display='flex'
      flexDir='column'
      isInvalid={props.hasError}
      mb='1em'
    >
      <Label label='display name' />
      <Input
        value={props.name}
        onChange={onChange}
      />
    </FormControl>
  );
}
