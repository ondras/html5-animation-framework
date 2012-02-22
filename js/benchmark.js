var Benchmark = OZ.Class().extend(HAF.Actor);

Benchmark.CIRCLE			= 0;
Benchmark.SQUARE			= 1;
Benchmark.SQUARE_ALIGNED	= 2;
Benchmark.SPRITE			= 3;
Benchmark.CANVAS			= 4;

Benchmark.image = OZ.DOM.elm("img", {src:"zombie.png"});
Benchmark.canvas = OZ.DOM.elm("canvas", {width:64, height:64});
OZ.Event.add(Benchmark.image, "load", function(e) {
	var context = Benchmark.canvas.getContext("2d");
	context.drawImage(
		Benchmark.image,
		64*4, 0, 64, 64,
		0, 0, 64, 64
	);
});

Benchmark.prototype.init = function(type) {
	this._type = null;
	this._position = null;
	this._size = [64, 64];
	

	var colors = ["red", "green", "blue", "black", "yellow", "cyan", "magenta", "orange"];
	this._color = colors[Math.floor(Math.random()*colors.length)];
	this._frame = 0;
	this.setType(type);
}

Benchmark.prototype.tick = function() {
	this._frame++;
	return true;
}

Benchmark.prototype.getBox = function() {
	return [
		[this._position[0], this._position[1]],
		this._size
	];
}

Benchmark.prototype.setType = function(type) {
	this._type = type;
	this._position = null;
	return this;
}

Benchmark.prototype.draw = function(context) {
	if (!this._position || this._type != Benchmark.SPRITE) {
		this._position = [
			~~(Math.random()*context.canvas.width),
			~~(Math.random()*context.canvas.height)
		];
	}

	switch (this._type) {
		case Benchmark.CIRCLE:
			context.strokeStyle = this._color;
			context.beginPath();
			context.arc(this._position[0] + this._size[0]/2, this._position[1] + this._size[1]/2, 10, 0, 2*Math.PI, false);
			context.stroke();
		break;
		
		case Benchmark.SQUARE:
			context.strokeStyle = this._color;
			context.strokeRect(this._position[0] + this._size[0]/2 - 10, this._position[1] + this._size[1]/2 - 10, 20, 20);
		break;

		case Benchmark.SQUARE_ALIGNED:
			context.strokeStyle = this._color;
			context.strokeRect(this._position[0] + this._size[0]/2 - 10.5, this._position[1] + this._size[1]/2 - 10.5, 20, 20);
		break;

		case Benchmark.SPRITE:
			var frame = Math.floor(this._frame / 5) % 8;
			context.drawImage(
				this.constructor.image, 
				(4 + frame)*this._size[0], 0, this._size[0], this._size[1], 
				this._position[0], this._position[1], this._size[0], this._size[1]
			);
		break;
		
		case Benchmark.CANVAS:
			context.drawImage(
				this.constructor.canvas, 
				this._position[0], this._position[1]
			);
		break;
	}
}
