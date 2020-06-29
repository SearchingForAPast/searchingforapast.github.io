WORLD = ()=>{return {'basePane': {'node':null}, 'interactablePane': {'node':null}, 'tilePane': {'node':null}}};
class Action
{
	constructor(action)
	{
		this.actions = [];
		if(action != null)
			this.actions.push(action);
	}
	start()
	{
		if(this.actions.length > 0)
			this.actions.shift()(this);
	}
	then(action)
	{
		if (typeof action === "function")
			this.actions.push(action);
		else
			this.actions.push(o=>{action.start(); o.start();});
		return this;
	}
	
}
class GameObject
{
	constructor(parent) {
		this.names = "";
		this.sprite = new ImageView(parent);
		this.x = -5000;
		this.y = -5000;
		this.imagename = null;
	}
	
	getNames()
	{
		return this.names;
	}
	setNames(names)
	{
		this.names = names;
	}
	
	getSprite()
	{
		return this.sprite;
	}
	getImageName()
	{
		return this.imagename;
	}
	setSprite(image)
	{
		this.imagename = image;
		this.sprite.setImage(image);
	}
	
	getX()
	{
		return this.x;
	}
	setX(x, set)
	{
		if(set == null)
			set = true;
		this.x = x;
		if(set)
			this.sprite.setLayoutX(x*TILEWIDTH);
	}
	getY()
	{
		return this.y;
	}
	setY(y, set)
	{
		if(set == null)
			set = true;
		this.y = y;
		if(set)
			this.sprite.setLayoutY((1+y)*TILEHEIGHT-this.sprite.getHeight());
	}
	parse(saved)
	{
		var index = saved.indexOf("\t\t");
		var s = saved.substring(0, index);
		var parts = s.split("\t");
		this.setNames(parts[1]);
		this.setSprite(parts[2]);
		this.setX(1*parts[3]);
		this.setY(1*parts[4]);
		return saved.substring(index+2);
	}
	isDecoration()
	{
		return false;
	}
	isBase()
	{
		return false;
	}
	isTile()
	{
		return false;
	}
	isInteractable()
	{
		return false;
	}
	toString()
	{
		return this.getClassName() + "\t" + (this.getNames().equals("")?"-":this.getNames())+"\t"+this.getImageName()+"\t"+this.getX()+"\t"+this.getY() + "\t\t";
	}
}
class Walkable extends GameObject
{
	constructor(parent) {
		super(parent);
	}
	//called when interactor tries to walk into this
	isWalkable(i)
	{
		return true;
	}
	isWalkableUp(i)
	{
		return this.isWalkable(i);
	}
	isWalkableDown(i)
	{
		return this.isWalkable(i);
	}
	isWalkableLeft(i)
	{
		return this.isWalkable(i);
	}
	isWalkableRight(i)
	{
		return this.isWalkable(i);
	}
	onWalk(i)
	{
		return new Action();
	}
	onWalkUp(i)
	{
		return this.onWalk(i);
	}
	onWalkDown(i)
	{
		return this.onWalk(i);
	}
	onWalkLeft(i)
	{
		return this.onWalk(i);
	}
	onWalkRight(i)
	{
		return this.onWalk(i);
	}
	onWalkOff(i)
	{
		return new Action();
	}
	onWalkOffUp(i)
	{
		return this.onWalkOff(i);
	}
	onWalkOffDown(i)
	{
		return this.onWalkOff(i);
	}
	onWalkOffLeft(i)
	{
		return this.onWalkOff(i);
	}
	onWalkOffRight(i)
	{
		return this.onWalkOff(i);
	}
}

class Movable extends Walkable
{
	constructor(parent) {
		super(parent);
		this.base = null;
	}
	move(x, y, then, newtile)
	{
		const X = this.sprite.node.attr('x');
		const Y = this.sprite.node.attr('y');
		this.setX(this.getX()+x, false);
		this.setY(this.getY()+y, false);
		this.base = newtile;
		this.sprite.node.transition().duration(150).attr('x', X*1+x*TILEWIDTH).attr('y',Y*1+y*TILEHEIGHT).on('end', ()=>
		{
			then.start();
		});
		/*TODO: Animate thisTimeline timeline = new Timeline();
		timeline.setCycleCount(1);
		timeline.getKeyFrames().add(new KeyFrame(Duration.millis(0), (e)->{}, new KeyValue(getSprite().layoutXProperty(), getSprite().getLayoutX()), new KeyValue(getSprite().layoutYProperty(), getSprite().getLayoutY())));
		timeline.getKeyFrames().add(new KeyFrame(Duration.millis(300), (e)->{}, new KeyValue(getSprite().layoutXProperty(), getSprite().getLayoutX()+x*TILEWIDTH), new KeyValue(getSprite().layoutYProperty(), getSprite().getLayoutY()+y*TILEHEIGHT)));
		setX(this.getX()+x, false);
		setY(getY()+y, false);
		timeline.setOnFinished(e->then.start());
		timeline.play();*/
	}
	getFloor()
	{
		return this.base;
	}
}

