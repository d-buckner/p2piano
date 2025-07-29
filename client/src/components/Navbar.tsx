import { A } from '@solidjs/router';
import * as styles from './Navbar.css';


interface NavbarProps {
  floating?: boolean;
}

export default function Navbar(props: NavbarProps = {}) {
  const isFloating = props.floating ?? false;
  
  return (
    <nav class={isFloating ? styles.navbarFloating : styles.navbar}>
      <A 
        href='/' 
        class={isFloating ? styles.brandFloating : styles.brand}
      >
        p2piano
      </A>
      <div class={styles.navLinks}>
        <A 
          href='/about' 
          class={isFloating ? styles.linkFloating : styles.link}
        >
          about
        </A>
        <A 
          href='/donate' 
          class={isFloating ? styles.linkFloating : styles.link}
        >
          donate
        </A>
      </div>
    </nav>
  );
}
