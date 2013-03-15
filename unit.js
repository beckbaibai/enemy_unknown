// Unit Prototype

/**
* Prototype for a unit
* @constructor
*/
var Unit = function(/*int*/player,/*int*/ team,/*int*/hp,/*int*/ type, /*Coordinate*/startCoord, /*image*/pic, /*image*/cdImage){
	this.player = player; //Starts from 0
	this.team = team; //Starts from 0
	this.hp = hp;
	this.type = type; //0. Wood 1. Water. 2.Earth. 3.Fire 4.Air undefined.Unknown
	this.range = 2;
	this.x = startCoord.X;
	this.y = startCoord.Y;
	this.cooldown = 0;
	this.moved = false;
	this.attacked = false;
	this.image = pic;
	this.cdImage = cdImage;
	this.attacking = false;
	this.damaged = false;
	this.death = null;
	this.lostHP = 0;
	this.losingHP = false;
	this.hpfloat = 0;
	this.terrain = null;
	this.buff = null;
	this.attack = 50;
	this.defense = 1;
}

// server side we export Unit.
if( 'undefined' != typeof global ) {
    module.exports = Unit;
}

Unit.prototype.setcd = function(/*int*/ time){
	this.cooldown = time;
	var self = this;
	var now, before = new Date();
	var cding = window.setInterval(function(){
			now = new Date();
			if(self.cooldown>=0){
				var elapsedTime = now.getTime() - before.getTime();
				if (elapsedTime > 100)  // in case tab is not active in Chrome
					self.cooldown = self.cooldown - Math.round(elapsedTime/100)/10;
				else
					self.cooldown = self.cooldown - 0.1;
			}else{
				self.cooldown = 0;
				window.clearInterval(cding);
			}
			before = new Date();
		} ,100);
}

/**
 * Unit Method: return a Kinetic.Image to be put into the unit group.
 * @this {Unit}
 */
Unit.prototype.draw = function(/*Point*/p, /*int*/height) {
	var unitToDraw;
	if (this.cooldown > 0.2 && this.cdImage) {
		unitToDraw = new Kinetic.Image({
			image: this.cdImage,
			x: Math.floor(p.X - this.image.width/2),
			y: Math.floor(p.Y + height*2/5 - this.image.height),
			width: this.image.width,
			height: this.image.height
		});
		var offset = Math.round((5 - this.cooldown/2)*10);
		unitToDraw.setCrop({x:120*offset, y:0, width:120, height:120});
	} else {
		unitToDraw = new Kinetic.Image({
			image: this.image,
			x: Math.floor(p.X - this.image.width/2),
			y: Math.floor(p.Y + height*2/5 - this.image.height),
			width: this.image.width,
			height: this.image.height
		});
	}
	return unitToDraw;
};

/**
 * Unit Method: return a Kinetic.Group to be put into the hp group.
 * @this {Unit}
 */
Unit.prototype.drawHP = function(/*Point*/p, /*int*/height) {

	var hpToDraw = new Kinetic.Group({listening: false});
	
	hpToDraw.add(new Kinetic.Line({
		points: [Math.floor(p.X - this.image.width/4), Math.floor(p.Y - this.image.height/2 ), Math.floor(p.X + this.image.width/4), Math.floor(p.Y - this.image.height/2 )],
		stroke: "white",
		strokeWidth: 3
	}));
	hpToDraw.add(new Kinetic.Line({
		points: [Math.floor(p.X - this.image.width/4), Math.floor(p.Y - this.image.height/2 ), Math.floor(p.X - this.image.width/4 + this.image.width/2 * this.hp / 100), Math.floor(p.Y - this.image.height/2 )],
		stroke: "red",
		strokeWidth: 3
	}));
	if (this.losingHP) {
		hpToDraw.add(new Kinetic.Text({
			text: "-" + this.lostHP,
			fill: "white",
			fontFamily: "Arial",
			fontSize: 16,
			x: p.X - this.image.width/8,
			y: p.Y - this.hpfloat
		}));
		this.hpfloat += 0.5;
		if(this.hpfloat >= this.image.width/2-20){
			this.losingHP = false;
			this.hpfloat = 0;
		}
	}
	
	return hpToDraw;
};

Unit.prototype.guess = function(/*int*/ guess){
	this.image = gc.sprites[this.player][guess];
}

Unit.prototype.minusHP = function(/*int*/hp){
	this.lostHP = this.hp - hp;
	this.hp = hp;
	var self = this;
	this.losingHP = true;
	this.hpfloat = 0;
}

Unit.prototype.gotHit = function(/*Unit*/enemy){
	//Wood beats water and earth
	//Water beats earth and fire
	//Earth beats fire and air
	//Fire beats air and wood
	//Air beats wood and water
	var damage = enemy.buff?(enemy.attack+enemy.buff.attackBuff):enemy.attack;
	var defense = this.buff?(this.defense*this.buff.defenseBuff):this.defense;
	//Calculate type advantage
    if(enemy.type == 0){
		if(this.type == 4){
			this.hp = 0;
		}else if(enemy.type == this.type){
			this.hp = this.hp - 20;
		}else if(enemy.type<this.type){
			enemy.hp = enemy.hp - 20;
		}
	}else{
		if(enemy.type>this.type){
			this.hp = this.hp - 50;
		}
		else if(enemy.type == this.type){
			this.hp = this.hp - 20;
		}
		else if(enemy.type < this.type){
			enemy.hp = enemy.hp - 20;
		}
	}
	//My advantage
//    if (flag>2){
//    	this.hp = this.hp - Math.floor(damage/2 * defense); 
//		//enemy.hp = enemy.hp - floor(damage/2);
//	}
//	//Enemy advantage
//    else if (flag!=0){
//        this.hp = this.hp - Math.floor(damage * 2 * defense);
//		//enemy.hp = enemy.hp - damage;
//	}
//	//Tie
//    else{
//        this.hp = this.hp - Math.floor(damage * defense);
//		//enemy.hp = enemy.hp - damage;
//	}
	if(this.hp < 0){
		this.hp = 0;
	}
	if(enemy.hp < 0){
		enemy.hp = 0;
	}
};


