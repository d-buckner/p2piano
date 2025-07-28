import PageLayout from '../components/PageLayout';
import * as styles from './Donate.css';


const Donate = () => (
  <PageLayout>
    <div class={styles.container}>
      {/* Hero Section */}
      <section class={styles.hero}>
        <div class={styles.heroContent}>
          <h1 class={styles.heroHeading}>
            Support <span class={styles.highlight}>Music Education</span>
          </h1>
          <p class={styles.heroSubtext}>
            We believe music education should be accessible to everyone, regardless of economic circumstances. Rather than monetizing this tool, we prefer to see resources flow directly to organizations doing the hard work of music education.
          </p>
        </div>
      </section>

      {/* Donation Options */}
      <section class={styles.content}>
        <div class={styles.contentContainer}>
          <h2 class={styles.sectionHeading}>Ways to Make a Difference</h2>
          
          <div class={styles.donationGrid}>
            <div class={styles.donationCard}>
              <span class={styles.donationIcon}>🎓</span>
              <h3 class={styles.donationTitle}>Seattle JazzED</h3>
              <p class={styles.donationText}>
                A Seattle non-profit providing jazz education and performance opportunities for young musicians. Their programs reach underserved communities and break down barriers to music education.
              </p>
              <a 
                href="https://www.seattlejazzed.org/donate" 
                target="_blank" 
                rel="noopener noreferrer"
                class={styles.donationButton}
              >
                Donate
              </a>
            </div>

            <div class={styles.donationCard}>
              <span class={styles.donationIcon}>🎶</span>
              <h3 class={styles.donationTitle}>Save the Music</h3>
              <p class={styles.donationText}>
                A national non-profit dedicated to restoring music education programs in public schools and raising awareness about the importance of music in every child's complete education.
              </p>
              <a 
                href="https://donate.savethemusic.org/give" 
                target="_blank" 
                rel="noopener noreferrer"
                class={styles.donationButton}
              >
                Donate
              </a>
            </div>

            <div class={styles.donationCard}>
              <span class={styles.donationIcon}>💻</span>
              <h3 class={styles.donationTitle}>Report & Suggest</h3>
              <p class={styles.donationText}>
                Help improve p2piano by reporting bugs or suggesting new features. Your feedback helps make music collaboration better for everyone.
              </p>
              <a 
                href="https://github.com/d-buckner/p2piano/issues" 
                target="_blank" 
                rel="noopener noreferrer"
                class={styles.donationButton}
              >
                Give Feedback
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  </PageLayout>
);

export default Donate;
