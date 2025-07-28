import { useNavigate } from '@solidjs/router';
import { createSignal, For } from 'solid-js';
import { setRoom } from '../actions/RoomActions';
import AudioManager from '../audio/AudioManager';
import { createNewRoom } from '../clients/RoomClient';
import CollaborativePiano from './CollaborativePiano';
import * as styles from './HomeContent.css';


interface FeatureData {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}

interface StepData {
  number: string;
  title: string;
  description: string;
}

const FEATURES: FeatureData[] = [
  {
    icon: '⚡',
    title: 'Ultra-Low Latency',
    description: 'Play together in perfect sync with our optimized real-time audio engine. Works best when collaborators are within 500 miles of each other.',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    icon: '🎵',
    title: 'Professional Sound Quality',
    description: 'High-fidelity piano samples and crystal-clear audio processing ensure every note sounds exactly as intended.',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
  {
    icon: '👥',
    title: 'Perfect for Teaching',
    description: 'Music teachers can easily demonstrate techniques, guide students, and conduct virtual lessons with seamless collaboration.',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  {
    icon: '💝',
    title: 'Completely Free',
    description: 'No subscriptions, no hidden fees, no ads. Just pure musical collaboration, hosted with love for the music community.',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
  {
    icon: '🌐',
    title: 'Works Everywhere',
    description: 'Browser-based solution that works on any device. No downloads required – just share a link and start playing.',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  },
  {
    icon: '🎙️',
    title: 'Recording (Coming Soon)',
    description: 'Recording tools are in development. Soon you\'ll be able to capture and share your collaborative sessions.',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  },
];

const STEPS: StepData[] = [
  {
    number: '1',
    title: 'Create a Room',
    description: 'Click the button above to instantly create your collaborative piano room with a unique shareable link.',
  },
  {
    number: '2',
    title: 'Invite Friends',
    description: 'Share the room code or link with your students, fellow musicians, or friends who want to play together.',
  },
  {
    number: '3',
    title: 'Start Playing',
    description: 'Everyone joins the room and can immediately start playing piano together in perfect real-time synchronization.',
  },
];

export default function HomeContent() {
  const [isRoomCreating, setRoomCreating] = createSignal(false);
  const navigate = useNavigate();

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
              Play Piano Together with <span class={styles.brand}>p2piano</span>
            </h1>
            <p class={styles.subHeading}>
              Connect with music teachers and friends for real-time piano collaboration. Play together in perfect sync, completely free.
            </p>
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
                  Create Room and Start Playing
                </>
              )}
            </button>
          </div>
          <div class={styles.heroVisual}>
            <CollaborativePiano />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section class={styles.features}>
        <div class={styles.featuresContainer}>
          <h2 class={styles.sectionHeading}>Why Teachers & Musicians Love p2piano</h2>
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

      {/* How It Works Section */}
      <section class={styles.howItWorks}>
        <div class={styles.howContainer}>
          <h2 class={styles.sectionHeading}>Get Started in Seconds</h2>
          <div class={styles.steps}>
            <For each={STEPS}>
              {(step) => (
                <div class={styles.step}>
                  <div class={styles.stepNumber}>{step.number}</div>
                  <h3 class={styles.stepTitle}>{step.title}</h3>
                  <p class={styles.stepText}>{step.description}</p>
                </div>
              )}
            </For>
          </div>
        </div>
      </section>

    </div>
  );
}
