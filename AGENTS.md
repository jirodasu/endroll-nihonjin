# AGENTS.md：AIへの引き継ぎ書

このリポジトリで作業するAI（Claude、ChatGPT、Codex、Gemini など）向けの説明です。作業の前に最後まで読んでください。

## 1. これは何か
- ゲーム名：**エンドロールの日本人**
- 内容：洋画風のエンドロールが下から流れ、そこに混ざった日本人の名前（ローマ字）を見つけてタップする。全10本立てで、完走すると評価が出る
- 作者：Jiro（jirodasu）。公開先は GitHub Pages：https://jirodasu.github.io/endroll-nihonjin/
- 想定プレイ環境：iPhoneのSafari（ホーム画面に追加したPWA）が主、WindowsのPCブラウザが従
- 公開と宣伝：Xで結果をシェアしてもらう前提

## 2. 守ること（変えるときは先に作者へ理由と代案を報告）
1. **ビルド不要の静的サイト**のままにする。npm・バンドラ・フレームワークは入れない。外部読み込みは Google Fonts だけ
2. **名前・作品名・スタジオ名はすべて架空**。実在の映画・人物のクレジットは使わない
3. **ひっかけ無し**：西洋名リストに、日本人に見える外国名（Kai、Mika、Ken、Nori、Naomi など）や中国・韓国などの東アジア名を入れない。日系の名前（例：Brian Tanaka）も出さない
4. 画面の文言・返答はすべて**日本語**。クレジットの中身（役職・作品名）だけ英語
5. 画面の向きは強制ロックしない。`alert()` / `confirm()` は使わない
6. 失敗したテストや未実施のテストを「合格」と報告しない

## 3. 仕組みの全体像
- `index.html` が骨組み。スクリプトは次の順で読み込む。どれも普通の `<script>` なので、上で `const` 宣言したものは下のファイルから見える
  1. `js/config.js`：`CONFIG`（数字の設定と `VERSION`）。`sw.js` も `importScripts` でこれを読む
  2. `js/data.js`：共通の小道具（`$`、`R`＝ランダムに1つ選ぶ、`shuffle`）、名前リスト `JS/JG/WG/WS`、漢字表 `KS/KG`、ジャンル `GENRES`、役職 `MAIN/DEPTS/LISTS/CHARS`、`makeLineup()`
  3. `js/audio.js`：`initAudio()`、効果音 `SE.*`、BGM `bgmStart(genre)/bgmStop()`、映写機の音 `hum(on)`、`setMute()`
  4. `js/game.js`：状態（`round, lives, score, combo, slots, film, filmLog, allFound…`）、`buildFilm()`、ループ `loop()`、`endRound()`、`showResult()`、シェア文 `shareText()`
- クレジットは毎作 `buildFilm(genre)` がHTML文字列で組み立てる。名前の枠を `slots` 配列に入れ、そのうち `jpCount(round)` 人を日本人にする
- スクロールは `requestAnimationFrame` で `#crawl` を `translate3d` で上へ動かす
  - 日本人の枠の下端が画面上端を越えたら「見逃し」
  - `#crawl` が全部抜けたら作品終了
- タップは `#stage` の `pointerdown` で判定する（iPhoneで遅延が出ないように `click` は使わない）
- ジャンルは `document.body.dataset.genre` に入る。CSSの `body[data-genre="…"]` が色と書体を切り替える
- 保存は `localStorage` の `er_best`（自己ベスト）と `er_muted`（消音）だけ。必ず try/catch で囲む

## 4. よくある作業のやり方
- **難易度・点数を変える**：`js/config.js` の数字だけ変える
- **ジャンルを足す**：次の3か所をそろえて足す
  1. `js/data.js` の `GENRES` に `ja, t1, t2, chars, dept` を追加
  2. `js/audio.js` の `MUSIC` に同じキーで `bpm, div, beats, prog, play`、必要なら `Object.assign` で `b`（Bパート）と `fill`
  3. `css/style.css` に `body[data-genre="キー"]` のトークンを追加。書体を使うなら `index.html` の Google Fonts のリンクにも足す
- **名前を足す**：日本人名を足したら、`KS`（名字）または `KG`（名前）に漢字も1つ足す。無いと結果画面でローマ字のまま出る
- **音を変える**：`docs/SOUND.md` を先に読む。音は作者の指定で「ゲーム音楽業界30年のプロ。キャラクターや世界観を踏襲した音作りが得意で、常に最短技術と効率化を図る」という立場で作る。音声ファイルは足さず、合成で作る
- **デザインを変える**：「使いやすさ」と「遊ぶ人の気持ちの動き」の両方を意識する。色は直接書かず、トークン（`--gold` など）を使う
- **シェア文を変える**（`shareText()`）：
  - ハッシュタグを並べない
  - 毎回中身が変わる要素（色マス・人数・見つけた名前）を残す。同じ文章の使い回しはXでスパム扱いされやすい
  - 長さは日本語で140字前後に収める

## 5. 版を上げるとき（mainに入れるとき必須）
1. `js/config.js` の `VERSION` を上げる。小さな修正は3つ目の数字、機能追加は2つ目。`sw.js` はこの値を読むので触らない
2. `CHANGELOG.md` の一番上に `## ver X.Y.Z` と変更点を1行ずつ書く（最大10行。内部の変更は「内部：〜」）
3. 作者には、版の数字と公開URLを報告する
4. 作業で分かったことがあれば `LEARNINGS.md` に書き足す

## 6. 確かめ方
- 手元で見る：リポジトリ直下で `python -m http.server 8000` を実行し、http://localhost:8000/ を開く（`file://` ではService Workerが動かない）
- 自動の通しテスト（Playwrightがある環境のみ）：`python tools/playtest.py`
  - 速度を上げて10本を全部パーフェクトで完走する流れと、全部見逃して途中退場する流れを確かめる
  - ページのエラーが出たら失敗にする
- 手で確かめる項目：タイトル → 上映 → 正解・誤タップ・見逃し → 幕間 → 10本完走 → シェア文 → もう一度、の一周。iPhone幅（390px前後）で崩れないこと
