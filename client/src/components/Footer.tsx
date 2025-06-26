import * as styles from './Footer.css';


export default function Footer() {
    return (
        <div className={styles.footer}>
            <span>
                open to the public 7 days a week. made by {' '}
                <a
                    className={styles.link}
                    href='https://d-buckner.org'
                >
                    d-buckner
                </a>
            </span>
        </div>
    );
}
