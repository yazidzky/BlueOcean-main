import api from "./api";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function getSWRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

export type EnqueuePayload = {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
};

export async function enqueueBackgroundSync(payload: EnqueuePayload) {
  const reg = await getSWRegistration();
  if (!reg || !navigator.onLine) {
    // If SW not ready or offline, try message to controller and register sync
  }
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "enqueue", payload });
  }
  try {
    const readyReg = await navigator.serviceWorker.ready;
    if ("sync" in (readyReg as any)) {
      await (readyReg as any).sync.register("blueocean-sync");
    }
  } catch {
    // Sync not supported; ignore
  }
}

export async function subscribePush(vapidPublicKeyBase64?: string) {
  if (!("serviceWorker" in navigator)) return null;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const reg = await navigator.serviceWorker.ready;

  let appServerKey: Uint8Array | undefined;
  if (vapidPublicKeyBase64) {
    appServerKey = urlBase64ToUint8Array(vapidPublicKeyBase64);
  } else if (import.meta.env.VITE_VAPID_PUBLIC_KEY) {
    appServerKey = urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY);
  }

  const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: appServerKey as unknown as BufferSource });

  try {
    await api.post("/notifications/subscribe", sub);
  } catch {
    // Backend may not be ready yet; ignore
  }

  return sub;
}
