# Hatsuki

自己用的 telegram 機器人

## 初始設定

```bash
# edit config.json first before start bot
cp config.template.jsonc config.json
vim config.json

# start the bot
node src/app.js
```

## Twitter 圖片轉發

* Twitter 改變政策後 telegram 無法直接預覽含有成人內容的 tweet, 機器人偵測到之後會直接轉發解析之後的連結

* config 中 `Feature_RepostMatureTweet` 要設定為 true 才會開啟此功能

## 快速貼圖片

```bash
# MODE = [post|add|edit|delete|remove]
/shortcut $MODE $KEY $VALUE

# or `sc` for short
/sc $MODE $KEY $VALUE

# or shortcut of `/shortcut post $KEY`
/sc $KEY

# list all options
/sc list
```

1. post: 根據 `$KEY` 貼出對應的圖片

1. add: 增加 `$KEY`, 對應的圖片為 `$VALUE`

1. edit: 將 `$KEY` 對應的圖片複寫為 `$VALUE`

1. remove/delete: 移除 `$KEY` 對應的圖片

1. list: 列出所有的 `$KEY`