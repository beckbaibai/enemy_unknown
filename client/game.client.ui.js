/**
 * Client UI functions
 */
 
/**
 * Constants.
 */
CONSTANTS.hexSideLength = 60;
CONSTANTS.hexRatio = 2.0;
CONSTANTS.mapScrollSpeed = 15;
CONSTANTS.minimapWidth = 200;
 
/**
 * Setup stage and layers.
 */
var stage = new Kinetic.Stage({
    container: 'container',
    id: 'gameCanvas',
    width: CONSTANTS.width,
    height: CONSTANTS.height
});
var mapLayer = new Kinetic.Layer(); // layer for background image, hexgrid, and units
var UILayer = new Kinetic.Layer(); // layer for UI elements, such as minimap, buttons, and unit info
var msgLayer = new Kinetic.Layer({listening: false}); // layer for messages, such as start and end message

/**
 * The GameClientUI class.
 */
var GameClientUI = function(/*gameClient*/ gc, /*string*/ scenario) {
    this.gc = gc;
    this.scenario = scenario;
    
    // Initialize platform-dependent UI
    this.platformUI;
    if (/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent))
        this.platformUI = new gcUIIOS(gc, this);
    else
        this.platformUI = new gcUIBrowser(gc, this);
        
    // Stores camera and minimap
    this.camera = null;
    this.minimap = null;
    
    // Teams: 0:red, 1:blue, 2:yellow, 3:green
    // Standalone images
    this.background = null;
    this.heartImg = null;
    this.resourceImg = null;
    this.flagImg = null;
    this.thronImg = null;
    this.whokillswhoImg = null;
    this.fogImg = null;
    this.buttonbarImg = null;
    // Container for all unit images
    this.sprites = [[], [], [], []];
    // Container for all unit cooldown images
    this.cooldown = [[], [], [], []];
    // Get hit images
    this.getHitImgs = {small: [[], [], [], []], big: [[], [], [], []]};
    // Button images
    this.buttonImgs = {lit: {}, unlit: {}};
    this.buttons = {};
    // Flag images
    this.flagImgs = [];
    this.flags = [];
    // Topbar images
    this.topbarImgs = [];
    this.topbar = null;
    // Build unit images
    this.buildUnitImgs = {frame: null, unavailable: [], lit: [], unlit: []};
    this.buildUnitButtons = [];
    
    // TODO: What's the meaning of these variables?
    this.markUnitGroup = null;
    this.hasLoaded = false;
    this.buildUnitMenu = false;
    this.whichUnitToBuild = null;
}

/**
 * Function to load all sprite images.
 */
