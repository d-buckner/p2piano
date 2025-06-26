import GeneralPage from '../components/GeneralPage';
import * as styles from './Donate.css';


const Donate = () => (
  <GeneralPage>
    <div class={styles.donateContainer}>
      <div class={styles.donateContent}>
        <h1 class={styles.donateHeading}>
          donate
        </h1>
        <p class={styles.donateText}>
          this project is provided free of charge without advertisements or tracking. if you like this project, please consider making music more accessible by donating to <a class={styles.donateLink} href='https://www.seattlejazzed.org/donate'>Seattle JazzED</a>
          {' '}or a music education non-profit working in your community. you can also donate your time by contributing code/issues to <a class={styles.donateLink} href='https://github.com/d-buckner/p2piano'>the github repository</a>
          {' '}if there's things you'd like to change.
        </p>
      </div>
    </div>
  </GeneralPage>
);

export default Donate;
