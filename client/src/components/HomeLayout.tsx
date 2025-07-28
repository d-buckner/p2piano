import Navbar from '../components/Navbar';
import Footer from './Footer';
import * as styles from './HomeLayout.css';
import type { JSX } from 'solid-js';


type Props = {
    children: JSX.Element,
}

const HomeLayout = (props: Props) => (
    <div class={styles.page}>
        <Navbar floating={true} />
        <main class={styles.main}>
            {props.children}
        </main>
        <footer class={styles.footer}>
            <Footer />
        </footer>
    </div>
);

export default HomeLayout;