GameClientUI.prototype.loadImage = function() {
    this.hasLoaded = false;
    var filesLoaded = 0;
    
    var loadImage = function(url) {
        var img = new Image();
        img.onload = incrementCounter;
        img.src = url;
        return img;
    };
    
    var incrementCounter = function() {
        filesLoaded++;
        if (filesLoaded >= 90) {
            this.hasLoaded = true;
        }
    }
    
    // Load standalone images.
    this.background = loadImage("sprites\\bg_grey.jpg");
    this.heartImg = loadImage("sprites\\heart.png");
    this.resourceImg = loadImage("sprites\\resource.png");
    this.flagImg = loadImage("sprites\\tile-flag.png");
    this.thronImg = loadImage("sprites\\thron.png");
    this.whokillswhoImg = loadImage("sprites\\whokillswho2.png");
    this.fogImg = loadImage("sprites\\fog.png");
    this.buttonbarImg = loadImage("sprites\\buttonbar.png");

    // Load character sprites.
    this.sprites[0][0] = loadImage("sprites\\vampire6_red.png");
    this.sprites[0][1] = loadImage("sprites\\wolf6_red.png");
    this.sprites[0][2] = loadImage("sprites\\hunter6_red.png");
    this.sprites[0][3] = loadImage("sprites\\zombie6_red.png");
    this.sprites[0][4] = loadImage("sprites\\wizard6_red.png");
    this.sprites[0][5] = loadImage("sprites\\unknown6_red.png");
    
    this.sprites[1][0] = loadImage("sprites\\vampire6_blue.png");
    this.sprites[1][1] = loadImage("sprites\\wolf6_blue.png");
    this.sprites[1][2] = loadImage("sprites\\hunter6_blue.png");
    this.sprites[1][3] = loadImage("sprites\\zombie6_blue.png");
    this.sprites[1][4] = loadImage("sprites\\wizard6_blue.png");
    this.sprites[1][5] = loadImage("sprites\\unknown6_blue.png");

    // Load cooldown spritesheets.
    this.cooldown[0][0] = loadImage("sprites\\vampire9_red_cd.png");
    this.cooldown[0][1] = loadImage("sprites\\wolf9_red_cd.png");
    this.cooldown[0][2] = loadImage("sprites\\hunter9_red_cd.png");
    this.cooldown[0][3] = loadImage("sprites\\zombie9_red_cd.png");
    this.cooldown[0][4] = loadImage("sprites\\wizard9_red_cd.png");
    this.cooldown[0][5] = loadImage("sprites\\unknown9_red_cd.png");
    
    this.cooldown[1][0] = loadImage("sprites\\vampire9_blue_cd.png");
    this.cooldown[1][1] = loadImage("sprites\\wolf9_blue_cd.png");
    this.cooldown[1][2] = loadImage("sprites\\hunter9_blue_cd.png");
    this.cooldown[1][3] = loadImage("sprites\\zombie9_blue_cd.png");
    this.cooldown[1][4] = loadImage("sprites\\wizard9_blue_cd.png");
    this.cooldown[1][5] = loadImage("sprites\\unknown9_blue_cd.png");

    // Load team specific UI images.
    this.flagImgs[0] = loadImage("sprites\\redflag.png");
    this.flagImgs[1] = loadImage("sprites\\blueflag.png");
    this.topbarImgs[0] = loadImage("sprites\\topbar1.png");
    this.topbarImgs[1] = loadImage("sprites\\topbar2.png");
    
    // Load button images.
    this.buttonImgs.unlit.build = loadImage("sprites\\hammerunlit.png");
    this.buttonImgs.lit.build = loadImage("sprites\\hammerlit.png");
    this.buttonImgs.unlit.menu = loadImage("sprites\\menuunlit.png");
    this.buttonImgs.lit.menu = loadImage("sprites\\menulit.png");
    this.buttonImgs.unlit.mute = loadImage("sprites\\muteunlit.png");
    this.buttonImgs.lit.mute = loadImage("sprites\\mutelit.png");
    this.buttonImgs.unlit.sound = loadImage("sprites\\soundunlit.png");
    this.buttonImgs.lit.sound = loadImage("sprites\\soundlit.png");
    
    // Load build unit button images.
    this.buildUnitImgs.frame = loadImage("sprites\\build\\buildframe.png");
    this.buildUnitImgs.unavailable[0] = loadImage("sprites\\build\\vampire_grey.png");
    this.buildUnitImgs.unlit[0] = loadImage("sprites\\build\\vampire_black.png");
    this.buildUnitImgs.lit[0] = loadImage("sprites\\build\\vampire_green.png");
    this.buildUnitImgs.unavailable[1] = loadImage("sprites\\build\\wolf_grey.png");
    this.buildUnitImgs.unlit[1] = loadImage("sprites\\build\\wolf_black.png");
    this.buildUnitImgs.lit[1] = loadImage("sprites\\build\\wolf_green.png");
    this.buildUnitImgs.unavailable[2] = loadImage("sprites\\build\\hunter_grey.png");
    this.buildUnitImgs.unlit[2] = loadImage("sprites\\build\\hunter_black.png");
    this.buildUnitImgs.lit[2] = loadImage("sprites\\build\\hunter_green.png");
    this.buildUnitImgs.unavailable[3] = loadImage("sprites\\build\\zombie_grey.png");
    this.buildUnitImgs.unlit[3] = loadImage("sprites\\build\\zombie_black.png");
    this.buildUnitImgs.lit[3] = loadImage("sprites\\build\\zombie_green.png");
    this.buildUnitImgs.unavailable[4] = loadImage("sprites\\build\\wizard_grey.png");
    this.buildUnitImgs.unlit[4] = loadImage("sprites\\build\\wizard_black.png");
    this.buildUnitImgs.lit[4] = loadImage("sprites\\build\\wizard_green.png");
    
    // Load guess unit button images.
    this.markUnitImgs.unlit[0] = loadImage("sprites\\mark\\vampire_unlit.png");
    this.markUnitImgs.lit[0] = loadImage("sprites\\mark\\vampire_lit.png");
    this.markUnitImgs.unlit[1] = loadImage("sprites\\mark\\wolf_unlit.png");
    this.markUnitImgs.lit[1] = loadImage("sprites\\mark\\wolf_lit.png");
    this.markUnitImgs.unlit[2] = loadImage("sprites\\mark\\hunter_unlit.png");
    this.markUnitImgs.lit[2] = loadImage("sprites\\mark\\hunter_lit.png");
    this.markUnitImgs.unlit[3] = loadImage("sprites\\mark\\zombie_unlit.png");
    this.markUnitImgs.lit[3] = loadImage("sprites\\mark\\zombie_lit.png");
    this.markUnitImgs.unlit[4] = loadImage("sprites\\mark\\wizard_unlit.png");
    this.markUnitImgs.lit[4] = loadImage("sprites\\mark\\wizard_lit.png");
    
    // Load got hit images.
    this.getHitImgs.small[0][0] = loadImage("sprites\\gethit\\vampire_red_small_hit.png");
    this.getHitImgs.small[0][1] = loadImage("sprites\\gethit\\wolf_red_small_hit.png");
    this.getHitImgs.small[0][2] = loadImage("sprites\\gethit\\hunter_red_small_hit.png");
    this.getHitImgs.small[0][3] = loadImage("sprites\\gethit\\zombie_red_small_hit.png");
    this.getHitImgs.small[0][4] = loadImage("sprites\\gethit\\wizard_red_small_hit.png");
    this.getHitImgs.small[1][0] = loadImage("sprites\\gethit\\vampire_blue_small_hit.png");
    this.getHitImgs.small[1][1] = loadImage("sprites\\gethit\\wolf_blue_small_hit.png");
    this.getHitImgs.small[1][2] = loadImage("sprites\\gethit\\hunter_blue_small_hit.png");
    this.getHitImgs.small[1][3] = loadImage("sprites\\gethit\\zombie_blue_small_hit.png");
    this.getHitImgs.small[1][4] = loadImage("sprites\\gethit\\wizard_blue_small_hit.png");
    
    this.getHitImgs.big[0][0] = loadImage("sprites\\gethit\\vampire_red_big_hit.png");
    this.getHitImgs.big[0][1] = loadImage("sprites\\gethit\\wolf_red_big_hit.png");
    this.getHitImgs.big[0][2] = loadImage("sprites\\gethit\\hunter_red_big_hit.png");
    this.getHitImgs.big[0][3] = loadImage("sprites\\gethit\\zombie_red_big_hit.png");
    this.getHitImgs.big[0][4] = loadImage("sprites\\gethit\\wizard_red_big_hit.png");
    this.getHitImgs.big[1][0] = loadImage("sprites\\gethit\\vampire_blue_big_hit.png");
    this.getHitImgs.big[1][1] = loadImage("sprites\\gethit\\wolf_blue_big_hit.png");
    this.getHitImgs.big[1][2] = loadImage("sprites\\gethit\\hunter_blue_big_hit.png");
    this.getHitImgs.big[1][3] = loadImage("sprites\\gethit\\zombie_blue_big_hit.png");
    this.getHitImgs.big[1][4] = loadImage("sprites\\gethit\\wizard_blue_big_hit.png");
    
    // Attach terrain images to terrain singletons.
    CONSTANTS.thronTerrain.image = this.thronImg;
    CONSTANTS.flagTerrain.image = this.flagImg;
    CONSTANTS.resourceTerrain.image = this.resourceImg;
    CONSTANTS.heart = this.heartImg;
}

