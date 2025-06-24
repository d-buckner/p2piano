import { FormLabel } from '@chakra-ui/react'

interface Props {
  label: string
}

export default function Label(props: Props) {
  return (
    <FormLabel fontFamily= 'heading' fontWeight = 'bold' >
      { props.label }
      </FormLabel>
    );
}
