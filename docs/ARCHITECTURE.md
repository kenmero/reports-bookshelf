# システムアーキテクチャ

## 概要
**Reports Bookshelf** (Bibliotheca Reports) は、PDF、Officeファイル、マルチメディア（画像/動画/音声）、Markdownテキストなどを一元管理できるドキュメント管理システムです。
Next.js (App Router) をベースに、**ローカル環境**と**Vercel（サーバーレス環境）**の両方で動作するように設計されたハイブリッドアーキテクチャを採用しています。

## 技術スタック (Tech Stack)

### フロントエンド / アプリケーション
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React (Icons), React Dropzone (Upload)
- **Markdown Rendering**: react-markdown, rehype-raw, remark-gfm (HTML/GFM support)

### バックエンド / データ
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database (Local)**: SQLite (`dev.db`)
- **Database (Production/Vercel)**: PostgreSQL (Vercel Postgres / Neon)
- **Authentication**: NextAuth.js (v5 beta) + Credentials Provider (Custom hashing with bcryptjs)

### インフラ / ストレージ
- **Local Env**: ローカルファイルシステム (`public/uploads`)
- **Production (Vercel)**: [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (Object Storage)

## ハイブリッド・アーキテクチャの仕組み

本システムは、デプロイ先に応じて「データベース」と「ファイル保存先」を自動的に切り替える設計になっています。

### 1. データベースの切り替え
Prismaのスキーマファイルをビルド時に差し替えることで対応しています。

*   **ローカル開発時**: `prisma/schema.prisma` (SQLite) を使用。
*   **Vercelビルド時**: `package.json` の `vercel-build` コマンドが `prisma/schema.postgres.prisma` を `prisma/schema.prisma` に上書きコピーし、PostgreSQLモードでビルドします。

### 2. ファイルストレージの切り替え (`src/lib/storage.ts`)
環境変数 `BLOB_READ_WRITE_TOKEN` の有無によって、保存ロジックが分岐します。

| 環境 | 判定条件 | 保存先 | 特徴 |
| :--- | :--- | :--- | :--- |
| **Local** | `BLOB_READ_WRITE_TOKEN` が未定義 | `./public/uploads/` | ローカルディスクに保存。開発やオンプレミス運用向け。 |
| **Vercel** | `BLOB_READ_WRITE_TOKEN` が存在 | **Vercel Blob** | クラウドストレージに保存。サーバーレス環境でもデータが消えない。 |

この抽象化層 (`src/lib/storage.ts`) により、ビジネスロジック (`actions.ts`) は保存先を意識せずに `storage.upload()` / `storage.delete()` を呼ぶだけで動作します。

## セキュリティ設計 (RBAC)

ロールベースアクセス制御 (RBAC) を実装しており、ユーザーごとに以下の権限レベルが割り当てられます。

1.  **ADMIN (管理者)**: 全機能（ユーザー管理、ドキュメントのアップロード/編集/削除、閲覧）
2.  **EDITOR (編集者)**: ドキュメントのアップロード/編集/削除、閲覧（ユーザー管理は不可）
3.  **VIEWER (閲覧者)**: 公開されたドキュメントの閲覧のみ

ドキュメント自体にも「閲覧に必要な最低権限 (`requiredRole`)」が設定でき、権限が不足しているユーザーには検索結果にも表示されません。
