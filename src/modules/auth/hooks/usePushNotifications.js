import { supabase } from '../../lib/supabaseClient.js';

const VAPID_KEY = 'BEl63iUzVIspEoKIzS5tZ7j9Z1pjAfJ1kQqKpYpFJKQqKpYpFJKQqKpYpFJKQqKpYpFJKQqKpYpFJKQqKpYpFJKQ';

let subscription = null;

async function subscribe() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('[Push] Service Worker or PushManager not supported');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[Push] Permission denied:', permission);
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUInt8Array(VAPID_KEY)
    });

    subscription = sub;
    console.log('[Push] Subscribed:', subscription.endpoint);

    await guardarSuscripcion(subscription);

    return subscription;
  } catch (error) {
    console.error('[Push] Subscribe error:', error);
    return null;
  }
}

async function unsubscribe() {
  if (!subscription) {
    const registration = await navigator.serviceWorker.ready;
    subscription = await registration.pushManager.getSubscription();
  }

  if (subscription) {
    await subscription.unsubscribe();
    console.log('[Push] Unsubscribed');
    subscription = null;
  }
}

async function onMessage(callback) {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  
  registration.onpush = (event) => {
    console.log('[Push] Evento push recibido');
    if (callback) callback(event);
  };
}

async function guardarSuscripcion(sub) {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const endpoint = sub.endpoint;
    const keys = sub.getKeys ? sub.getKeys() : {};

    await supabase.from('push_suscripciones').upsert({
      user_id: user.id,
      endpoint,
      p256dh: keys?.p256dh || '',
      auth: keys?.auth || '',
      created_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    console.log('[Push] Suscripción guardada en Supabase');
  } catch (error) {
    console.error('[Push] Error guardando suscripción:', error);
  }
}

function urlBase64ToUInt8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const usePushNotifications = {
  subscribe,
  unsubscribe,
  onMessage,
  getSubscription: () => subscription
};