/**
 * Function to initialize game UI.
 */
GameClientUI.prototype.initGameUI = function(){
    var me = this;
    
    // Build camera.
    this.camera = new BuildCamera([this.scenario.size.x + this.scenario.offset*2, this.scenario.size.y], CONSTANTS.mapScrollSpeed, this.background, mapLayer);
    
    // Build minimap.
    this.minimap = new BuildMiniMap(this.camera, [this.scenario.size.x + this.scenario.offset*2, this.scenario.size.y], CONSTANTS.minimapWidth, this.background, UILayer, stage);
    
    // Initialize terrains in the hexgrid.
    var terrain = this.scenario.terrain;
    for (var i = 0; i < terrain.length; i++)
        for (var j = 0; j < terrain[i].length; j++) {
            switch (terrain[i][j]) {
            case "thron":
                this.gc.hexgrid.addTerrain(CONSTANTS.thronTerrain, new Coordinate(i, j));
                break;
            case "resource":
                this.gc.hexgrid.addTerrain(CONSTANTS.resourceTerrain, new Coordinate(i, j));
                break;
            case "flag":
                this.gc.hexgrid.addTerrain(CONSTANTS.flagTerrain, new Coordinate(i, j));
                break;
            }
        }
    
    // A Kinetic text to show text message at the center of canvas.
    var centerMsg = new Kinetic.Text({
        text: "Waiting for other players...",
        x: 80,
        y: 260,
        fill: 'rgba(127, 155, 0, 0.5)',
        fontFamily: 'Calibri',
        fontSize: 60,
        fontStyle: 'italic'
    });
    msgLayer.add(centerMsg);
    
    // A Kinetic animation to change the text message at the center of canvas.
    this.msgLayerAnim = new Kinetic.Animation(function(frame) {
        if (me.started) {
            if (me.starting){
                centerMsg.setText("Game has started");
                centerMsg.setFill('white');
                centerMsg.setX(CONSTANTS.width/4);
                centerMsg.setY(CONSTANTS.height/2);
                centerMsg.setFontSize(60);
                centerMsg.setFontStyle('normal');
                centerMsg.setFontFamily('Calibri');
                // ctx.font = '30px Calibri';    
                // ctx.fillText("Objective: Kill all enemy units.", canvas.width/4 + 60, canvas.height/2 + 60);
                if (!msgLayer.isAncestorOf(centerMsg)) {
                    msgLayer.add(centerMsg);
                }
            } else if ((me.capping == -1) && (me.countdown <= 30)){  // TODO: hardcoded!
                // if (me.capping == 1){
                    // centerMsg.setText("Capturing flag: " + me.countdown + " seconds until win.");
                    // centerMsg.setFill('white');
                    // centerMsg.setX(200);
                    // centerMsg.setY(50);
                    // centerMsg.setFontSize(28);
                    // centerMsg.setFontStyle('normal');
                    // centerMsg.setFontFamily('Calibri');
                    // if (!msgLayer.isAncestorOf(centerMsg)) {
                        // msgLayer.add(centerMsg);
                    // }
                // } else {
                centerMsg.setText("Defend flag: " + me.countdown + " seconds until lose!");
                centerMsg.setFill('red');
                centerMsg.setX(210);
                centerMsg.setY(50);
                centerMsg.setFontSize(28);
                centerMsg.setFontStyle('normal');
                centerMsg.setFontFamily('Calibri');
                if (!msgLayer.isAncestorOf(centerMsg)) {
                  msgLayer.add(centerMsg);
                }
                // }
                } else if (!me.alive && me.winner === false){
                    centerMsg.setText("All your units are dead!");
                    centerMsg.setFill('white');
                    centerMsg.setX(CONSTANTS.width/4);
                    centerMsg.setY(CONSTANTS.height/2);
                    centerMsg.setFontSize(60);
                    centerMsg.setFontStyle('normal');
                    centerMsg.setFontFamily('Calibri');
                    if (!msgLayer.isAncestorOf(centerMsg)) {
                        msgLayer.add(centerMsg);
                    }
                } else {
                if (msgLayer.isAncestorOf(centerMsg)) {
                    centerMsg.remove();
                }
            }
        }
    }, msgLayer);
    this.msgLayerAnim.start();
    
    // A Kinetic image for the topbar.
    this.topbar = new Kinetic.Image({
        x: CONSTANTS.minimapWidth,
        y: 0,
        image: this.topbarImgs[this.team],
        listening: false
    });
    UILayer.add(this.topbar);
    
    // Kinetic text objects for the unit counters.
    var counter1Text = new Kinetic.Text({
        fontFamily: "Courier New",
        fontSize: 15,
        fill: "white",
        text: this.unitCounter[1-this.team],
        x: 248,
        y: 8,
        listening: false
    });
    UILayer.add(counter1Text);
    var counter2Text = new Kinetic.Text({
        fontFamily: "Courier New",
        fontSize: 15,
        fill: "white",
        text: this.unitCounter[this.team],
        x: 328,
        y: 8,
        listening: false
    });
    UILayer.add(counter2Text);
    
    // A Kinetic text for the resource counter.
    var resourceText = new Kinetic.Text({
        fontFamily: "Courier New",
        fontSize: 15,
        fill: "white",
        text: this.resource,
        x: 402,
        y: 8,
        listening: false
    });
    UILayer.add(resourceText);
    
    // Kinetic image objects for the flags.
    for (var i = 0; i < this.flagImgs.length; i++) {
        this.flags.push(new Kinetic.Image({
            image: this.flagImgs[i],
            x: 448,
            y: 5,
            visible: false,
            listening: false
        }));
        UILayer.add(this.flags[i]);
        this.flags[i].moveToTop();
    }
    
    // A Kinetic text for the flag label.
    var flagText = new Kinetic.Text({
        fontFamily: "Courier New",
        fontSize: 15,
        fill: "white",
        text: CONSTANTS.countdown-this.countdown + "/" + CONSTANTS.countdown,
        x: 475,
        y: 8,
        listening: false
    });
    UILayer.add(flagText);
    
    // A Kinetic image for the button bar.
    this.buttonbar = new Kinetic.Image({
        x: CONSTANTS.minimapWidth + this.topbar.getWidth(),
        y: 0,
        image: this.buttonbarImg,
        listening: false
    });
    UILayer.add(this.buttonbar);
    
    // Kinetic image objects for the buttons.
    this.buttons.build = new Kinetic.Image({
        x: 572,
        y: 4,
        image: this.buttonImgs.unlit.build,
        listening: true
    });
    UILayer.add(this.buttons.build);
    
    this.buttons.menu = new Kinetic.Image({
        x: 602,
        y: 4,
        image: this.buttonImgs.unlit.menu,
        listening: true
    });
    
    this.buttons.menu.on('click', function(){
        // click event listener goes here
        alert("clicked!");
    });
    UILayer.add(this.buttons.menu);
    
    this.buttons.sound = new Kinetic.Image({
        x: 630,
        y: 4,
        image: this.buttonImgs.unlit.sound,
        listening: true
    });
    if (!this.soundOn) {
        this.buttons.sound.setImage(this.buttonImgs.unlit.mute);
    }
    UILayer.add(this.buttons.sound);
    
    // A Kinetic group of Kinetic image objects for buildable units.
    var buildUnitGroup = new Kinetic.Group({
        visible: false,
    });
    this.buildUnitGroup = buildUnitGroup;
    buildUnitGroup.add(new Kinetic.Image({
        image: this.buildUnitImgs.frame,
        x: 572,
        y: 40
    }));
    for (var i = 0; i < 5; i++) {
        this.buildUnitButtons[i] = new Kinetic.Image({
            image: this.buildUnitImgs.unavailable[i],
            x: 573,
            y: 60+31*i
        });
        buildUnitGroup.add(this.buildUnitButtons[i]);
    }
    UILayer.add(buildUnitGroup);
    
    // A Kinetic animation to update the unit counters, the resource counter,
    // and the flag label.
    this.UILayerAnim = new Kinetic.Animation(function(frame) {
        counter1Text.setText(me.unitCounter[1-me.team]);
        counter2Text.setText(me.unitCounter[me.team]);
        resourceText.setText(me.resource);
        flagText.setText(CONSTANTS.countdown-me.countdown + "/" + CONSTANTS.countdown);
    }, UILayer);
    this.UILayerAnim.start();
    
    // platform-dependent UI event registration
    this.platformUI.registerEventListeners();
    
    // draw the game
    stage.add(mapLayer);
    stage.add(UILayer);
    stage.add(msgLayer);
}

