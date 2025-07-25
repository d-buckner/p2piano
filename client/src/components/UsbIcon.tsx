interface Props {
  width?: string | number;
  height?: string | number;
}

function UsbIcon(props: Props) {
  return (
    <svg 
      width={props.width || 16} 
      height={props.height || 16} 
      viewBox="-20 -40 122.88 120" 
      style={{ fill: 'currentColor', display: 'block', margin: 'auto' }}
    >
      <g transform="rotate(-90 61.44 39.49) translate(21.95, -21.95)">
        <path d="M13.83,25.37c7.03,0,11.84,4.39,13.38,10.34h6.27c3.58-3.42,5.64-8.23,7.55-12.7 c4.14-9.65,7.73-18.05,21.57-15.32C63.79,3.26,67.83,0,72.64,0c5.74,0,10.4,4.65,10.4,10.39c0,5.74-4.66,10.4-10.4,10.4 c-4.14,0-7.71-2.42-9.39-5.93l-0.03,0.12c-1.5-0.4-2.84-0.6-4.04-0.63c-6.79-0.15-9.11,5.25-11.73,11.38 c-0.16,0.37-0.32,0.74-0.48,1.12c-1.28,2.96-2.65,6-4.52,8.85l57.63,0v-7.77v-1.79l1.9,1.13l20.9,12.4l-22.81,13.53V42.69H56.1 c1.91,2.85,3.31,5.91,4.6,8.89c0.2,0.45,0.39,0.91,0.59,1.36c2.65,6.2,5,11.66,11.98,11.37c0.94-0.04,1.96-0.18,3.08-0.44v-4.94 c0-0.83,0.68-1.5,1.5-1.5h18.24c0.83,0,1.5,0.68,1.5,1.5v18.55c0,0.83-0.67,1.5-1.5,1.5l-18.24,0c-0.82,0-1.5-0.68-1.5-1.5V71 C62.6,73.67,59,65.29,54.88,55.66c-1.97-4.59-4.09-9.54-7.85-12.98l-19.81,0c-1.55,5.95-6.35,10.34-13.38,10.34 C6.79,53.02,0,46.83,0,39.2S6.79,25.37,13.83,25.37L13.83,25.37z"/>
      </g>
    </svg>
  );
}

export default UsbIcon;
