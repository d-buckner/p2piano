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

interface StepData {
  number: string;
  title: string;
  description: string;
}

interface InputEvent extends Event {
  target: HTMLInputElement;
}

interface KeyPressEvent extends KeyboardEvent {
  key: string;
}

const FEATURES: FeatureData[] = [
  {
    icon: '⚡',
    title: 'Real-Time Synchronization',
    description: 'Optimized for low latency with strong performance nearby and reliable quality across distances. Best performance within 500 miles, works anywhere.',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    icon: '🎵',
    title: 'High-Quality Piano Sounds',
    description: 'Rich, expressive piano samples with multiple velocity layers for natural, dynamic playing.',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
  {
    icon: '👥',
    title: 'Perfect for Music Education',
    description: 'Ideal for remote lessons, ensemble practice, and collaborative learning. Teachers and students connect instantly. Private by design - only people with your room code can join.',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  {
    icon: '💝',
    title: 'Completely Free',
    description: 'No subscriptions, ads, or premium tiers. Built for the music community and supported by donations.',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
  {
    icon: '🌐',
    title: 'Universal Compatibility',
    description: 'Works instantly in any browser. Desktop, tablet, and mobile ready. MIDI keyboards connect seamlessly.',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  },
  {
    icon: '🎙️',
    title: 'Active Development',
    description: 'Regular updates bring new features and improvements. Built with modern technology and constantly improving.',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  },
];

const STEPS: StepData[] = [
  {
    number: '1',
    title: 'Create a Room',
    description: 'Click "Start Now" and get a unique room link.',
  },
  {
    number: '2',
    title: 'Share the Link',
    description: 'Send the link to whoever you want to play with. They click it and join instantly.',
  },
  {
    number: '3',
    title: 'Start Playing',
    description: 'Everyone can play piano together. Use your keyboard, mouse, or touch screen.',
  },
];

function HomeContent() {
  const [isRoomCreating, setRoomCreating] = createSignal(false);
  const [roomCode, setRoomCode] = createSignal('');
  const navigate = useNavigate();

  onMount(() => {
    document.title = 'p2piano - Online Piano Collaboration';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional online piano collaboration platform for teachers, students, and musicians. Play piano together remotely with real-time synchronization and studio-quality sound. Perfect for remote piano lessons and musical collaboration.');
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

  const joinRoom = () => {
    const code = roomCode().trim().toLowerCase();
    if (code.length === 5) {
      AudioManager.activate();
      navigateToRoom(code);
    }
  };

  const handleRoomCodeInput = (e: InputEvent) => {
    const target = e.target;
    const value = target.value.toLowerCase().slice(0, 5);
    setRoomCode(value);
    target.value = value;
  };

  return (
    <div class={styles.container}>
      {/* Hero Section */}
      <section class={styles.hero}>
        <div class={styles.heroContent}>
          <div class={styles.heroText}>
            <h1 class={styles.mainHeading}>
              The Best Way to Play Piano Together Online
            </h1>
            <p class={styles.subHeading}>
              Perfect for music lessons, jamming with friends, or connecting with nearby musicians. Create a room and share the link to start playing together instantly.
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
                    Start Now
                  </>
                )}
              </button>

              <div class={styles.orDivider}>
                <span>or</span>
              </div>

              <div class={styles.joinSection}>
                <label class={styles.joinLabel}>Have a room code?</label>
                <div class={styles.joinInputGroup}>
                  <input
                    class={styles.roomCodeInput}
                    placeholder="abcde"
                    maxLength="5"
                    inputMode="text"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck="false"
                    onInput={handleRoomCodeInput}
                    onKeyPress={(e: KeyPressEvent) => e.key === 'Enter' && joinRoom()}
                  />
                  <button
                    class={styles.joinButton}
                    onClick={joinRoom}
                    disabled={roomCode().length !== 5}
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>

          </div>
          <div class={styles.heroVisual}>
            <div class={styles.demoContext}>
              <LandingPiano />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section class={styles.howItWorks}>
        <div class={styles.howContainer}>
          <h2 class={styles.sectionHeading}>How It Works</h2>
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
              <div class={styles.faqQuestion}>Is p2piano good for online piano lessons?</div>
              <div class={styles.faqAnswer}><strong>Perfect for piano teachers</strong>, designed specifically for remote piano instruction with real-time collaboration</div>
            </div>
            <div class={styles.faqItem}>
              <div class={styles.faqQuestion}>Do I need to download anything?</div>
              <div class={styles.faqAnswer}><strong>No downloads needed</strong>, runs instantly in your browser</div>
            </div>
            <div class={styles.faqItem}>
              <div class={styles.faqQuestion}>Is it really free?</div>
              <div class={styles.faqAnswer}><strong>Completely free</strong>, no subscriptions, ads, or hidden costs</div>
            </div>
            <div class={styles.faqItem}>
              <div class={styles.faqQuestion}>Can I use my MIDI keyboard?</div>
              <div class={styles.faqAnswer}><strong>Full MIDI support</strong>, works with any MIDI keyboard or use mouse, touch, computer keyboard</div>
            </div>
            <div class={styles.faqItem}>
              <div class={styles.faqQuestion}>How well does it work across distances?</div>
              <div class={styles.faqAnswer}><strong>Best within 500 miles</strong>, our audio synchronization engine optimizes for minimal delay</div>
            </div>
            <div class={styles.faqItem}>
              <div class={styles.faqQuestion}>Are my sessions private?</div>
              <div class={styles.faqAnswer}><strong>Completely private</strong>, only people with your room code can join</div>
            </div>
            <div class={styles.faqItem}>
              <div class={styles.faqQuestion}>Does it work on mobile?</div>
              <div class={styles.faqAnswer}><strong>Works everywhere</strong>, phones, tablets, desktops, any modern browser</div>
            </div>
            <div class={styles.faqItem}>
              <div class={styles.faqQuestion}>What makes this different from other online piano apps?</div>
              <div class={styles.faqAnswer}><strong>Built specifically for piano</strong>, with studio-grade audio and minimal latency</div>
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
