import { useNavigate } from '@solidjs/router';
import { createSignal, For, onMount } from 'solid-js';
import { setRoom } from '../actions/RoomActions';
import AudioManager from '../audio/AudioManager';
import { createNewRoom } from '../clients/RoomClient';
import * as styles from '../components/HomeContent.css';
import HomeLayout from '../components/HomeLayout';
import LandingPiano from '../components/LandingPiano';


interface FeatureData {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}

const FEATURES: FeatureData[] = [
  {
    icon: '⚡',
    title: 'Play Together Like You\'re in the Same Room',
    description: 'Feel connected whether you\'re across town or across the country. The closer you are, the more it feels like sitting side-by-side at the same piano.',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    icon: '🎵',
    title: 'Beautiful, Responsive Piano Sound',
    description: 'Every note responds to your touch, from the gentlest pianissimo to powerful forte. It sounds and feels like a real piano.',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
  {
    icon: '👥',
    title: 'Perfect for Music Education',
    description: 'Built for real teaching moments. Students hear you play, you hear them respond. Share the same musical space even when you\'re apart. Only people you invite can join your lesson.',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  {
    icon: '💝',
    title: 'Completely Free',
    description: 'No ads. Ever. Built for the music community.',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
  {
    icon: '🌐',
    title: 'USB MIDI & Universal Support',
    description: 'Plug in any MIDI keyboard for professional playing with full velocity sensitivity. Also works great on any device with mouse, touchscreen, or computer keys. No downloads needed.',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  },
  {
    icon: '🎙️',
    title: 'Always Getting Better',
    description: 'We listen to teachers and musicians, adding features you actually need. Your feedback shapes what we build next.',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  },
];

function HomeContent() {
  const [isRoomCreating, setRoomCreating] = createSignal(false);
  const navigate = useNavigate();

  onMount(() => {
    document.title = 'p2piano - Online Piano Collaboration';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Play piano together online with friends, students, or teachers. Beautiful piano sound that responds to your touch. Works with MIDI keyboards or any device. Perfect for piano lessons and jamming.');
    }
  });

  const navigateToRoom = (roomId: string) => navigate(`/${roomId}`);

  const createRoom = async () => {
    AudioManager.activate();
    setRoomCreating(true);
    try {
      const room = await createNewRoom();
      setRoom(room);
      navigateToRoom(room.roomId);
    } catch {
      setRoomCreating(false);
    }
  };

  return (
    <div class={styles.container}>
      {/* Hero Section */}
      <section class={styles.hero}>
        <div class={styles.heroContent}>
          <div class={styles.heroText}>
            <h1 class={styles.mainHeading}>
              Play Piano Together Online
            </h1>
            <p class={styles.subHeading}>
              Perfect for piano lessons, jamming with friends, or practicing together. Join thousands making music together. No ads, no signups, just music.
            </p>

            <div class={styles.actionSection}>
              <button
                class={styles.ctaButton}
                onClick={createRoom}
                disabled={isRoomCreating()}
              >
                {isRoomCreating() ? (
                  <div class={styles.spinner} />
                ) : (
                  <>
                    <span>🎹</span>
                    Start Playing
                  </>
                )}
              </button>
            </div>

          </div>
          <div class={styles.heroVisual}>
            <div class={styles.demoContext}>
              <LandingPiano />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section class={styles.features}>
        <div class={styles.featuresContainer}>
          <h2 class={styles.sectionHeading}>Features</h2>
          <div class={styles.featuresGrid}>
            <For each={FEATURES}>
              {(feature) => (
                <div class={styles.featureCard}>
                  <div
                    class={styles.featureIcon}
                    style={{
                      background: feature.gradient,
                      color: 'white',
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3 class={styles.featureTitle}>{feature.title}</h3>
                  <p class={styles.featureText}>{feature.description}</p>
                </div>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section class={styles.faq}>
        <div class={styles.faqContainer}>
          <h2 class={styles.sectionHeading}>Frequently Asked Questions</h2>
          <div class={styles.faqGrid}>
            <div class={styles.faqItem}>
              <div class={styles.faqQuestion}>Do I need to download anything?</div>
              <div class={styles.faqAnswer}><strong>No downloads needed</strong>, runs instantly in your browser</div>
            </div>
            <div class={styles.faqItem}>
              <div class={styles.faqQuestion}>Is it really free?</div>
              <div class={styles.faqAnswer}><strong>Completely free</strong>, no subscriptions, ads, or hidden costs</div>
            </div>
            <div class={styles.faqItem}>
              <div class={styles.faqQuestion}>How well does it work across distances?</div>
              <div class={styles.faqAnswer}><strong>Best within 500 miles</strong>. Works great at any distance, but nearby connections feel most like playing together in person</div>
            </div>
            <div class={styles.faqItem}>
              <div class={styles.faqQuestion}>Are my sessions private?</div>
              <div class={styles.faqAnswer}><strong>Completely private</strong>, only people with your link can join</div>
            </div>
            <div class={styles.faqItem}>
              <div class={styles.faqQuestion}>Does it work on mobile?</div>
              <div class={styles.faqAnswer}><strong>Works everywhere</strong>, phones, tablets, desktops, any modern browser</div>
            </div>
            <div class={styles.faqItem}>
              <div class={styles.faqQuestion}>Why choose p2piano?</div>
              <div class={styles.faqAnswer}><strong>Built specifically for piano</strong>, with peer-to-peer networking and audio synchronization that keeps everyone in time</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

const Home = () => (
  <HomeLayout>
    <HomeContent />
  </HomeLayout>
);

export default Home;
