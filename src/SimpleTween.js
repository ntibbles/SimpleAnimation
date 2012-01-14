/**
* SimpleTween
* A JavaScript solution to animate any single
* enumerable CSS property
* 
* Copyright (c) 2011 Noel Tibbles (noel.tibbles.ca)
* 
* Version 0.461b
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
		this.useJS = options.useJS || true; // flag to use use js
		
		// private properties
		this._css = false;
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
	
		// check for options
		if(options) {
			this._trigger =  options.trigger || {};
			this._ease = options.ease || Easing.linear;
			this._delay =  options.delay || 0;
			this._callback =  options.callback || null;
			this.isPaused = options.pause || false;
			this.data = options.data || {};
		}
		
		// private methods
		/**
		 * @private
		 * _setProps
		 * Sets all the props we're tweening in the changeProps array.
		 * For curVal, test to see if we can tween it, if not, use the value
		 * If there's an extension, adjust properties as needed.
		 * @param {Object} o - The object with the properties we're tweening
		 */
		this._setAllJSProps = function(o) {
			var styles = SimpleTween._getCurrentStyle(this.target);
			
			for(prop in o) {
				var curVal = styles[prop] || "0",	
					args = {
						start : Number(curVal.replace(/[A-Za-z$]/g, "")),
						prop : SimpleTween.supports(prop),
						end : o[prop],
						val : SimpleTween._getPropValue(prop)
					};
					
				if(SimpleTween.supports(prop)) {
					if(prop == "transform"){
						var vals = [];
						
						for(key in o[prop]) {
							vals.push(key + SimpleTween._getPropValue(key)); 
							// prepend the matrix if transforming
							args.val = (styles[args.prop] == "none") ? vals.join(" ") : styles[args.prop] +" "+ vals.join(" ");
							args.end = o[prop][key];
						}
					};
				} else {
					//Test failed, check for IE filters
					if(prop == "opacity") {
						args.prop = "filter";
						args.val = "alpha(opacity=%n%)";
						args.multiplier = 100;
						args.start = args.start * args.multiplier;
						args.end = args.end * args.multiplier;
					};
				};
				this._setProp(args);
			};
		};
		
		this._setAllCSSProps = function(o) {
			var styles = SimpleTween._getCurrentStyle(this.target),
				args = {},
				transProps = [];
				
				for(prop in o) {
					var normalizedName = SimpleTween.supports(prop);
					transProps.push(normalizedName);
					args.start = 0;
					args.prop = normalizedName;
					args.end = o[prop];
					args.val = SimpleTween._getPropValue(prop);
					
					this._setProp(args);
				};
				
				this.target.style[SimpleTween.supports('transitionProperty')] = transProps.join(",");
				this.target.style[SimpleTween.supports('transitionDuration')] = String(this._duration) + "s";
				this.target.style[SimpleTween.supports('transitionTimingFunction')] = "cubic-bezier(0.175, 0.885, 0.320, 1.275)";
		};
		
		this._startCSS = function() {
				for(prop in this._changeProps) {
					//console.log("name: ", prop," value: ",this._changeProps[prop]);
					var p = this._changeProps[prop];
					this.target.style[prop] = p.val.replace("%n%", p.end);
				}
		}
		
		/**
		 * _setProp
		 * Sets the individual variables on a property and
		 * sets the triggers
		 * @param {Object} args - The properties to set
		 * 		expects: start and end, optional multi and val
		 */
		this._setProp = function(args) { 
			this._changeProps[args.prop] = {
				start : args.start,
				end : args.end,
				change : args.end - args.start,
				multiplier : args.multi || 1,
				isForward : (args.start < args.end) ? true : false,
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
	
	SimpleTween.VERSION = "0.461b";
	SimpleTween.TWEENS = [];
	SimpleTween._extensions =[];
	
	var p = SimpleTween.prototype;
		// public properties
		p.target = null;
		p.isPlaying = false;
		p.isComplete = false;
		p.uid = 0;
		p.data = {};
		SimpleSynchro = window.SimpleSynchro;
	
	/**
	 * initialize
	 * Initializes the SimpleTween
	 * @param {Object} obj - The target object to animate
	 * @param {Object} props - The props to set 
	 */
	p.initialize = function(obj, props) {
		this.target = obj;
		this._css = SimpleTween.supports("transition");
		if(this._css && !this.useJS) {
			this._setAllCSSProps(props);
		} else {
			this._setAllJSProps(props);
		}
		
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
		if(prop.isForward) { 
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
		if(!this._css || this.useJS) {
			//console.log("play");
			this._time = SimpleSynchro.getTime() + this._delay;
		} else {
			this._startCSS();
		}
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
	 * Gets the total elapsed time this animation has run
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
	 * Modified from:
	 * Jeffrey Way
	 * http://net.tutsplus.com/tutorials/html-css-techniques/quick-tip-detect-css-support-in-browsers-with-javascript/
	 */
	SimpleTween.supports = (function() {  
		var el = document.createElement("div"), 
			vendors = 'Webkit ms o Moz'.split(' ');
		
		return function(prop) {
			if( prop in el.style) {
				return prop;
			}
			
			prop = prop.replace(/^[a-z]/, function(val) {
				return val.toUpperCase();
			});
			
			for(var i = 0, len = vendors.length; i < len; i++){
				if(vendors[i] + prop in el.style) {
					return vendors[i] + prop;
				}
			}
			return false;
		};
	}());
	
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
	
	
	SimpleTween._getPropValue = function(prop) {
		switch(prop) {
			case "opacity":
				return "%n%";
				break;
			case "skew":
			case "rotate":
				return "(%n%deg)";
				break;
			case "scale":
				return "(%n%)";
				break;
			default:
				return "%n%px";
		}
	};
	
	window.SimpleTween = SimpleTween;
}(window, document, undefined))