class Interactable extends Movable
{
	constructor(parent)
	{
		super(parent==null?WORLD().interactablePane.node:parent);
		this.tile = null;
	}
	getX()
	{
		return this.tile==null?super.getX():this.tile.getX();
	}
	getY()
	{
		return this.tile==null?super.getY():this.tile.getY();
	}
	setX(x, b)
	{
		var ox = Math.floor(this.getX());
		this.tile = getWorld().getWalkable(x, this.getY());
		super.setX(x, b);
		getWorld().moveItem(getWorld().interactablePane, getWorld().interactables, this, ox, Math.floor(this.getY()), Math.floor(this.getX()), Math.floor(this.getY()));
	}
	setY(y, b)
	{
		var oy = Math.floor(this.getY());
		this.tile = getWorld().getWalkable(this.getX(), y);
		super.setY(y, b);
		getWorld().moveItem(getWorld().interactablePane, getWorld().interactables, this, Math.floor(this.getX()), oy, Math.floor(this.getX()), Math.floor(this.getY()));
	}
	//called when interactor interacts with this
	onInteract(i)
	{
	}
	onInteractUp(i)
	{
		this.onInteract(i);
	}
	onInteractDown(i)
	{
		this.onInteract(i);
	}
	onInteractLeft(i)
	{
		this.onInteract(i);
	}
	onInteractRight(i)
	{
		this.onInteract(i);
	}
	getFloor()
	{
		if(this.tile == null)
			return super.getFloor();
		return this.tile;
	}
	isInteractable()
	{
		return true;
	}
}

class Interactor extends Interactable
{
	constructor(parent) {
		super(parent);
		this.lastx = 0;
		this.lasty = 1;
	}
	interact()
	{
		var i = getWorld().getInteractable(this.getX() + this.lastx, this.getY() + this.lasty);
		if(i == null)
			return;
		else if(this.lastx == 1)
			i.onInteractRight(this);
		else if(this.lastx == -1)
			i.onInteractLeft(this);
		else if(this.lasty == 1)
			i.onInteractDown(this);
		else if(this.lasty == -1)
			i.onInteractUp(this);
	}
	tryMoveUp(then)
	{
		this.lastx = 0;
		this.lasty = -1;
		this.tryMove(0, -1, then, (w, i)=>w.isWalkableUp(i), (w, i)=>w.onWalkUp(i), (w, i)=>w.onWalkOffUp(i));
	}
	tryMoveDown(then)
	{
		this.lastx = 0;
		this.lasty = 1;
		this.tryMove(0, 1, then, (w, i)=>w.isWalkableDown(i), (w, i)=>w.onWalkDown(i), (w, i)=>w.onWalkOffDown(i));
	}
	tryMoveLeft(then)
	{
		this.lasty = 0;
		this.lastx = -1;
		this.tryMove(-1, 0, then, (w, i)=>w.isWalkableLeft(i), (w, i)=>w.onWalkLeft(i), (w, i)=>w.onWalkOffLeft(i));
	}
	tryMoveRight(then)
	{
		this.lasty = 0;
		this.lastx = 1;
		this.tryMove(1, 0, then, (w, i)=>w.isWalkableRight(i), (w, i)=>w.onWalkRight(i), (w, i)=>w.onWalkOffRight(i));
	}
	tryMove(x, y, then, check, on, off)
	{
		if(this.sprite.node == null || this.sprite.node.node() == null || this.sprite.node.node().parentElement.parentElement == null)
		{
			//getWorld().remove(this);
			return;
		}
		var xc = this.getX();
		var yc = this.getY();
		var interactable = getWorld().getInteractable(xc + x, yc + y);
		if(interactable != null)
		{
			check(interactable, this);
			then.start();
			return;
		}
		var target = getWorld().getWalkable(xc + x, yc + y);
		var floor = this.getFloor();
		if(target == null || !check(target, this))
		{
			then.start();
			return;
		}
		if(floor != null) off(floor, this).start();
		this.move(x, y, on(target, this).then(then), target);
	}
}
class Decoration extends GameObject
{
	constructor(image, parent) {
		super(null);
		this.isTopLayer = false;
		this.setSprite(image);
		this.className = "Decoration"
	}
	makeCopy(parent) {
		return new Decoration(this.getImageName(), parent);
	}
	parse(saved) {
		saved = super.parse(saved);
		var index = saved.indexOf("\t\t");
		var s = saved.substring(0, index);
		this.isTopLayer = s == "true";
		return saved.substring(index+2);
	}
	toString()
	{
		return super.toString() + this.isTopLayer+"\t\t";
	}
	
