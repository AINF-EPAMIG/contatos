// Este arquivo registra o service worker para o PWA
if (typeof window !== "undefined" && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => {
        // Sucesso no registro
        // console.log('Service Worker registrado');
      })
      .catch(() => {
        // Falha no registro
        // console.error('Erro ao registrar Service Worker');
      });
  });
}
