/**
* SimpleTween
* A JavaScript solution to animate any single
* enumerable CSS property
* 
* Copyright (c) 2011 Noel Tibbles (noel.tibbles.ca)
* 
* Version 0.44b
* 
* usage:
* SimpleTween.to(document.getElementById('sqA'), 2, {left: 100, top:100, width: 200, height:200}, {callback: cbHandler, ease: Easing.elasticEaseOut, pause:true});
* 
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>
**/

(function(window, document, undefined){
	/**
	 * Checks if an Easing object exists and 
	 * sets the default easing if not.
	 */
	if(!window.Easing) {
		Easing = {
			linear : function (t, b, c, d) { 
				return c*t/d + b; 
			}
		};
	};
	
	SimpleTween = function(obj, duration, props, options) {
		if(!SimpleSynchro) throw "The SimpleSynchro.js script is required to run SimpleTween";
		
		this.isPaused = false;
		
		// private properties
		this._time = 0;
		this._duration = duration;
		this._curTime = 0;
		this._elapsedTime = 0;
		this._pausedTime = {
			start: 0,
			end: 0
		};
		this._totalTime = 0;
		this._changeProps = {};
		this._triggers = 0;
		this._ease = Easing.linear;
		this._trigger = {};
		this._delay = 0;
		this._callback = null;
		
		// add the opacity_extension
		var opacity = {
			name: "opacity", 					// CSS name
			alts: ["opacity","filter"],			// alternate name for browsers
			val : ["%n%", "alpha(opacity=%n%)"],// string value
			multiplier: [1, 100] 				// multiplier of value (optional)
		}
		SimpleTween.registerExtension(opacity);
		
		// check for options
		if(options) {
			this._trigger =  options.trigger || {};
			this._ease = options.ease || Easing.linear;
			this._delay =  options.delay || 0;
			this._callback =  options.callback || null;
			this.isPaused = options.pause || false;
		}
		
		// private methods
		/**
		 * @private
		 * _setProps
		 * Sets all the props we're tweening in the changeProps array.
		 * If there's an extension, adjust properties as needed
		 * @param {Object} o - The object with the properties we're tweening
		 */
		this._setAllProps = function(o) {
			var styles = SimpleTween._getCurrentStyle(this.target);
			
			for(prop in o) {
				var ext = SimpleTween._getExtension(prop),
					curVal = (SimpleTween._test(prop)) ? styles[prop].replace(/[A-Za-z$-]/g, "") : styles[ext.alts].replace(/[(=A-Za-z$-)]/g, ""),
					args = {
						start: Number(curVal),
						prop: prop,
						end: o[prop]
					};
				
				if(ext) {
					var multi =  ext.multiplier || 1;
							
					if(ext.alts == "filter") {
						// @FIXME need to get the value from ANY filter in IE
						// try and get the current value of the opacity from IE
						try { args.start = o.filters.alpha.opacity } catch(e) {};
					};
					if(ext.multiplier) {
						args.start = args.start/ext.multiplier;
					};
					args.prop = ext.alts;
					args.val = ext.val;
					args.multi = multi;
				};
				
				this._setProp(args);
			};
		};
		
		/**
		 * _setProp
		 * Sets the individual variables on a property and
		 * sets the triggers
		 * @param {String} prop - The property to set
		 * @param {Number} start - The start position of the prop
		 * @param {Number} end - The end position of the prop
		 */
		this._setProp = function(args) { 
			this._changeProps[args.prop] = {
				start : args.start,
				end : args.end,
				change : args.end - args.start,
				multiplier : args.multi || 1,
				val : args.val || "%n%px"
			};

			for(tprop in this._trigger) {
				if(tprop === prop) {
					this._changeProps[prop]["trigger"] = this._trigger[tprop];
					this._triggers++;
				}
			};
		};
		
		/**
		 * @private
		 * _setUID
		 * Sets a unique to the tween
		 */
		this._setUID = function() {
			var curUID = this.target.getAttribute("data-tweenId");
			if(curUID != null) {
				SimpleSynchro.removeListener(SimpleTween.getTweenByUID(curUID).stop());
			}

			this.uid = SimpleTween.TWEENS.push(this) - 1;
			this.target.setAttribute("data-tweenId", this.uid);
		};
		
		this.initialize(obj, props);
		
		// add to the SimpleSynchro
		SimpleSynchro.addListener(this);
		
		if(!this.isPaused) this.start();
	}
	
	SimpleTween.VERSION = "0.44b";
	SimpleTween.TWEENS = [];
	
	var p = SimpleTween.prototype;
		// public properties
		p.target = null;
		p.isPlaying = false;
		p.isComplete = false;
		p.uid = 0;
		SimpleSynchro = window.SimpleSynchro;
	
	/**
	 * initialize
	 * Initializes the SimpleTween
	 * @param {Object} obj - The target object to animate
	 * @param {Object} props - The props to set 
	 */
	p.initialize = function(obj, props) {
		this.target = obj;
		this._setAllProps(props);
		this._setUID();
	};
	
	/**
	 * tick
	 * This is the method that's called from SimpleSynchro.
	 * It updates all the properties of the object and checks
	 * for completion
	 * @param {Number} time - Current time of the animation
	 */
	p.tick = function(time) {
		if(this.isPlaying && !this.isPaused) { 
			var elapsed = time - this._time - this._pausedTime.end;
			
			if(elapsed < 0) return;
				
			// set the position on each property
			for(prop in this._changeProps) {
				var p = this._changeProps[prop];
				this.target.style[prop] = p.val.replace("%n%", (this.getPosition(elapsed, p)*p.multiplier));
			}
			
			if(elapsed > this._duration) {
				this.isPlaying = false;
				this.isComplete = true;
				this.target.removeAttribute("data-tweenId");
				this.dispatch("onComplete");
			}
		}
	};
	
	/**
	 * delay
	 * Delays the start of the tween.
	 * @param {Number} value - the time to delay the tween in seconds
	 */
	p.delay = function(value) {
		this._delay = value || 0;
		return this;
	};
	
	/**
	 * callback
	 * Sets the callback object for the tween
	 * @param {Object} obj - the object that has the listeners
	 */
	p.callback = function(obj) {
		this._callback = obj || null;
		return this;
	};
	
	/**
	 * getPosition
	 * Gets the current positon (or value) of the object.
	 * Checks for a trigger and decrements the precalculated number.
	 * @param {Number} t - the time (used for easing)
	 * @param {Object} prop - the prop object with the start, change and trigger values
	 */
	p.getPosition = function(t, prop){
		var pos = Math.round(this._ease(t, prop.start, prop.change, this._duration)*100)/100;
		
		if(prop.trigger && this.checkTrigger(pos, prop)) {
			this._triggers--;
			if(this._triggers == 0) {
				this._trigger.callback.call(this, {target: this.target});
			}
			prop.trigger = null;
		}
		
		return pos;
	};
	
	/**
	 * checkTrigger
	 * Checks the current position against the trigger
	 * position.
	 * @param {Number} pos - the position to check against
	 * @param {Object} prop - the property object
	 * @returns {Boolean} true if we're past the trigger point, otherwise false
	 */
	p.checkTrigger = function(pos, prop) {
		if(prop.start < prop.end) { 
			if(pos > prop.trigger) return true;
		} else {
			if(pos < prop.trigger) return true;
		}
		return false;
	};
	
	/**
	 * start
	 * Starts the animation running
	 */
	p.start = function() {
		this._time = SimpleSynchro.getTime() + this._delay;
		this._totalTime = this._time + this._duration;
		this.isPlaying = true;
		this.isPaused = false;
		this.dispatch("onStart");
		
		return this;
	};
	
	/**
	 * stop
	 * Stops the current animation
	 */
	p.stop = function() {
		this.isPlaying = false;
		this.dispatch("onStop");
		
		return this;
	};
	
	/**
	 * pause
	 * Pauses the animation
	 */
	p.pause = function() {
		this.isPaused = !this.isPaused;
		if(this.isPaused) {
			this._pausedTime.start = SimpleSynchro.getTime() - this._time;
			this.dispatch("onPause");
		} else {
			this._pausedTime.end = (SimpleSynchro.getTime() - this._time) - this._pausedTime.start;
			this.dispatch("onResume");
		}
		
		return this;
	};
	
	/**
	 * dispatch
	 * Dispatchs the current state to the callback object.
	 * @param {String} evt - the event name to dispatch
	 */
	p.dispatch = function(evt) {
		if(this._callback && this._callback[evt]) {
			this._callback[evt].call(this, {type:evt, tween: this});
		}; 
	};
	
	/**
	 * getElapsedTime
	 * Gets the total elapsed time this aniamtion has run
	 */
	p.getElapsedTime = function() {
		return (SimpleSynchro.getTime() - this._time) - this._pausedTime.end;
	};
	
	/**
	 * toString
	 * @returns {String} the name and id of the tween
	 */
	p.toString = function() {
		return "[object SimpleTween "+ this.uid +"]";
	};
	
	// public static methods
	/**
	 * to
	 * A shortcut to instanciate SimpleTween
	 */
	SimpleTween.to = function(obj, duration, props, vars) {
		return new SimpleTween(obj, duration, props, vars);
	};
	
	/**
	 * getTweenByUID
	 * Gets a tween by it's UID
	 * @returns {SimpleTween} A SimpleTween object
	 */
	SimpleTween.getTweenByUID = function(uid) {
		 return SimpleTween.TWEENS[uid];
	};
	
	/**
	 * registerExtension
	 * Adds an extension to the SimpleTween._extensions array.
	 * Tests each parameter and splices out all the other options.
	 * Extensions are simply an object defining how the 
	 * css property value should be rendered.
	 * Checks if the extension exists and removes it if it does
	 * @param {Object} ext - the extension to add
	 * @return {Boolean} true if extension was added
	 */
	SimpleTween.registerExtension = function(ext) {
		if(typeof ext !== 'object' || ext.alts === undefined) {
			throw "Please register a valid extension";
		};
		SimpleTween.removeExtension(ext);
		
		for(var i = 0, len = ext.alts.length; i < len; i++){
			if(SimpleTween._test(ext.alts[i])) {
				var ext_name = ext.alts.splice(i, 1),
					ext_val = ext.val.splice(i, 1),
					ext_multi = (ext.multiplier !== undefined) ? ext.multiplier.splice(i, 1) : [1];
				ext.alts = ext_name[0];
				ext.val = ext_val[0];
				ext.multiplier = ext_multi[0];
				SimpleTween._extensions.push(ext);
				return true;
			} 
		}
		
		throw "All tests have failed. The browser doesn't support the '"+ext.name+"' extension";
	};
	
	/**
	 * removeExtension
	 * Removes the extension from the array
	 * @param {Object} ext - the extension to remove
	 * @return {Boolean} true if the extensions was removed, false for failure
	 */
	SimpleTween.removeExtension = function(ext) {
		if (SimpleTween._extensions == []) { return; }
		var index = SimpleTween._extensions.indexOf(ext);

		if (index != -1) {
			SimpleTween._extensions.splice(index, 1);
			return true;
		};
		
		return false;
	};

	
	// private static methods
	/**
	 * @private
	 * _getCurrentStyle
	 * Gets the current style of an object
	 * @param {Object} The object to get the style from
	 * @returns {String} A string with the current value
	 */
	SimpleTween._getCurrentStyle = function(obj) {
	  	var computedStyle;
	  	if (typeof obj.currentStyle != 'undefined') { 
	 		computedStyle = obj.currentStyle; 
		} else { 
	 		computedStyle = document.defaultView.getComputedStyle(obj, null); 
		};
	
	  	return computedStyle;
	};
	
	/**
	* @private
	* _getExtension
	* Checks for an extension by it's name and returns it or false
	* @param {String} name - the name to look for in the extensions array
	* @return {Boolean/Object} - false if it doesn't exist, the object if it does
	*/
	SimpleTween._getExtension = function(name) {
		for(var i = 0, len = SimpleTween._extensions.length; i < len; i++) {
			if(SimpleTween._extensions[i]['name'] == name) {
				return SimpleTween._extensions[i];
			}
		}

		return false;
	};

	/**
	 * test
	 * Tests the browser for a style.
	 * Known styles across browsers return the style.
	 * @param {String} style - the style to test for
	 * @return {String} The correct string for the corresponding style
	 */
	SimpleTween._test = function(style) {
		var test = document.body;
		if(typeof test.style[style] != "undefined") {
			return true;
		};
	};
	
	SimpleTween._extensions =[];
	
	window.SimpleTween = SimpleTween;
}(window, document, undefined))