	isDecoration()
	{
		return true;
	}
}
class Base extends Walkable
{
	constructor(parent)
	{
		super(parent==null?WORLD().basePane.node:parent);
		this.setSprite("brick.png");
		this.className = "Base";
	}
	makeCopy(parent)
	{
		return new Base(parent);
	}
	isBase()
	{
		return true;
	}
}
class Wall extends Base
{
	constructor(parent)
	{
		super(parent);
		this.setSprite("brickwall.png");
		this.className = "Wall";
	}
	makeCopy(parent)
	{
		return new Wall(parent);
	}
	isWalkable(i)
	{
		return false;
	}
}
class Ice extends Base
{
	constructor(parent)
	{
		super(parent);
		this.setSprite("ice.png");
		this.className = "Ice";
	}
	makeCopy(parent)
	{
		return new Ice(parent);
	}
	onWalkUp(i)
	{
		return new Action(o=>{i.tryMoveUp(new Action()); o.start();});
	}
	onWalkDown(i)
	{
		return new Action(o=>{i.tryMoveDown(new Action()); o.start();});
	}
	onWalkLeft(i)
	{
		return new Action(o=>{i.tryMoveLeft(new Action()); o.start();});
	}
	onWalkRight(i)
	{
		return new Action(o=>{i.tryMoveRight(new Action()); o.start();});
	}
}
class LoadNew extends Base
{
	constructor(parent)
	{
		super(parent);
		this.destination = "-";
		this.setSprite("brickportal.png");
		this.className = "LoadNew";
	}
	makeCopy(parent)
	{
		return new LoadNew(parent);
	}
	onWalk(i)
	{
		if("Player" == i.className)
			return new Action(o=>{getWorld().fadeIn(this.destination); o.start()});
		else if(i.className.startsWith("Log-"))
			return new Action();
		return new Action(o=>{getWorld().remove(i); o.start();});
	}
	setDestination(dest)
	{
		this.destination = (dest==""?"-":dest);
	}
	parse(saved)
	{
		saved = super.parse(saved);
		var index = saved.indexOf("\t\t");
		this.setDestination(saved.substring(0, index));
		return saved.substring(index+2);
	}
	toString()
	{
		return super.toString() + this.destination + "\t\t";
	}
}
found = [];
class Memory extends Interactable
{
	constructor(parent) {
		super(parent);
		this.setSprite("bubble.png");
		this.className = "Memory";
	}
	makeCopy(parent)
	{
		return new Memory(parent);
	}
	onInteract(i)
	{
		found.push(this.getNames());
		getWorld().remove(this);
		getWorld().showCutscene(this.getNames());
	}
	parse(saved)
	{
		saved = super.parse(saved);
		if(found.indexOf(this.getNames()) > -1)
		{
			this.sprite.node.remove();
			getWorld().remove(this);
			throw "donotcreate";
		}
		return saved;
	}
}
class Charact extends Interactor
{
	constructor(parent) {
		super(parent);
		this.setSprite("down-character.png");
		this.name = '-';
		this.text = '-';
		this.className = 'Character';
	}
	makeCopy(parent)
	{
		return new Charact(parent);
	}
	isWalkableLeft(i)
	{
		return false;
	}
	isWalkableRight(i)
	{
		return false;
	}
	isWalkableUp(i)
	{
		return false;
	}
	isWalkableDown(i)
	{
		return false;
	}
	onInteract(t)
	{
		const  a = new Action((o)=>{getWorld().hero.disableMenu();o.start();});
		const i = this.getImageName().replace(/[^-]*-/,"icon-");
		const n = this.getName();
		const s = this.getText().split(";");
		for(var k = 0; k < s.length; k++)
		{
			const s2 = s[k];
			a.then((o)=>{getWorld().showDialog(i, n, s2, o)});
		}
		a.then((o)=>{getWorld().hero.enableMenu();o.start();});
		if(/^ *Dragon *$/.test(this.getName()))
		{
			var d = new Decoration("start.png");
			d.setX(0);
			d.setY(0);
			d.isTopLayer = true;
			a.then((o)=>{getWorld().addDecoration(new Decoration("start.png"))});
		}
		a.start();
	}
	getName()
	{
		return this.name;
	}
	setName(s)
	{
		this.name = s;
	}
	getText()
	{
		return this.text;
	}
	setText(s)
	{
		this.text = s;
	}
	onInteractUp(i)
	{
		this.setSprite(this.getImageName().replace(/[^-]*-/,"down-"));
		this.onInteract(i);
	}
	onInteractDown(i)
	{
		this.setSprite(this.getImageName().replace(/[^-]*-/,"up-"));
		this.onInteract(i);
	}
	onInteractLeft(i)
	{
		this.setSprite(this.getImageName().replace(/[^-]*-/,"right-"));
		this.onInteract(i);
	}
	onInteractRight(i)
	{
		this.setSprite(this.getImageName().replace(/[^-]*-/,"left-"));
		this.onInteract(i);
	}
	parse(saved)
	{
		saved = super.parse(saved);
		var index = saved.indexOf("\t\t");
		var p = saved.substring(0, index).split("\t");
		this.setText(p[0]);
		this.setName(p[1]);
		return saved.substring(index+2);
	}
	toString()
	{
		return super.toString() + this.getText() + "\t "+ this.getName() + "\t\t";
	}
}
class End extends LoadNew
{
	constructor(parent)
	{
		super(parent);
		if(found.length == 6)
		{
			var d = new Decoration("cave.png");
			d.setX(1);
			d.setY(3);
			getWorld().addDecoration(d);
		}
		this.className = "End";
	}
	onWalk(i)
	{
		var a = new Action();
		if(found.length == 6)
			a.then(super.onWalk(i));
		return a;
	}
	makeCopy(parent)
	{
		return new End(parent);
	}
}
class Boulder extends Interactor
{
	constructor(parent)
	{
		super(parent);
		this.setSprite("boulder.png");
		this.className = "Boulder";
	}
	makeCopy(parent)
	{
		return new Boulder(parent);
	}
	isWalkableUp(i)
	{
		getWorld().playSound("push.mp3", new Action());
		this.tryMoveUp(new Action());
		return false;
	}
	isWalkableDown(i)
	{
		getWorld().playSound("push.mp3", new Action());
		this.tryMoveDown(new Action());
		return false;
	}
	isWalkableLeft(i)
	{
		getWorld().playSound("push.mp3", new Action());
		this.tryMoveLeft(new Action());
		return false;
	}
	isWalkableRight(i)
	{
		getWorld().playSound("push.mp3", new Action());
		this.tryMoveRight(new Action());
		return false;
	}
}

