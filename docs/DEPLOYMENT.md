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

### 4. 初回デプロイと初期ユーザー
デプロイが完了するとドメインが発行されます。
初回アクセス時、データベースは空の状態ですが、アプリケーションには「初期ユーザー作成スクリプト」などは含まれていません（セキュリティのため）。

Vercelのコンソール等から手動でUserレコードを作成するか、ローカル環境でデータベースを操作してデータを流し込む必要がありますが、
最も簡単な方法は **「Vercel上のデータベースに対してSeedを実行する」** ことです。
（※現状の構成では、ローカルからVercel DBへ接続して `npx prisma db push` するのが手っ取り早いです）
