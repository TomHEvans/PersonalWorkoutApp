// Register the service worker in production builds only, so it never
// interferes with the Vite dev server / HMR.
export function registerSW(): void {
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* registration failures are non-fatal */
      })
    })
  }
}