class IcicleNPC extends Charact
{
	constructor(parent)
	{
		super(parent);
		this.setSprite("left-icicle.png");
		this.className = "IcicleNPC";
	}
	makeCopy(parent)
	{
		return new IcicleNPC(parent);
	}
	parse(saved)
	{
		saved = super.parse(saved);
		if(getWorld().hero != null && !found.includes("ice.mp4"))
		{
			getWorld().remove(this);
			throw "donotcreate";
		}
		return saved;
	}
}
class CastleStone extends Base
{
	constructor(parent)
	{
		super(parent);
		this.stepped = false;
		this.setSprite("IceStoneButton.png");
		this.className = "CastleStone";
	}
	makeCopy(parent)
	{
		return new CastleStone(parent);
	}
	getStepped()
	{
		return this.stepped;
	}
	onWalk(i)
	{
		return new Action((o)=>{if(this.stepped) getWorld().restartLevel(); else this.stepped = true; o.start();});
	}
	onWalkOff(i)
	{
		return new Action((o)=> {
			var b = getWorld().getBase(this.getX(), this.getY()-1);
			this.setSprite("Button-Press-"+((b == null || b.className!="Base")?"1":"2")+".gif?a="+Math.random());
		});
	}
}
class CastleGate extends Base
{
	constructor(parent)
	{
		super(parent);
		this.stepped = false;
		this.open = false;
		this.setSprite("Gate.png");
		this.className = "CastleGate";
	}
	makeCopy(parent)
	{
		return new CastleGate(parent);
	}
	isWalkable(t)
	{
		if(this.open)
			return true;
		for(var i = getWorld().getLeft(); i < getWorld().getWide(); i++)
		{
			for(var j = getWorld().getTop(); j < getWorld().getHigh(); j++)
			{
				var x = i;
				var y = j;
				var b = getWorld().getBase(x, y);
				if(b != null && b.className == "CastleStone")
					if(!b.getStepped())
						return false;
			}
		}
		this.setSprite("GateOpen.png");
		this.open = true;
		return true;
	}
	isWalkableDown(i)
	{
		this.setSprite("GateOpen.png");
		this.open = true;
		return true;
	}
}
class Lava extends Base
{
	constructor(parent)
	{
		super(parent);
		this.setSprite('lava.png');
		this.className = "Lava";
	}
	makeCopy(parent)
	{
		return new Lava(parent);
	}
	onWalk(i)
	{
		return new Action(o=>
		{
			var p = new Platform(null);
			p.setSprite(i.getImageName());
			p.setX(i.getX());
			p.setY(i.getY());
			getWorld().addTile(p);
			getWorld().remove(i);
		});
	}
	isWalkable(i)
	{
		return i.className != "Player";
	}
}
class Tile extends Movable
{
	constructor(parent)
	{
		super(parent==null?WORLD().tilePane.node:parent);
		this.base= null;
	}
	getX()
	{
		if(this.base == null)
			return super.getX();
		return this.base.getX();
	}
	getY()
	{
		if(this.base == null)
			return super.getY();
		return this.base.getY();
	}
	isTile()
	{
		return true;
	}
}

