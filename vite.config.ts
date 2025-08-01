import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    electron([
      {
        entry: 'electron/main.ts',
        onstart(options) {
          // 防止重复启动
          if (options.startup) {
            options.startup()
          }
        },
        vite: {
          build: {
            sourcemap: true,
            minify: false,
            outDir: 'dist-electron',
            rollupOptions: {
              external: Object.keys('dependencies' in {} ? {} : {})
            }
          }
        }
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          // 只重新加载预加载脚本，不启动新窗口
          if (options.reload) {
            options.reload()
          }
        },
        vite: {
          build: {
            sourcemap: 'inline',
            minify: false,
            outDir: 'dist-electron',
            rollupOptions: {
              external: Object.keys('dependencies' in {} ? {} : {})
            }
          }
        }
      }
    ]),
    renderer()
  ],
  server: {
    port: 5173
  }
})