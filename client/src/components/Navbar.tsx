import { Link} from 'react-router-dom';
import * as styles from './Navbar.css';


export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Link to='/' className={styles.link}>
        p2piano
      </Link>
      <Link to='/donate' className={styles.link}>
        donate
      </Link>
    </nav>
  );
}
