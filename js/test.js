Benchmark.prototype._drawUser = function(context) {
	if (this._x == -1) {
		var w = context.canvas.width-100;
		var h = context.canvas.height-100;
		this._x = ~~(Math.random()*w);
		this._y = ~~(Math.random()*h);
	}
	
	var x1 = this._x;
	var y1 = this._y;
	var x2 = x1 + 100;
	var y2 = y1 + 60;
	
	context.lineCap = "round";
//	context.globalCompositeOperation = "lighter";
	
	var c1 = [255, 0, 0];
	var c2 = [255, 255, 255];
	var count = 5;
	
	for (var i=0;i<count;i++) {
		var c = [];
		for (var j=0;j<3;j++) {
			c.push(c1[j] + Math.round((c2[j]-c1[j])*i/(count-1)));
		}

		context.beginPath();
		context.moveTo(x1, y1);
		context.lineTo(x2, y2);
		context.strokeStyle = "rgb(" + c.join(",") + ")";
		context.lineWidth = (count-i)*3;
		
		if (i) {
			context.stroke();
		} else {
			context.save();
			context.shadowColor = "red";
			context.shadowBlur = 5;
			context.stroke();
			context.restore();
		}
	}
	
}
