// @ts-check
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
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