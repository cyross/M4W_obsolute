/**
 * @fileOverview Miyako4Web(Miyako for Web)本体
 * 
 * @name Miyako for Web(M4W)
 * @author Cyross Makoto (サイロス誠)
 * @version 1.0.0
 * @revision 1
 * @require jQuery 1.7.2(or later)
 * @license MIT License (MITライセンス)
 */

(function($){
  /**
   * @constructor
   * @class レンダリングメソッドを定義
   */
  Renderer = function(){
    this.name= "Miyako4Web Renderer";
  };

  /**
   * 画面への描画を行う(レイヤ向け)<br>
   * 次の順番で描画する
   * <ul>
   * <li>レイヤの内容を消去する</li>
   * <li>pre_render(コンテキストを引数とする関数の配列)を実行する</li>
   * <li>各スプライトを描画する</li>
   * <li>post_render(コンテキストを引数とする関数の配列)を実行する</li>
   */
  Renderer.default_layer_render = function(){
    var ctx = this.context;
    var ia = this.sprite_array;

    ctx.clearRect(0, 0, this.width(), this.height());
    for(var pr=0; pr<this.pre_render.length; pr++){
      this.pre_render[pr].render(ctx);
    }
    for(var i=0; i<ia.length; i++){
      ia[i].render(ctx);
    }
    for(var ps=0; ps<this.post_render.length; ps++){
      this.post_render[ps].render(ctx);
    }
    return this;
  };

  /**
   * 画面の消去を行わない画面への描画を行う(レイヤ向け)<br>
   * 次の順番で描画する
   * <ul>
   * <li>pre_render(コンテキストを引数とする関数の配列)を実行する</li>
   * <li>各スプライトを描画する</li>
   * <li>post_render(コンテキストを引数とする関数の配列)を実行する</li>
   */
  Renderer.no_clear_layer_render = function(){
    var ctx = this.context;
    var ia = this.sprite_array;

    for(var pr=0; pr<this.pre_render.length; pr++){
      this.pre_render[pr].render(ctx);
    }
    for(var i=0; i<ia.length; i++){
      ia[i].render(ctx);
    }
    for(var ps=0; ps<this.post_render.length; ps++){
      this.post_render[ps].render(ctx);
    }
    return this;
  };

  /**
   * 画面の描画を行わない(レイヤ向け)
   */
  Renderer.layer_no_render = function(){
  	return this;
  };

  /**
   * 画面の図形の描画を行う(Renderer.layer_no_renderと組み合わせる)
   */
  Renderer.draw = function(){
    var ctx = this.context;
    var drawers = this.drawers;
    
    for(var i; i< drawers.length; i++){
   	  drawers[i].draw();
    }
  	return this;
  };

  /**
   * 画面への描画を行う(スプライト向け)<br>
   * 隠蔽中の時は描画しない<br>
   * 次の順番で描画する
   * <ul>
   * <li>回転/拡大/縮小を行う(m11,m12,m21,m22,x,dx,y,dy)<li>
   * <li>描画位置をずらす(dx,dy)</li>
   * <li>透明度を設定(a)</li>
   * <li>画像を描画する(image,sx,sy,sw,sh,dw,dh)</li>
   * <li>設定を元に戻す</li>
   * </ul>
   */
  Renderer.default_render = function(context){
    if(!this.v){ return; }
    context.save();
    context.setTransform(this.m11,this.m12,this.m21,this.m22,this.x-this.dx,this.y-this.dy);
    context.translate(this.dx,this.dy);
    context.globalAlpha = this.a;
    context.drawImage(this.image, this.sx, this.sy, this.sw, this.sh, 0, 0, this.dw, this.dh);
    context.restore();
  };

  /**
   * 画面への描画を行う(スプライト向け)<br>
   * 隠蔽中の時は描画しない<br>
   * 次の順番で描画する
   * <ul>
   * <li>画像を描画する(image)</li>
   * </ul>
   */
  Renderer.fast_render = function(context){
    if(!this.v){ return; }
    context.drawImage(this.image, 0, 0);
  };

  /**
   * 画面への描画を行う(スプライト向け)<br>
   * 隠蔽中の時は描画しない<br>
   * 次の順番で描画する
   * <ul>
   * <li>透明度を設定(a)</li>
   * <li>画像を描画する(image,sx,sy,sw,sh,dw,dh)</li>
   * </ul>
   */
  Renderer.fast_render2 = function(context){
    if(!this.v){ return; }
    context.globalAlpha = this.a;
    context.drawImage(this.image, this.sx, this.sy, this.sw, this.sh, 0, 0, this.dw, this.dh);
  };

  /**
   * @constructor
   * @class アセット(画像、スプライト、音声など)をブラウザに読み込む
   */
  AssetsLoader = function(){
  };

  /** @ignore */
  AssetsLoader.loaders = {
    image: function(options){ return Sprite.load_image(options); },
    sprite: function(options){ return Sprite.load(options); },
    bgm: function(options){
      var o = $.extend({
        bgm: true
      }, options);
      return Sound.load(o);
    },
    se: function(options){
      var o = $.extend({
        bgm: false
      }, options);
      return Sound.load(options);
    }
  };

  /**
   * 画像などのアセットを読み込み、指定した関数をコールバックする<br>
   * すべてのロードに成功したときはsuccess関数、一つでも失敗したときはfailed関数を呼ぶ
   * success関数の引数は以下のキーを持つ辞書オブジェクト<br>
   * <table>
   * <tr><th>Key</th><th>Value</th></tr>
   * <tr><td>image</td><td>Imageオブジェクトの辞書オブジェクト</tr>
   * <tr><td>sprite</td><td>Spriteオブジェクトの辞書オブジェクト</tr>
   * <tr><td>bgm</td><td>BGMのSoundオブジェクトの辞書オブジェクト</tr>
   * <tr><td>se</td><td>効果音のSoundオブジェクトの辞書オブジェクト</td></tr>
   * </table>
   * failed関数の引数はdefer.when.failedメソッドの引数の配列が渡される<br>
   * @example 実際のImage/Sprite/Soundを取得するときは以下の方法でアクセス可能<br>
   * 例1)<br>
   * function success(assets){<br>
   *    var image = assets.image.(id);<br>
   *    var sprite = assets.sprite.(id);<br>
   *    var bgm = assets.bgm.(id);<br>
   *    var se = assets.se.(id);<br>
   * }<br>
   * 例2)<br>
   * function success(assets){<br>
   *    var image = assets["image"]["id"];<br>
   *    var sprite = assets["sprite"]["id"];<br>
   *    var bgm = assets["bgm"]["id"];<br>
   *    var se = assets["se"]["id"];<br>
   * }
   * @param options.assets アセット設定オブジェクトの配列
   * @param options.assets[].type アセットの形式<br>画像は"image"、スプライトは"sprite"、音声は"sound"で示される
   * @param options.assets[].その他 Image,Sprite,Soundクラスコンストラクタの引数と同じものを指定
   * @param [options.success] ロードが全て完了したときに呼び出されるコールバック関数<br>引数はアセット管理オブジェクト<br>内容は後述
   * @param [options.failed] ロードに失敗した時に呼び出されるコールバック関数<br>引数は失敗した時に渡される引数リスト
   */
  AssetsLoader.load = function(options){
    var o = $.extend({
      success: function(assets){ return assets; },
      failed: function(args){ alert("error occured!"); return args; }
    }, options);

    var assets = {}

    for(var i=0; i<o.assets.length; i++){
      var asset = o.assets[i]
      assets[asset.id] = asset;
    }

    var exec_assets = [];
    for(var asset_id in assets){
      var asset = assets[asset_id];
      exec_assets.push((AssetsLoader.loaders[asset.type])(asset));
    }
    $.when.apply(this, exec_assets).then(function(){
      var loaded_assets = {
      };
      for(var i=0; i<arguments.length; i++){
        var asset = arguments[i];
        if (!(asset.type in loaded_assets)){ loaded_assets[asset.type] = {}; }
        loaded_assets[asset.type][asset.id] = asset.value;
      }
      o.success(loaded_assets);
    }).fail(function(){
      o.failed(arguments);
    });
  };

  /**
   * @constructor
   * @class 画面(ブロック要素領域)・画面上で発生するイベントを管理
   * @param options.id 画面のID
   * @param [options.width] 画面の横幅<br>ピクセル単位<br>省略時は640
   * @param [options.height] 画面の高さ<br>ピクセル単位<br>省略時は480
   * @param [options.left] ブラウザ(もしくは親ブロックからの右方向の位置<br>単位はピクセル<br>省略時は0(ブロックの左端)
   * @param [options.top] ブラウザ(もしくは親ブロックからの上方向の位置<br>単位はピクセル<br>省略時は0(ブロックの上端)
   * @param [options.z] 画面の奥行き<br>CSSのz-indexと同じ<br>省略時は1000
   * @param [options.body] 画面レイヤーを埋め込むブロック<br>jQueryオブジェクトを指定<br>省略時はbodyブロック($("body"))
   * @param [options.css] CSS値をオブジェクトで指定<br>省略時は{}
   * @param [options.attr] attr値をオブジェクトで指定<br>jQueryオブジェクトを指定<br>省略時は{}
   * @param [options.events] 登録したいイベントの関数群<br>"イベント名": イベントハンドラ本体で登録する<br>省略時は{}
   */
  Screen = function(options){
    var o = $.extend({
      width: 640,
      height: 480,
      top: 0,
      left: 0,
      z: 1000,
      body: $("body"),
      events: {}
    }, options);

    var $screen = $('<div />', {width: o.width, height: o.height});
    $screen.attr("id", o.id);
    $screen.css("position", "absolute");
    $screen.css("left", o.left);
    $screen.css("top", o.top);
    $screen.appendTo(o.body);

    this.body = $screen;
    this.id = o.id;
    this.body.css("z-index", parseInt(o.z));
    this.body.css("left", o.left);
    this.body.css("top", o.top);
    
    for(name in o.css){ $screen.css(name, o.css[name]); }
    for(name in o.attr){ $screen.attr(name, o.attr[name]); }
    for(name in o.events){
      $screen.unbind(name);
      $screen.bind(name, o.events[name]);
    }

    this.layers = {};
  };

  /**
   * スクリーンにレイヤを登録する
   * @param id レイヤのID
   * @param layer レイヤ本体
   */
  Screen.prototype.add = function(id, layer){
    this.layers[id] = layer;
  };

  /**
   * ブラウザにレイヤの内容を描画する
   */
  Screen.prototype.render = function(){
    var id = null;
    for(id in this.layers){
      this.layers[id].render();
    }
  };

  /** 画面の横幅・高さを変更する
   * @param {int} width 横幅
   * @param {int} height 高さ
   */
  Screen.prototype.resize = function(width, height){
    var w = parseInt(width);
    var h = parseInt(height);
    this.body.css("width", w);
    this.body.css("height", h);
  };

  /**
   * レイヤー(canvasブロック)を作成する<br>生成されたcanvasブロックはcssのpositionがabsoluteになっていることに注意
   * @constructor
   * @class Screenクラス内で扱えるレイヤー(canvasブロック)
   * @param options.id レイヤーのID
   * @param [options.width] レイヤーの横幅<br>ピクセル単位<br>省略時は640
   * @param [options.height] レイヤーの高さ<br>ピクセル単位<br>省略時は480
   * @param [options.content_width] レイヤーの描画領域の横幅<br>単位はピクセル<br>指定したときは、widthで指定した範囲まで拡大して表示される<br>省略時はwidthと同じ値
   * @param [options.content_height] レイヤーの描画領域の高さ<br>単位はピクセル<br>指定したときは、heightで指定したはんいまで拡大して表示される<br>省略時はheightと同じ値
   * @param [options.left] ブラウザ(もしくは親ブロックからの右方向の位置<br>単位はピクセル<br>省略時は0(ブロックの左端)
   * @param [options.top] ブラウザ(もしくは親ブロックからの上方向の位置<br>単位はピクセル<br>省略時は0(ブロックの上端)
   * @param [options.z] レイヤーの高さ<br>CSSのz-indexと同じ<br>省略時は0
   * @param [options.body] レイヤーを埋め込むブロック<br>jQueryオブジェクトを指定<br>省略時はbodyブロック($("body"))
   * @param [options.renderer] レイヤーの内容を描画する際の処理関数<br>省略時はRenderer.default_layer_render
   * @param [options.css] レイヤーのCSS値をオブジェクトで指定<br>省略時は{}
   * @param [options.attr] レイヤーのattr値をオブジェクトで指定<br>jQueryオブジェクトを指定<br>省略時は{}
   */
  Layer = function(options){
    var o = $.extend({
      width: 640,
      height: 480,
      top: 0,
      left: 0,
      z: 0,
      body: $("body"),
    }, options);

    // attempt content_width, content_height
    o = $.extend({
      content_width: o.width,
      content_height: o.height,
      renderer: Renderer.default_layer_render
    }, o);

    var $layer = $('<canvas />', {width: o.width, height: o.height});
    $layer.attr("id", o.id);
    $layer.css("position", "absolute");
    $layer.css("left", o.left);
    $layer.css("top", o.top);
    $layer.appendTo(o.body);
    $layer[0].width = o.content_width;
    $layer[0].height = o.content_height;

    this.body = $layer;
    this.id = o.id;
    this.context = this.body[0].getContext("2d");
    this.pre_render = [];
    this.post_render = [];
    this.sprites = {};
    this.sprite_array = [];
    this.render = o.renderer.bind(this);
    this.body.css("z-index", parseInt(o.z));
    this.body.css("left", o.left);
    this.body.css("top", o.top);
    
    for(name in o.css){ $layer.css(name, o.css[name]); }
    for(name in o.attr){ $layer.attr(name, o.attr[name]); }
  };

  /** レイヤーの内容を消去する */
  Layer.prototype.clear = function(){
    this.context.clearRect(0, 0, this.width(), this.height());
  };

  /** レイヤーの横幅を設定する */
  Layer.prototype.width = function(){
    return parseInt(this.body.width());
  };

  /** レイヤーの高さを設定する */
  Layer.prototype.height = function(){
    return parseInt(this.body.height());
  };

  /** レイヤーの右方向の位置を設定する */
  Layer.prototype.left = function(){
    return parseInt(this.body.css("left"));
  };

  /** レイヤーの下方向の位置を設定する */
  Layer.prototype.top = function(){
    return parseInt(this.body.css("top"));
  };

  /** レイヤーのz-indexを設定する */
  Layer.prototype.z = function(){
    return parseInt(this.body.css("z-index"));
  };

  /** レイヤーの横幅・高さを変更する
   * @param {int} width 横幅
   * @param {int} height 高さ
   * @param {boolean} widt_content trueのときは描画領域の大きさも指定の値で設定する
   */
  Layer.prototype.resize = function(width, height, with_content){
    var w = parseInt(width);
    var h = parseInt(height);
    this.body.css("width", w);
    this.body.css("height", h);
    if(with_content && with_content != false){
      this.body[0].width = w;
      this.body[0].height = h;
    }
  };

  /** レイヤーの描画領域の高さ・幅を変更する
   * @param {int} width 横幅
   * @param {int} height 高さ
   */
  Layer.prototype.content_resize = function(width, height){
    this.body[0].width = parseInt(width);
    this.body[0].height = parseInt(height);
  };

  /** レイヤーの位置を変更する
   * @param {int} left 右方向の位置
   * @param {int} top 下方向の位置
   */
  Layer.prototype.move = function(left, top){
    this.body.css("left", left);
    this.body.css("top", top);
  };

  /** レイヤーのz-indexを変更する
   * @param {int} z z-index
   */
  Layer.prototype.set_z = function(z){
    this.body.css("z-index", parseInt(z));
  };

  /** レイヤー内にスプライトを登録する<br>表示順でソートしないことに注意!
   * @param sprite Spriteオブジェクト
   */
  Layer.prototype.add = function(sprite){
    this.sprites[sprite.id] = sprite;
    this.sprite_array.push(sprite);
  };

  /** レイヤー内で登録されているスプライトの表示順をスプライトのz値でソートする */
  Layer.prototype.sort = function(){
    this.sprite_array.sort(function(a, b){ return b.z - a.z; });
  };

  /**
   * レイヤーにCSSを指定する
   * @param options オブジェクト: {"name": CSS値}で指定<br>文字列：CSSの値を返す
   * @return optionsが文字列：CSSの値を返す
   */
  Layer.prototype.css = function(options){
    if(typeof(options) == "string"){ return this.body.css(options); }

    var o = $.extend({}, options);
    
    for(name in o){ $bg.css(name, o[name]); }
  };

  /**
   * レイヤーに属性を指定する
   * @param options オブジェクト: {"name": 属性値}で指定<br>文字列：属性の値を返す
   * @return optionsが文字列：属性の値を返す
   */
  Layer.prototype.attr = function(options){
    if(typeof(options) == "string"){ return this.body.attr(options); }

    var o = $.extend({}, options);
    
    for(name in o){ $bg.attr(name, o[name]); }
  };

  /**
   * 背景(divブロック)を作成する<br>生成されたdivブロックはcssのpositionがabsoluteになっていることに注意
   * @constructor
   * @class 背景を管理・操作(divブロック)
   * @param options.id 背景のID
   * @param [options.width] 背景の横幅<br>ピクセル単位<br>省略時は640
   * @param [options.height] 背景の高さ<br>ピクセル単位<br>省略時は480
   * @param [options.left] ブラウザ(もしくは親ブロックからの右方向の位置<br>単位はピクセル<br>省略時は0(ブロックの左端)
   * @param [options.top] ブラウザ(もしくは親ブロックからの上方向の位置<br>単位はピクセル<br>省略時は0(ブロックの上端)
   * @param [options.z] 背景の奥行き<br>CSSのz-indexと同じ<br>省略時は0
   * @param [options.body] 背景を埋め込むブロック<br>jQueryオブジェクトを指定<br>省略時はbodyブロック($("body"))
   * @param [options.css] レイヤーのCSS値をオブジェクトで指定<br>省略時は{}
   * @param [options.attr] レイヤーのattr値をオブジェクトで指定<br>jQueryオブジェクトを指定<br>省略時は{}
   */
  Background = function(options){
    var o = $.extend({
      width: 640,
      height: 480,
      top: 0,
      left: 0,
      z: 0,
      body: $("body"),
      css: {},
      attr: {}
    }, options);

    var $bg = $('<div />', {width: o.width, height: o.height});
    $bg.attr("id", o.id);
    $bg.css("position", "absolute");
    $bg.css("left", o.left);
    $bg.css("top", o.top);
    $bg.appendTo(o.body);

    this.body = $bg;
    this.id = o.id;
    this.body.css("z-index", parseInt(o.z));
    this.body.css("left", o.left);
    this.body.css("top", o.top);
    
    for(name in o.css){ $bg.css(name, o.css[name]); }
    for(name in o.attr){ $bg.attr(name, o.attr[name]); }
  };

  /** 背景の横幅を設定する */
  Background.prototype.width = function(){
    return parseInt(this.body.width());
  };

  /** 背景の高さを設定する */
  Background.prototype.height = function(){
    return parseInt(this.body.height());
  };

  /** 背景の右方向の位置を設定する */
  Background.prototype.left = function(){
    return parseInt(this.body.css("left"));
  };

  /** 背景の下方向の位置を設定する */
  Background.prototype.top = function(){
    return parseInt(this.body.css("top"));
  };

  /** 背景のz-indexを設定する */
  Background.prototype.z = function(){
    return parseInt(this.body.css("z-index"));
  };

  /** 背景の横幅・高さを変更する
   * @param {int} width 横幅
   * @param {int} height 高さ
   */
  Background.prototype.resize = function(width, height){
    var w = parseInt(width);
    var h = parseInt(height);
    this.body.css("width", w);
    this.body.css("height", h);
  };

  /** 背景の位置を変更する
   * @param {int} left 右方向の位置
   * @param {int} top 下方向の位置
   */
  Background.prototype.move = function(left, top){
    this.body.css("left", left);
    this.body.css("top", top);
  };

  /** 背景のz-indexを変更する
   * @param {int} z z-index
   */
  Background.prototype.set_z = function(z){
    this.body.css("z-index", parseInt(z));
  };

  /**
   * 背景にCSSを指定する
   * @param options オブジェクト: {"name": CSS値}で指定<br>文字列：CSSの値を返す
   * @return optionsが文字列：CSSの値を返す
   */
  Background.prototype.css = function(options){
    if(typeof(options) == "string"){ return this.body.css(options); }

    var o = $.extend({}, options);
    
    for(name in o){ $bg.css(name, o[name]); }
  };

  /**
   * 背景に属性を指定する
   * @param options オブジェクト: {"name": 属性値}で指定<br>文字列：属性の値を返す
   * @return optionsが文字列：属性の値を返す
   */
  Background.prototype.attr = function(options){
    if(typeof(options) == "string"){ return this.body.attr(options); }

    var o = $.extend({}, options);
    
    for(name in o){ $bg.attr(name, o[name]); }
  };

  /**
   * @constructor
   * @class スプライトを管理・操作
   * @param options.id スプライトに一意に一位につけられるID<br>省略時はvalue属性(Imageオブジェクト)のidプロパティ
   * @param options.value スプライトの元にするImageクラス(Javascript標準クラス)のオブジェクト
   * @param [options.x] ブロックの左端から右方向の位置(左端を0とする)<br>省略時は0
   * @param [options.y] ブロックの左端から右方向の位置(左端を0とする)<br>省略時は0
   * @param [options.z] スプライトの奥行き<br>大きいほど手前に描画される<br>省略時は0
   * @param [options.a] 描画時の透明度<br>0.0≦a≦1.0の間<br>0.0で完全透明、1.0で完全不透明<br>省略時は1.0
   * @param [options.m11] 変換マトリクスの左上値<br>transform,reset_matrixメソッドでも操作可<br>省略時は1.0
   * @param [options.m12] 変換マトリクスの右上値<br>transform,reset_matrixメソッドでも操作可<br>省略時は0.0
   * @param [options.m21] 変換マトリクスの左下値<br>transform,reset_matrixメソッドでも操作可<br>省略時は0.0
   * @param [options.m22] 変換マトリクスの右下値<br>transform,reset_matrixメソッドでも操作可<br>省略時は1.0
   * @param [options.sx] 画像内の右方向の描画開始位置<br>省略時は0
   * @param [options.sy] 画像内の下方向の描画開始位置
   * @param [options.sw] 画像内の描画幅<br>省略時は画像と同じ幅
   * @param [options.sh] 画像内の描画高さ<br>省略時は画像と同じ高さ
   * @param [options.dx] レイヤ内の右方向の描画開始位置<br>Sprite.xの位置より右にずれる<br>省略時は0
   * @param [options.dy] レイヤ内の下方向の描画開始位置<br>Sprite.yの位置より下にずれる<br>省略時は0
   * @param [options.dw] レイヤ内の描画幅<br>Sprite.swの値から拡大/縮小して描画される<br>省略時はSprite.swと同じ値
   * @param [options.dh] レイヤ内の描画高さ<br>Sprite.shの値から拡大/縮小して描画される<br>省略時はSprite.shと同じ値
   * @param [options.v] スプライトの表示(true)・非表示(false)を指定<br>show/hideメソッドでも操作可<br>省略時はfalse
   */
  Sprite = function(options){
    var o = $.extend({
      id: options.value.id,
      x:0, y:0, z:0, a:1.0,
      m11:1.0, m12:0.0, m21:0.0, m22:1.0,
      sx:0, sy:0, sw:options.value.width, sh:options.value.height,
      dx:0, dy:0, dw:options.value.width, dh:options.value.height, v:false }, options);
    this.id = o.id;
    this.image = o.value;
    /** @property ブロックの左端から右方向の位置(左端を0とする) */
    this.x = o.x;
    /** @property ブロックの左端から右方向の位置(左端を0とする) */
    this.y = o.y;
    /** @property スプライトの奥行き<br>大きいほど手前に描画される */
    this.z = o.z;
    /** @property 描画時の透明度<br>0≦a≦1の間<br>0で完全透明、1で完全不透明 */
    this.a = o.a;
    /** @property 変換マトリクスの左上値<br>transform,reset_matrixメソッドでも操作可 */
    this.m11 = o.m11;
    /** @property 変換マトリクスの右上値<br>transform,reset_matrixメソッドでも操作可 */
    this.m12 = o.m12;
    /** @property 変換マトリクスの左下値<br>transform,reset_matrixメソッドでも操作可 */
    this.m21 = o.m21
    /** @property 変換マトリクスの右下値<br>transform,reset_matrixメソッドでも操作可 */
    this.m22 = o.m22;
    /** @property 画像内の右方向の描画開始位置<br>省略時は0 */
    this.sx = o.sx;
    /** @property 画像内の下方向の描画開始位置 */
    this.sy = o.sy;
    /** @property 画像内の描画幅<br>省略時は画像と同じ幅 */
    this.sw = o.sw;
    /** @property 画像内の描画高さ<br>省略時は画像と同じ高さ */
    this.sh = o.sh;
    /** @property レイヤ内の右方向の描画開始位置<br>xの位置より右にずれる<br>省略時は0 */
    this.dx = o.dx;
    /** @property レイヤ内の下方向の描画開始位置<br>yの位置より下にずれる<br>省略時は0 */
    this.dy = o.dy;
    /** @property レイヤ内の描画幅<br>swの値から拡大/縮小して描画される<br>省略時はswと同じ値 */
    this.dw = o.dw;
    /** @property レイヤ内の描画高さ<br>shの値から拡大/縮小して描画される<br>省略時はshと同じ値 */
    this.dh = o.dh;
    /** @property スプライトの表示(true)・非表示(false)を指定<br>show/hideメソッドでも操作可<br>省略時はfalse */
    this.v = o.v;
  };

  /**
   * 画像ファイルを読み込む<br>imgタグを作り、再生ができるときに指定した関数を呼び出す
   * @param options.id 画像に一意につけられるID
   * @param options.src 対象ファイルのURLを配列で指定(マルチブラウザ対応)
   * @return 画像を読み込んでいるDeferredオブジェクト<br>コールバック関数の引数は、{type: "image", id: options.id, value: 生成したImageオブジェクト}で示すオブジェクト
   */
  Sprite.load_image = function(options){
    var defer = $.Deferred();
    var img_id = options.id;
    var img = new Image();
    img.src = options.src+ "?" + new Date().getTime();
    img.onload = function(){ defer.resolve({type: "image", id: img_id, value: img}); };
    return defer.promise();
  };

  /**
   * 音声ファイルを読み込む<br>audioタグを作り、再生ができるときに指定した関数を呼び出す
   * @param options.id スプライトに一意に一位につけられるID<br>内部で生成するImageオブジェクトも同じIDになる
   * @param options.src 対象ファイルのURLを配列で指定(マルチブラウザ対応)
   * @return スプライトを生成しているDeferredオブジェクト<br>コールバック関数の引数は、{type: "sprite", id: options.id, value: 生成したImageオブジェクト}で示すオブジェクト
   */
  Sprite.load = function(options){
    var defer = $.Deferred();
    Sprite.load_image(options).then(function(obj){
      defer.resolve({type: "sprite", id: obj.id, value: new Sprite(obj)});
    });
    return defer.promise();
  };

  /**
   * スプライトを描画する<br>省略時はRenderer.default_render関数が指定される
   * @param {Object} context 対象のレイヤー(canvasタグ)が持つコンテキスト
   */
  Sprite.prototype.render = Renderer.default_render;

  /**
   * スプライトを回転・拡大・縮小させる<br>一旦指定すると、transformかreset_matrixメソッドを呼ばない限り、この値が有効に鳴る
   * @param [options.deg] 回転させる角度<br>単位:度<br>省略時は0
   * @param [options.sx] sx 横方向の拡大縮小割合(右への方向)<br>省略時は1.0
   * @param [options.sy] sy 縦方向の拡大縮小割合(下への方向)<br>省略時は1.0
   */
  Sprite.prototype.transform = function(options){
    var o = $.extend({deg: 0, sx: 1.0, sy: 1.0}, options);
    var rad = 2.0 * o.deg * Math.PI / 360.0;
    this.m11 = o.sx * Math.cos(rad);
    this.m12 = o.sx * Math.sin(rad);
    this.m21 = o.sy * -(Math.sin(rad));
    this.m22 = o.sy * Math.cos(rad);
  };

  /**
   * transformメソッドで指定したか回転・拡大・縮小をリセット(回転0度、拡大1.0倍)する
   */
  Sprite.prototype.reset_matrix = function(){
    this.m11 = 1.0;
    this.m12 = 0.0;
    this.m21 = 0.0;
    this.m22 = 1.0;
  };

  /**
   * スプライトを移動させる<br>座標は、ブロックの左上が(0,0)で、値がプラスだと右・下方向、マイナスだと左・上方向となる
   * @param [options.x] 左端を0とした時の右方向の位置<br>省略時は現在位置
   * @param [options.y] 上端を0とした時の下方向の位置<br>省略時は現在位置
   * @param [options.dx] 右方向をプラスとした時の移動量<br>省略時は0
   * @param [options.dy] 下方向をプラスとした時の移動量<br>省略時は0
   */
  Sprite.prototype.move = function(options){
    var o = $.extend({x: this.x, y: this.y, dx: 0, dy: 0}, options);
    this.x = o.x + o.dx;
    this.y = o.y + o.dy;
  };

  /**
   * スプライトを表示させる
   */
  Sprite.prototype.show = function(){
    if(!this.v){ this.v = true; }
  };

  /**
   * スプライトを隠す
   */
  Sprite.prototype.hide = function(){
    if(this.v){ this.v = false; }
  };

  /**
   * @constructor
   * @class スプライトと同じタイミングで図形描画を管理・操作(ドローワー)
   * @param options.id スプライトに一意に一位につけられるID<br>省略時はvalue属性(Imageオブジェクト)のidプロパティ
   * @param options.render ブラウザ画面描画する関数<br>関数の引数には対象ブロックのコンテキスト(context)が渡る
   * @param [options.v] スプライトの表示(true)・非表示(false)を指定<br>show/hideメソッドでも操作可<br>省略時はfalse
   */
  Drawer = function(options){
    var o = $.extend({
      render: function(context){ },
      v: false
    }, options);
    // 直接インスタンスオブジェクトにパラメータの内容を結合
    $.extend(this, o);
    // renderメソッドのthisが指す場所をインスタンスに変更
    this.render.bind(this);
  }
  
  /**
   * 図形を表示させる
   */
  Drawer.prototype.show = function(){
    if(!this.v){ this.v = true; }
  };

  /**
   * 図形を隠す
   */
  Drawer.prototype.hide = function(){
    if(this.v){ this.v = false; }
  };

  /**
   * @constructor
   * @class 音声(audioタグ)を管理・操作
   * @param id 音声に固有に付けられるID(audioタグのidと共通にすればなお良い)
   */
  Sound = function(id){
    this.id = id;
    this.is_play = false;
    this.is_pause = false;
  };

  /**
   * 音声ファイルを読み込む<br>audioタグを作り、再生ができるときに指定した関数を呼び出す
   * @example {id: "hoge", src: ["/sounds/hoge.mp3","/sounds/hoge.ogg","/sounds/hoge.wav"], bgm: false}
   * @param options.id audioタグに一位につけられるID
   * @param options.src 音声ファイルのURLを配列で指定(マルチブラウザ対応、ブラウザ内では指定したどれかを再生)
   * @param [options.bgm] BGMとして繰り返し再生可かどうかを指定(true:BGM/false:SE)
   * @return 音声を再生できる状態に持ち込んでいるDeferredオブジェクト<br>コールバック関数の引数は、{type: "bgm"もしくは"se", id: options.id, value: 生成したSoundオブジェクト}で示すオブジェクト
   */
  Sound.load = function(options){
    var o = $.extend({
      bgm: false,
      body: $("body")
    }, options);
    var $area = $("<audio />");
    var defer = $.Deferred();

    $area.attr("id", o.id);
    $area.attr("preload", "auto");
    if(o.bgm == true){ $area.attr("loop", "true"); }
    
    for(var i=0; i<o.src.length; i++){
      var $src = $("<source />");
      var url = o.src[i] + "?" + new Date().getTime();
      $src.attr("id", o.id+"_"+i);
      $src.attr("name", o.id);
      $src.attr("src", url);
      $src.appendTo($area);
    }
    $area.appendTo(o.body);

    $area[0].addEventListener("loadedmetadata", (function(){
      var d = defer;
      var snd_id = o.id;
      var type = (o.bgm==true ? "bgm" : "se");
      return function(){ d.resolve({type: type, id: snd_id, value: new Sound(snd_id)}); };
    }).bind(this)());

    this.tag = $area[0];

    return defer.promise();
  };

  /**
   * 音声を再生する<br>最初から再生する(pauseした時も)
   */
  Sound.prototype.play = function(){
    var v = $("audio#"+this.id);
    if(this.is_play){
      v[0].pause();
    }
    v[0].currentTime = 0;
    v[0].play();
    this.is_play = true;
    this.is_pause = false;
  };

  /**
   * 音声の再生を停止する<br>再生位置は停止した位置を保持する<br>resumeメソッドを呼ぶと、そこから再生する
   */
  Sound.prototype.pause = function(){
    if(!this.is_pause){
      $("audio#"+this.id)[0].pause();
  	  this.is_pause = true;
	  }
  };

  /**
   * 音声を停止した位置から再生する
   */
  Sound.prototype.resume = function(){
    if(this.is_play && !this.is_pause){ return; }
    $("audio#"+this.id)[0].play();
    this.is_pause = false;
  };

  /**
   * 音声の再生を停止する<br>再生位置は最初に戻る(resumeしても)
   */
  Sound.prototype.stop = function(){
    if(!this.is_play){ return; }
    var v = $("audio#"+this.id)[0];
    v.pause();
    v.currentTime = 0;
    this.is_play = false;
    this.is_pause = false;
  };

  /**
   * 対象画面内から音声を削除する<br>audioタグを削除する
   */
  Sound.prototype.remove = function(){
    var $v = $("audio#"+this.id);
    if(this.is_play && !this.is_pause){ $v[0].pause(); }
    $v.remove();
  };

  /**
   * ロードした音声の長さを返す<br>単位：秒
   */
  Sound.prototype.length = function(){
    return $("audio#"+this.id)[0].duuration;
  };

  /**
   * 再生している位置を返す<br>単位：秒
   */
  Sound.prototype.pos = function(){
    return $("audio#"+this.id)[0].currentTime;
  };

  /**
   * 音声のボリューム(0.0(無音)～1.0(最大))を返す
   */
  Sound.prototype.volume = function(){
    return $("audio#"+this.id)[0].volume;
  };

  /**
   * 音声のボリューム(0.0(無音)～1.0(最大))を設定する
   */
  Sound.prototype.set_volume = function(vol){
    return $("audio#"+this.id)[0].volume = vol;
  };

  /**
   * エラー状態かどうかを返す
   * @return true/false
   */
  Sound.prototype.is_error = function(){
    return $("audio#"+this.id)[0].error != null;
  };

  /**
   * @constructor
   * @class 複数スレッドを一括管理・操作
   * @param interval スレッドを更新する間隔<br>ミリ秒で指定
   */
  Threads = function(interval){
    /**
     * IDとスレッドを関連付ける辞書オブジェクト
     */
    this.threads = {};
    this.interval = interval;
    this.timer = null;
  };

  /**
   * @ignore
   */
  Threads.prototype.update = function(){
    var ts = this.threads;
    var dels = [];
    for(var id in ts){
      var th = ts[id];
      if(!th.is_exec || th.waiting()){ continue; }
      th.update();
      if(!th.check()){
        th.stop();
        delete ts[id];
      }
    }
  };

  Threads.prototype.add = function(thread){
    this.threads[thread.body.id] = thread;
  };

  /**
   * @param [options.start] Thread#startで呼び出す関数(引数は同じ)
   * @param [options.update] Thread#updateで呼び出す関数(引数は同じ)
   * @param [options.check] Thread#checkで呼び出す関数(引数は同じ)
   * @param [options.stop] Thread#stopで呼び出す関数(引数は同じ)
   * @param [options.waiting] Thread#waitingで呼び出す関数(引数は同じ)
   * @constructor
   * @class スレッドを実装
  */
  Thread = function(options){
    t = $.extend({
      start: function(params){ },
      update: function(){ },
      check: function(){ return true; },
      stop: function(){ },
      waiting: function(){ return false; }
    }, options);

    this.is_exec = false;
    this.body = t;
  };

  /**
   * スレッドの開始処理
   * 開始時の処理内容をオーバーライドする
   * @param params スレッド開始時に渡したいオブジェクト
   */
  Thread.prototype.start = function(params){
    this.body.start(params);
    this.is_exec = true;
  };

  /**
   * スレッドのメイン処理
   * 処理の内容をオーバーライドする
   */
  Thread.prototype.update = function(){
    this.body.update();
  };

  /**
   * スレッドの終了判定処理
   * 処理の内容をオーバーライドする
   * 終了させたい時はtrue、継続させたい場合はfalseを返す
   */
  Thread.prototype.check = function(){
    return this.body.check();
  };

  /**
   * スレッドの停止処理
   * 停止時の処理内容をオーバーライドする
   */
  Thread.prototype.stop = function(){
    this.is_exec = false;
    this.body.stop();
  };

  /**
   * スレッドの実行待ち判定処理
   * updateするかどうかを判定する
   * updateさせたいときはtrue、処理を待たせたいときはfalseを返す
   */
  Thread.prototype.waiting = function(){
    return this.body.waiting();
  };

  /** @ignore */
  function requestAnimFrame(interval){
    var on_each_frame = window.requestAnimationFrame       ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame    ||
                        window.oRequestAnimationFrame      ||
                        window.msRequestAnimationFrame     ||
                        function(/* function */ callback, /* DOMElement */ element){
                          return window.setTimeout(callback, 100/6);
                        };
    return function(cb){
      var _cb = function(){ cb(); return on_each_frame(_cb); };
      return _cb();
    };
  };

  /**
   * @param options.body 処理対象のjQueryオブジェクト
   * @constructor
   * @class $.fn.m4w呼び出し後の各種処理をまとめる
  */
  M4W = function(options){
      this.body = options.body;
  };
  
  /**
   * レイヤーに図形を描画する
   * @param {Object} options {process: function(screen){スクリーンscreenに対する描画処理}}
  */
  M4W.prototype.draw = function(options){
    return this.body.each(function(){ 
      this.m4w.draw(options);
    });
  };

  /**
   * タイマーを使ったスプライト描画・スレッドの監視を開始する
   * @param {function} [objects.on_start] function(){開始に処理したい内容}}で示す関数オブジェクト<br>省略可
   */
  M4W.prototype.start = function(options){
    var o = $.extend({on_start: function(){ }}, options);
    o.on_start();
    return this.body.each(function(){
      this.m4w.start();
    });
  };

  /**
   * タイマーを使ったスレッドの監視を停止する<br>スプライト描画は継続
   * @param {function} [objects.on_stop] function(){停止時に処理したい内容}}で示す関数オブジェクト<br>省略可
   */
  M4W.prototype.stop = function(options){
    var o = $.extend({on_stop: function(){ }}, options);
    o.on_stop();
    return this.body.each(function(){
      this.m4w.stop();
    });
  };

  /**
   * 指定したDOMオブジェクトのlayers(Layerクラス)配列を返す
   * @param index 指定したDOMオブジェクト配列のインデックス<br>省略したときは全DOMオブジェクトが持つlayersプロパティの配列を返す
   * @return Layerオブジェクト配列もしくはその配列
  */
  M4W.prototype.layers = function(index){
    var layers = []
    this.body.each(function(){
      layers.push(this.m4w.screen.layers);
    });
    if(index!=null||index!=undefined){ return layers[index]; }
    return layers;
  };

  /**
   * 指定したDOMオブジェクトのscreenプロパティ(Screenクラス)を返す
   * @param index 指定したDOMオブジェクト配列のインデックス<br>省略したときは全DOMオブジェクトが持つscreenプロパティの配列を返す
   * @return Screenオブジェクトもしくはその配列
   */
  M4W.prototype.screens = function(index){
    var screens = []
    this.body.each(function(){
      screens.push(this.m4w.screen);
    });
    if(index!=null||index!=undefined){ return screens[index]; }
    return screens;
  };

  /**
   * 指定したDOMオブジェクトのthredasプロパティ(Threadsクラス)を返す
   * @param index 指定したDOMオブジェクト配列のインデックス<br>省略したときは全DOMオブジェクトが持つthreadsプロパティの配列を返す
   * @return Threadsオブジェクトもしくはその配列
  */
  M4W.prototype.threads = function(index){
    var threads = []
    this.body.each(function(){
      threads.push(this.m4w.threads.threads);
    });
    if(index!=null||index!=undefined){ return threads[index]; }
    return threads;
  };

  /**
   * 指定のDOMオブジェクト・idに対応したScreenオブジェクトを返す
   * @param [options.index] DOMオブジェクトの配列のインデックス。省略時は0
   * @return Screenオブジェクト
  */
  M4W.prototype.screen = function(options){
    var o = $.extend({index: 0}, options);
    return this.body[o.index].m4w.screen;
  };

  /**
   * 指定のDOMオブジェクト・idに対応したLayerオブジェクトを返す
   * @param options.id レイヤーのID
   * @param [options.index] DOMオブジェクトの配列のインデックス。省略時は0
   * @return Layerオブジェクト
  */
  M4W.prototype.layer = function(options){
//    var o = $.extend({index: 0}, options);
//    var layers = []
//    this.body.each(function(){
//      layers.push(this.m4w.screen.layers);
//    });
//    return layers[o.index][o.id];
    var o = $.extend({index: 0}, options);
    return this.body[o.index].m4w.screen.layers[o.id];
  };

  /**
   * 指定のDOMオブジェクト・idに対応したThreadオブジェクトを返す
   * @param options.id スレッドのID
   * @param [options.index] DOMオブジェクトの配列のインデックス。省略時は0
   * @return Threadオブジェクト
  */
  M4W.prototype.thread = function(options){
    var o = $.extend({index: 0}, options);
    var threads = []
    this.body.each(function(){
      threads.push(this.m4w.threads.threads);
    });
    return threads[o.index][o.id]; 
  };

  /**
   * 対象のDOMオブジェクトにレイヤーを追加する
   * @param {Object} options Layerコンストラクタの引数と同じ
   */
  M4W.prototype.add_layer = function(options){
    return this.body.each(function(){
      this.m4w.add_layer(options);
    });
  };

  /**
   * 対象のDOMオブジェクトに背景を追加する
   * @param {Object} options Backgroundコンストラクタの引数と同じ
   */
  M4W.prototype.add_background = function(options){
    return this.body.each(function(){
      this.m4w.add_background(options);
    });
  };

  /**
   * 対象のDOMオブジェクトにスレッドを追加する
   * @param {Object} options Threadコンストラクタの引数と同じ
   */
  M4W.prototype.add_thread = function(options){
    return this.body.each(function(){
      this.m4w.add_thread(options);
    });
  };

  /**
   * 対象のDOMオブジェクトにアセットを追加する
   * @param {Object} options AssetsLoader.loadメソッドの引数と同じ
   */
  M4W.prototype.add_assets = function(options){
    return this.body.each(function(){
      this.m4w.add_assets(options);
    });
  };

  /**
   * @param options.body 処理対象のDOMオブジェクト
   * @constructor
   * @class $.fn.m4w呼び出し後、DOMオブジェクト内での各種処理をまとめる
  */
  M4WDOM = function(options){
    this.body = options.body;
    /**
     * @property スレッド共有オブジェクト<br>Threadsクラス
     */
    this.threads = new Threads(options.thread_interval);
    /**
     * @property 背景共有オブジェクト
     */
    this.backgrounds = {};
    /**
     * @property スクリーン共有オブジェクト<br>Screenクラス
     */
    this.screen = new Screen(options.screen_options);
    /**
     * @property 画面更新タイマー
     */
    this.on_each_frame = null;
    /**
     * @property スレッド割り込みタイマー
     */
    this.thread_timer = null;
    /**
     * @property データ共有オブジェクト<br>初期は空のオブジェクト
     */
    this.vars = {};
  }
  
  /**
   * レイヤーに図形を描画する
   * @param obj 描画対象のDOMオブジェクト
   * @param oprions.process 処理内容<br>function(Layerオブジェクトの辞書オブジェクト){ 描画処理内容 }で示す
   */
  M4WDOM.prototype.draw = function(options){
    var o = $.extend({
    }, options);

    var layers = this.screen.layers;
    o.process(layers);
    return this.body;
  };

  /**
   * タイマーを使ったスプライト描画・スレッドの監視を開始する
   * @param {function} [objects.on_start] function(){開始に処理したい内容}}で示す関数オブジェクト<br>省略可
   */
  M4WDOM.prototype.start = function(){
    this.threads.timer = setInterval(this.threads.update.bind(this.threads), this.threads.interval);
    var each_frame = requestAnimFrame(this.screen.interval);
    each_frame(this.screen.render.bind(this.screen));
    return this.body;
  };

  /**
   * タイマーを使ったスレッドの監視を停止する<br>スプライト描画は継続
   * @param {function} [objects.on_stop] function(){停止時に処理したい内容}}で示す関数オブジェクト<br>省略可
   */
  M4WDOM.prototype.stop = function(){
    if(this.threads.timer != null){ clearInterval(this.threads.timer); }
    return this.body;
  };

  /**
   * 対象のDOMオブジェクトにレイヤーを追加する
   * @param {Object} options Layerコンストラクタの引数と同じ
   */
  M4WDOM.prototype.add_layer = function(options){
    this.screen.add(options.id, new Layer(options));
    return this.body;
  };

  /**
   * 対象のDOMオブジェクトに背景を追加する
   * @param {Object} options Backgroundコンストラクタの引数と同じ
   */
  M4WDOM.prototype.add_background = function(options){
    this.backgrounds[options.id] = new Background(options);
    return this.body;
  };

  /**
   * 対象のDOMオブジェクトにスレッドを追加する
   * @param {Object} options Threadコンストラクタの引数と同じ
   */
  M4WDOM.prototype.add_thread = function(options){
    this.threads.add(new Thread(options));
    return this.body;
  };

  /**
   * 対象のDOMオブジェクトにアセットを追加する
   * @param {Object} options AssetsLoader.loadメソッドの引数と同じ
   */
  M4WDOM.prototype.add_assets = function(options){
    AssetsLoader.load(options);
    return this.body;
  };
  
  /**
   * windowオブジェクト
   * @name window
  */
  
  /**
   * @namespace 各種クラスの外部アクセス用名前空間<br>以下のクラスが利用可能
   * <ul>
   * <li>Screen</li>
   * <li>Layer</li>
   * <li>Background</li>
   * <li>AssetsLoader</li>
   * <li>Sprite</li>
   * <li>Drawer</li>
   * <li>Sound</li>
   * <li>Threads</li>
   * <li>Thread</li>
   * </ul>
   * @example var dw = new (window).m4w.Drawer({render: function(ctx){ ctx.beginPath(); ... }});
  */
  window.m4w = {
    Screen: Screen,
    Layer: Layer,
    Background: Background,
    AssetsLoader: AssetsLoader,
    Sprite: Sprite,
    Drawer: Drawer,
    Sound: Sound,
    Threads: Threads,
    Thread: Thread
  };
  
  /**
   * jQueryオブジェクトの別名(http://jquery.com/)
   * @name $
   * @class 
   */
  
  /**
   * jQueryオブジェクトのプラグイン関数(http://jquery.com/)
   * @name $.fn
   * @class 
   */

   /**
   * 指定したブロックのm4w初期化
   * このメソッドを呼び出すと、以下の場所にオブジェクトが追加される
   * <table>
   * <tr><th>対象</th><th>名称</th><th>オブジェクト</th></tr>
   * <tr><td>jQueryオブジェクト</td><td>m4w</td><td>M4W</td></tr>
   * <tr><td>各ブロック要素のDOMオブジェクト</td><td>m4w</td><td>M4WDOM</td></tr>
   * </table>
   * @param [options.screen_options] screenオブジェクトに渡す引数<br>Screenコンストラクタの引数と同じ
   * @param [options.thread_interval] Threads.updateの呼び出し間隔<br>単位はミリ秒<br>省略時は10
   * @param [options.layers] 初期化時に作成したいレイヤーの配列。要素はLayerコンストラクタの引数と同じ<br>省略時は[]
   * @param [options.backgrounds] 初期化時に作成したい背景の配列。要素はBackgroundコンストラクタの引数と同じ<br>省略時は[]
   * @param [options.threads] 初期化時に作成したいスレッドの配列。要素はThreadコンストラクタの引数と同じ<br>省略時は[]
   * @param [options.assets] 初期化時に作成したいアセットの配列。内容はAssetLoader.loadメソッドの引数と同じ<br>省略時はnull
   */
  $.fn.m4w = function(options){
    var o = $.extend({
      screen_options: {},
      layers: [],
      threads: [],
      backgrounds: [],
      assets: null,
      thread_interval: 10
    }, options);
   
    $.extend($(this).m4w, new M4W({body: $(this)}));
   
    return this.each(function(){
      this.m4w = new M4WDOM($.extend({body: this}, o));
     
      for(var l=0; l<o.layers.length; l++){
        this.m4w.add_layer(o.layers[l]);
      }
      
      for(var l=0; l<o.backgrounds.length; l++){
        this.m4w.add_background(o.backgrounds[l]);
      }
      
      for(var l=0; l<o.threads.length; l++){
        this.m4w.add_thread(o.threads[l]);
      }
      
      if(o.assets != null){ this.m4w.add_assets(o.assets); }
    });
  };
})(jQuery);
