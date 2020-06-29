startlevel = "end";
function setWorld()
{
	var scene = d3.select("svg");
	document.addEventListener("keydown", (event)=>
	{
		getWorld().hero.handleKey(event.keyCode);
	})
	document.addEventListener("keydown", (event)=>
	{
		getWorld().hero.handleKeyRelease(event.keyCode);
	});
	var world = getWorld();
	world.load(startlevel, () => 
	{
		getWorld().loadsave(()=>
		{
			getWorld().enablesaves = true;
			getWorld().showMenu();
			getWorld().showMainMenu();
		});
	});
}

setWorld();
