import { onMount } from 'solid-js';
import * as styles from '../components/HomeContent.css';
import HomeLayout from '../components/HomeLayout';


function AboutContent() {
  onMount(() => {
    document.title = 'About p2piano - Mission & Creator | Online Piano Collaboration';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn about p2piano\'s mission to democratize online piano collaboration and make professional music tools freely available to all.');
    }
  });

  return (
    <div class={styles.container}>
      {/* Our Mission Section */}
      <section class={styles.missionHero}>
        <div class={styles.missionContainer}>
          <h1 class={styles.sectionHeading}>Our Mission</h1>
          <p class={styles.missionText}>
            We believe exceptional music tools shouldn't be locked behind paywalls. p2piano exists to create professional-grade piano collaboration software that every musician, teacher, and student can access freely, removing barriers that prevent people from making music together.
          </p>
          <p class={styles.missionText}>
            Whether you're teaching from your home studio, learning remotely, or collaborating with musicians worldwide, our commitment is simple: build the best possible platform and make it available to all.
          </p>
          <p class={styles.missionText}>
            Music brings people together. Technology should do the same.
          </p>
        </div>
      </section>

      {/* Creator Section */}
      <section class={styles.mission}>
        <div class={styles.missionContainer}>
          <h2 class={styles.sectionHeading}>About the Creator</h2>
          <p class={styles.missionText}>
            Hi, I'm <a href="https://d-buckner.org" target="_blank" rel="noopener noreferrer">Daniel Buckner</a>. I'm a software engineer who spent over a decade as a music educator and professional musician, working in Title 1 schools and with music nonprofits. I've watched students light up when they connect with music and discover what they can create together.
          </p>
          <p class={styles.missionText}>
            Those moments inspired me to create p2piano. Music works best when it's collaborative. Whether you're learning, teaching, or just playing for fun, people connect more deeply with music when they can share the experience with others.
          </p>
          <p class={styles.missionText}>
            Everyone deserves to experience music. When high-quality music tools are freely available, people can focus on what matters: discovering the joy of making music together.
          </p>
        </div>
      </section>
    </div>
  );
}

const About = () => (
  <HomeLayout>
    <AboutContent />
  </HomeLayout>
);

export default About;
