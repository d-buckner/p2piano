import Navbar from '../components/Navbar';
import Footer from './Footer';
import * as styles from './GeneralPage.css';
import type { ReactNode } from 'react';


type Props = {
    children: ReactNode,
}

const GeneralPage = ({ children }: Props) => (
    <div className={styles.page}>
        <nav className={styles.header}>
            <Navbar />
        </nav>
        <main className={styles.main}>
            {children}
        </main>
        <footer className={styles.footer}>
            <Footer />
        </footer>
    </div>
);

export default GeneralPage;
