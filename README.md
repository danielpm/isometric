isometric
=========

A Isometric View Engine


## Find your Isometric!

Normally at window.Isometric

## Draw something!

To draw is as simples as that:

    Isometric.draw(listOfDrawable, camera, canvas, context, spriteSize);

where:

    //listOfDrawable is a lista of drawable :)
    var listOfDrawable = [].push(new Isometric.Drawable());

    //camera is the center of the screen something like:
    var camera = {x: 10, y: 10};

    //canvas is the canvas itself:
    var canvas = window.getElementById('canvas');

    //context is the 2d context from canvas:
    var context = canvas.getContext('2d');

    //spriteSize is the size of each sprite on the screen,
    //to give the fake 3d, use a height smaller then the width
    var spriteSize = {w: 32, h: 16};


## List of Drawable

To draw anything create a list of drawable, there is a simple object to do this inside window.Isometric, take a look!

    window.Isometric.Drawable = function () {
        this._image = null;
        this._imageRect = {xp: 32, yp: 0, h: 32, w: 32};
        this._position = {x: 0, y: 0, z: 0};

        this.getImage = function() {
            return this._image;
        };
        this.getImageRect = function () {
            return this._imageSize;
        }
        this.getPosition = function() {
            return this._position;
        };
    }


## Order your objects

To start drawing, you will need to order your drawables. To do this use the:

    var listOfDrawable = [].push(new Isometric.Drawable());
    window.Isometric.order(listOfDrawables);

Be advised that if you didnt do this, will rise an exception and the engine will call this method for you, reordering YOUR objects :)


