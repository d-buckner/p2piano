import { A } from '@solidjs/router';
import * as styles from './Navbar.css';


export default function Navbar() {
  return (
    <nav class={styles.navbar}>
      <A href='/' class={styles.link}>
        p2piano
      </A>
      <A href='/donate' class={styles.link}>
        donate
      </A>
    </nav>
  );
}