class Platform extends Tile
{
	constructor(parent)
	{
		super(parent);
		this.className = "Platform";
	}
	makeCopy(parent)
	{
		return new Platform(parent);
	}
	isWalkable(i)
	{
		return true;
	}
}
class TeleportPad extends Base
{
	constructor(parent)
	{
		super(parent);
		this.setSprite("teleportpad.png");
		this.className = "TeleportPad";
	}
	makeCopy(parent)
	{
		return new TeleportPad(parent);
	}
	onWalk(i)
	{
		if(this.imagename == "teleportpad.png")
			getWorld().playSound("warp.mp3", new Action());
		var s = this.getNames().split(";")[0].split("_");
		var t = s.length==2?getWorld().getBaseByName(s[0]+"_"+(s[1].toLowerCase() == "a"?"B":"A")):null;
		if(t == null || getWorld().getInteractable(t.getX(), t.getY()) != null)
			return new Action();
		return new Action(o=>{i.setX(-5000);i.setY(t.getY());i.setX(t.getX()); o.start();});
	}
}
class MovePad extends Base
{
	constructor(parent)
	{
		super(parent);
		this.dx = 0;
		this.dy = 0;
		this.setSprite("movepadicon.png");
		this.className = "MovePad";
	}
	makeCopy(parent)
	{
		return new MovePad(parent);
	}
	onWalk(i)
	{
		var a = new Action();
		for(var j = 0; j < this.dx; j++)
			a.then((o)=>{i.tryMoveRight(o);}).then(o=>{i.setX(i.getX());i.setY(i.getY());o.start();});
		for(var j = 0; j > this.dx; j--)
			a.then((o)=>{i.tryMoveLeft(o);}).then(o=>{i.setX(i.getX());i.setY(i.getY());o.start();});
		for(var j = 0; j < this.dy; j++)
			a.then((o)=>{i.tryMoveDown(o);}).then(o=>{i.setX(i.getX());i.setY(i.getY());o.start();});
		for(var j = 0; j > this.dy; j--)
			a.then((o)=>{i.tryMoveUp(o);}).then(o=>{i.setX(i.getX());i.setY(i.getY());o.start();});
		getWorld().playSound("slide.mp3", new Action());
		return a;
	}
	parse(saved)
	{
		saved = super.parse(saved);
		var index = saved.indexOf("\t\t");
		var parts = saved.substring(0, index).split("\t");
		this.dx = 1*parts[0];
		this.dy = 1*parts[1];
		this.updateImage();
		return saved.substring(index+2);
	}
	setDx(dx)
	{
		this.dx = dx;
		this.updateImage();
	}
	setDy(dy)
	{
		this.dy = dy;
		this.updateImage();
	}
	toString()
	{
		return super.toString() + this.dx +"\t"+this.dy+ "\t\t";
	}
	updateImage()
	{
		var name = this.getImageName().replace("down.png","").replace("up.png","").replace("left.png","").replace("right.png","").replace("icon.png","");
		if(this.dx > 0)
			this.setSprite(name+"right.png");
		else if(this.dx < 0)
			this.setSprite(name+"left.png");
		else if(this.dy > 0)
			this.setSprite(name+"down.png");
		else if(this.dy < 0)
			this.setSprite(name+"up.png");
		else
			this.setSprite(name+"icon.png");
	}
	rotate()
	{
		var t = this.dx;
		this.setDx(-1 *this.dy);
		this.setDy(t);
	}
}
class PanelRotater extends Interactable
{
	constructor(parent)
	{
		super(parent);
		this.setSprite("rotatebutton.png");
		this.className = "PanelRotater";
		
	}
	makeCopy(parent)
	{
		return new PanelRotater(parent);
	}
	isWalkableLeft(i)
	{
		return false;
	}
	isWalkableRight(i)
	{
		return false;
	}
	isWalkableUp(i)
	{
		return false;
	}
	isWalkableDown(i)
	{
		return false;
	}
	onInteract(i)
	{
		getWorld().getBaseByName((";"+this.getNames()+";").replace(/.*;Rotate-/g, '').replace(/;.*/g, '')).rotate();
	}
}

