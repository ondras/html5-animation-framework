var Particle = OZ.Class().extend(HAF.Particle);
Particle.prototype.tick = function(dt) {
	var result = HAF.Particle.prototype.tick.call(this, dt);
	if (this._particle.opacity == 0) { this.dispatch("death"); }
	return result;
}
