// server side we import Point and Coordinate.
if( 'undefined' != typeof global ) {
    var helper = require("./helper.js");
	var Point = helper.Point;
	var Coordinate = helper.Coordinate;
	var CONSTANTS = helper.CONSTANTS;
}

var Terrain = function(/*int*/attackBuff,/*int*/ defenseBuff,/*int*/rangeBuff,/*boolean*/ moveable, /*string*/objectiveType, 
	/*int*/ objectiveTime,/*int*/ resource,/*double*/ gatheringSpeed,/*image*/image){
	this.buff = new Buff(attackBuff,defenseBuff,rangeBuff);
	this.moveable = moveable;
	this.objectiveType = objectiveType;
	this.objectiveTime = objectiveTime;
	this.resource = resource;
	this.gatheringSpeed = gatheringSpeed;
	this.image = image;
	this.captured = false;
	this.countdown = null;
    this.interval = -1;
}

var Buff = function(/*int*/attackBuff,/*int*/ defenseBuff,/*int*/rangeBuff){
	this.attackBuff = attackBuff; 
	this.defenseBuff = defenseBuff;
	this.rangeBuff = rangeBuff;
}

/**
 * Terrain Method: return a Kinetic.Image to be put into the terrain group.
 * If oldTerrain is provided, update on oldTerrain.
 * @this {Terrain}
 */
Terrain.prototype.draw = function(/*Point*/p, /*int*/height, /*Kinetic.Image*/oldTerrain) {
	if (this.image) {
		if (oldTerrain) {
			oldTerrain.setX(Math.floor(p.X - this.image.width/2));
			oldTerrain.setY(Math.floor(p.Y + height/2 - this.image.height));
			return oldTerrain;
		} else {
			var terrainToDraw = new Kinetic.Image({
				image: this.image,
				x: Math.floor(p.X - this.image.width/2),
				y: Math.floor(p.Y + height/2 - this.image.height)
			});
			return terrainToDraw;
		}
	}
};

//Build terrains.

CONSTANTS.thronTerrain = new Terrain(0,0,0,false,null,0,0,0,null);
CONSTANTS.flagTerrain = new Terrain(0,1,0,true,'flag',CONSTANTS.countdown,0,0,null);
CONSTANTS.resourceTerrain = new Terrain(0,0,0,true,'resource',0,1,2,null);