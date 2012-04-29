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
    $pb.appendTo(o.body);

    for(name in o.css){ $pb.css(name, o.css[name]); }
    for(name in o.attr){ $pb.attr(name, o.attr[name]); }
    for(name in o.events){
      $pb.unbind(name);
      $pb.bind(name, o.events[name]);
    }

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
    $select.css("position", o.position);
    $select.css("z-index", o.z);
    $select.css("left", o.left);
    $select.css("top", o.top);
    $select.appendTo(o.body);

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

    for(name in o.css){ $select.css(name, o.css[name]); }
    for(name in o.attr){ $select.attr(name, o.attr[name]); }
    for(name in o.events){
      $select.unbind(name);
      $select.bind(name, o.events[name]);
    }

    return $select;
  }

  /**
   * ラベルを管理・操作
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

    var $label = $("<div />", o);
    $label.css("position", o.position);
    $label.css("z-index", o.z);
    $label.css("left", o.left);
    $label.css("top", o.top);
    $label.appendTo(o.body);

    if(typeof(o.text) == "string"){
      $label.html(o.text);
    }
    else{
      o.text.appendTo($label);
    }

    for(name in o.css){ $label.css(name, o.css[name]); }
    for(name in o.attr){ $label.attr(name, o.attr[name]); }
    for(name in o.events){
      $label.unbind(name);
      $label.bind(name, o.events[name]);
    }

    return $label;
  }

  window.m4w = $.extend({Form: Form}, window.m4w);
})(jQuery);
