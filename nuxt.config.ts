// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'GNK FR',
      meta: [
        { name: 'description', content: 'Site de l\'équipe GNK FR' }
      ],
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    }
  },
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxtjs/tailwindcss', 'nuxt-scheduler'],
  ui: {
    global: true,
    icons: ['mdi', 'simple-icons']
  },
  hooks: {
  },
  //ssr: true,
  vite: {
    build: {
      emptyOutDir: false
    }
  },
  nitro: {
    esbuild: {
      options: {
        target: 'esnext'
      }
    },
  },
})
