export function unregister() {
  if('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(reg => reg.unregister());
  }
}