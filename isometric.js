

(function(global) {

  var DEBUG = global.DEBUG || global.DEBUG_ISOMETRIC || false;

  var Sprite = global.Sprite = function(id, img, w, h, x, y, cx, cy) {
    this.id = id;
    this.img = img;
    this.w = w || 32;
    this.hw = this.w / 2;
    this.h = h || 16;
    this.hh = this.h / 2;
    this.x = x || 0;
    this.y = y || 0;
    this.cx = cx || this.w/2 + this.x;
    this.cy = cy || this.h/2 + this.y;
  }

  var Isometric = global.Isometric = function(canvas, sw, sh, w, h) {
    if (!canvas) {
      throw new Error('Not enough parameters, missing canvas');
    }
    else if (!sw || !sh) {
      throw new Error('Not enough parameters, missing step width, and step height. Maybe 32x16?');
    }
    else if (!w || !h) {
      throw new Error('Not enough parameters, missing the canvas width and heigth');
    }

    this.canvas = canvas;
    this.ctx2d = canvas.getContext('2d');
    this.sprites = {};
    this.objects = [];
    this.camera = {x:0, y:0};
    this.size = {w: w, h: h};
    this.step = {w: sw, hw: sw/2, h: sh, hh: sh/2};

    this.resize(w, h);
  }

  Isometric.prototype.setCamera = function(cam) {
    this.camera = cam;
  }

  Isometric.prototype.getCamera = function() {
    return this.camera;
  }

  Isometric.prototype.addSprite = function(s) {
    if (!s.dw || !s.dh) {
      s.dw = this.dw;
      s.dh = this.dh
    }
    this.sprites[s.id] = s;
  }

  Isometric.prototype.addObject = function(o) {
    if (o === undefined
      || o.x === undefined
      || o.y === undefined
      || o.sizeX === undefined
      || o.sizeY === undefined
      || o.sprite === undefined) {
      throw new Error('Bad object')
    }
    else if (this.sprites[o.sprite] === undefined) {
      throw new Error('There is no sprite: ' + o.sprite)
    }
    
    this.objects.push(o);
  }

  Isometric.prototype.orderObjects = function() {
    var objs = this.objects,
      len = objs.length;

    for (var i=0; i<len-1; i++) {
      var a = objs[i];
      var b = objs[i+1];

      var ra = this.toScreenRect(a, this.camera, this.size, this.step, this.sprites[a.sprite]);
      var rb = this.toScreenRect(b, this.camera, this.size, this.step, this.sprites[b.sprite]);

      var pa = ra.y + ra.h;
      var pb = rb.y + rb.h;

      if (pa > pb) {
        objs[i] = b;
        objs[i+1] = a;

        if (i>0) i -= 2;
        else i -= 1;
      }
    }
  }

  Isometric.prototype.resize = function(w, h) {
    this.size.w = w;
    this.size.hw = w / 2;
    this.size.h = h;
    this.size.hh = h /2;
    this.ctx2d.canvas.width = w;
    this.ctx2d.canvas.height = h;
  }

  Isometric.prototype.getSize = function() {
    return {
      w: this.size.w,
      hw: this.size.hw,
      h: this.size.h,
      hh: this.size.hh
    }
  }

  Isometric.prototype.draw = function() {
    var ctx2d = this.ctx2d,
      cam = this.camera,
      size = this.size,
      step = this.step,
      spts = this.sprites,
      objs = this.objects,
      len = objs.length;

    ctx2d.clearRect(0, 0, size.w, size.h);

    for (var i=0; i<len; i++) {
      var o = objs[i];
      var s = spts[o.sprite];
      var targ = this.toScreenRect(o, cam, size, step, s);

      ctx2d.drawImage(
        s.img,
        s.x, s.y, s.w, s.h,
        targ.x, targ.y, targ.w, targ.h
      );
    }

    if (DEBUG) {
      ctx2d.beginPath();
      ctx2d.strokeStyle = '#ff0000';
      ctx2d.moveTo(100, 0);
      ctx2d.lineTo(0, 0);
      ctx2d.lineTo(0, 100);
      ctx2d.closePath();
      ctx2d.stroke();

      ctx2d.beginPath();
      ctx2d.strokeStyle = '#ff0000';
      ctx2d.moveTo(size.w, size.h);
      ctx2d.lineTo(size.w - 100, size.h);
      ctx2d.lineTo(size.w, size.h - 100);
      ctx2d.closePath();
      ctx2d.stroke();

      ctx2d.beginPath();
      ctx2d.strokeStyle = '#ff0000';
      ctx2d.moveTo(size.hw, 0);
      ctx2d.lineTo(size.hw, size.h);
      ctx2d.stroke();

      ctx2d.beginPath();
      ctx2d.strokeStyle = '#ff0000';
      ctx2d.moveTo(0, size.hh);
      ctx2d.lineTo(size.w, size.hh);
      ctx2d.stroke();
    }
  }

  Isometric.prototype.toScreenRect = function (o, cam, size, step, sprite) {
    var difxtx = o.x * step.hw;
    var difxty = o.x * step.hh;
    var difytx = o.y * step.hw;
    var difyty = - o.y * step.hh;
    var tx = - cam.x + size.hw + difxtx + difytx - sprite.cx;
    var tw = sprite.w;
    var ty = size.h + cam.y - size.hh + difxty + difyty - sprite.cy;
    var th = sprite.h;
    return {x: tx, y: ty, w: tw, h: th};
  }

  Isometric.prototype.toWorldPoint = function(x, y, cam, size, step) {
    var cx = x + cam.x;
    var cy = y + cam.y;
    var difxtx = cx / step.w;
    var difxty = cx / step.w;
    var difytx = - cy / step.h;
    var difyty = cy / step.h;
    var tx = difxtx + difytx;
    var ty = difxty + difyty;
    return {x: tx, y: ty};
  }

  Isometric.prototype.getWorldObject = function(x, y) {
    var p = this.toWorldPoint(x, y, this.camera, this.size, this.step);

    var wx = Math.round(p.x),
      wy = Math.round(p.y);

    var objs = this.objects,
      len = objs.length;

    var lastFinded = null;

    for (var i=0; i<len; i++) {
      var o = objs[i];
      if (o.x >= wx && o.y >= wy) {
        if (o.x + o.sizeX - 1 <= wx && o.y + o.sizeY - 1 <= wy) {
          lastFinded = {x: o.x, y: o.y, sprite: o.sprite};
        }
      }
    }

    return lastFinded;
  }

})(window.thc || (window.thc = {}))