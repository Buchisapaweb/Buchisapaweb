/**
 * BUCHISAPA ADMIN - SYSTEM CONFIGURATION MODULE
 * Layer: /admin/js/modules/config.js
 */

(function () {
  'use strict';

  const AdminConfig = {
    schedule: 'Lunes a Domingo de 6:00 PM a 5:00 AM (Lima UTC-5)',
    deliveryFee: 5.00,
    whatsappNumber: '+51 984 123 456',

    isWithinBusinessHours() {
      // Cálculo horario Lima (UTC-5)
      const now = new Date();
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const limaTime = new Date(utcTime - (5 * 3600000));
      const hours = limaTime.getHours();

      // De 6:00 PM (18:00) a 5:00 AM (05:00)
      return (hours >= 18 || hours < 5);
    }
  };

  window.AdminConfig = AdminConfig;

})();
