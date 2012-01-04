if (!Date.now) {
	Date.now = function() { return +(new Date); }
}

var HAF = {};

HAF.MODE_DIRECT			= 0;
HAF.MODE_OFFSCREEN		= 1;
HAF.MODE_DOUBLEBUFFER	= 2;

/**
 * @class Base animation director
 */
HAF.Engine = OZ.Class();
HAF.Engine.prototype.init = function(size) {
	this._size = size;

	this._running = false;
	this._container = OZ.DOM.elm("div", {position:"relative", width:this._size[0]+"px", height:this._size[1]+"px"});
	this._canvases = {};
	this._tick = this._tick.bind(this);
	this._mode = HAF.MODE_DIRECT;

	var prefixes = ["", "moz", "webkit", "ms"];
	var ok = false;
	for (var i=0;i<prefixes.length;i++) {
		var name = prefixes[i] + (prefixes[i] ? "R" : "r") + "equestAnimationFrame";
		if (name in window) {
			this._schedule = window[name];
			ok = true;
			break;
		}
	}
	if (!ok) { 
		this._schedule = function(cb) {
			setTimeout(cb, 1000/60); /* 60 fps */
		}
	}
}

HAF.Engine.prototype.isRunning = function() {
	return this._running;
}

HAF.Engine.prototype.setMode = function(mode) {
	this._mode = mode;
	return this;
}

HAF.Engine.prototype.getContainer = function() {
	return this._container;
}

HAF.Engine.prototype.addCanvas = function(id) {
	var canvas = OZ.DOM.elm("canvas", {position:"absolute"});
	canvas.width = this._size[0];
	canvas.height = this._size[1];
	var second = canvas.cloneNode(false);
	var obj = {
		canvas: canvas,
		ctx: canvas.getContext("2d"),
		second: second,
		secondCtx: second.getContext("2d"),
		id: id,
		dirty: false,
		actors: []
	}
	this._canvases[id] = obj;
	this._container.appendChild(canvas);
}

HAF.Engine.prototype.addActor = function(actor, canvasId) {
	var obj = this._canvases[canvasId];
	obj.actors.push(actor); 
	obj.dirty = true;
}

HAF.Engine.prototype.removeActor = function(actor, canvasId) {
	var obj = this._canvases[canvasId];
	var index = obj.actors.indexOf(actor);
	if (index != -1) { obj.actors.splice(index, 1); }
	obj.dirty = true;
}

HAF.Engine.prototype.removeActors = function(canvasId) {
	var obj = this._canvases[canvasId];
	obj.actors = [];
	obj.dirty = true;
}

HAF.Engine.prototype.start = function() {
	this._running = true;
	this.dispatch("start");
	this._ts = Date.now();
	this._tick();
}

HAF.Engine.prototype.stop = function() {
	this._running = false;
	this.dispatch("stop");
}

HAF.Engine.prototype._tick = function() {
	if (!this._running) { return; }
	
	this._schedule.call(window, this._tick); /* schedule next tick */
	var ts1 = Date.now();
	var dt = ts1 - this._ts;
	this._ts = ts1;
	
	for (var id in this._canvases) { /* for all canvases */
		var obj = this._canvases[id];
		var changed = false;
		var actors = obj.actors;
		var i = actors.length;
		while (i--) { /* tick all actors, remember if any actor changed */
			changed = actors[i].tick(dt) || changed;
		}
		
		if (!changed && !obj.dirty) { continue; }
		
		/* at least one actor changed; redraw canvas */
		
		switch (this._mode) {
			case HAF.MODE_DIRECT:
				obj.canvas.width = obj.canvas.width; /* clear canvas */
				i = actors.length; 
				while (i--) { actors[i].draw(obj.ctx); }
			break;
			
			case HAF.MODE_OFFSCREEN:
				obj.canvas.width = obj.canvas.width; /* clear canvas */
				i = actors.length; 
				var canvas = obj.canvas;
				var next = canvas.nextSibling;
				var parent = canvas.parentNode;
				parent.removeChild(canvas);
				while (i--) { actors[i].draw(obj.ctx); }
				parent.insertBefore(canvas, next);
			break;

			case HAF.MODE_DOUBLEBUFFER:
				obj.second.width = obj.second.width; /* clear canvas */
				i = actors.length; 
				while (i--) { actors[i].draw(obj.secondCtx); }
				obj.canvas.parentNode.replaceChild(obj.second, obj.canvas);
				
				var tmp = obj.canvas;
				obj.canvas = obj.second;
				obj.second = tmp;
				
				tmp = obj.ctx;
				obj.ctx = obj.secondCtx;
				obj.secondCtx = tmp;
			break;
		}
		
	}
	
	var ts2 = Date.now();
	this.dispatch("frame", {time:ts2-ts1});
}

/**
 * @class FPS measurement & display
 */
