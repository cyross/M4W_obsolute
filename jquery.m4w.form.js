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
   * (private)セットアップ<基本情報の追加>
   */
  Form.setup = function($obj, o){
    $obj.css("position", o.position);
    $obj.css("z-index", o.z);
    $obj.css("left", o.left);
    $obj.css("top", o.top);
    $obj.appendTo(o.body);

    for(name in o.css){ $obj.css(name, o.css[name]); }
    for(name in o.attr){ $obj.attr(name, o.attr[name]); }
    for(name in o.events){
      $obj.unbind(name);
      $obj.bind(name, o.events[name]);
    }
  }

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
    this.setup($pb, o);

    return $pb;
  }

  /**
   * セレクトボックスを管理・操作
   * @param options.id 固有に付けられるID(inputタグのidと共通にすればなお良い)
   * @param options.options 選択できるオプションオブジェクトの配列<br>{value: (選択しているオプションの値),<br>text: (表示する文字列、省略時はvalueと同じ),<br>selected: (表示時に選択された状態にするときはtrueを渡す(省略可))<br>}
   * @param [options.left] 画面(もしくは親ブロックからの右方向の位置<br>単位はピクセル<br>省略時は0(ブロックの左端)
   * @param [options.top] 画面(もしくは親ブロックからの上方向の位置<br>単位はピクセル<br>省略時は0(ブロックの上端)
   * @param [options.z] 奥行き<br>CSSのz-indexと同じ<br>省略時は1000
   * @param [options.body] 埋め込み先ブロック<br>jQueryオブジェクトを指定<br>省略時はbodyブロック($("body"))
   * @param [options.css] CSS値をオブジェクトで指定<br>省略時は{}
   * @param [options.attr] attr値をオブジェクトで指定<br>jQueryオブジェクトを指定<br>省略時は{}
   * @param [options.events] 登録したいイベントの関数群<br>"イベント名": イベントハンドラ本体で登録する<br>省略時は{}
   */
  Form.create_selectbox = function(options){
    var o = $.extend({
      options: [],
      position: "absolute",
      z: 0,
      left: 0,
      top: 0,
      body: $("body"),
      events: { }
    }, options);

    if(!("name" in o)){ o.name = o.id; }

    var $select = $("<select />", o);
    this.setup($select, o);

    for(var i=0; i<o.options.length; i++){
      var opt = $.extend({
        value: "",
        selected: false
      }, o.options[i]);
      if(!("text" in opt)){ opt["text"] = opt.value; }

      var $opt = $("<option />");
      $opt.val(opt.value);
      $opt.html(opt.text);
      if(opt.selected){ $opt.attr("selected", "selected"); }
      $opt.appendTo($select);
    }

    return $select;
  }

  /**
   * ラベル(span)を管理・操作
   * @param options.id 固有に付けられるID(inputタグのidと共通にすればなお良い)
   * @param options.text ラベルに挿入したい文字列(HTMLもしくはjQueryオブジェクト)
   * @param [options.left] 画面(もしくは親ブロックからの右方向の位置<br>単位はピクセル<br>省略時は0(ブロックの左端)
   * @param [options.top] 画面(もしくは親ブロックからの上方向の位置<br>単位はピクセル<br>省略時は0(ブロックの上端)
   * @param [options.z] 奥行き<br>CSSのz-indexと同じ<br>省略時は1000
   * @param [options.body] 埋め込み先ブロック<br>jQueryオブジェクトを指定<br>省略時はbodyブロック($("body"))
   * @param [options.css] CSS値をオブジェクトで指定<br>省略時は{}
   * @param [options.attr] attr値をオブジェクトで指定<br>jQueryオブジェクトを指定<br>省略時は{}
   * @param [options.events] 登録したいイベントの関数群<br>"イベント名": イベントハンドラ本体で登録する<br>省略時は{}
   */
  Form.create_label = function(options){
    var o = $.extend({
      position: "absolute",
      z: 0,
      left: 0,
      top: 0,
      body: $("body"),
      events: { }
    }, options);

    var $label = $("<span />", o);
    this.setup($label, o);

    if(typeof(o.text) == "string"){
      $label.html(o.text);
    }
    else{
      o.text.appendTo($label);
    }

    return $label;
  }

  /**
   * ボックス(div)を管理・操作
   * @param options.id 固有に付けられるID(inputタグのidと共通にすればなお良い)
   * @param [options.left] 画面(もしくは親ブロックからの右方向の位置<br>単位はピクセル<br>省略時は0(ブロックの左端)
   * @param [options.top] 画面(もしくは親ブロックからの上方向の位置<br>単位はピクセル<br>省略時は0(ブロックの上端)
   * @param [options.width] 幅<br>単位はピクセル<br>省略時は256
   * @param [options.height] 高さ<br>単位はピクセル<br>省略時は256
   * @param [options.z] 奥行き<br>CSSのz-indexと同じ<br>省略時は1000
   * @param [options.body] 埋め込み先ブロック<br>jQueryオブジェクトを指定<br>省略時はbodyブロック($("body"))
   * @param [options.css] CSS値をオブジェクトで指定<br>省略時は{}
   * @param [options.attr] attr値をオブジェクトで指定<br>jQueryオブジェクトを指定<br>省略時は{}
   * @param [options.events] 登録したいイベントの関数群<br>"イベント名": イベントハンドラ本体で登録する<br>省略時は{}
   */
  Form.create_box = function(options){
    var o = $.extend({
      position: "absolute",
      z: 0,
      left: 0,
      top: 0,
      width: 256,
      height: 256,
      body: $("body"),
      events: { }
    }, options);

    var $box = $("<div />", o);
    this.setup($box, o);
    $box.width(o.width);
    $box.height(o.height);

    return $box;
  }

  window.m4w = $.extend({Form: Form}, window.m4w);
})(jQuery);
