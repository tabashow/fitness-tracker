/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * 本番ビルドにだけ CSP を埋め込み、外部への通信・外部スクリプトをブラウザ側で遮断する。
 * （開発サーバーは HMR 用のインラインスクリプトを使うため対象外）
 */
function contentSecurityPolicy(): Plugin {
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
  ].join('; ')
  return {
    name: 'content-security-policy',
    apply: 'build',
    transformIndexHtml: () => [
      { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: csp }, injectTo: 'head-prepend' },
    ],
  }
}

export default defineConfig({
  // GitHub Pages（https://tabashow.github.io/fitness-tracker/）に合わせる
  base: '/fitness-tracker/',
  plugins: [
    react(),
    contentSecurityPolicy(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon-180.png'],
      manifest: {
        name: 'undo-log 運動記録',
        short_name: 'undo-log',
        description: '週3〜5回の運動習慣を続けるための記録アプリ',
        lang: 'ja',
        start_url: '.',
        display: 'standalone',
        background_color: '#0b1210',
        theme_color: '#0f766e',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
  server: {
    host: true, // スマホ実機から LAN 経由でアクセスできるように
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
