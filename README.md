# Reports Bookshelf (Bibliotheca Reports)

**Reports Bookshelf** は、PDF、Officeファイル、画像、動画、Markdownテキストなどの多様なフォーマットを一元管理・閲覧できる「本棚」システムです。
管理者によるロールベースのアクセス制御 (RBAC) と、美しいUIを備えています。

## 📚 ドキュメント

詳細な情報は `docs/` ディレクトリにまとめています。

- **[システムアーキテクチャ (Architecture)](docs/ARCHITECTURE.md)**
  - 技術スタック、ハイブリッド構成（Local/Vercel）、セキュリティ設計について
- **[ユーザーマニュアル (Usage)](docs/USAGE.md)**
  - ログイン、権限ロール、アップロード方法、閲覧機能について
- **[Vercelデプロイガイド (Deployment)](docs/DEPLOYMENT.md)**
  - 本番環境（Vercel）へのデプロイ手順、環境変数設定について

---

## 🚀 ローカル環境での起動 (Quick Start)

開発やローカルでの試用を行うための手順です。

### 前提条件
*   Node.js 18+
*   npm

### 1. インストール
```bash
git clone https://github.com/kenmero/reports-bookshelf.git
cd reports-bookshelf
npm install
```

### 2. 環境変数の設定
`.env` ファイルを作成します（`.env.example` はありませんが、基本設定は以下の通りです）。
```bash
# .env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="secret-key-at-least-32-chars-long" 
# openssl rand -hex 32 等で生成・変更推奨
```

### 3. データベースのセットアップ
ローカル開発用のSQLiteデータベースを作成し、初期データを投入します。

```bash
# スキーマ反映
npx prisma db push

# 初期ユーザー作成スクリプトの実行（admin/guest）
npx tsx restore-admin.ts
npx tsx create-guest.ts
```

### 4. 起動
```bash
npm run dev
```
ブラウザで `http://localhost:3000` にアクセスしてください。

*   **Admin**: `admin` / `admin123`
*   **Guest**: `guest` / `guest123`

---

## 🛠️ 主な機能

*   **マルチフォーマット対応**: PDF, Word, Excel, PowerPoint, MP4, MP3, JPEG, PNG, Markdown, HTML, URL
*   **インラインプレビュー**: 多くのフォーマットをダウンロードせずにブラウザ上で閲覧可能
*   **権限管理 (RBAC)**: 管理者・編集者・閲覧者の3段階の権限システム
*   **ハイブリッドストレージ**: ローカルディスク保存とクラウド (Vercel Blob) 保存を自動切り替え

## License
MIT
