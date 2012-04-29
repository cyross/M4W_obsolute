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
    update: function(){
      var mx = this.matrix;
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
          //if(Math.random() > 0.5){ m[x].state = "dead"; }
          //else{ m[x].state = "live"; }
        }
      }
    }
  };
  
  $(document).ready(function(){
    var $body = $("body");
    var screen_options = $.extend({id: "s01", body: $body}, base);
    var layer_options = $.extend({id: "l01", z: 1,  body: $body}, base);
    $body.m4w({
      screen_options: screen_options,
      layers: [ layer_options ],
      threads: [ th ]
    });

    $body.m4w.layer({id: "l01"}).add(dw);

    setup(matrix);

    $body.m4w.start({
      on_start: function(){
        $body.m4w.thread({id: "t01"}).start();
        $body.m4w.layer({id: "l01"}).sprites["d01"].show();
      }
    });
  });
})();