class Log extends Interactor
{
	constructor(parent)
	{
		super(parent);
		this.onFire = false;
		this.flame = null;
	}
	move(dx, dy, a, w)
	{
		super.move(dx, dy, a, w);
		getWorld().playSound("push.mp3", new Action());
	}
	canPushUpL(i)
	{
		return this.check(0, -1) && ((getWorld().getInteractable(this.getX()-1, this.getY()))).canPushUpL(i);
	}
	canPushUpR(i)
	{
		return this.check(0, -1) && ((getWorld().getInteractable(this.getX()+1, this.getY()))).canPushUpR(i);
	}
	isWalkableUp(i)
	{
		if(this.canPushUpL(i) && this.canPushUpR(i))
		{
			((getWorld().getInteractable(this.getX()-1, this.getY()))).isWalkableUpL(i);
			((getWorld().getInteractable(this.getX()+1, this.getY()))).isWalkableUpR(i);
			this.tryMoveUp(new Action());
		}
		return false;
	}
	isWalkableUpL(i)
	{
		((getWorld().getInteractable(this.getX()-1, this.getY()))).isWalkableUpL(i);
		this.tryMoveUp(new Action());
		return false;
	}
	isWalkableUpR(i)
	{
		((getWorld().getInteractable(this.getX()+1, this.getY()))).isWalkableUpR(i);
		this.tryMoveUp(new Action());
		return false;
	}
	
	canPushDownL(i)
	{
		return this.check(0, 1) && ((getWorld().getInteractable(this.getX()-1, this.getY()))).canPushDownL(i);
	}
	canPushDownR(i)
	{
		return this.check(0, 1) && ((getWorld().getInteractable(this.getX()+1, this.getY()))).canPushDownR(i);
	}
	isWalkableDown(i)
	{
		if(this.canPushDownL(i) && this.canPushDownR(i))
		{
			((getWorld().getInteractable(this.getX()-1, this.getY()))).isWalkableDownL(i);
			((getWorld().getInteractable(this.getX()+1, this.getY()))).isWalkableDownR(i);
			this.tryMoveDown(new Action());
		}
		return false;
	}
	isWalkableDownL(i)
	{
		((getWorld().getInteractable(this.getX()-1, this.getY()))).isWalkableDownL(i);
		this.tryMoveDown(new Action());
		return false;
	}
	isWalkableDownR(i)
	{
		((getWorld().getInteractable(this.getX()+1, this.getY()))).isWalkableDownR(i);
		this.tryMoveDown(new Action());
		return false;
	}
	canPushLeftU(i)
	{
		return this.check(-1, 0) && ((getWorld().getInteractable(this.getX(), this.getY()-1))).canPushLeftU(i);
	}
	canPushLeftD(i)
	{
		return this.check(-1, 0) && ((getWorld().getInteractable(this.getX(), this.getY()+1))).canPushLeftD(i);
	}
	isWalkableLeft(i)
	{
		if(this.canPushLeftU(i) && this.canPushLeftD(i))
		{
			((getWorld().getInteractable(this.getX(), this.getY()-1))).isWalkableLeftU(i);
			((getWorld().getInteractable(this.getX(), this.getY()+1))).isWalkableLeftD(i);
			this.tryMoveLeft(new Action());
		}
		return false;
	}
	isWalkableLeftU(i)
	{
		((getWorld().getInteractable(this.getX(), this.getY()-1))).isWalkableLeftU(i);
		this.tryMoveLeft(new Action());
		return false;
	}
	isWalkableLeftD(i)
	{
		((getWorld().getInteractable(this.getX(), this.getY()+1))).isWalkableLeftD(i);
		this.tryMoveLeft(new Action());
		return false;
	}
	canPushRightU(i)
	{
		return this.check(1, 0) && ((getWorld().getInteractable(this.getX(), this.getY()-1))).canPushRightU(i);
	}
	canPushRightD(i)
	{
		return this.check(1, 0) && ((getWorld().getInteractable(this.getX(), this.getY()+1))).canPushRightD(i);
	}
	isWalkableRight(i)
	{
		if(this.canPushRightU(i) && this.canPushRightD(i))
		{
			((getWorld().getInteractable(this.getX(), this.getY()-1))).isWalkableRightU(i);
			((getWorld().getInteractable(this.getX(), this.getY()+1))).isWalkableRightD(i);
			this.tryMoveRight(new Action());
		}
		return false;
	}
	isWalkableRightU(i)
	{
		((getWorld().getInteractable(this.getX(), this.getY()-1))).isWalkableRightU(i);
		this.tryMoveRight(new Action());
		return false;
	}
	isWalkableRightD(i)
	{
		((getWorld().getInteractable(this.getX(), this.getY()+1))).isWalkableRightD(i);
		this.tryMoveRight(new Action());
		return false;
	}
	
