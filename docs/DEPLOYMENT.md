# Vercel デプロイガイド

このプロジェクトは [Vercel](https://vercel.com/) へのデプロイに最適化されています。
以下の手順に従って、無料で本番環境を構築できます。

## デプロイ手順

### 1. リポジトリのインポート
1. Vercelのダッシュボードにアクセスし、「Add New...」 -> 「Project」を選択します。
2. GitHubリポジトリ `reports-bookshelf` を選択し、インポートします。

### 2. 環境変数の設定 (Environment Variables)
インポート時の設定画面、または設定後の「Settings」 -> 「Environment Variables」にて、以下の変数を設定してください。

| 変数名 | 説明 | 入手方法 |
| :--- | :--- | :--- |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (ファイル保存) 用トークン | Vercel StorageタブでBlobを作成して取得 |
| `POSTGRES_PRISMA_URL` | PostgreSQL接続URL (Pooling) | Vercel StorageタブでPostgresを作成して取得 |
| `POSTGRES_URL_NON_POOLING` | PostgreSQL接続URL (Direct) | Vercel StorageタブでPostgresを作成して取得 |
| `AUTH_SECRET` | ログインセッション暗号化キー | 任意のランダム文字列（例: `openssl rand -hex 32`） |

> **Note**: Storage (Blob/Postgres) は、Vercelダッシュボードの「Storage」タブから「Create Database (Postgres)」および「Create Blob」をクリックし、プロジェクトに接続（Connect）するだけで、上記の環境変数が自動的に入力されます。

### 3. Build Command の確認
`package.json` にVercel専用のビルドコマンドを用意しています。
通常は自動検出されますが、もしビルドが失敗する場合やDBエラーが出る場合は、**Build Command** 設定を以下のように明示的に上書きしてください。

*   **Build Command**: `npm run vercel-build`

> `vercel-build` コマンドは、`schema.postgres.prisma` を `schema.prisma` にコピーしてからビルドを行う特別なコマンドです。

### 4. 初回デプロイと初期ユーザー (Initial Data Seeding)
デプロイ直後のデータベースは空の状態です。管理者ユーザーでログインするためには、**初期データ（Seed）の投入**が必要です。

#### 推奨: Vercelの画面から実行する方法
Vercelのデプロイ設定で、**Install Command** を一時的に変更してSeedを実行するのが最も確実です。

1.  Vercelの **Settings** > **Build & Development** に移動します。
2.  **Install Command** の `Override` をオンにし、以下のコマンドを入力します。
    ```bash
    npm install && npx prisma db seed
    ```
3.  **Deployments** タブに戻り、最新のデプロイを **Redeploy** します。
    *   これでビルドプロセス中に初期データ（adminユーザー等）が作成されます。
4.  デプロイ成功後、**Install Command** を元の空欄（デフォルト）に戻しておきます（毎回初期化されるのを防ぐため）。

#### その他の方法: ローカルから実行
ローカル環境から本番データベースに対して直接Seedを実行することも可能です。
1.  VercelのPostgres接続情報を `.env` に設定します。
2.  以下のコマンドを実行します。
    ```bash
    npx prisma db seed
    ```
