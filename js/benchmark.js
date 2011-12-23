var Benchmark = OZ.Class().extend(HAF.Actor);

Benchmark.prototype.init = function(complexity) {
	this._complexity = complexity || 1;
	var colors = ["red", "green", "blue", "black", "yellow", "cyan", "magenta", "orange"];
	this._color = colors[Math.floor(Math.random()*colors.length)];
}

Benchmark.prototype.tick = function() {
	return true;
}

Benchmark.prototype.draw = function(context) {
	var w = context.canvas.width;
	var h = context.canvas.height;
	context.strokeStyle = this._color;

	for (var i=0;i<this._complexity;i++) {
		var x = ~~(Math.random()*w);
		var y = ~~(Math.random()*h);
		context.beginPath();
		context.arc(x, y, 10, 0, 2*Math.PI, false);
		context.stroke();
	}
}
