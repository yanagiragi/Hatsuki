# Hatsuki

自己用的 telegram 機器人

# 初始設定

```bash
# edit config.json first before start bot, note we use `json` not `jsonc`
cp config.template.jsonc config.json
vim config.json

# start the bot
node src/app.js
```

# 功能

## Twitter 圖片轉發

* Twitter 改變政策後 telegram 無法直接預覽含有成人內容的 tweet, 機器人偵測到之後會直接轉發解析之後的連結

* config 中 `Feature_RepostMatureTweet` 要設定為 true 才會開啟此功能

## 快速貼圖片

* tg 的貼圖太多了, 因此寫一個小工具可以幫貼圖設定 key, 打 key 就會自動回覆對應的貼圖

* 支援使用回覆設定 shortcut

* 功能:
  * post: 根據 `$KEY` 貼出對應的圖片
  * add: 增加 `$KEY`, 對應的圖片為 `$VALUE`
  * edit: 將 `$KEY` 對應的圖片複寫為 `$VALUE`
  * remove/delete: 移除 `$KEY` 對應的圖片
  * list: 列出所有的 `$KEY`

* 範例:
  ```bash
  # MODE = [post|add|edit|delete|remove]
  /shortcut $MODE $KEY $VALUE

  # or `sc` for short
  /sc$MODE $KEY $VALUE

  # or shortcut of `/shortcut post $KEY`
  /sc $KEY

  # or just type $KEY
  $KEY

  # list all options
  /sclist
  ```

## 學術影片推薦

* 把第一次寫機器人時嘗試寫的[linebot](https://github.com/yanagiragi/yanagi-linebot) porting 過來, 會推薦一些充滿學術價值的影片

* 範例:
  ```bash
  # 請機器人推薦一片, avr = av recommendation
  /avr [抽|u]

  # 根據發帖時間排序請機器人推薦一片
  /avr [排|u2]

  # 請機器人推薦好多片片
  /avr [我全都要|all]
  ```

## Channel Alias

* 快速貼圖片 延伸出的需求, 希望可以讓別的 channel 也可以直接使用別的 channel 設定好的 shortcut

* 範例:
  ```bash
  # 或許 $KEY 的 alias, 若無 alias 則返回 $KEY
  /alias get $KEY

  # 讓 $KEY 頻道的貼圖都 alis 成 $KEY_ALIAS
  /alias set $KEY $KEY_ALIAS
  ```
