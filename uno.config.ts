import { defineConfig, presetIcons, presetWind } from 'unocss'

export default defineConfig({
  presets: [
    presetWind(),
    presetIcons({
      collections: {
        'material-symbols': () => import('@iconify-json/material-symbols/icons.json').then(i => i.default)
      },
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      }
    })
  ],
  safelist: [
    'i-material-symbols-edit',
    'i-material-symbols-delete',
    'i-material-symbols-add',
    'i-material-symbols-square-outline',
    'i-material-symbols-folder',
    'i-material-symbols-layers',
    'i-material-symbols-terminal',
    'i-material-symbols-download',
    'i-material-symbols-upload',
    'i-material-symbols-close',
    'i-material-symbols-minimize',
    'i-material-symbols-play-arrow'
  ],
  shortcuts: {
    'btn': 'px-3 py-1.5 rounded bg-blue-500 text-white hover:bg-blue-600 cursor-pointer inline-flex items-center gap-1',
    'btn-icon': 'p-1.5 rounded hover:bg-gray-200 cursor-pointer inline-flex items-center justify-center',
    'input-field': 'px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 box-border',
    'scale-102': 'transform scale-102',
    'window-btn': 'p-1.5 rounded inline-flex items-center justify-center transition-colors cursor-pointer'
  },
  rules: [
    ['animate-pulse', { animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }]
  ]
})