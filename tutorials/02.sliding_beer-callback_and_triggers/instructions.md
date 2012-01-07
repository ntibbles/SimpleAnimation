# Moving an object

## Overview

This tutorial is an extension of tutorial 1, please refer to it if you have any problems following this tutorial.
In this tutorial you will be able to:

1. Create a callback object to handle tween events
2. Learn about the different events, trigger and to pause

All the parameters discussed below get passed into the SimpleTween as the last object, the options object. 

SimpleTween.to(document.getElementById("slidingBeer"), time, { left:500 }, { callback: cbHandler, trigger: { left:200, callback: triggerHandler }, pause:true });

## Let's Code!

Before you can handle any events it's important to create an object that will handle the events. In the code it's:

	var cbHandler = {};
	
You then need to add event handlers on the object. Below are all the events you can listen to, with pointers to the handling methods.

	cbHandler.onComplete = handleTweenComplete;
	cbHandler.onStart = handleTweenStart;
	cbHandler.onStop = handleTweenStop;
	cbHandler.onPause = handleTweenPause;
	cbHandler.onResume = handleTweenResume;

### Events

The events that are dispatched are:

+ onComplete
+ onStart
+ onStop
+ onPause
+ onResume

When you recieve an event, you'll get an argument as an object with the event type (evt) and the tween (tween).
You could then use this data for further tweens or any other operations you need to do.

The syntax for a callback is:

	{ callback: cbHandler }

### Triggers

Triggers are a little different. They have two required parameters:

1. value - The value you want to trigger on
2. callback - The method to call when the trigger is activated

The syntax for a trigger is similar to a callback:

	trigger: { left:200, callback: triggerHandler }

### Pause

If the pause attribute isn't passed the tween will start as soon as it's instanciated. To prevent this behaviour, we can set the pause flag.

	pause:true
	
When you want to start the tween, you MUST call the start() method on the tween.

That's it!

Check out the demos for more complex examples.


 