var TILEWIDTH = 100;
var TILEHEIGHT = 100;
var enablesaves = false;

var world = null;
var cutscenes = ["EndCutscene.mp4","CastleCutscene.mp4", "LavaCutscene.mp4","ice.mp4",  "ForestCutscene.mp4", "TowerCutscene.mp4"];
music = null;
var last = "";
var mediaMap = {};
function makeArray(a, b)
{
	var res = [];
	for(var i = 0; i < a; i++)
	{
		res.push([]);
		for(var j = 0; j < b; j++)
		{
			res[i].push(null);
		}
	}
	return res;
}

function getWorld()
{
	if(world == null)
	{
		world = new GameWorld();
		window.onresize = function() {
			width = (window.innerWidth - 50)/getWorld().tiles.length;
			height = (window.innerHeight - 50)/getWorld().tiles[0].length;
			scale = Math.min(width, height);
			d3.select('svg').attr('width', scale*getWorld().tiles.length).attr('height', scale*getWorld().tiles[0].length);
		};
		window.onresize();
	}
	return world;
}
WORLD = getWorld;
class GameWorld {
	constructor() {
		this.lastlevel = "Start";
		this.interactables = [[null]];
		this.tiles = [[null]];
		this.bases = [[null]];
		this.decorations = [];
		this.loading = false;
		this.basemap = {};
		this.up = ()=>{};
		this.down = ()=>{};
		this.left = ()=>{};
		this.right = ()=>{};
		this.handler = new Action();
		this.startx = 0;
		this.starty = 0;
		this.pane = new Pane(d3.select('svg'));
		this.menu = new ImageView(d3.select('svg'));
		this.menu.node.attr('visibility', 'hidden');
		this.pane.node.attr('visibility', 'visible');
		this.menu.x = 0;
		this.menu.y = 0;
		this.menu.width = "100%";
		this.menu.height = "100%";
		this.menuitem = 0;
		this.basePane = new Pane(this.pane.node);
		this.decorationPaneBottom = new Pane(this.pane.node);
		this.tilePane = new Pane(this.pane.node);
		this.interactablePane = new Pane(this.pane.node);
		this.playerPane = new Pane(this.pane.node);
		this.hero = new Player(this.playerPane.node);
		this.decorationPaneTop = new Pane(this.pane.node);
		this.sound = null;
	}
	updateBinding() {this.menu.setLayoutX(this.startx*TILEWIDTH);this.menu.setLayoutY(this.starty*TILEHEIGHT);}; //(un)used for startx and starty changes
	setWidth(w1, w2) {
		var v = Math.max(1, w2-w1);
		var vars = ["interactables", "tiles", "bases"];
		for(var k = 0; k < vars.length; k++)
		{
			var temp = makeArray(v, this.interactables[0].length);
			for(var i = Math.max(this.startx, w1); i < Math.min(w2, this.startx - this.interactables.length); i++)
				for(var j = 0; j < temp[i].length; j++)
					temp[i-w1][j] = this[vars[k]][i-startx][j];
			this[vars[k]] = temp;
			this.startx = w1;
			this.updateBinding();
		}
		d3.select('svg').attr('viewBox', this.startx*TILEWIDTH+" "+this.starty*TILEHEIGHT+" "+(this.interactables.length)*TILEWIDTH+" "+(this.interactables[0].length)*TILEHEIGHT);
	}
	setHeight(h1, h2)
	{
		var v = Math.max(1, h2 - h1);
		var vars = ["interactables", "tiles", "bases"];
		for(var k = 0; k < vars.length; k++)
		{
			var temp = makeArray(this.interactables.length, v);
			for(var i = 0; i < temp.length; i++)
				for(var j = Math.max(this.starty, h1); j < Math.min(h2, this.starty - this.interactables[i].length); j++)
					temp[i][j-h1] = this[vars[k]][i][j-starty];
			this[vars[k]] = temp;
			this.starty = h1;
			this.updateBinding();
		}
		d3.select('svg').attr('viewBox', this.startx*TILEWIDTH+" "+this.starty*TILEHEIGHT+" "+(this.interactables.length)*TILEWIDTH+" "+(this.interactables[0].length)*TILEHEIGHT);
	}
	getLeft() {return this.startx;}
	getTop() {return this.starty;}
	showMenu()
	{
		this.hero.disableMenu();
		this.menuitem = -1;
		this.hero.disableMovement(new Action());
		this.down = ()=>{this.menuitem = (this.menuitem+1)%5;this.menu.setImage("menu_"+this.menuitem+".png")};
		this.up = ()=>{this.menuitem = (this.menuitem+4)%5;this.menu.setImage("menu_"+this.menuitem+".png")};
		this.menu.node.attr('visibility', 'visible');
		this.pane.node.attr('visibility', 'hidden');
		this.down();
		this.handler = new Action(o=>{
			if(this.menuitem==3)
			{
				this.showMainMenu();
			}
			else if(this.menuitem == 4)
			{
				this.showMemories();
			}
			else
			{
				this.hero.enableMenu();
				this.menu.node.attr('visibility', 'hidden');
				this.pane.node.attr('visibility', 'visible');
				this.hero.enableMovement(new Action());
				if(this.menuitem == 1)
				{
					this.restartLevel();
				}
				else if(this.menuitem == 2)
				{
					this.lastlevel = "end";
					this.load("overworld");
				}
			}
		});
	}
	showCutscene(filename, then)
	{
		this.hero.disableMovement(new Action());
		this.hero.disableMenu();
		try
		{
			d3.select('svg').style('display', 'none');
			d3.selectAll('video').style('display', '').attr('src', "Images/"+filename).node().play();
			var h = new Action(()=> {
				d3.select('svg').style('display', '');
				d3.selectAll('video').style('display', 'none').node().pause();
				this.hero.enableMovement(new Action());
				this.hero.enableMenu();
				if(then != null)
					then.start();
			});
			this.handler = h;
			d3.selectAll('video').style('display', '').attr('src', "Images/"+filename).on('ended', ()=>{this.handler.start();}).node().play();
		}
		catch(e)
		{
			this.hero.enableMovement(new Action());
		}
	}
	showMainMenu()
	{
		if("Audio/MenuMusic.mp3" != this.last)
			this.lastmusic = this.last;
		this.setMusic("Audio/MenuMusic.mp3");
		this.menuitem = -1;
		this.down = ()=>{this.menuitem = (this.menuitem+1)%4;this.menu.setImage("mainmenu_"+this.menuitem+".png")};
		this.up = ()=>{this.menuitem = (this.menuitem+3)%4;this.menu.setImage("mainmenu_"+this.menuitem+".png")};
		this.down();
		this.handler = new Action(o=>{
			if(this.menuitem==0)
			{
				this.showConfirmation();
			}
			else if(this.menuitem == 1)
			{
				this.hero.enableMenu();
				this.menu.node.attr('visibility', 'hidden');
				this.pane.node.attr('visibility', 'visible');
				this.setMusic(this.lastmusic);
				this.hero.enableMovement(new Action());
			}
			else if(this.menuitem == 2)
			{
				this.menu.setImage("Credits.png")
				this.down = ()=>{};
				this.up = ()=>{};
				this.handler = new Action(o2=>this.showMainMenu());
			}
			else if(this.menuitem == 3)
			{
				d3.select('svg').html('');
				this.setMusic(null);
			}
		});
	}
	fadeIn(destination)
	{
		this.hero.disableMovement(new Action());
		d3.select('svg').attr('opacity', 1);
		d3.select('svg').transition().duration(250).attr('opacity', 0).on('end', ()=>{
			this.load(destination, ()=>{
				this.hero.disableMovement(new Action());
				d3.select('svg').transition().duration(250).attr('opacity', 1).on('end', ()=>{
					this.hero.enableMovement(new Action());
				});
			});
		});
	}
	
