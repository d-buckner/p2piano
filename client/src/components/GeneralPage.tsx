import Navbar from '../components/Navbar';
import Footer from './Footer';
import * as styles from './GeneralPage.css';
import type { JSX } from 'solid-js';


type Props = {
    children: JSX.Element,
}

const GeneralPage = (props: Props) => (
    <div class={styles.page}>
        <nav class={styles.header}>
            <Navbar />
        </nav>
        <main class={styles.main}>
            {props.children}
        </main>
        <footer class={styles.footer}>
            <Footer />
        </footer>
    </div>
);

export default GeneralPage;