HAF.FPS = OZ.Class();
HAF.FPS.prototype.init = function(engine) {
	this._interval = null;
	this._intervalLength = 500;
	this._avgFrames = 10;
	
	this._frames = null; /* absolute frames */

	this._potFrames = null; /* 0..this._avgFrames */
	this._potTime = null; /* time spent in local frames */

	this._curTick = null; /* for current timer */
	this._curFrames = null; /* current frames */
	
	this._dom = {
		container: OZ.DOM.elm("div", {whiteSpace:"pre", fontFamily:"monospace"}),
		frames: OZ.DOM.elm("span"),
		pot: OZ.DOM.elm("span"),
		cur: OZ.DOM.elm("span")
	}
	
	OZ.DOM.append([
		this._dom.container,
		this._dom.frames,
		OZ.DOM.text(" frames • Potential FPS "),
		this._dom.pot,
		OZ.DOM.text(" (" + this._avgFrames + " frame average) • Current FPS "),
		this._dom.cur,
		OZ.DOM.text(" (" + this._intervalLength + "ms average)"),
	]);
	
	OZ.Event.add(engine, "start", this._start.bind(this));
	OZ.Event.add(engine, "stop", this._stop.bind(this));
	OZ.Event.add(engine, "frame", this._frame.bind(this));
}

HAF.FPS.prototype.getContainer = function() {
	return this._dom.container;
}

HAF.FPS.prototype._start = function(e) {
	this._frames = 0; /* frames encountered so far */

	this._potTime = 0;
	this._potFrames = 0;
	
	this._curTick = Date.now();
	this._curFrames = 0;
	
	this._interval = setInterval(this._tick.bind(this), this._intervalLength);
}

HAF.FPS.prototype._stop = function(e) {
	clearInterval(this._interval);
	this._interval = null;
}

HAF.FPS.prototype._frame = function(e) {
	var time = e.data.time;
	this._frames++;
	this._curFrames++;
	this._dom.frames.innerHTML = this._pad(this._frames + "", 7);

	this._potTime += time;
	this._potFrames++;
	if (this._potFrames == this._avgFrames) {
		this._dom.pot.innerHTML = this._pad((1000*this._avgFrames/this._potTime).toFixed(2), 7);
		this._potFrames = 0;
		this._potTime = 0;
	}
	
}

HAF.FPS.prototype._pad = function(str, len) {
	while (str.length < len) { str = " " + str; }
	return str;
}

HAF.FPS.prototype._tick = function() {
	var ts = Date.now();
	var dt = ts - this._curTick;
	this._dom.cur.innerHTML = this._pad((1000*this._curFrames/dt).toFixed(2), 7);
	
	this._curTick = ts;
	this._curFrames = 0;
}

HAF.Monitor = OZ.Class();
HAF.Monitor.prototype.init = function(engine, size) {
	this._size = size;
	this._canvas = OZ.DOM.elm("canvas", {className:"monitor"});
	this._ctx = this._canvas.getContext("2d");
	this._data = [];
	
	OZ.Event.add(engine, "start", this._start.bind(this));
	OZ.Event.add(engine, "frame", this._frame.bind(this));
}

HAF.Monitor.prototype.getContainer = function() {
	return this._canvas;
}

HAF.Monitor.prototype._start = function(e) {
	this._canvas.width = this._size[0];
	this._canvas.height = this._size[1];
	this._data = [];
}

HAF.Monitor.prototype._frame = function(e) {
	this._data.push(e.data.time);
	if (this._data.length > this._size[0]) { this._data.shift(); }
	this._canvas.width = this._canvas.width;
	
	this._ctx.beginPath();
	var i = this._data.length;
	var w = this._size[0]-1;
	var h = this._size[1]-1;
	
	this._ctx.moveTo(w, h);
	while (i--) {
		this._ctx.lineTo(w--, h-this._data[i]);
	}
	
	this._ctx.stroke();
}

/**
 * Abstract actor
 */
HAF.Actor = OZ.Class();
HAF.Actor.prototype.tick = function(dt) { return false; }
HAF.Actor.prototype.draw = function(context) { }

/**
 * Image sprite actor
 */
HAF.Sprite = OZ.Class().extend(HAF.Actor);
HAF.Sprite.prototype.init = function(image, size) {
	this._size = size;
	this._position = [0, 0];
	this._image = image;
}
HAF.Sprite.prototype.draw = function(context) {
	var position = this._getSourceImagePosition();
	position[0] *= this._size[0];
	position[1] *= this._size[1];

	context.drawImage(
		this._image, 
		position[0], position[1], this._size[0], this._size[1], 
		this._position[0]-this._size[0]/2, this._position[1]-this._size[1]/2, this._size[0], this._size[1]
	);
}
HAF.Sprite.prototype._getSourceImagePosition = function() {
	return [0, 0];
}

/**
 * Animated image sprite, consists of several frames
 */
HAF.AnimatedSprite = OZ.Class().extend(HAF.Sprite);
HAF.AnimatedSprite.prototype.init = function(image, size, frames) {
	HAF.Sprite.prototype.init.call(this, image, size);
	this._frames = frames;
	this._frame = -1;
	this._fps = 10;
	this._time = 0;
	
}
HAF.AnimatedSprite.prototype.tick = function(dt) {
	this._time += dt;
	var oldFrame = this._frame;
	this._frame = Math.floor(this._time * this._fps / 1000) % this._frames;
	return (oldFrame != this._frame);
}