/**
 * Function to draw and periodically update the hexgrid.
 */
GameClientUI.prototype.drawHexgrid = function(/*Hexgrid*/hexgrid){
    var x = this.scenario.size.x;
	var y = this.scenario.size.y;
	var offset = this.scenario.offset;
    var spec = findHexSpecs(CONSTANTS.hexSideLength, CONSTANTS.hexRatio);
	var xpos = offset;
	var ypos = y/2-spec.height/2;
    var hexGroup = new Kinetic.Group();  // only hexagons listen to events
    var terrainGroup = new Kinetic.Group({listening: false});
    var unitGroup = new Kinetic.Group({listening: false});
    var fogGroup = new Kinetic.Group({listening: false});
    
    mapLayer.add(terrainGroup);
    mapLayer.add(hexGroup);
    mapLayer.add(unitGroup);
    mapLayer.add(fogGroup);
    this.anim = new Kinetic.Animation(function(frame) {
       for(var x in hexgrid.matrix){
           for(var y in hexgrid.matrix[x]){
               hexgrid.matrix[x][y].update();
           }
       }
    }, layer);
    this.anim.start();
}

/*********************************
 Hexgrid & Hexagon Related Methods
 *********************************/
 
/**
 * Helper function to calculate the specs of a hexagon.
 * @return The specs for hexagons with given side length and ratio
 */
