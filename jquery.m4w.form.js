/**
 * @fileOverview Miyako4Web(Miyako for Web) WebフォームVideo<br>
 * このファイルを読み込むと、window.m4wオブジェクトに以下のプロパティが追加される<br>
 * window.m4w.Form<br>
 *
 * @name Miyako for Web(M4W) Web form extention
 * @author Cyross Makoto (サイロス誠)
 * @version 1.0.0
 * @revision 1
 * @require jQuery 1.7.2(or later)
 * @license MIT License (MITライセンス)
 */

(function($){
  /**
   * @class フォームを管理するクラス
   */
  Form = function(){
  };

  /**
   * ボタン(inputタグ・type="button")を管理・操作
   * @param options.id ボタンに固有に付けられるID(inputタグのidと共通にすればなお良い)
   * @param [options.name] ボタンのな前(inputタグのnameと共通にすればなお良い)
   * @param [options.left] ボタン(もしくは親ブロックからの右方向の位置<br>単位はピクセル<br>省略時は0(ブロックの左端)
   * @param [options.top] ボタン(もしくは親ブロックからの上方向の位置<br>単位はピクセル<br>省略時は0(ブロックの上端)
   * @param [options.z] ボタンの奥行き<br>CSSのz-indexと同じ<br>省略時は1000
   * @param [options.body] ボタンを埋め込むブロック<br>jQueryオブジェクトを指定<br>省略時はbodyブロック($("body"))
   * @param [options.css] CSS値をオブジェクトで指定<br>省略時は{}
   * @param [options.attr] attr値をオブジェクトで指定<br>jQueryオブジェクトを指定<br>省略時は{}
   * @param [options.events] 登録したいイベントの関数群<br>"イベント名": イベントハンドラ本体で登録する<br>省略時は{}
   */
  Form.create_button = function(options){
    var o = $.extend({
      type: "button",
      position: "absolute",
      z: 0,
      left: 0,
      top: 0,
      body: $("body"),
      events: { }
    }, options);

    if(!("name" in o)){ o.name = o.id; }

    var $pb = $("<input />", o);
    $pb.css("position", o.position);
    $pb.css("z-index", o.z);
    $pb.css("left", o.left);
    $pb.css("top", o.top);
    $pb.unbind("click");
    $pb.appendTo(o.body);

    for(name in o.css){ $pb.css(name, o.css[name]); }
    for(name in o.attr){ $pb.attr(name, o.attr[name]); }
    for(name in o.events){
      $pb.unbind(name);
      $pb.bind(name, o.events[name]);
    }

    return $pb;
  }

  window.m4w = $.extend({Form: Form}, window.m4w);
})(jQuery);
