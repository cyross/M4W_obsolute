**Miyako for Web (M4W)**

version 1.0.0

2012.04.18 Cyross Makoto

# はじめに

本ソフトは、HTML5ベースのゲーム開発を支援するjQueryプラグインです。

# 必要環境

 1. Webサーバ
  * 推奨:Ruby on Rails 3.1以降が動く環境  
    できれば3.2以降
 2. jQuery
  * 1.7.1以降
  * jQuery UIなどはお好みで
 3. HTML、画像、CSSなどのファイル

# ファイル構成

ダウンロードしたアーカイブファイルを展開すると、以下のファイル・ディレクトリが作成されます。

 * doc ドキュメントディレクトリ
 * sample サンプルディレクトリ
 * README.md 本ファイル
 * jquery.m4w.js M4W本体
 * jquery.m4w.video.js M4Wを使用し、ビデオを再生するための追加プラグイン
 * jquery.m4w.form.js M4Wを使用し、ボタン(など)のフォームタグを追加するプラグイン
 * 

# 最低限の前準備(よくある方法)：
 1. HTMLファイルを作成する
 2. HTML内で、どこにm4wの情報を表示するか決める
 3. HTML上でjQuery-1.7.x.jsのロードを追加する
 4. HTML上でjQuery.m4w.jsのロードを追加する
 5. jQueryオブジェクトのm4wメソッドを呼び出す
   * 例1・bodyブロック内  
       $("body").m4w();
   * 例2・divブロック内(id=area1)  
       $("div#area1").m4w();

実際の例は以下

    <DOCTYPE HTML>
    <html>
      <head>
        <meta charset=utf-8>
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title>Miyako 4 Web sample</title>
        <link rel="stylesheet" href="jq.css" type="text/css" />
        <script type="text/javascript" src="jquery-1.7.2.js"></script>
        <script type="text/javascript" src="jquery.m4w.js"></script>
        <script type="text/javascript" src="jq.js"></script>
      </head>
      <body>
      </body>
    </html>

# リファレンスマニュアル

展開した時に同梱される doc ディレクトリをご参照ください  
`docディレクトリのドキュメントは、「JsDoc Toolkit v2.4.0」を使用しています。`

# ラインセンス

本プログラムの使用・再配布に関してMIT Lisenceを適応します。

> The MIT License (MIT)
> Copyright (c) 2012 Cyross Makoto
> 
> Permission is hereby granted, free of charge, to any person obtaining a copy ofis software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
> 
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
> 
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

# 免責事項

本ソフトウェアは、MITライセンスに準拠し、無保証とします。  
本ソフトウェアを使用したことにより、いかなる問題が発生したとしても、作者であるサイロス誠には一切の責任を負いません。

# 連絡先

もし、何かしらの質問や要望などがございましたら、下記のメールアドレスかTwitterアカウントに連絡をお願い致します。
また、感想などを添えていただけると嬉しいです。

cyross _at_ po.twin.ne.jp  
http://d.hatena.ne.jp/cyross/  
http://twitter.com/cyross  
