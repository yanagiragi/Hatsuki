# MeowMeowImage OCR

所有貼圖與結果會放在 `Storage/<貼圖包名稱>/`。每份 `result.json` 維持外掛需要的格式：

```json
[
    {
        "filename": "0.png",
        "text": "貼圖文字"
    }
]
```

沒有文字的貼圖會保留空字串：

```json
{
    "filename": "1.png",
    "text": ""
}
```

## 下載新貼圖包

在 Hatsuki 專案根目錄執行：

```bash
node src/Plugins/MeowMeowImage/fetch.js 'LINE 貼圖商店網址'
```

預設只辨識尚未出現在 `result.json` 的圖片，因此可以安全續跑，不會清除既有結果。已經存在且文字為空字串的紀錄也會保留，不會自動重試。

```bash
# 明確要求時，才重新辨識空白結果
node src/Plugins/MeowMeowImage/fetch.js '網址' --retry-empty

# 強制重新辨識這個貼圖包的全部圖片
node src/Plugins/MeowMeowImage/fetch.js '網址' --force-ocr
```

## OCR 設定

預設會將透明貼圖合成白底；沒有文字或信心低於 0.20 時再用黑底辨識。模型在同一個貼圖包的處理期間只載入一次。

```bash
EASYOCR_IMAGE=easy_ocr \
EASYOCR_MODEL_DIR=/home/rayark/Projects/EasyOCR/bin/models \
OCR_VARIANTS=white,black,contrast \
node src/Plugins/MeowMeowImage/fetch.js '網址'
```

`OCR_VARIANTS` 預設為 `auto`。可用 `OCR_LOW_CONFIDENCE` 調整黑底重試門檻。候選與信心分數只用於當次辨識，不會寫入檔案。