	check(dx, dy)
	{
		if(this.onFire)
			return false;
		return getWorld().getInteractable(this.getX()+dx, this.getY()+dy) == null && getWorld().getWalkable(this.getX()+dx, this.getY()+dy) != null && getWorld().getWalkable(this.getX()+dx, this.getY()+dy).isWalkable(this);
	}
	getFlame()
	{
		return this.flame;
	}
	setOnFire(a)
	{
		if(a == null)
			a = new Action();
		if(this.onFire)
			return;
		this.flame = new Decoration("Fire.gif");
		this.flame.setX(this.getX());
		this.flame.setY(this.getY());
		this.flame.isTopLayer = true;
		const l = this;
		getWorld().addDecoration(this.flame);
		this.onFire = true;
		getWorld().playSound("flame.mp3", new Action());
		setTimeout(()=>{this.onTimeout(l, a);}, 500);
	}
	onTimeout(l, a)
	{
		if(getWorld().getInteractable(this.getX(),this.getY())==l)
		{
			for(var i = -1; i <= 1; i++)
				for(var j = -1; j <= 1; j++)
					if(Math.abs(i+j)== 1)
					{
						var o = getWorld().getInteractable(this.getX()+i, this.getY()+j);
						if(o != null && o.className.startsWith("Log-"))
							(o).setOnFire();
						
					}
			a.start();
		}
	}
}
class LogH extends Log
{
	constructor(parent)
	{
		super(parent);
		this.setSprite("logh.png");
		this.className = "Log-Horizontal";
	}
	makeCopy(parent)
	{
		return new LogH(parent);
	}
	isWalkableLeft(i)
	{
		return false;
	}
	isWalkableRight(i)
	{
		return false;
	}
}
class LogV extends Log
{
	constructor(parent)
	{
		super(parent);
		this.setSprite("logv.png");
		this.className = "Log-Vertical";
	}
	makeCopy(parent)
	{
		return new LogV(parent);
	}
	isWalkableUp(i)
	{
		return false;
	}
	isWalkableDown(i)
	{
		return false;
	}
}
class LogRight extends Log
{
	constructor(parent)
	{
		super(parent);
		this.setSprite("logright.png");
		this.className = "Log-Right";
	}
	makeCopy()
	{
		return new LogRight();
	}
	canPushUpR(i)
	{
		return this.check(0, -1);
	}
	isWalkableUpR(i)
	{
		this.tryMoveUp(new Action());
		return false;
	}
	canPushDownR(i)
	{
		return this.check(0, 1);
	}
	isWalkableDownR(i)
	{
		this.tryMoveDown(new Action());
		return false;
	}
	isWalkableLeft(i)
	{
		return false;
	}
	isWalkableRight(i)
	{
		return false;
	}
	isWalkableUp(i)
	{
		if(this.canPushUpL(i))
		{
			((getWorld().getInteractable(this.getX()-1,this.getY()))).isWalkableUpL(i);
			this.tryMoveUp(new Action());
		}
		return false;
	}
	isWalkableDown(i)
	{
		if(this.canPushDownL(i))
		{
			((getWorld().getInteractable(this.getX()-1, this.getY()))).isWalkableDownL(i);
			this.tryMoveDown(new Action());
		}
		return false;
	}
}
class LogTop extends Log
{
	constructor(parent)
	{
		super(parent);
		this.setSprite("logtop.png");
		this.className = "Log-Top";
	}
	makeCopy(parent)
	{
		return new LogTop(parent);
	}
	canPushLeftU(i)
	{
		return this.check(-1, 0);
	}
	isWalkableLeftU(i)
	{
		this.tryMoveLeft(new Action());
		return false;
	}
	canPushRightU(i)
	{
		return this.check(1, 0);
	}
	isWalkableRightU(i)
	{
		this.tryMoveRight(new Action());
		return false;
	}
	isWalkableUp(i)
	{
		return false;
	}
	isWalkableDown(i)
	{
		return false;
	}
	isWalkableLeft(i)
	{
		if(this.canPushLeftD(i))
		{
			((getWorld().getInteractable(this.getX(), this.getY()+1))).isWalkableLeftD(i);
			this.tryMoveLeft(new Action());
		}
		return false;
	}
	isWalkableRight(i)
	{
		if(this.canPushRightD(i))
		{
			((getWorld().getInteractable(this.getX(), this.getY()+1))).isWalkableRightD(i);
			this.tryMoveRight(new Action());
		}
		return false;
	}
}
class LogBottom extends Log
{
	constructor(parent)
	{
		super(parent);
		this.setSprite("logbottom.png");
		this.className = "Log-Bottom";
	}
	makeCopy(parent)
	{
		return new LogBottom(parent);
	}
	canPushLeftD(i)
	{
		return this.check(-1, 0);
	}
	isWalkableLeftD(i)
	{
		this.tryMoveLeft(new Action());
		return false;
	}
	canPushRightD(i)
	{
		return this.check(1, 0);
	}
	isWalkableRightD(i)
	{
		this.tryMoveRight(new Action());
		return false;
	}
	isWalkableUp(i)
	{
		return false;
	}
	isWalkableDown(i)
	{
		return false;
	}
	isWalkableLeft(i)
	{
		if(this.canPushLeftU(i))
		{
			((getWorld().getInteractable(this.getX(), this.getY()-1))).isWalkableLeftU(i);
			this.tryMoveLeft(new Action());
		}
		return false;
	}
	isWalkableRight(i)
	{
		if(this.canPushRightU(i))
		{
			((getWorld().getInteractable(this.getX(), this.getY()-1))).isWalkableRightU(i);
			this.tryMoveRight(new Action());
		}
		return false;
	}
}
class LogLeft extends Log
{
	constructor(parent)
	{
		super(parent);
		this.setSprite("logleft.png");
		this.className = "Log-Left";
	}
	makeCopy(parent)
	{
		return new LogLeft(parent);
	}
	canPushUpL(i)
	{
		return this.check(0, -1);
	}
	isWalkableUpL(i)
	{
		this.tryMoveUp(new Action());
		return false;
	}
	canPushDownL(i)
	{
		return this.check(0, 1);
	}
	isWalkableDownL(i)
	{
		this.tryMoveDown(new Action());
		return false;
	}
	isWalkableLeft(i)
	{
		return false;
	}
	isWalkableRight(i)
	{
		return false;
	}
	isWalkableUp(i)
	{
		if(this.canPushUpR(i))
		{
			((getWorld().getInteractable(this.getX()+1, this.getY()))).isWalkableUpR(i);
			this.tryMoveUp(new Action());
		}
		return false;
	}
	isWalkableDown(i)
	{
		if(this.canPushDownR(i))
		{
			((getWorld().getInteractable(this.getX()+1, this.getY()))).isWalkableDownR(i);
			this.tryMoveDown(new Action());
		}
		return false;
	}
}


