# SimpleAnimation

## Overview

The SimpleAnimation library is designed to make complex JavaScript animations, simple. It's syntax is inspired from TweenLite (as AS3 library), but that's where the similarity ends.

The SimpleAnimation library is currently separated into 3 parts:

+ SimpleSynchro
+ SimpleTween 
+ SimpleTimeline. 

Below are descriptions of what each script does and some basic usage examples.

## SimpleSynchro

SimpleSynchro is REQUIRED for any other script. It's the main timer for all animations and timelines. You don't need to initialise SimpleSynchro, it will initialise as soon as any tween or timeline is added to the page.

### usage
	&lt;script type="text/javascript" src="libs/SimpleSynchro.js"&gt;

Just include it your page and you're done.

## SimpleTween

SimpleTween is the main script of the library. It's used to animate any enumerable property of an element. The most common usage is to move an element across the screen or change the width or height of an element.

### usage

To move an element with the id of 'sqA' left 100px in 2 seconds;

	SimpleTween.to(document.getElementById('sqA'), 2, {left: 100);

Move an element with easing, delay and multiple callbacks. (See the demos for examples).

	SimpleTween.to(document.getElementById('sqA'), 2, {left: 100, top:100, width: 200, height:200}, {delay:1, callback: cbHandler, ease: Easing.elasticEaseOut, pause:true});

## SimpleTimeline

SimpleTimeline is used to sequence multiple SimpleTweens. With SimpleTimeline you can sequence animations and then change the timing of the animation without impacting the events to follow.

### usage 

	var timeline, tween1, tween2, tween3, cbHandler = {};
			
	tween1 = SimpleTween.to(document.getElementById('sqA'), 2, {width: 180, height:100}, {callback: cbHandler, trigger: {callback: triggerHandler, width: 90}, ease: Easing.backEaseOut});
	cbHandler.onComplete = handleTweenComplete;
	cbHandler.onStart = handleTweenStart;
	cbHandler.onStop = handleTweenStop;
			
	tween2 = SimpleTween.to(document.getElementById('sqB'), 1, {width: 300}, {ease: Easing.backEaseOut});
	tween3 = SimpleTween.to(document.getElementById('sqC'), 1, {top: 10, left:200}, {ease: Easing.strongEaseOut});
			
	timeline = new SimpleTimeline();
	timeline.addTween(tween1, 0);
	timeline.addTween(tween2, 0);
	timeline.addTween(tween3, 2);