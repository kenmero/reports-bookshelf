# Vercel デプロイガイド

このプロジェクトは [Vercel](https://vercel.com/) へのデプロイに最適化されています。
以下の手順に従って、無料で本番環境を構築できます。

## デプロイ手順

### 1. リポジトリのインポート
1. Vercelのダッシュボードにアクセスし、「Add New...」 -> 「Project」を選択します。
2. GitHubリポジトリ `reports-bookshelf` を選択し、インポートします。

### 2. Storageの追加 (Neon Postgres & Blob)
Vercelダッシュボードの **Storage** タブから、以下の2つのデータベースを追加してプロジェクトに接続（Connect）してください。

1.  **Vercel Postgres (Neon)**:
    *   「Create」→「Postgres」を選択。
    *   名称は任意（例: `bookshelf-db`）。
    *   作成後、プロジェクトに接続すると、`POSTGRES_PRISMA_URL` 等の環境変数が自動設定されます。
2.  **Vercel Blob**:
    *   「Create」→「Blob」を選択。
    *   名称は任意（例: `bookshelf-blob`）。
    *   作成後、プロジェクトに接続すると、`BLOB_READ_WRITE_TOKEN` が自動設定されます。

### 3. Build Command の確認
`package.json` にVercel専用のビルドコマンドを用意しています。
通常は自動検出されますが、もしビルドが失敗する場合やDBエラーが出る場合は、**Build Command** 設定を以下のように明示的に上書きしてください。

*   **Build Command**: `npm run vercel-build`

> `vercel-build` コマンドは、`schema.postgres.prisma` を `schema.prisma` にコピーしてからビルドを行う特別なコマンドです。

### 4. 初回デプロイと初期ユーザー (Initial Data)
デプロイ完了後、データベースにテーブルは作成されますがユーザーは空の状態です。
Vercel (Neon) の管理画面からSQLを実行して、初期管理者ユーザーを手動で登録します。

1.  Vercelダッシュボードの **Storage** タブを開き、作成した **Postgres** をクリックします。
2.  左メニューの **Query** (または Data Browser) を開きます。
3.  以下のSQLを入力して実行（Run）してください。
    *   ユーザー名: `admin`
    *   パスワード: `admin123`
    *   ロール: `ADMIN`

```sql
INSERT INTO "User" (id, username, password, role, "createdAt", "updatedAt")
  id, username, password, role, "createdAt", "updatedAt")
VALUES (
  'admin-init-id',
  'admin',
  '$2b$10$YZ.VEIJ6DIyLvK/j4BTLhe0GIPsdX0W3c4OaPINmY7i5TmTmwrJlm',
  'ADMIN',
  NOW(),
  NOW()
);
```

4.  実行後、アプリ（`https://your-project.vercel.app`）にアクセスし、`admin` / `admin123` でログインできることを確認してください。

> **Note**: パスワードのハッシュ値は `admin123` のものです。ログイン後、必ず変更してください。