GameClientUI.prototype.findHexSpecs = function()(/*double*/side, /*double*/ratio){
	var z = side;
	var r = ratio;
	
	//solve quadratic
	var r2 = Math.pow(r, 2);
	var a = (1 + r2)/r2;
	var b = z/r2;
	var c = ((1-4.0*r2)/(4.0*r2)) * (Math.pow(z, 2));
	var x = (-b + Math.sqrt(Math.pow(b,2)-(4.0*a*c)))/(2.0*a);
	var y = ((2.0 * x) + z)/(2.0 * r);
	var spec = new Object();
	spec.width = ((2.0*x)+z);
	spec.height = (2.0*y);
	spec.side = side;
	return spec;	
}

/**
 * Hexagon Method:  Checks if point is in hexagon.
 * @this {Hexagon}
 */
Hexagon.prototype.contains = function(/*Point*/ p) {
    var isIn = false;
    if (this.TopLeftPoint.X < p.X && this.TopLeftPoint.Y < p.Y &&
       p.X < this.BottomRightPoint.X && p.Y < this.BottomRightPoint.Y)
    {
        var i, j = 0;
		//Point in polygon test from this webpage
		//http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html#Originality
        for (i = 0, j = this.Points.length - 1; i < this.Points.length; j = i++)
        {
            var iP = this.Points[i];
            var jP = this.Points[j];
            if (((iP.Y <= p.Y && p.Y < jP.Y) || (jP.Y <= p.Y && p.Y < iP.Y)) &&
                (p.X < (jP.X - iP.X) * (p.Y - iP.Y) / (jP.Y - iP.Y) + iP.X)) {
               isIn = !isIn;
            }
        }
    }
    return isIn;
};