	addInteractable(i)
	{
		if(this.interactables[Math.floor(i.getX()) - this.startx][Math.floor(i.getY()) - this.starty] != null)
			this.remove(this.interactables[Math.floor(i.getX()) - this.startx][Math.floor(i.getY()) - this.starty]);
		this.interactables[Math.floor(i.getX()) - this.startx][Math.floor(i.getY()) - this.starty] = i;
		i.getSprite().setParent(this.interactablePane.node);
	}
	savesave()
	{
		var res = this.lastlevel;
		for(var i = 0; i < found.length; i++)
			res = res + "\n"+found[i]
		window.localStorage.setItem("savedata", res);
	}
	remove(o)
	{
		if(o.isBase())
		{
			for(var i = 0; i < this.tiles.length; i++)
				for(var j = 0; j < this.tiles[i].length; j++)
					if(this.bases[i][j] == o)
						this.bases[i][j] = null;
			this.basePane.remove(o.getSprite());
		}
		if(o.isTile())
		{
			for(var i = 0; i < this.tiles.length; i++)
				for(var j = 0; j < this.tiles[i].length; j++)
					if(this.tiles[i][j] == o)
						this.tiles[i][j] = null;
			this.tilePane.remove(o.getSprite());
		}
		if(o.isInteractable())
		{
			for(var i = 0; i < this.tiles.length; i++)
				for(var j = 0; j < this.tiles[i].length; j++)
					if(this.interactables[i][j] == o)
						this.interactables[i][j] = null;
			this.interactablePane.remove(o.getSprite());
		}
		if(o.isDecoration())
		{
			this.decorations = this.decorations.filter(d=>d!=o);
			this.decorationPaneTop.remove(o.getSprite());
			this.decorationPaneBottom.remove(o.getSprite());
		}
	}
	
	
	loadsave(then)
	{
		var scan = window.localStorage.getItem("savedata");
		if(scan != null && scan.length > 1)
		{
			scan = scan.split("\n");
			var level = scan[0];
			for(var i = 1; i < scan.length; i++)
				if(scan[i] != "")
					found.push(scan[i]);
			this.lastlevel = "Start";
			this.load(level, then);
		}
		else
		{
			then();
		}
	}
	