class LogLighter extends Log
{
	constructor(parent)
	{
		super(parent);
		this.setSprite("loglighter.png");
		this.className = "Log-Lighter";
	}
	makeCopy(parent)
	{
		return new LogLighter(parent);
	}
	isWalkableLeft(i)
	{
		return false;
	}
	isWalkableRight(i)
	{
		return false;
	}
	isWalkableUp(i)
	{
		return false;
	}
	isWalkableDown(i)
	{
		return false;
	}
	onInteract(i)
	{
		this.setOnFire();
	}
}
class Stump extends Log
{
	constructor(parent)
	{
		super(parent);
		this.setSprite("stump.png");
		this.className = "Log-Stump"
	}
	makeCopy(parent)
	{
		return new Stump(parent);
	}
	isWalkableLeft(i)
	{
		return false;
	}
	isWalkableRight(i)
	{
		return false;
	}
	isWalkableUp(i)
	{
		return false;
	}
	isWalkableDown(i)
	{
		return false;
	}
	setOnFire()
	{
		super.setOnFire(new Action((o)=>{getWorld().remove(this);getWorld().remove(this.getFlame()); o.start();}));
	}
}









ObjectList = [new Decoration("sample.png", null), new Base(null), new Wall(null), new Ice(null), new LoadNew(null), new Memory(null), new Charact(null), new End(null), new Boulder(null), new IcicleNPC(null), new CastleStone(null), new CastleGate(null), new Lava(null), new Platform(null), new TeleportPad(null), new MovePad(null), new PanelRotater(null), new Log(null), new LogH(null), new LogV(null), new LogRight(null), new LogLeft(null), new LogTop(null), new LogBottom(null), new LogLighter(null), new Stump(null)]; 
