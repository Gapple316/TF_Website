// @ts-check
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Nötig für absolute URLs. Open-Graph-Bilder (Link-Vorschau in Mail und
  // WhatsApp, siehe src/layouts/BriefLayout.astro) werden von den meisten
  // Diensten nur ausgewertet, wenn sie absolut angegeben sind – relative
  // Pfade bleiben dort leer. Astro.site liefert diesen Wert.
  site: 'https://true-frame.net',

  integrations: [vue()],

  // Astros Dev-Server/Static-Handling löst /admin (ohne Dateiendung) nicht
  // automatisch zu public/admin/index.html auf, wie es die meisten
  // Static-Host-Konventionen (und TinaCMS' eigene Doku) erwarten würden –
  // ohne diesen Redirect landet man auf Astros eigener 404-Seite.
  redirects: {
    '/admin': '/admin/index.html',
  },

  vite: {
    plugins: [tailwindcss()]
  }
});