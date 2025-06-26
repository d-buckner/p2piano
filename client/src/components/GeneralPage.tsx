import Navbar from '../components/Navbar';
import Footer from './Footer';
import * as styles from './GeneralPage.css';
import type { JSX } from 'solid-js';


type Props = {
    children: JSX.Element,
}

const GeneralPage = ({ children }: Props) => (
    <div class={styles.page}>
        <nav class={styles.header}>
            <Navbar />
        </nav>
        <main class={styles.main}>
            {children}
        </main>
        <footer class={styles.footer}>
            <Footer />
        </footer>
    </div>
);

export default GeneralPage;
