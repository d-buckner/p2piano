import { createSignal, onMount, onCleanup, For } from 'solid-js';
import * as styles from './LandingPiano.css';


const USERS = [
  { id: 'emma', name: 'Emma', color: '#3b82f6' },
  { id: 'liam', name: 'Liam', color: '#10b981' },
  { id: 'sophia', name: 'Sophia', color: '#f59e0b' },
];

// Simple, fluid piano trio
const COLLABORATIVE_PATTERN = [
  // Emma starts melody
  { key: 'C', delay: 0, user: 'emma' },
  { key: 'D', delay: 600, user: 'emma' },
  { key: 'E', delay: 1200, user: 'emma' },
  
  // Liam joins with bass
  { key: 'C', delay: 1800, user: 'liam' },
  { key: 'F', delay: 2400, user: 'emma' },
  
  // Sophia adds harmony
  { key: 'A', delay: 3000, user: 'sophia' },
  { key: 'G', delay: 3600, user: 'emma' },
  { key: 'E', delay: 4200, user: 'sophia' },
  
  // Everyone together - final phrase
  { key: 'C', delay: 4800, user: 'liam' },
  { key: 'E', delay: 4800, user: 'sophia' },
  { key: 'G', delay: 4800, user: 'emma' },
];

export default function LandingPiano() {
  const [activeKeys, setActiveKeys] = createSignal<Map<string, string>>(new Map());
  const [activeUsers, setActiveUsers] = createSignal<Set<string>>(new Set());
  
  let patternInterval: number;
  
  const pressKey = (key: string, userId: string) => {
    const user = USERS.find(u => u.id === userId);
    if (!user) return;
    
    setActiveKeys(prev => new Map([...prev, [key, user.color]]));
    setActiveUsers(prev => new Set([...prev, userId]));
    
    // Remove key after duration
    setTimeout(() => {
      setActiveKeys(prev => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
      
      // Check if user has any other active keys before removing from active users
      setTimeout(() => {
        setActiveUsers(prev => {
          const currentKeys = activeKeys();
          const userHasActiveKeys = Array.from(currentKeys.values()).some(color => color === user.color);
          
          if (!userHasActiveKeys) {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          }
          return prev;
        });
      }, 10); // Small delay to ensure activeKeys state has updated
    }, 400);
  };
  
  const playCollaboration = () => {
    COLLABORATIVE_PATTERN.forEach(({ key, delay, user }) => {
      setTimeout(() => pressKey(key, user), delay);
    });
  };
  
  onMount(() => {
    playCollaboration();
    patternInterval = setInterval(playCollaboration, 4000);
  });
  
  onCleanup(() => {
    if (patternInterval) clearInterval(patternInterval);
  });
  
  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const blackKeys = [
    { note: 'C#', left: '29px' },    // After C (0 * 41 + 29)
    { note: 'D#', left: '70px' },    // After D (1 * 41 + 29) 
    { note: 'F#', left: '152px' },   // After F (3 * 41 + 29)
    { note: 'G#', left: '193px' },   // After G (4 * 41 + 29)
    { note: 'A#', left: '234px' },   // After A (5 * 41 + 29)
  ];
  
  return (
    <div class={styles.container}>
      <div class={styles.pianoContainer}>
        {/* White keys */}
        <div class={styles.whiteKeysContainer}>
          <For each={whiteKeys}>
            {(key) => {
              const isActive = () => activeKeys().has(key);
              const keyColor = () => activeKeys().get(key) || '#f9fafb';
              return (
                <div 
                  classList={{
                    [styles.whiteKey]: true,
                    [styles.keyActive]: isActive()
                  }}
                  style={{
                    'background-color': keyColor()
                  }}
                />
              );
            }}
          </For>
        </div>
        
        {/* Black keys */}
        <div class={styles.blackKeysContainer}>
          <For each={blackKeys}>
            {(key) => {
              const isActive = () => activeKeys().has(key.note);
              const keyColor = () => activeKeys().get(key.note) || '#1f2937';
              return (
                <div 
                  classList={{
                    [styles.blackKey]: true,
                    [styles.keyActive]: isActive()
                  }}
                  style={{
                    left: key.left,
                    'background-color': keyColor()
                  }}
                />
              );
            }}
          </For>
        </div>
        
        {/* User avatars inside piano */}
        <div class={styles.userAvatars}>
        <For each={USERS}>
          {(user) => {
            const isUserActive = () => activeUsers().has(user.id);
            return (
              <div class={styles.userAvatar}>
                <div 
                  classList={{
                    [styles.avatar]: true,
                    [styles.avatarActive]: isUserActive()
                  }}
                  style={{ 'background-color': user.color }}
                >
                  {user.name.charAt(0)}
                </div>
                <span class={styles.userName}>{user.name}</span>
              </div>
            );
          }}
        </For>
        </div>
      </div>
      
      <div class={styles.description}>
        Watch multiple users play together in real-time
      </div>
    </div>
  );
};
