// Este arquivo registra o service worker para o PWA
if (typeof window !== "undefined" && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        // Sucesso no registro
        // console.log('Service Worker registrado:', registration);
      })
      .catch(error => {
        // Falha no registro
        // console.error('Erro ao registrar Service Worker:', error);
      });
  });
}
