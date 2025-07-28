import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Music, 
  Users, 
  Share2, 
  Copy, 
  Check,
  ChevronDown,
  Circle,
  Usb,
  X,
  Settings,
  Wifi
} from 'lucide-react';

// Ocean Breeze Theme colors adapted for dark mode
const theme = {
  colors: {
    primary: '#0284c7',          // Ocean blue for primary actions
    primaryDark: '#0369a1',      // Darker ocean blue for hover
    primaryLight: '#0ea5e9',     // Lighter ocean blue
    success: '#10b981',          // Ocean green
    successDark: '#059669',      
    danger: '#dc2626',           // Keep red for recording
    background: '#111827',       // Dark background
    secondary: '#1f2937',        // Slightly lighter dark
    foreground: '#f3f4f6',       // Light text
    muted: '#9ca3af',           // Muted gray text
    border: 'rgba(156, 163, 175, 0.2)', // Subtle borders
  }
};

// Add CSS for animations and slider
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Ysabeau:wght@400;500;600&family=Ysabeau+Office:wght@400;500;600;700&display=swap');
  
  body {
    font-family: 'Ysabeau', sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Ysabeau Office', sans-serif;
  }
  
  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    background: ${theme.colors.primary};
    cursor: pointer;
    border-radius: 50%;
  }
  .slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: ${theme.colors.primary};
    cursor: pointer;
    border-radius: 50%;
    border: none;
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .dropdown-enter {
    animation: slideDown 0.2s ease-out;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  .metronome-pulse {
    animation: pulse 0.5s ease-in-out;
  }
`;

// Custom hook for click outside detection
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

// Tooltip component
const Tooltip = ({ children, text, shortcut }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-700 text-white text-xs rounded whitespace-nowrap z-50">
          {text}
          {shortcut && (
            <span className="ml-2 text-gray-400">({shortcut})</span>
          )}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-gray-700"></div>
        </div>
      )}
    </div>
  );
};

const P2PianoToolbar = () => {
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [isMidiEnabled, setIsMidiEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedInstrument, setSelectedInstrument] = useState('piano');
  const [showMetronomeDropdown, setShowMetronomeDropdown] = useState(false);
  const [showInstrumentDropdown, setShowInstrumentDropdown] = useState(false);
  const [showRecordingsDropdown, setShowRecordingsDropdown] = useState(false);
  const [showMidiDropdown, setShowMidiDropdown] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedMidiDevice, setSelectedMidiDevice] = useState(null);
  const [lastMidiDevice, setLastMidiDevice] = useState(null);
  const [metronomeBeat, setMetronomeBeat] = useState(false);
  
  // Refs for click outside
  const metronomeRef = useRef(null);
  const instrumentRef = useRef(null);
  const recordingsRef = useRef(null);
  const midiRef = useRef(null);
  
  // Mock data
  const latency = 12;
  const connectionQuality = latency < 20 ? 'good' : latency < 50 ? 'fair' : 'poor';
  const roomCode = 'ABC123';
  const roomUrl = `https://p2piano.app/room/${roomCode}`;
  const recordings = [
    { id: 1, name: 'Recording 1', date: '2024-03-20 14:30' },
    { id: 2, name: 'Recording 2', date: '2024-03-20 15:45' },
    { id: 3, name: 'Recording 3', date: '2024-03-21 10:15' }
  ];
  const activeUsers = [
    { id: 1, name: 'Alice', color: '#0ea5e9' },
    { id: 2, name: 'Bob', color: '#06b6d4' },
    { id: 3, name: 'Charlie', color: '#0284c7' }
  ];
  const instruments = [
    { value: 'piano', label: 'Piano', icon: '🎹' },
    { value: 'synth', label: 'Synth', icon: '🎛️' },
    { value: 'bass', label: 'Electric Bass', icon: '🎸' }
  ];
  const midiDevices = [
    { id: 'device1', name: 'Arturia KeyStep', type: 'input' },
    { id: 'device2', name: 'Roland FP-30', type: 'input' },
    { id: 'device3', name: 'MIDI Fighter 3D', type: 'input' }
  ];
  
  // Close dropdowns when clicking outside
  useClickOutside(metronomeRef, () => setShowMetronomeDropdown(false));
  useClickOutside(instrumentRef, () => setShowInstrumentDropdown(false));
  useClickOutside(recordingsRef, () => setShowRecordingsDropdown(false));
  useClickOutside(midiRef, () => setShowMidiDropdown(false));
  
  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);
  
  // Metronome beat indicator
  useEffect(() => {
    let interval;
    if (isMetronomeActive) {
      const beatInterval = 60000 / bpm;
      interval = setInterval(() => {
        setMetronomeBeat(true);
        setTimeout(() => setMetronomeBeat(false), 100);
      }, beatInterval);
    }
    return () => clearInterval(interval);
  }, [isMetronomeActive, bpm]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      switch(e.key) {
        case ' ':
          e.preventDefault();
          setIsMetronomeActive(prev => !prev);
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          setIsRecording(prev => !prev);
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <style>{styles}</style>
      <div style={{ 
        backgroundColor: theme.colors.background,
        color: theme.colors.foreground,
        borderBottom: `1px solid ${theme.colors.border}`
      }} className="px-3 py-2 flex items-center justify-between shadow-lg">
        {/* App Name */}
        <div className="flex items-center">
          <h1 className="text-lg font-bold mr-4 pr-4" style={{ 
            borderRight: `1px solid ${theme.colors.border}`,
            fontFamily: "'Ysabeau Office', sans-serif"
          }}>p2piano</h1>
          
          <div className="flex items-center space-x-2">
            {/* Metronome */}
            <div className="relative" ref={metronomeRef}>
              <div className="flex items-center rounded h-7" style={{ backgroundColor: theme.colors.secondary }}>
                <Tooltip text="Start/Stop Metronome" shortcut="Space">
                  <button
                    onClick={() => setIsMetronomeActive(!isMetronomeActive)}
                    className={`h-full px-1.5 rounded-l text-xs transition-colors`}
                    style={{ 
                      backgroundColor: isMetronomeActive ? theme.colors.primary : 'transparent',
                      color: isMetronomeActive ? 'white' : theme.colors.muted
                    }}
                  >
                    <div className={metronomeBeat && isMetronomeActive ? 'metronome-pulse' : ''}>
                      {isMetronomeActive ? <Pause size={14} /> : <Play size={14} />}
                    </div>
                  </button>
                </Tooltip>
                <button
                  onClick={() => setShowMetronomeDropdown(!showMetronomeDropdown)}
                  className={`h-full px-2 flex items-center space-x-1 text-xs transition-colors hover:bg-gray-700 rounded-r`}
                  style={{ 
                    borderLeft: `1px solid ${theme.colors.border}`,
                    backgroundColor: showMetronomeDropdown ? 'rgba(55, 65, 81, 0.5)' : 'transparent'
                  }}
                >
                  <Music size={12} />
                  <span>{bpm}</span>
                  <ChevronDown size={12} className={`transition-transform ${showMetronomeDropdown ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {showMetronomeDropdown && (
                <div className="absolute top-full mt-1 left-0 rounded shadow-xl p-3 w-56 z-10 dropdown-enter" style={{ 
                  backgroundColor: theme.colors.secondary,
                  border: `1px solid ${theme.colors.border}`
                }}>
                  <h3 className="text-xs font-semibold mb-2 text-gray-300">Metronome</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-gray-400">BPM</label>
                        <span className="text-xs font-mono text-gray-300 px-1.5 py-0.5 rounded" style={{ backgroundColor: theme.colors.background }}>{bpm}</span>
                      </div>
                      <input
                        type="range"
                        value={bpm}
                        onChange={(e) => setBpm(parseInt(e.target.value))}
                        className="w-full h-1 rounded-lg appearance-none cursor-pointer slider"
                        min="40"
                        max="300"
                        style={{
                          backgroundColor: theme.colors.background,
                          background: `linear-gradient(to right, ${theme.colors.primary} 0%, ${theme.colors.primary} ${((bpm - 40) / (300 - 40)) * 100}%, ${theme.colors.background} ${((bpm - 40) / (300 - 40)) * 100}%, ${theme.colors.background} 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>40</span>
                        <span>300</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Time Signature</label>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { value: 4, label: '4/4' },
                          { value: 3, label: '3/4' },
                          { value: 2, label: '2/4' },
                          { value: 6, label: '6/8' },
                        ].map(sig => (
                          <button
                            key={sig.value}
                            onClick={() => setBeatsPerMeasure(sig.value)}
                            className={`px-2 py-1 text-xs rounded transition-all`}
                            style={{ 
                              backgroundColor: beatsPerMeasure === sig.value ? theme.colors.primary : theme.colors.background,
                              color: beatsPerMeasure === sig.value ? 'white' : theme.colors.muted
                            }}
                          >
                            {sig.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* USB MIDI Toggle */}
            <div className="relative" ref={midiRef}>
              <Tooltip text={isMidiEnabled ? "MIDI Device Settings" : "Enable MIDI"} shortcut="">
                <button
                  onClick={() => {
                    if (!isMidiEnabled && midiDevices.length > 0) {
                      setIsMidiEnabled(true);
                      const deviceToSelect = lastMidiDevice || midiDevices[0];
                      setSelectedMidiDevice(deviceToSelect);
                    } else if (isMidiEnabled) {
                      setShowMidiDropdown(!showMidiDropdown);
                    }
                  }}
                  className={`flex items-center space-x-1 px-2 h-7 rounded text-xs transition-all`}
                  style={{ 
                    backgroundColor: isMidiEnabled ? theme.colors.primary : theme.colors.secondary,
                    color: isMidiEnabled ? 'white' : theme.colors.muted
                  }}
                >
                  <Usb size={14} />
                  <span>{isMidiEnabled && selectedMidiDevice ? selectedMidiDevice.name : 'MIDI'}</span>
                  {isMidiEnabled && midiDevices.length > 1 && (
                    <ChevronDown size={12} className={`transition-transform ${showMidiDropdown ? 'rotate-180' : ''}`} />
                  )}
                </button>
              </Tooltip>
              
              {showMidiDropdown && isMidiEnabled && (
                <div className="absolute top-full mt-1 left-0 rounded shadow-xl p-2 w-56 z-10 dropdown-enter" style={{ 
                  backgroundColor: theme.colors.secondary,
                  border: `1px solid ${theme.colors.border}`
                }}>
                  <h3 className="text-xs font-semibold mb-2 px-2 text-gray-300">MIDI Devices</h3>
                  {midiDevices.map(device => (
                    <button
                      key={device.id}
                      onClick={() => {
                        setSelectedMidiDevice(device);
                        setLastMidiDevice(device);
                        setShowMidiDropdown(false);
                      }}
                      className={`w-full text-left px-2 py-1 hover:bg-gray-700 rounded flex items-center justify-between text-xs transition-colors`}
                      style={{ 
                        backgroundColor: selectedMidiDevice?.id === device.id ? 'rgba(55, 65, 81, 0.5)' : 'transparent'
                      }}
                    >
                      <span>{device.name}</span>
                      {selectedMidiDevice?.id === device.id && (
                        <span style={{ color: theme.colors.primary }}>✓</span>
                      )}
                    </button>
                  ))}
                  <div className="border-t border-gray-700 mt-2 pt-2">
                    <button
                      onClick={() => {
                        setIsMidiEnabled(false);
                        setSelectedMidiDevice(null);
                        setShowMidiDropdown(false);
                      }}
                      className="w-full text-left px-2 py-1 hover:bg-gray-700 rounded text-xs transition-colors"
                      style={{ color: theme.colors.danger }}
                    >
                      Disconnect MIDI
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Recording */}
            <div className="relative" ref={recordingsRef}>
              <Tooltip text={isRecording ? "Stop Recording" : "Start Recording"} shortcut="R">
                <button
                  onClick={() => {
                    if (!isRecording) {
                      setIsRecording(true);
                    } else {
                      setIsRecording(false);
                      setShowRecordingsDropdown(true);
                    }
                  }}
                  className={`flex items-center space-x-1 px-2 h-7 rounded text-xs transition-all ${
                    isRecording ? 'animate-pulse' : ''
                  }`}
                  style={{ 
                    backgroundColor: isRecording ? theme.colors.danger : theme.colors.secondary,
                    color: isRecording ? 'white' : theme.colors.muted
                  }}
                >
                  {isRecording ? <Square size={14} /> : <Circle size={14} />}
                  <span>{isRecording ? formatTime(recordingTime) : 'REC'}</span>
                </button>
              </Tooltip>
              
              {showRecordingsDropdown && (
                <div className="absolute top-full mt-1 left-0 rounded shadow-xl p-2 w-56 z-10 dropdown-enter" style={{ 
                  backgroundColor: theme.colors.secondary,
                  border: `1px solid ${theme.colors.border}`
                }}>
                  <h3 className="text-xs font-semibold mb-2 px-2 text-gray-300">Recordings</h3>
                  <div className="max-h-32 overflow-y-auto">
                    {recordings.map(rec => (
                      <button
                        key={rec.id}
                        className="w-full text-left px-2 py-1 hover:bg-gray-700 rounded flex items-center justify-between text-xs transition-colors"
                      >
                        <span>{rec.name}</span>
                        <span className="text-xs text-gray-500">{rec.date}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Instrument Selector */}
            <div className="relative" ref={instrumentRef}>
              <button
                onClick={() => setShowInstrumentDropdown(!showInstrumentDropdown)}
                className={`flex items-center space-x-1 px-2 h-7 rounded hover:bg-gray-700 text-xs transition-all`}
                style={{ 
                  backgroundColor: showInstrumentDropdown ? 'rgba(55, 65, 81, 0.5)' : theme.colors.secondary
                }}
              >
                <span className="text-sm">{instruments.find(i => i.value === selectedInstrument)?.icon}</span>
                <span>{instruments.find(i => i.value === selectedInstrument)?.label}</span>
                <ChevronDown size={12} className={`transition-transform ${showInstrumentDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showInstrumentDropdown && (
                <div className="absolute top-full mt-1 left-0 rounded shadow-xl p-1 w-48 z-10 dropdown-enter" style={{ 
                  backgroundColor: theme.colors.secondary,
                  border: `1px solid ${theme.colors.border}`
                }}>
                  {instruments.map(inst => (
                    <button
                      key={inst.value}
                      onClick={() => {
                        setSelectedInstrument(inst.value);
                        setShowInstrumentDropdown(false);
                      }}
                      className="w-full text-left px-2 py-1.5 hover:bg-gray-700 rounded flex items-center space-x-2 text-xs transition-colors"
                    >
                      <span className="text-sm">{inst.icon}</span>
                      <span>{inst.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-2">
          {/* Latency Indicator */}
          <Tooltip text="Connection Quality" shortcut="">
            <div className="flex items-center space-x-1 px-2 h-7 rounded text-xs" style={{ backgroundColor: theme.colors.secondary }}>
              <Wifi size={12} className={`${
                connectionQuality === 'good' ? 'text-green-400' : 
                connectionQuality === 'fair' ? 'text-yellow-400' : 
                'text-red-400'
              }`} />
              <span className="text-gray-400">{latency}ms</span>
            </div>
          </Tooltip>

          {/* Active Users */}
          <div className="flex items-center space-x-1 rounded px-2 h-7" style={{ backgroundColor: theme.colors.secondary }}>
            <Users size={14} className="text-gray-400" />
            <div className="flex -space-x-1">
              {activeUsers.map(user => (
                <div
                  key={user.id}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{ 
                    backgroundColor: user.color,
                    color: 'white',
                    border: `1px solid ${theme.colors.background}`
                  }}
                  title={user.name}
                >
                  {user.name[0]}
                </div>
              ))}
            </div>
          </div>

          {/* Invitation */}
          <Tooltip text="Invite Others" shortcut="">
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center space-x-1 px-2 h-7 rounded text-xs transition-colors"
              style={{ 
                backgroundColor: theme.colors.primary,
                color: 'white'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.primaryDark}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.primary}
            >
              <Share2 size={14} />
              <span>Invite</span>
            </button>
          </Tooltip>

          {/* Room Code */}
          <Tooltip text="Room Code" shortcut="">
            <div className="px-2 h-7 rounded text-xs font-mono flex items-center" style={{ backgroundColor: theme.colors.secondary }}>
              {roomCode}
            </div>
          </Tooltip>

          {/* Settings */}
          <Tooltip text="Settings" shortcut="">
            <button
              className="p-1.5 h-7 w-7 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors flex items-center justify-center"
              style={{ backgroundColor: theme.colors.secondary }}
            >
              <Settings size={14} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-lg p-5 w-80 dropdown-enter" style={{ 
            backgroundColor: theme.colors.secondary,
            border: `1px solid ${theme.colors.border}`
          }}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "'Ysabeau Office', sans-serif" }}>Invite to Room</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <p className="text-gray-300 mb-3 text-sm">Share this link to invite others:</p>
            
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={roomUrl}
                readOnly
                className="flex-1 px-2 py-1.5 rounded text-sm"
                style={{ 
                  backgroundColor: theme.colors.background,
                  color: 'white',
                  border: `1px solid ${theme.colors.border}`
                }}
              />
              <button
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded transition-all`}
                style={{ 
                  backgroundColor: copied ? theme.colors.success : theme.colors.primary,
                  color: 'white'
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            
            {copied && (
              <p className="text-green-400 text-xs mt-2">Link copied to clipboard!</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default P2PianoToolbar;