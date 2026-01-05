/**
 * Sound notification utilities for the dashboard
 */

export interface SoundOptions {
  volume?: number;
  loop?: boolean;
}

const DEFAULT_VOLUME = 0.3;

/**
 * Check if we're in a browser environment
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Play a notification sound
 */
export function playNotificationSound(options: SoundOptions = {}) {
  if (!isBrowser) return;

  const { volume = DEFAULT_VOLUME } = options;

  // Create audio context for browser notification sound
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Set frequency for a pleasant notification tone
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'sine';

    // Set volume (gain)
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    // Play the sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isBrowser || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Show browser notification
 */
export function showBrowserNotification(title: string, body: string, options?: NotificationOptions) {
  if (!isBrowser || !('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const notification = new Notification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    ...options,
  });

  // Auto-close after 5 seconds
  setTimeout(() => notification.close(), 5000);

  return notification;
}

/**
 * Check if notifications are supported and permitted
 */
export function canShowNotifications(): boolean {
  if (!isBrowser) return false;
  return 'Notification' in window && Notification.permission === 'granted';
}
