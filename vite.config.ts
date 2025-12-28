import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import neon from './neon-vite-plugin.ts'

const config = defineConfig({
  optimizeDeps: {
    exclude: ['@resvg/resvg-js'],
  },
  plugins: [
    devtools(),
    nitro({
        preset: 'vercel',
        //=========Temporary Fix untill stable release========= Start
      rollupConfig: {
        external: [],
      },
      // Prevent TanStack packages from being externalized during SSR
      externals: {
        inline: [
          '@tanstack/router-core',
          '@tanstack/react-router',
          '@tanstack/react-start',
          '@tanstack/start-server-core',
          '@tanstack/start-client-core',
        ],
        },
       //=========Temporary Fix untill stable release========= End
    }),
    neon,
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
})

export default config