	playSound(sound, then) {
		var a = new Audio("Audio/"+sound);
		a.onerror = ()=>{then.start()};
		a.onended = ()=>{then.start()};
		a.play();
	}
	setMusic(sound) {
		if(this.sound != null)
		{
			if(sound == this.last)
				return;
			this.sound.volume = 0;
			this.sound.pause();
			this.sound.defaultMuted = true;
		}
		if(sound != null)
		{
			this.sound = new Audio(sound);
			this.sound.loop = true;
			this.sound.play();
		}
		this.last = sound;
	}
	readfile(fname, then) {
		fetch(fname).then(response=>
			{
				response.text().then((text)=>
				{
					then(text);
				});
			});
	}
	load(file, then)
	{
		this.loading = true;
		this.setWidth(0, 1);
		this.setHeight(0, 1);
		this.bases = makeArray(this.bases.length, this.bases[0].length);
		this.tiles = makeArray(this.bases.length, this.bases[0].length);
		this.interactables = makeArray(this.bases.length, this.bases[0].length);
		this.basemap = {};
		this.decorations = [];
		this.pane.node.html('');
		this.basePane = new Pane(this.pane.node);
		this.decorationPaneBottom = new Pane(this.pane.node);
		this.tilePane = new Pane(this.pane.node);
		this.interactablePane = new Pane(this.pane.node);
		this.playerPane = new Pane(this.pane.node);
		this.hero = new Player(this.playerPane.node);
		this.decorationPaneTop = new Pane(this.pane.node);
		this.readfile("Datafiles/"+file+".data", (scan) => {
			const lines = scan.split("\n");
			this.setWidth(1*lines[0],1*lines[1]);
			this.setHeight(1*lines[2], 1*lines[3]);
			this.setMusic("Audio/"+lines[4]);
			var s = null;
			var index = 5;
			while("" != (s = lines[index++]))
			{
				try
				{
					this.addDecoration(this.parseObject(s));
				}
				catch(dnce){}
			}
			this.bases = makeArray(this.bases.length, this.bases[0].length);
			this.tiles = makeArray(this.bases.length, this.bases[0].length);
			this.interactables = makeArray(this.bases.length, this.bases[0].length);
			while("" != (s = lines[index++]))
			{
				try
				{
					this.addBase(this.parseObject(s));
				}
				catch(dnce){}
			}
			while("" != (s = lines[index++]))
			{
				try
				{
					this.addTile(this.parseObject(s));
				}
				catch(dnce){}
			}
			while("" != (s = lines[index++]))
			{
				try
				{
					this.addInteractable(this.parseObject(s));
				}
				catch(dnce){}
			}
			this.lastlevel = file;
			this.loading = false;
			if(this.enablesaves)
				this.savesave();
			
			width = (window.innerWidth - 50)/getWorld().tiles.length;
			height = (window.innerHeight - 50)/getWorld().tiles[0].length;
			scale = Math.min(width, height);
			d3.select('svg').attr('width', scale*getWorld().tiles.length).attr('height', scale*getWorld().tiles[0].length);
			
			if(then != null)
				then();
		});
	}
	addTile(t)
	{
		if(this.tiles[Math.floor(t.getX()) - this.startx][Math.floor(t.getY()) - this.starty] != null)
			this.remove(this.tiles[Math.floor(t.getX()) - this.startx][Math.floor(t.getY()) - this.starty]);
		this.tiles[Math.floor(t.getX()) - this.startx][Math.floor(t.getY()) - this.starty] = t;
		t.getSprite().setParent(this.tilePane.node);
	}
	
