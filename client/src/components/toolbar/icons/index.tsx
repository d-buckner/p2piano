type IconProps = {
  size?: number;
  class?: string;
};

export function PlayIcon(props: IconProps) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="currentColor" class={props.class}>
      <path d="M7 4v16l13-8z"/>
    </svg>
  );
}

export function PauseIcon(props: IconProps) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="currentColor" class={props.class}>
      <path d="M7 4h3v16H7V4zm7 0h3v16h-3V4z"/>
    </svg>
  );
}

export function StopIcon(props: IconProps) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="currentColor" class={props.class}>
      <rect x="6" y="6" width="12" height="12"/>
    </svg>
  );
}

export function MetronomeIcon(props: IconProps) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="currentColor" class={props.class}>
      <line x1="12" y1="4" x2="16" y2="18" stroke="currentColor" stroke-width="2" fill="none"/>
      <circle cx="16" cy="18" r="2"/>
      <rect x="14" y="8" width="4" height="2" rx="1"/>
    </svg>
  );
}

export function MusicIcon(props: IconProps) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class={props.class}>
      <path d="M9 18V5l12-2v13M9 9l12-2M3 18a3 3 0 1 0 6 0 3 3 0 0 0-6 0zM15 18a3 3 0 1 0 6 0 3 3 0 0 0-6 0z"/>
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class={props.class}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

export function CircleIcon(props: IconProps) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="currentColor" class={props.class}>
      <circle cx="12" cy="12" r="10"/>
    </svg>
  );
}

export function SquareIcon(props: IconProps) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="currentColor" class={props.class}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    </svg>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class={props.class}>
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class={props.class}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

export function WifiIcon(props: IconProps) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class={props.class}>
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
      <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <line x1="12" y1="20" x2="12.01" y2="20"/>
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class={props.class}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v6m0 6v6m3.22-10.22l4.24-4.24M6.34 7.34L2.1 3.1m10.12 13.56l4.24 4.24M7.34 16.66L3.1 20.9M1 12h6m6 0h6"/>
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class={props.class}>
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class={props.class}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class={props.class}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
