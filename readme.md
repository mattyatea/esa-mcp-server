# ESA MCP Server
https://esa.io のMCPサーバーです。
## 使い方
1. https://[team-name].esa.io/user/applications にアクセスし、Personal access tokens を作成します。
   2. この際、権限は `read` のみでも問題ありません。
   3. 投稿を行う場合は `write` 権限が必要です。
   4. トークンの名前は `esa-mcp` など、わかりやすい名前にしておくと良いでしょう。
2. Claude Desktop 等のConfigに以下のように記述してください。 (`claude_desktop_config.json` 等）
```json
{
  "esa": {
    "command": "npx",
    "args": [
      "-y",
      "esa-mcp"
    ],
    "env": {
      "ESA_API_TOKEN": "ESAのAPIトークン",
      "ESA_TEAM_NAME": "ESAのチーム名"
    }
  }
}
```
3. Claude Desktop を再起動してください。
4. 以上です

## 機能
下記にある機能は実装済み or 実装予定です。
- [x] 投稿の取得
- [x] 投稿の検索
- [x] 投稿の作成
- [ ] 投稿の更新
- [ ] コメントの取得
- [ ] コメントの作成