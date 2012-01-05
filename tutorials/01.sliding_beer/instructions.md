# Moving an object

## Overview

In this tutorial you will learn how tween the simplest way using SimpleTween.
You will be able to:

1. Create the basic template for SimpleTween
2. Learn the basic styles for the tweened element
3. Code a SimpleTween with the least syntax

## Let's Code!

First thing that's needed to tween is an HTML file with all the assets required to tween an element.
In the index.html you'll notice a couple of key areas I've added comments to. They are:

+ Styles in the head
+ Included scripts
+ Javascript syntax to instanciate a SimpleTween

### Styles

The most important part for the style of the element is that it MUST be positioned either absolutely or relatively.
If it's not positioned, it won't work. period.
In the index.html you'll notice the following code:

	img { position: absolute; top:20px; left:20px; }

This simply positions the image absolutely and adds 20px of padding.

### Scripts

The scripts that are REQUIRED are the SimpleSynchro and SimpleTween.
The SimpleSynchro is used to create a global timer all SimpleScripts march to. If you accidentally leave in a page, don't worry, it doesn't initialize until a tween or timeline is added to the page.

Here's the code that required:

	<script type="text/javascript" src="../../libs/SimpleSynchro.js"></script>
	<script type="text/javascript" src="../../libs/SimpleTween.js"></script>

Make sure the paths are set for your directory structure.

### Syntax

Here's the most basic syntax you'll need to get up and running:

	SimpleTween.to(document.getElementById("slidingBeer"), 2, { left:500 });

Here's the breakdown of what's happening. 

1. Get the element we want to tween: document.getElementById("slidingBeer")
2. How long do we want to take to move it: 2
3. How far do we want to move it: { left:500 }

That's it!

Check out the demos for more complex examples.


 