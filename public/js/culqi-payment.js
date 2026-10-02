/**
 * Enrutador hacia la carpeta dedicada /culqi/culqi-payment.js
 */
if (typeof window !== 'undefined' && !window.BuchisapaCulqi) {
  const script = document.createElement('script');
  script.src = '/culqi/culqi-payment.js';
  script.async = false;
  document.head.appendChild(script);
}
