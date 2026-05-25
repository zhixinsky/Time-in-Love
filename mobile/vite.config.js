import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  vue: {
    template: {
      compilerOptions: {
        // Skyline 原生组件，仅微信小程序运行时生效
        isCustomElement: (tag) => tag === 'draggable-sheet'
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['import', 'legacy-js-api']
      }
    }
  }
})
