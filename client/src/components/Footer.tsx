import * as styles from './Footer.css';


export default function Footer() {
    return (
        <div class={styles.footer}>
            <span>
                open to the public 7 days a week. made by {' '}
                <a
                    class={styles.link}
                    href='https://d-buckner.org'
                >
                    d-buckner
                </a>
            </span>
        </div>
    );
}
