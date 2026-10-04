/*
 * Banner de cookies + Google Analytics con consentimiento previo.
 * Usa CookieConsent v3 (https://github.com/orestbida/cookieconsent), cargado desde jsDelivr.
 * Google Analytics solo se carga si la persona acepta la categoría "analytics".
 * Los mapas de Google (iframes con class="consent-map" y data-src) solo se cargan
 * si se acepta la categoría "external" o si se pulsa el botón del propio mapa.
 */
(function () {
  var GA_ID = 'G-WNHK6D9FLW';
  var lang = (document.documentElement.lang || 'es').slice(0, 2) === 'ca' ? 'ca' : 'es';
  var links = {
    es: { privacy: 'privacidad.html', cookies: 'politica-cookies.html' },
    ca: { privacy: 'privacitat.html', cookies: 'politica-galetes.html' }
  }[lang];

  // --- Google Analytics (Consent Mode v2, todo denegado por defecto) ---
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  var gaLoaded = false;
  function loadAnalytics() {
    if (gaLoaded) return;
    gaLoaded = true;
    gtag('consent', 'update', { analytics_storage: 'granted' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  // --- Mapas de Google: marcador hasta que haya consentimiento ---
  var mapText = {
    es: { msg: 'El mapa lo proporciona Google Maps, que puede usar cookies.', btn: 'Mostrar mapa' },
    ca: { msg: 'El mapa el proporciona Google Maps, que pot fer servir galetes.', btn: 'Mostra el mapa' }
  }[lang];

  function loadMaps() {
    document.querySelectorAll('iframe.consent-map[data-src]').forEach(function (f) {
      f.src = f.getAttribute('data-src');
      f.removeAttribute('data-src');
      f.style.display = '';
      if (f.previousElementSibling && f.previousElementSibling.classList.contains('consent-map-placeholder')) {
        f.previousElementSibling.remove();
      }
    });
  }

  function showMapPlaceholders() {
    document.querySelectorAll('iframe.consent-map[data-src]').forEach(function (f) {
      if (f.previousElementSibling && f.previousElementSibling.classList.contains('consent-map-placeholder')) return;
      var box = document.createElement('div');
      box.className = 'consent-map-placeholder';
      box.innerHTML = '<p>' + mapText.msg + '</p><button type="button" class="btn">' + mapText.btn + '</button>';
      box.querySelector('button').addEventListener('click', function () {
        CookieConsent.acceptCategory('external');
      });
      f.style.display = 'none';
      f.parentNode.insertBefore(box, f);
    });
  }

  var style = document.createElement('style');
  style.textContent =
    '.consent-map-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.8rem;' +
    'min-height:250px;height:100%;padding:1.5rem;background:#f9f3fc;border:1px dashed #bfa4d1;border-radius:8px;' +
    'text-align:center;box-sizing:border-box;color:#38264e;font-size:.95rem;}' +
    '.consent-map-placeholder p{margin:0;}' +
    '.consent-map-placeholder .btn{cursor:pointer;font:inherit;}' +
    '#cc-main{--cc-btn-primary-bg:#9f7db4;--cc-btn-primary-border-color:#9f7db4;' +
    '--cc-btn-primary-hover-bg:#38264e;--cc-btn-primary-hover-border-color:#38264e;' +
    '--cc-toggle-on-bg:#9f7db4;--cc-font-family:"Open Sans",sans-serif;}';
  document.head.appendChild(style);

  function applyConsent() {
    if (CookieConsent.acceptedCategory('analytics')) loadAnalytics();
    if (CookieConsent.acceptedCategory('external')) loadMaps(); else showMapPlaceholders();
  }

  // --- Configuración del banner ---
  CookieConsent.run({
    guiOptions: {
      consentModal: { layout: 'box', position: 'bottom left', equalWeightButtons: true },
      preferencesModal: { layout: 'box', equalWeightButtons: true }
    },
    categories: {
      necessary: { enabled: true, readOnly: true },
      analytics: {
        autoClear: { cookies: [{ name: /^_ga/ }], reloadPage: true }
      },
      external: {}
    },
    onConsent: applyConsent,
    onChange: function (ev) {
      applyConsent();
      // Si se retira un consentimiento ya dado, recargamos para dejar de usar el servicio.
      if (ev.changedCategories.indexOf('external') !== -1 && !CookieConsent.acceptedCategory('external')) {
        location.reload();
      }
    },
    language: {
      default: lang,
      translations: {
        es: {
          consentModal: {
            title: 'Usamos cookies',
            description: 'Utilizo cookies propias necesarias para el funcionamiento de la web y, solo si lo aceptas, ' +
              'cookies de Google Analytics para saber cómo se usa la web y de Google Maps para mostrar el mapa de la consulta. ' +
              '<a href="' + links.cookies + '">Política de cookies</a>',
            acceptAllBtn: 'Aceptar todas',
            acceptNecessaryBtn: 'Rechazar',
            showPreferencesBtn: 'Configurar',
            footer: '<a href="' + links.privacy + '">Política de privacidad</a>'
          },
          preferencesModal: {
            title: 'Preferencias de cookies',
            acceptAllBtn: 'Aceptar todas',
            acceptNecessaryBtn: 'Rechazar todas',
            savePreferencesBtn: 'Guardar preferencias',
            closeIconLabel: 'Cerrar',
            sections: [
              {
                description: 'Puedes elegir qué cookies aceptas. Puedes cambiar de opinión cuando quieras desde el enlace ' +
                  '"Configurar cookies" al pie de cada página. Más información en la <a href="' + links.cookies + '">política de cookies</a>.'
              },
              {
                title: 'Necesarias',
                description: 'Imprescindibles para que la web funcione y para recordar tu elección sobre las cookies.',
                linkedCategory: 'necessary'
              },
              {
                title: 'Analíticas',
                description: 'Google Analytics me ayuda a saber cuántas personas visitan la web y qué contenidos les resultan útiles. Los datos son estadísticos.',
                linkedCategory: 'analytics'
              },
              {
                title: 'Servicios externos',
                description: 'Google Maps, para mostrar la ubicación de la consulta. Google puede usar sus propias cookies.',
                linkedCategory: 'external'
              }
            ]
          }
        },
        ca: {
          consentModal: {
            title: 'Fem servir galetes',
            description: 'Faig servir galetes pròpies necessàries per al funcionament del web i, només si ho acceptes, ' +
              'galetes de Google Analytics per saber com s\'utilitza el web i de Google Maps per mostrar el mapa de la consulta. ' +
              '<a href="' + links.cookies + '">Política de galetes</a>',
            acceptAllBtn: 'Accepta-les totes',
            acceptNecessaryBtn: 'Rebutja',
            showPreferencesBtn: 'Configura',
            footer: '<a href="' + links.privacy + '">Política de privacitat</a>'
          },
          preferencesModal: {
            title: 'Preferències de galetes',
            acceptAllBtn: 'Accepta-les totes',
            acceptNecessaryBtn: 'Rebutja-les totes',
            savePreferencesBtn: 'Desa les preferències',
            closeIconLabel: 'Tanca',
            sections: [
              {
                description: 'Pots triar quines galetes acceptes. Pots canviar d\'opinió quan vulguis des de l\'enllaç ' +
                  '"Configura les galetes" al peu de cada pàgina. Més informació a la <a href="' + links.cookies + '">política de galetes</a>.'
              },
              {
                title: 'Necessàries',
                description: 'Imprescindibles perquè el web funcioni i per recordar la teva elecció sobre les galetes.',
                linkedCategory: 'necessary'
              },
              {
                title: 'Analítiques',
                description: 'Google Analytics m\'ajuda a saber quantes persones visiten el web i quins continguts els resulten útils. Les dades són estadístiques.',
                linkedCategory: 'analytics'
              },
              {
                title: 'Serveis externs',
                description: 'Google Maps, per mostrar la ubicació de la consulta. Google pot fer servir les seves pròpies galetes.',
                linkedCategory: 'external'
              }
            ]
          }
        }
      }
    }
  });

  // Si no hay consentimiento todavía, mostramos los marcadores de los mapas.
  if (!CookieConsent.validConsent()) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showMapPlaceholders);
    else showMapPlaceholders();
  }
})();
