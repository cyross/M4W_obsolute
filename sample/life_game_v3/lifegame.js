/*
 * M4W de ライフゲーム Version 3.0
 * 2012 Cyross Makoto
 */

(function(){
  // セルオブジェクトクラス
  Cell = function(){
    this.state = 0; // 生死状態
    this.generation = 0; // 世代
  }
  
  Cell.prototype.birth = function(){
    this.state = 1; // 生きている
    this.generation = 0; // 世代はゼロ
  }

  Cell.prototype.proceed = function(){
    this.state = 1; // 死んでいる
    this.generation = 1; // 世代を増やす
  }

  Cell.prototype.death = function(){
    this.state = 0; // 死んでいる
    this.generation = 0; // 世代を戻す
  }

  // 最初に生きさせる格子の数
  var live_cells = 200;

  // 格子ひとつのピクセル数
  var matrix_width = 16;
  var matrix_height = 16;

  // 更新ウェイト数
  var wait = 10;

  // 実行・停止切り替え
  var is_exec = true;

  // 画面・レイヤーのオプション群(基本)
  var base = {
    left: 0,
    top: 0,
    width: $(window).width(),
    height: $(window).height()
  }
  // 格子の数
  var mwidth = base.width / matrix_width;
  var mheight = base.height / matrix_height;
  // 格子一つの生命状態を格納するマトリックス
  var matrix = create_matrix(mwidth, mheight);

  // 画面に格子を描く処理
  var dw = new Drawer({
    id: "d01",
    width: base.width,
    height: base.height,
    mw: matrix_width,
    mh: matrix_height,
    mx: matrix,
    state: {"2": "yellow", "1": "red", "0": "black"},
    render: function(context){
      var w = this.mx.w;
      var h = this.mx.h;
      context.lineWidth = 1;
      for(var y=0; y<h; y++){
        var yy = y * this.mh;
        var m = this.mx[y];
        for(var x=0; x<w; x++){
          var state = this.state[m[x].state+m[x].generation];
          context.save();
          context.beginPath();
          context.fillStyle = state;
          context.fillRect(x*this.mw, yy, this.mw, this.mh);
          context.restore();
        }
      }
    }
  });
  
  // ライフゲームのアルゴリズム
  // 0.01秒ごとに呼ばれている
  var th = {
    id: "t01",
    wait: wait,
    count: 0,
    matrix: matrix,
    is_exec: is_exec,
    update: function(){
      var mx = this.matrix;
      if(!this.is_exec){ return; }
      if(this.count < this.wait){
        this.count++;
        return;
      }
      this.count = 0;
      for(var y=0; y<mx.h; y++){
        var m = mx[y];
        for(var x=0; x<mx.w; x++){
          var cell = m[x];
          var lives = mx[y-1][x-1].state
                    + mx[y-1][x].state
                    + mx[y-1][x+1].state
                    + mx[y][x-1].state
                    + mx[y][x+1].state
                    + mx[y+1][x-1].state
                    + mx[y+1][x].state
                    + mx[y+1][x+1].state;
          if(cell.state == 0){
            if(lives==3){ cell.birth(); } // 誕生
          }
          else{
            if(lives <= 1 || lives >= 4){ // 過疎or過密
              cell.death();
            }
            else{                         // 生存
              cell.proceed();
            }
            
          }
        }
      }
    }
  };

  // 格子オブジェクトを生成
  // わざと余白分のセルを作っておくために、オブジェクトを使用
  function create_matrix(w, h){
    var matrix = {w: w, h: h};
    for(var y=-1; y<h+1; y++){
      var row = {};
      for(var x=-1; x<w+1; x++){ row[x] = new Cell(); }
      matrix[y] = row;
    }
    return matrix;
  }

  // 格子を初期化
  function setup(matrix){
    for(var l=0; l<live_cells; l++){
      var x = parseInt(Math.random() * matrix.w)+1;
      var y = parseInt(Math.random() * matrix.h)+1;
      matrix[y][x].birth();
    }
  }

  $(document).ready(function(){
    var $body = $("body");
    var screen_options = $.extend({id: "s01", body: $body}, base);
    var layer_options = $.extend({id: "l01", z: 1,  body: $body}, base);
    // 再生用関数
    var play_umareta = function(){};
    var play_shinda = function(){};

    var reset = function(width, height, cells){
      // 更新処理を一旦停止
      $body.m4w.thread({id: "t01"}).stop();
      // 基本データを変更
      live_cells = cells;
      base.width = width;
      base.height = height
      mwidth = base.width / matrix_width;
      mheight = base.height / matrix_height;

      matrix = create_matrix(mwidth, mheight);
      $body.m4w.layer({id: "l01"}).sprites["d01"].mx = matrix;
      $body.m4w.thread({id: "t01"}).body.matrix = matrix;
      
      setup(matrix);

      // 画面のリサイズ
      $body.m4w.screen().resize(base.width, base.height);
      // レイヤのリサイズ
      $body.m4w.layer({id: "l01"}).resize(base.width, base.height, true);
      // 更新処理を再開
      $body.m4w.thread({id: "t01"}).start();
    };

    // クリックした箇所のセルの生死を反転
    screen_options.events = {click: function(event){
      var x = parseInt(event.pageX / matrix_width);
      var y = parseInt(event.pageY / matrix_height);
      var m = matrix[y][x];
      if(m.state == 0){
        m.birth();
        play_umareta();
      }
      else{
        m.death();
        play_shinda();
      }
    }};

    // ボックス作成
    var $box1 = window.m4w.Form.create_box({
      id: "box01",
      left: 16,
      top: 16,
      width: 480,
      height: 160,
      z: 2000,
      is_dand: false,
      offset_x: 0,
      offset_y: 0,
      css: {'background-color': 'white'}
    });
    $box1[0].is_dand = false;
    $box1[0].ox = 0;
    $box1[0].oy = 0;
    $box1[0].target = $box1;
    // D&D処理
    $box1.mousedown(function(event){
      this.is_dand = true;
      this.ox = event.pageX;
      this.oy = event.pageY;
      $("body").mousemove(function(event){
        var base = $box1[0];
        if(!base.is_dand){ return; }
        var $t = base.target;
        var px = event.pageX;
        var py = event.pageY;
        $t.css("left", parseInt($t.css("left")) + (px - base.ox));
        $t.css("top", parseInt($t.css("top")) + (py - base.oy));
        base.ox = px;
        base.oy = py;
      });
      $("body").mouseup(function(event){
        $box1[0].is_dand = false;
        $("body").unbind('mousemove');
        $("body").unbind('mouseup');
      });
    });

    // ラベル追加
    var $label1 = window.m4w.Form.create_label({
      id: "lb01",
      body: $box1, // box1上に表示
      left: 16,
      top: 16,
      text: "画面上のセルをクリックすると、そのセルの生死が反転します。"
    });
    var $label2 = window.m4w.Form.create_label({
      id: "lb02",
      body: $box1, // box1上に表示
      left: 16,
      top: 96,
      text: "ウェイト:&nbsp;"
    });
    var $label2 = window.m4w.Form.create_label({
      id: "lb02",
      body: $box1, // box1上に表示
      left: 16,
      top: 128,
      text: "初期セル数:"
    });

    // 更新を停止・再開するボタンを作成
    var boptions1 = {
      id: "b01",
      body: $box1, // box1上に表示
      left: 16,
      top: 32,
      name: "toggle",
      value: "停止／再開",
      events: {click: function(event){
        var body = $body.m4w.thread({id: "t01"}).body;
        body.is_exec = !body.is_exec;
      }}
    }

    // ボタン追加
    var $chg_button = window.m4w.Form.create_button(boptions1);

    // 更新を停止・再開するボタンを作成
    var boptions2 = {
      id: "b02",
      body: $box1, // box1上に表示
      left: 16,
      top: 64,
      name: "reset",
      value: "リセット",
      events: {click: function(event){
        reset($(window).width(), $(window).height(), live_cells);
      }}
    }

    // ボタン追加
    var $chg_button = window.m4w.Form.create_button(boptions2);

    // ウェイトを変更するセレクトボックスを作成
    var soptions1 = {
      id: "s01",
      body: $box1, // box1上に表示
      left: 128,
      top: 96,
      options: [{value: 0}, {value: 1}, {value: 2}, {value: 3}, {value: 5}, {value: 8}, {value: 10}],
      events: {change: function(event){
        $body.m4w.thread({id: "t01"}).body.wait = parseInt($(this).val());
      }}
    }
    // ウェイトの初期値をselectedにする
    for(var i=0; i<soptions1.options.length; i++){
      if(soptions1.options[i].value == wait){ soptions1.options[i].selected = true; }
    }

    // セレクトボックス追加
    var $select_wait = window.m4w.Form.create_selectbox(soptions1);

    // 生存セル数を変更するセレクトボックスを作成
    var soptions2 = {
      id: "s02",
      body: $box1, // box1上に表示
      left: 128,
      top: 128,
      options: [{value: 100}, {value: 200}, {value: 500}, {value: 1000}, {value: 2000}, {value: 5000}, {value: 10000}],
      events: {change: function(event){
        reset($(window).width(), $(window).height(), parseInt($(this).val()));
      }}
    }
    // ウェイトの初期値をselectedにする
    for(var i=0; i<soptions1.options.length; i++){
      if(soptions2.options[i].value == live_cells){ soptions2.options[i].selected = true; }
    }

    // セレクトボックス追加
    var $select_live_cells = window.m4w.Form.create_selectbox(soptions2);
    
    // M4W初期化
    $body.m4w({
      screen_options: screen_options, // 画面用のオプション
      layers: [ layer_options ], // レイヤ用のオプション
      threads: [ th ], // スレッド用のオプション
      assets: { 
        assets: [
          {type: "se", id: "se_umareta", src: ["./lifegame_umareta.mp3", "./lifegame_umareta.ogg"]},
          {type: "se", id: "se_shinda", src: ["./lifegame_shinda.mp3", "./lifegame_shinda.ogg"]},
        ],
        success: function(assets){
          // 各再生用関数の処理を差し替え
          play_umareta = function(){ assets.se.se_umareta.play(); };
          play_shinda = function(){ assets.se.se_shinda.play(); };
        }
      }
    });

    // drawerをレイヤーに追加
    $body.m4w.layer({id: "l01"}).add(dw);

    // セットアップ
    setup(matrix);

    // 画面サイズが変わったときの処理
    $(window).unbind('resize');
    $(window).resize(function(event){
      reset($(window).width(), $(window).height(), live_cells);
    });

    // ループ処理を開始
    $body.m4w.start({
      on_start: function(){
        $body.m4w.thread({id: "t01"}).start(); // スレッド起動
        $body.m4w.layer({id: "l01"}).sprites["d01"].show(); // drawerを表示
      }
    });
  });
})();