/**
 * Update the appearances of the hexagon, its terrain, its unit, and its fog.
 */
GameClientUI.prototype.updateHexagon = function(/*Hexagon*/hexagon) {
   
    // update hexagon
    var points = [];
    for (var i = 0; i < this.Points.length; i++) {
        points.push([this.Points[i].X-this.camera.x, this.Points[i].Y-this.camera.y]);
    }
    this.hexagonToDraw.setPoints(points);
    this.hexagonToDraw.setFill('transparent');
    if (this.reachable || this.buildable) {
        this.hexagonToDraw.setFill('rgba(120, 255,120, 0.3)');
    } else if (this.attackable) {
        this.hexagonToDraw.setFill('rgba(255, 0, 0, 0.3)');
    }else if (this.guessing){
        this.hexagonToDraw.setFill('rgba(0,0,255,0.3)');
    }
    // else if(!this.viewable){
        // this.hexagonToDraw.setFill('rgba(120,0,0,0.3)');
    // }
    // add/update terrain
    var midPoint = new Point(this.MidPoint.X - this.camera.x, this.MidPoint.Y - this.camera.y);
    if (this.terrain) {
        if (this.terrainToDraw) {
            this.terrain.draw(midPoint, this.spec.height, this.terrainToDraw);
        } else {
            this.terrainToDraw = this.terrain.draw(midPoint, this.spec.height);
            this.map.terrainGroup.add(this.terrainToDraw);
        }
    }
    // add/update unit and hp
    if (this.unitToDraw)
        this.unitToDraw.destroy();
    if (this.piece != null) {
        this.unitToDraw = this.piece.draw(midPoint, this.spec.height);
        this.map.unitGroup.add(this.unitToDraw);
    }
    // add fog of war
    if (!this.fog) {
        this.fog = new Kinetic.Image({
            image: this.fogImg,
            opacity: 0,
            scale: {x:0.95, y:0.95}
        });
        this.map.fogGroup.add(this.fog);
    }
    this.fog.setX(midPoint.X - this.fogImg.width/3 - 18);
    this.fog.setY(midPoint.Y - this.fogImg.height/3 - 18);
    if (!this.viewable) {   
        if (this.opacity < 0.5) {
            this.fog.setOpacity(this.opacity);
            this.opacity += 0.01;
        } else {
            this.fog.setOpacity(0.5);
        }
    } else {
        this.fog.setOpacity(0);
    }
};

/**
 * Function to control the showing time of starting message.
 */
GameClientUI.prototype.startingMessageControl = function(){
    this.starting = true;
    var self = this;
    window.setTimeout(function(){
            self.starting = false;
            }, 2000);
}
