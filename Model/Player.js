class Player extends Interactor {
	constructor(parent) {
		super(parent);
		this.openmenu = true;
		this.setSprite("hero.png", parent)
		this.className = "Player";
		this.ismovementEnabled = 0;
		this.goNorth = false;
		this.goSouth = false;
		this.goEast = false;
		this.goWest = false;
		this.lasttime = 0;
	}
	makeCopy(parent) {
		return new Player(parent);
	}
	movementEnabled() {
		return this.ismovementEnabled == 0;
	}
	disableMovement(next) {
		this.ismovementEnabled++;
		next.start();
	}
	enableMovement(next) {
		this.ismovementEnabled--;
		next.start();
	}
	enableMenu()
	{
		this.openmenu = true;
	}
	disableMenu()
	{
		this.openmenu = false;
	}
	checkUpdate(then)
	{
		if(this != getWorld().hero)
			return;
		if(Date.now() - this.lasttime < 100)
			return;
		if(!this.movementEnabled())
		{
			if(this.goNorth)
				getWorld().up();
			else if(this.goSouth)
				getWorld().down();
			else if(this.goWest)
				getWorld().left();
			else if(this.goEast)
				getWorld().right();
			return
		}
		else
		{
			this.setX(this.getX())
			this.setY(this.getY())
			this.lasttime = Date.now();
			if(this.goNorth)
			{
				this.setSprite("heroup.png");
				this.tryMoveUp(new Action());//o=>{this.checkUpdate(o)}));
			}
			else if(this.goSouth)
			{
				this.setSprite("herodown.png");
				this.tryMoveDown(new Action());//o=>{this.checkUpdate(o)}));
			}
			else if(this.goWest)
			{
				this.setSprite("heroleft.png");
				this.tryMoveLeft(new Action());//o=>{this.checkUpdate(o)}));
			}
			else if(this.goEast)
			{
				this.setSprite("heroright.png");
				this.tryMoveRight(new Action());//o=>{this.checkUpdate(o)}));
			}
		}
		then.start();
	}
	handleKey(key)
	{
		if(this.openmenu && (key == 8 || key == 27))
			getWorld().showMenu();
		if(key == 38)
			this.goNorth = true;
		else if(key == 40)
			this.goSouth = true;
		else if(key == 37)
			this.goWest = true;
		else if(key == 39)
			this.goEast = true;
		else if(key == 87)
			this.goNorth = true;
		else if(key == 83)
			this.goSouth = true;
		else if(key == 65)
			this.goWest = true;
		else if(key == 68)
			this.goEast = true;
		if(!this.movementEnabled())
		{
			if(key == 32)
				getWorld().handler.start();
			else if(key == 13)
				getWorld().handler.start();
		}
		else
		{
			if(key == 32)
				this.interact();
			else if(key == 13)
				this.interact();
		}
		this.checkUpdate(new Action());
	}
	handleKeyRelease(key)
	{
		if(key == 38)
			this.goNorth = false;
		else if(key == 40)
			this.goSouth = false;
		else if(key == 37)
			this.goWest = false;
		else if(key == 39)
			this.goEast = false;
		else if(key == 87)
			this.goNorth = false;
		else if(key == 83)
			this.goSouth = false;
		else if(key == 65)
			this.goWest = false;
		else if(key == 68)
			this.goEast = false;
	}
	tryMoveUp(then)
	{
		new Action(o=>{this.disableMovement(o)}).then(o=>{super.tryMoveUp(o)}).then(o=>{this.enableMovement(o)}).then(then).start();
	}
	tryMoveDown(then)
	{
		new Action(o=>{this.disableMovement(o)}).then(o=>{super.tryMoveDown(o)}).then(o=>{this.enableMovement(o)}).then(then).start();
	}
	tryMoveLeft(then)
	{
		new Action(o=>{this.disableMovement(o)}).then(o=>{super.tryMoveLeft(o)}).then(o=>{this.enableMovement(o)}).then(then).start();
	}
	tryMoveRight(then)
	{
		new Action(o=>{this.disableMovement(o)}).then(o=>{super.tryMoveRight(o)}).then(o=>{this.enableMovement(o)}).then(then).start();
	}
}
