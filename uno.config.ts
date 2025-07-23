import { defineConfig, presetIcons, presetWind } from 'unocss'

export default defineConfig({
  presets: [
    presetWind(),
    presetIcons({
      collections: {
        'material-symbols': () => import('@iconify-json/material-symbols/icons.json').then(i => i.default)
      }
    })
  ],
  shortcuts: {
    'btn': 'px-3 py-1.5 rounded bg-blue-500 text-white hover:bg-blue-600 cursor-pointer inline-flex items-center gap-1',
    'btn-icon': 'p-1.5 rounded hover:bg-gray-200 cursor-pointer inline-flex items-center justify-center',
    'input-field': 'px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500'
  }
})