var Benchmark = OZ.Class().extend(HAF.Actor);

Benchmark.CIRCLE			= 0;
Benchmark.SQUARE			= 1;
Benchmark.SQUARE_ALIGNED	= 2;
Benchmark.SPRITE			= 3;
Benchmark.USER				= -1;

Benchmark.image = OZ.DOM.elm("img", {src:"zombie.png"});

Benchmark.prototype.init = function(type) {
	this._type = null;
	this._transform = false;
	this._x = null;
	this._y = null;

	var colors = ["red", "green", "blue", "black", "yellow", "cyan", "magenta", "orange"];
	this._color = colors[Math.floor(Math.random()*colors.length)];
	this._frame = 0;
	this.setType(type);
}

Benchmark.prototype.tick = function() {
	this._frame++;
	return true;
}

Benchmark.prototype.setType = function(type) {
	this._type = type;
	this._x = -1;
	return this;
}

Benchmark.prototype.setTransform = function(mode) {
	this._transform = mode;
	return this;
}

Benchmark.prototype.draw = function(context) {
	context.save();
	if (this._transform) { 
		var w = context.canvas.width/2;
		var h = context.canvas.height/2;
		context.translate(w, h);
		context.rotate(45 * Math.PI/180); 
		context.translate(-w, -h);
	}

	switch (this._type) {
		case Benchmark.CIRCLE:
			var w = context.canvas.width;
			var h = context.canvas.height;
			var x = ~~(Math.random()*w);
			var y = ~~(Math.random()*h);

			context.strokeStyle = this._color;
			context.beginPath();
			context.arc(x, y, 10, 0, 2*Math.PI, false);
			context.stroke();
		break;
		
		case Benchmark.SQUARE:
			var w = context.canvas.width;
			var h = context.canvas.height;
			var x = ~~(Math.random()*w);
			var y = ~~(Math.random()*h);

			context.strokeStyle = this._color;
			context.strokeRect(x, y, 20, 20);
		break;

		case Benchmark.SQUARE_ALIGNED:
			var w = context.canvas.width;
			var h = context.canvas.height;
			var x = ~~(Math.random()*w);
			var y = ~~(Math.random()*h);

			context.strokeStyle = this._color;
			context.strokeRect(x-0.5, y-0.5, 20, 20);
		break;

		case Benchmark.SPRITE:
			if (this._x == -1) {
				var w = context.canvas.width;
				var h = context.canvas.height;
				this._x = ~~(Math.random()*w);
				this._y = ~~(Math.random()*h);
			}
			var frame = Math.floor(this._frame / 5) % 8;
			var size = 64;
			context.drawImage(
				this.constructor.image, 
				(4 + frame)*size, 0, size, size, 
				this._x, this._y, size, size
			);
		break;
		
		case Benchmark.USER:
			this._drawUser(context);
		break;
	}
	
	context.restore();

}

Benchmark.prototype._drawUser = function(context) {
}
