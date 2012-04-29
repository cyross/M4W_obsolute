/*
 * M4W de ライフゲーム
 * 2012 Cyross Makoto
 */

(function(){
  // 最初に生きさせる格子の数
  var live_cells = 200;

  // 格子ひとつのピクセル数
  var matrix_width = 16;
  var matrix_height = 16;

  // 更新ウェイト数
  var wait = 10;

  // 実行・停止切り替え
  var is_exec = true;

  // セルオブジェクト
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

  // 画面・レイヤーのオプション群(基本)
  var base = {
    left: 0,
    top: 0,
    width: 640,
    height: 480
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

  $(document).ready(function(){
    var $body = $("body");
    var screen_options = $.extend({id: "s01", body: $body}, base);
    var layer_options = $.extend({id: "l01", z: 1,  body: $body}, base);
    // 再生用関数
    var play_umareta = function(){};
    var play_shinda = function(){};

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

    
    // ラベル追加
    var $label1 = window.m4w.Form.create_label({
      id: "lb01",
      left: 0,
      top: 480,
      text: "画面上のセルをクリックすると、そのセルの生死が反転します。"
    });
    var $label2 = window.m4w.Form.create_label({
      id: "lb02",
      left: 640,
      top: 48,
      text: "ウェイト:&nbsp;"
    });

    // 更新を停止・再開するボタンを作成
    var boptions = {
      id: "b01",
      left: 640,
      top: 0,
      name: "toggle",
      value: "停止／再開",
      events: {click: function(event){
        var body = $body.m4w.thread({id: "t01"}).body;
        body.is_exec = !body.is_exec;
      }}
    }

    // ボタン追加
    var $chg_button = window.m4w.Form.create_button(boptions);

    // ウェイトを変更するセレクトボックスを作成
    var soptions = {
      id: "s01",
      body: $label2, // 「ウェイト」ラベルの中に組み込む
      left: 64,
      top: 0,
      options: [{value: 0}, {value: 1}, {value: 2}, {value: 3}, {value: 5}, {value: 8}, {value: 10}],
      events: {change: function(event){
        $body.m4w.thread({id: "t01"}).body.wait = parseInt($(this).val());
      }}
    }
    // ウェイトの初期値をselectedにする
    for(var i=0; i<soptions.options.length; i++){
      if(soptions.options[i].value == wait){ soptions.options[i].selected = true; }
    }

    // セレクトボックス追加
    var $select_wait = window.m4w.Form.create_selectbox(soptions);
    
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

    // ループ処理を開始
    $body.m4w.start({
      on_start: function(){
        $body.m4w.thread({id: "t01"}).start(); // スレッド起動
        $body.m4w.layer({id: "l01"}).sprites["d01"].show(); // drawerを表示
      }
    });
  });
})();
