/**
 * @fileOverview Miyako4Web(Miyako for Web) Video<br>
 * このファイルを読み込むと、window.m4wオブジェクトに以下のプロパティが追加される<br>
 * window.m4w.Video<br>
 * window.m4w.AssetsLoader.loaders.video<br>
 *
 * @name Miyako for Web(M4W) Video extention
 * @author Cyross Makoto (サイロス誠)
 * @version 1.0.0
 * @revision 1
 * @require jQuery 1.7.2(or later)
 * @license MIT License (MITライセンス)
 */

(function($){
  /**
   * @constructor
   * @class ビデオ(videoタグ)を管理・操作
   * @param id ビデオに固有に付けられるID(videoタグのidと共通にすればなお良い)
   * @param body 対応するvideoタグのjQueryオブジェクト
   */
  Video = function(id, body){
    this.id = id;
    this.body = body;
    this.is_play = false;
    this.is_pause = false;
  };

  /**
   * ビデオファイルを読み込む<br>videoタグを作り、再生ができるときに指定した関数を呼び出す
   * @example {id: "hoge", src: ["/hoge.mp4","/hoge.avi"]}
   * @param options.id videoタグに一意につけられるID
   * @param options.src ファイルのURLを配列で指定(マルチブラウザ対応、ブラウザ内では指定したどれかを再生)
   * @param [options.width] ビデオの横幅<br>ピクセル単位<br>省略時は640
   * @param [options.height] ビデオの高さ<br>ピクセル単位<br>省略時は480
   * @param [options.left] ブラウザ(もしくは親ブロックからの右方向の位置<br>単位はピクセル<br>省略時は0(ブロックの左端)
   * @param [options.top] ブラウザ(もしくは親ブロックからの上方向の位置<br>単位はピクセル<br>省略時は0(ブロックの上端)
   * @param [options.z] ビデオの奥行き<br>CSSのz-indexと同じ<br>省略時は0
   * @param [options.body] ビデオを埋め込むブロック<br>jQueryオブジェクトを指定<br>省略時はbodyブロック($("body"))
   * @param [options.loop] ビデオを繰り返し再生するかを指定<br>省略時はfalse(繰り返さない)
   * @param [options.autofinish] 再生終了時、自動的にvideoタグを取り除くかを指定<br>省略時はfalse(取り除かない)
   * @return ビデオを再生できる状態に持ち込んでいるDeferredオブジェクト<br>コールバック関数の引数は、{type: "video", id: options.id, value: 生成したVideoオブジェクト}で示すオブジェクト
   */
  Video.load = function(options){
    var o = $.extend({
      id: this.id,
      width: 640,
      height: 480,
      left: 0,
      top: 0,
      z: 0,
      loop: false,
      autofinish: false,
      body: $("body")
    }, options);
    
    var $area = $("<video />");
    var defer = $.Deferred();

    $area.attr("id", o.id);
    $area.attr("preload", "metadata");
    $area.attr("loop", o.loop);
    $area.attr("width", o.width);
    $area.attr("height", o.height);
    $area.css("position", "absolute");
    $area.css("top", o.top);
    $area.css("left", o.left);
    $area.css("z-index", o.z);
    
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
      var video_id = o.id;
      var body = $area;
      return function(){ d.resolve({type: "video", id: video_id, value: new Video(video_id, body)}); };
    }).bind(this)());

    if(o.autofinish == true){
      $area[0].addEventListener("ended", (function(){
          var d = defer;
          var video_id = o.id;
          var video = $area[0];
          return function(){
            video.finish();
            d.resolve(video_id);
          };
      }).bind(this)());
    }

    return defer.promise();
  };

  /**
   * ビデオを表示する
   */
  Video.prototype.show = function(){
    $("video#"+this.id)[0].show();
  };

  /**
   * ビデオを非表示にする
   */
  Video.prototype.hide = function(){
    $("video#"+this.id)[0].hide();
  };

  /**
   * ビデオの奥行きを設定する
   */
  Video.prototype.z = function(z){
    var $v = $("video#"+this.id);
    if(!z){ return $v.css("z-index"); }
    $v.css("z-index", parseInt(z));
  };

  /**
   * ロードした音声の長さを返す<br>単位：秒
   */
  Video.prototype.length = function(){
    return $("video#"+this.id)[0].duuration;
  };

  /**
   * 再生している位置を返す<br>単位：秒
   */
  Video.prototype.pos = function(){
    return $("video#"+this.id).currentTime;
  };

  /**
   * 音声のボリューム(0.0(無音)～1.0(最大))を返す
   */
  Video.prototype.volume = function(){
    return $("video#"+this.id)[0].volume;
  };

  /**
   * 音声のボリューム(0.0(無音)～1.0(最大))を設定する
   */
  Video.prototype.set_volume = function(vol){
    return $("video#"+this.id)[0].volume = vol;
  };

  /**
   * ビデオを最初から再生する
   */
  Video.prototype.play = function(){
    var v = $("video#"+this.id)[0];
    if(!this.is_pause && !v.ended){ v.pause(); }
    v.play();
    this.is_play = true;
    this.is_pause = false;
  };

  /**
   * ビデオの再生を停止する<br>同時に、ビデオの再生位置を先頭に戻す
   */
  Video.prototype.stop = function(){
    var v = $("video#"+this.id)[0];
    if(v.ended){ return; }
    if(!this.is_pause){ v.pause(); }
    v.currentTime = 0;
    this.is_play = false;
    this.is_pause = false;
  };

  /**
   * ビデオの再生を停止する<br>同時に、ビデオの再生位置はそのまま
   */
  Video.prototype.pause = function(){
    var v = $("video#"+this.id)[0];
    if(this.is_pause || v.ended){ return; }
    v.pause();
    this.is_play = false;
    this.is_pause = true;
  };


  /**
   * 停止時の再生位置からビデオを再生する
   */
  Video.prototype.resume = function(){
    $("video#"+this.id)[0].play();
    this.is_play = true;
    this.is_pause = false;
  };

  /**
   * videoタグを取り除く
   */
  Video.prototype.remove = function(){
    $("video#"+this.id)[0].remove();
  };

  /**
   * 再生を停止して、videoタグを取り除く
   */
  Video.prototype.finish = function(){
    this.pause();
    this.hide();
    this.remove();
  };

  window.m4w = $.extend({Video: Video}, window.m4w);

  window.m4w.AssetsLoader.loaders.video = function(options){
    return Video.load(options);
  };
})(jQuery);
