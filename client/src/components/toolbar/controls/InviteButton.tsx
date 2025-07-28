import { createSignal } from 'solid-js';
import Modal from '../../ui/Modal';
import Tooltip from '../../ui/Tooltip';
import { ShareIcon, CopyIcon, CheckIcon } from '../icons';
import * as styles from './InviteButton.css';


function InviteButton() {
  const [showInviteModal, setShowInviteModal] = createSignal(false);
  const [copied, setCopied] = createSignal(false);
  
  // Use current window location to generate invite URL
  const roomUrl = () => window.location.href;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(roomUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Tooltip text="Invite Others">
        <button
          class={styles.inviteButton}
          onClick={() => setShowInviteModal(true)}
        >
          <ShareIcon size={14} />
          <span>Invite</span>
        </button>
      </Tooltip>

      <Modal
        open={showInviteModal()}
        onClose={() => setShowInviteModal(false)}
        title="Invite to Room"
      >
        <div class={styles.modalContent}>
          <p class={styles.modalDescription}>Share this link to invite others:</p>
          
          <div class={styles.linkContainer}>
            <input
              type="text"
              value={roomUrl()}
              readOnly
              class={styles.linkInput}
            />
            <button
              onClick={handleCopyLink}
              class={`${styles.copyButton} ${copied() ? styles.copied : ''}`}
            >
              {copied() ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
            </button>
          </div>
          
          {copied() && (
            <p class={styles.copiedMessage}>Link copied to clipboard!</p>
          )}
        </div>
      </Modal>
    </>
  );
}

export default InviteButton;
