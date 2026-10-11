# undo-log

中性脂肪改善のため、運動習慣を「週1回」から「週3〜5回」に増やして続けるための個人用 PWA。
ユーザーは本人 1 人。主にスマホ（iPhone / Android）のホーム画面から使い、PC でも閲覧する。

## コマンド

```bash
npm run dev        # 開発サーバー（host: true なので LAN 内のスマホからも開ける）
npm test           # Vitest（src/**/*.test.ts）
npm run typecheck  # tsc -b
npm run lint       # oxlint
npm run build      # 本番ビルド + Service Worker 生成
npm run preview    # ビルド結果の確認（/fitness-tracker/ で開く。PWA・オフライン・CSP の検証はこちらで）
```

変更後は `npm run typecheck && npm run lint && npm test` を通すこと。

## 技術スタック

React 19 + TypeScript + Vite / Dexie（IndexedDB）+ dexie-react-hooks / vite-plugin-pwa / date-fns / react-router（HashRouter）/ CSS Modules / Vitest + fake-indexeddb。
サーバーは持たない。データは端末内の IndexedDB で完結し、バックアップは JSON エクスポート／インポートで行う。

## ディレクトリ構成

- `src/domain/` — 純粋関数のみ（React・Dexie に依存させない）。週の計算、週次集計、ストリーク、リマインド判定。テストの中心
- `src/db/` — Dexie スキーマとリポジトリ関数、バックアップ
- `src/hooks/` — domain と db をつなぐ React フック（`useLiveQuery` で DB 変更を即時反映）
- `src/features/<画面>/` — 画面ごとのコンポーネント（home / record / calendar / history / settings）
- `src/components/` — 画面をまたいで使う UI（BottomNav, Toast, Sheet など）
- `src/styles/tokens.css` — 色トークン

## ドメインルール（仕様として確定済み）

- **週は月曜始まり**。日付は `'YYYY-MM-DD'` のローカル日付文字列（`DateKey`）で扱い、`Date` の生比較やタイムゾーン変換をしない。日付操作は `src/domain/week.ts` 経由
- **週の目標（初期値）**：有酸素 150 分、運動日数 4 日、筋トレ 2 回
  - 有酸素 = `bike` + `walk` + `other`（`other` は `countsAsAerobic !== false` のとき）
  - 運動日数 = 記録がある日付の数
  - 筋トレ回数 = `strength` の記録がある日付の数（同じ日に複数あっても 1 回）
- **総合達成率** = 3 目標それぞれの達成率（上限 100%）の平均
- **ストリーク** = 運動日数の目標を達成した週の連続数。今週は進行中なので、未達でも途切れ扱いにしない。全目標を達成した週は別途マークする（`allMet`）
- **目標の変更**は `Settings.goalsHistory` に `effectiveFrom`（週の月曜）付きで追記し、過去の週の判定が変わらないようにする
- **記録 1 件 = 活動 1 つ**。テンプレート（例：バイク 30 分 + 筋トレ 20 分）は 1 タップで複数レコードを作る
- **リマインド**はアプリ内バナーのみ（iOS PWA で予約通知を出すにはプッシュサーバーが必要なため）。今日の記録がなく、設定時刻を過ぎていれば控えめに表示

## データとプライバシー（厳守）

- 記録データは端末内の IndexedDB にのみ保存し、**外部へは一切送信しない**。バックアップも JSON ファイルの書き出し／読み込みだけで、送信先は持たない
- **アクセス解析・外部トラッキング・外部 CDN・外部フォントは入れない**。依存を追加するときは、ネットワーク通信やテレメトリを含まないか確認する
- 本番ビルドでは `vite.config.ts` の `contentSecurityPolicy()` が CSP（`connect-src 'self'` など）を埋め込み、外部への通信をブラウザ側で遮断している。CSP を緩める変更はユーザーの承認を得てから行う（第 2 段階の Fitbit 連携で必要になった場合も同様）
- テストデータ・サンプルデータ・スクリーンショットに実在の個人データ（実際の運動記録・検査値・体重など）を含めない。架空の値を使う

## 非機能要件

- 記録は 3 タップ以内（テンプレートなら 1 タップ + 取り消しトースト。手動なら ＋ → 種別 → 時間で保存）
- オフラインで動くこと（Service Worker で事前キャッシュ。外部 API に依存しない）
- ダークモード：`prefers-color-scheme` に追従し、`html[data-theme="light" | "dark"]` で手動上書きできる。色は直接書かず `tokens.css` の CSS 変数を使う
- スマホ幅を基準にする（最大幅 560px、safe-area-inset を考慮）。UI の文言は日本語

## デプロイ

- GitHub Pages に GitHub Actions（`.github/workflows/deploy.yml`）で自動デプロイする。`main` への push で lint → test → build → デプロイの順に実行される
- リポジトリは `tabashow/fitness-tracker`。公開 URL は `https://tabashow.github.io/fitness-tracker/`
- そのため Vite の `base` は `/fitness-tracker/`。アセットや manifest のパスは `/` 始まりの絶対パスを直書きせず、`base` に従わせる（`public/` のファイルは `import.meta.env.BASE_URL` 経由で参照する）
- ルーティングは HashRouter。Pages では SPA のフォールバックが効かないため、BrowserRouter に変えない
- デプロイ前の確認は `npm run build && npm run preview` → `http://localhost:4173/fitness-tracker/`

## 実装方針

- 集計・判定ロジックは必ず `src/domain/` に純粋関数として置き、Vitest でテストする（月またぎ・年またぎ・週の境界・未達週を含める）。テスト用データは `src/domain/testUtils.ts` の `workout()` で作る
- コンポーネントの中で集計しない。フックで domain 関数を呼ぶ
- IndexedDB のスキーマを変えるときは Dexie の `version()` を上げ、既存データを壊さない。エクスポートする JSON にもスキーマバージョンを含める
- ライブラリを追加する前に、既存の依存で足りないか検討する

## ロードマップ

MVP（段階 0〜7）：ひな形 → domain + テスト → DB・記録シート・テンプレート → ホーム → カレンダー → 履歴の編集 → 設定・バックアップ → 実機確認。
第 2 段階：血液検査値・体重の記録とグラフ（`measurements` ストアを追加）、運動量と検査値を並べて見る画面、Fitbit 連携（着手時に API の現状と認証方式を調べてから提案する）。