	addDecoration(decoration)
	{
		this.decorations.push(decoration);
		decoration.getSprite().setParent(decoration.isTopLayer?this.decorationPaneTop.node:this.decorationPaneBottom.node);
	}
	addBase(b)
	{
		if(this.bases[Math.floor(b.getX()) - this.startx][Math.floor(b.getY()) - this.starty] != null)
			this.remove(this.bases[Math.floor(b.getX()) - this.startx][Math.floor(b.getY()) - this.starty]);
		this.bases[Math.floor(b.getX()) - this.startx][Math.floor(b.getY()) - this.starty] = b;
		b.getSprite().setParent(this.basePane.node);
		b.getNames().split(";").forEach(s=>
		{
			this.basemap[s] = b;
		});
		if(((";"+b.getNames()+";").toLowerCase()).includes((";From-"+this.lastlevel+";").toLowerCase()))
		{
			this.hero.setX(b.getX());
			this.hero.setY(b.getY());
		}
	}
	getWide()
	{
		return this.tiles.length + this.getLeft();
	}
	getHigh()
	{
		return this.tiles[0].length + this.getTop();
	}
	
	parseObject(object)
	{
		var name = object.substring(0, object.indexOf('\t'));
		for(var k = 0; k < ObjectList.length; k++) {
			var go = ObjectList[k];
			if(name == go.className)
			{
				var res = go.makeCopy(null);
				res.parse(object);
				return res;
			}
		};
		throw "cannot find "+object;
	}
	getTile(x, y)
	{
		if(this.loading)
			return null;
		return this.fetch(this.tiles, x, y);
	}
	getBaseByName(n)
	{
		if(n in this.basemap)
			return this.basemap[n];
		return null;
	}
	getBase(x, y)
	{
		if(this.loading)
			return null;
		return this.fetch(this.bases, x, y);
	}
	getWalkable(x, y)
	{
		if(this.loading)
			return null;
		var tile = this.getTile(x, y);
		return tile==null?this.getBase(x,y):tile;
	}
	getInteractable(x, y)
	{
		if(this.loading)
			return null;
		return this.fetch(this.interactables, x, y);
	}
	fetch(arr, xv, yv)
	{
		var x = Math.floor(xv) - this.startx;
		var y = Math.floor(yv) - this.starty;
		if( x < 0 || y < 0 || x >= arr.length || y >= arr[x].length)
			return null;
		return arr[x][y];
	}
	moveItem(PANE, ARRAY, i, ox, oy, nx, ny)
	{
		if(i.getSprite().node.node().parentNode != PANE.node.node())
			return; //hopefully fixes a bug where invisible things from before we restarted the level are still floating around
		ox -= this.startx;
		nx -= this.startx;
		oy -= this.starty;
		ny -= this.starty;
		if(ox >= 0 && ox < ARRAY.length && oy >= 0 && oy < ARRAY[ox].length && ARRAY[ox][oy] == i)
			ARRAY[ox][oy] = null;
		if(nx >= 0 && nx < ARRAY.length && ny >= 0 && ny < ARRAY[nx].length)
			ARRAY[nx][ny] = i;
	}
	restartLevel()
	{
		var t = this.lastlevel;
		this.lastlevel = "Start";
		this.load(t);
	}
	showDialog(speaker, name, text, then)
	{
		this.hero.disableMovement(new Action());
		var t = new Pane(this.pane.node);
		var H = 200;
		var SIZE = 100;
		var truewidth = TILEWIDTH* this.interactables.length;
		var trueheight = TILEHEIGHT*this.interactables[0].length;
		/*t.layoutYProperty().bind(this.heightProperty().subtract(H));
		t.minWidthProperty().bind(this.widthProperty().divide(scale.xProperty()));
		t.maxWidthProperty().bind(this.widthProperty().divide(scale.xProperty()));
		t.prefWidthProperty().bind(this.widthProperty().divide(scale.xProperty()));
		t.setMinHeight(H);
		t.setMaxHeight(H);
		t.setPrefHeight(H);*/
		var r = t.node.append('rect').attr('width','90%').attr('x', this.startx*TILEWIDTH+0.05*truewidth).attr('height', '15%').attr('y', this.starty*TILEHEIGHT+trueheight*0.8).attr('rx', '3%').attr('ry', '3%').attr('fill', "#CCCCCC");
		
		const W = Math.min(500, 0.1*trueheight);
		var img = t.node.append('image').attr('width',W).attr('x',this.startx*TILEWIDTH+0.075*truewidth).attr('height', W).attr('y', (this.starty*TILEHEIGHT+trueheight*0.8)-(0.75*W)).attr('href','Images/'+speaker);
		var r2 = t.node.append('rect').attr('width','70%').attr('x',this.startx*TILEWIDTH+0.19*truewidth).attr('height', W/2).attr('y', (this.starty*TILEHEIGHT+trueheight*0.8)-(0.25*W)).attr('rx','1%').attr('ry','2%').attr('fill', '#999999');
		var l = t.node.append('text').text(name).attr('text-anchor', 'middle').attr('x',this.startx*TILEWIDTH+0.54*truewidth).attr('y', (this.starty*TILEHEIGHT+trueheight*0.8)-(0.25*W)+W*0.4).style('font', Math.min(60, 2*Math.max(this.interactables.length, this.interactables[0].length))+'px sans-serif').style('fill', 'black');
		var l2 = t.node.append('foreignObject').attr('x',this.startx*TILEWIDTH+0.06*truewidth).attr('y', (this.starty*TILEHEIGHT+trueheight*0.8)-(0.25*W)+W*0.6).attr('width','83%').attr('height','10%').html('<p x="0" y="0" width="100%" height="100%" style="font: '+Math.min(50,Math.floor(1.8*Math.max(this.interactables.length, this.interactables[0].length)))+'px sans-serif; fill="black"; text-align="left";">'+text+'</p>');
		this.handler = new Action(o=>{this.hero.enableMovement(new Action()); t.node.remove(); then.start(); o.start();});
	}
	setMemoryHandler()
	{
		this.handler = new Action(o=>
		{
			if(this.menuitem==6)
			{
				this.hero.enableMenu();
				this.hero.enableMovement(new Action());
				this.showMenu();
			}
			else
			{
				this.showCutscene(cutscenes[this.menuitem], new Action((o2)=>{this.hero.disableMenu();this.setMemoryHandler();o2.start();}));
			}
		});
	}
	showMemories()
	{
		this.menuitem = -1;
		this.down = ()=>{do {this.menuitem = (this.menuitem+1)%7;} while(this.menuitem != 6 && !found.includes(cutscenes[this.menuitem]));this.menu.setImage("Cutscenes_"+this.menuitem+".png");};
		this.up = ()=>{do {this.menuitem = (this.menuitem+6)%7;} while(this.menuitem != 6 && !found.includes(cutscenes[this.menuitem]));this.menu.setImage("Cutscenes_"+this.menuitem+".png");};
		this.down();
		this.setMemoryHandler();
	}
	showConfirmation()
	{
		this.menuitem = -1;
		this.down = ()=>{this.menuitem = (this.menuitem+1)%2;this.menu.setImage("check_"+this.menuitem+".png")};
		this.up = ()=>{this.menuitem = (this.menuitem+1)%2;this.menu.setImage("check_"+this.menuitem+".png")};
		this.down();
		this.handler = new Action(o=>{
			if(this.menuitem == 0)
			{
				found.length = 0;
				this.lastlevel = "Start";
				this.hero.enableMenu();
				this.menu.node.attr('visibility', 'hidden');
				this.pane.node.attr('visibility', 'visible');
				this.hero.enableMovement(new Action());
				this.load("end");
			}
			else
			{
				this.showMainMenu();
			}
		});
	}
}

