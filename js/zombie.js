var Zombie = OZ.Class().extend(HAF.AnimatedSprite);
/*
Zombie.img = OZ.DOM.elm("img", {src:"zombie-big.png"});
Zombie.size = [128, 128];
*/
Zombie.img = OZ.DOM.elm("img", {src:"zombie.png"});
Zombie.size = [64, 64];

Zombie.prototype.init = function(area) {
	HAF.AnimatedSprite.prototype.init.call(this, Zombie.img, Zombie.size, 20);
	
	var availW = area[0] - Zombie.size[0];
	var availH = area[1] - Zombie.size[1];
	
	this._sprite.position = [Math.round(Zombie.size[0]/2 + Math.random()*availW), Math.round(Zombie.size[1]/2 + Math.random()*availH)];
	this._direction = Math.floor(Math.random()*8);
	this._animation.fps = 6 + 10*Math.random();
}
Zombie.prototype._getSourceImagePosition = function() {
	if (this._animation.frame < 8) {
		return [4 + this._animation.frame, this._direction];
	} else if (this._frame < 16) {
		return [20 + this._animation.frame, this._direction];
	} else {
		return [35, this._direction];
	}
}

var MovingZombie = OZ.Class().extend(HAF.AnimatedSprite);
var tmp = Math.SQRT2/2;
MovingZombie.DIR = [
	[-tmp,	tmp],
	[-1, 	0],
	[-tmp, 	-tmp],
	[0, 	-1],
	[tmp, 	-tmp],
	[1, 	0],
	[tmp,	tmp],
	[0, 	1]
];
MovingZombie.prototype.init = function(area) {
	HAF.AnimatedSprite.prototype.init.call(this, Zombie.img, Zombie.size, 8);
	
	this._area = area;
	this._exactPosition = [Math.random()*area[0], Math.random()*area[1]];
	this._direction = Math.floor(Math.random()*8);

	this._speed = 30 + Math.random()*80; /* pixels per second */
	var dir = MovingZombie.DIR[this._direction];
	this._dir = [this._speed*dir[0], this._speed*dir[1]];
	this._animation.fps = this._speed / 8;
}

MovingZombie.prototype.tick = function(dt) {
	var frameChange = Zombie.prototype.tick.call(this, dt);
	
	this._exactPosition[0] += this._dir[0] * dt / 1000;
	this._exactPosition[1] += this._dir[1] * dt / 1000;
	
	for (var i=0;i<2;i++) {
		if (this._exactPosition[i] > this._area[i]) { this._exactPosition[i] -= this._area[i]; }
		if (this._exactPosition[i] < 0) { this._exactPosition[i] += this._area[i]; }
	}
	
	var x = Math.round(this._exactPosition[0]);
	var y = Math.round(this._exactPosition[1]);
	var positionChange = false;
	if (x != this._sprite.position[0] || y != this._sprite.position[1]) {
		positionChange = true;
		this._sprite.position[0] = x;
		this._sprite.position[1] = y;
	}

	return (frameChange || positionChange);
}
MovingZombie.prototype._getSourceImagePosition = function() {
	return [4 + this._animation.frame, this._direction];
}
