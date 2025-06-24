import { extendTheme } from "@chakra-ui/react"

export default extendTheme({
  fonts: {
    body: 'Ysabeau',
    heading: 'Ysabeau Office',
  },
  colors: {
    background: '#000',
    secondary: '#424242',
    foreground: '#FFF',
  },
  styles: {
      global: () => ({
        body: {
          bg: 'background',
        },
      }),
    }
});
