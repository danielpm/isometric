

(function (holder) {
    "use strict";

    console.log('Isometric!');

    var Isometric = holder.Isometric = {};

    Isometric.Drawable = function () {
        this._image = null;
        this._imageSize = {xp: 32, yp: 0, h: 32, w: 32};
        this._position = {x: 0, y: 0, z: 0};

        this.getImage = function() {
            return this._image;
        };
        this.getImageSize = function () {
            return this._imageSize;
        }
        this.getPosition = function() {
            return this._position;
        };
    }

    Isometric.Camera = function () {
        this.getPosition = function () {
            return {x: 320, y: 240, z: 0};
        }
    }

    Isometric.orderValue = function (o) {
        var p = o.getPosition();
        return p.y-p.x;
    }

    Isometric.order = function (objects) {
        objects = objects.sort(function (a,b) {
            return Isometric.orderValue(b) - Isometric.orderValue(a);
        });
        return objects;
    }

    Isometric.draw = function (objects, camera, canvas, context, spriteSize) {

        var objects = objects;
        var camera = camera;
        var canvas = canvas
        var context = context || canvas.getContext('2d');
        var spriteX = spriteSize.x;
        var spriteY = spriteSize.y; //normally half of the 'x'

        camera.hx = canvas.width / 2;
        camera.hy = canvas.height / 2;

        var incx = spriteX/2;
        var incy = spriteY/2;

        if (!objects)
            throw 'Out of objects to draw!';
        if (!camera)
            throw 'Cant see without a camera!';
        if (!canvas)
            throw 'Cant do anything without a canvas!'

        var lastOrderValue = undefined;

        context.clearRect(0, 0, canvas.width, canvas.height);

        for ( var i=0, len=objects.length; i<len; i++ ) {
            var o = objects[i];
            var imgSize = o.getImageSize();
            var position = o.getPosition();

            var dx = incx*position.x;
            var dy = - incy*position.y;

            dx += position.y*incx;
            dy += position.x*incy

            dx += camera.hx;
            dy += camera.hy;

            dx += - incx;
            dy += - incy - incy;

            var thisOrderValue = Isometric.orderValue(o);

            if ( lastOrderValue != undefined && thisOrderValue > lastOrderValue ) {
                Isometric.order(objects);
                throw 'Objects are not ordered to draw! We ordered they  for you ;D'
            }

            lastOrderValue = thisOrderValue;

            context.drawImage(o.getImage(), imgSize.xp, imgSize.yp, imgSize.w, imgSize.h,
                dx, dy, imgSize.w, imgSize.h);
        }
    }
})(window);