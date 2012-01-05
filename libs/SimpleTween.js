/**
* SimpleTween
* A JavaScript solution to animate any single
* enumerable CSS property
* 
* Copyright (c) 2011 Noel Tibbles (noel.tibbles.ca)
* 
* Version 0.42b
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
	
	SimpleTween = function(obj, duration, props, vars) {
		if(!SimpleSynchro) throw "The SimpleSynchro.js script is required to run SimpleTween";
		
		this.isPaused = false;
		
		// private properties
		this._plugin = null;
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
		this._suffix = "px";
		
		// check for vars
		if(vars) {
			this._trigger =  vars.trigger || {};
			this._ease = vars.ease || Easing.linear;
			this._delay =  vars.delay || 0;
			this._callback =  vars.callback || null;
			this._suffix = vars.suffix || "px";
			this.isPaused = vars.pause || false;
		}
		
		
		// private methods
		/**
		 * @private
		 * _setProps
		 * Sets all the props we're tweening in the changeProps array.
		 * For speed, try and pre-calculate all positions.
		 * For the trigger, pre-calcuate the end.
		 * @param {Object} o - The object with the properties we're tweening
		 */
		this._setProps = function(o) {
			var styles = SimpleTween._getCurrentStyle(this.target);
			
			for(prop in o) {
				var curPos = SimpleTween._removeSuffix(styles[prop], this._getSuffix(prop));
				this._changeProps[prop] = {};
				this._changeProps[prop]["start"] = curPos;
				this._changeProps[prop]["end"] = o[prop]
				this._changeProps[prop]["change"] = o[prop] - curPos;
				for(tprop in this._trigger) {
					if(tprop === prop) {
						this._changeProps[prop]["trigger"] = this._trigger[tprop];
						this._triggers++;
						console.log("trigger: ", this._changeProps[prop]["trigger"]);
					}
				}
			}
			
			//console.log("changeProps: ", this._changeProps);
		};
		
		/**
		 * @private
		 * _setUID
		 * Sets a unique to the tween
		 */
		this._setUID = function() {
			var curUID = this.target.getAttribute("data-tweenId");
			if(curUID != null) SimpleSynchro.removeListener(SimpleTween.getTweenByUID(curUID).stop());

			this.uid = SimpleTween.TWEENS.push(this) - 1;
			this.target.setAttribute("data-tweenId", this.uid);
		};
		
		/**
		 * @private
		 * _getSuffix
		 * Gets the correct suffix for the corresponding property
		 * @param {String} prop - the property to get the suffix for.
		 * @returns {String} The suffix string
		 */
		this._getSuffix = function(prop) {
			return (prop !== "opacity") ? this._suffix : " ";
		};
		
		this.initialize(obj, props);
		
		// add to the SimpleSynchro
		SimpleSynchro.addListener(this);
		
		if(!this.isPaused) this.start();
	}
	
	SimpleTween.VERSION = "0.42b";
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
		this._setProps(props);
		this._setUID();
	};
	
	/**
	 * tick
	 * This is the method that's called from SimpleSynchro.
	 * It updates all the properties of the object and checks
	 * for completion and triggers
	 * @param {Number} time - Current time of the animation
	 */
	p.tick = function(time) {
		if(this.isPlaying && !this.isPaused) { 
			var elapsed = time - this._time - this._pausedTime.end;
			
			if(elapsed < 0) return;
				
			// set the position on each property
			for(prop in this._changeProps) {
				this.setProp(prop, this.getPosition(elapsed, this._changeProps[prop]));
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
	 * setProp
	 * Sets the property of the object and checks for the correct
	 * suffix of the property
	 * @param {String} prop - the property to tween
	 * @param {Number} p - the amount to tween
	 */
	p.setProp = function(prop, p){
		this.target.style[prop] = p + this._getSuffix(prop);
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
	 * destroy
	 * Stops the animation and removes all
	 * references from possible listeners
	 */
	p.destroy = function() {
		this.stop();
		this.target.removeAttribute("data-tweenId");
		SimpleSynchro.removeListener(this);
		SimpleTween.TWEENS.splice(this.uid, 1);
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
		if(this._callback && this._callback[evt]) this._callback[evt].call(this, {type:evt, tween: this});
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
	 * _removeSuffix
	 * Removes the suffix string from a value
	 * @param {String} value - the value to remove the suffix from
	 * @param {String} suffix - the suffix string to remove
	 */
	SimpleTween._removeSuffix = function(value, suffix) {
		return Number((value != '' && suffix != ' ') ? value.substring(0, value.indexOf(suffix)) : value);
	};
	
	window.SimpleTween = SimpleTween;
}(window, document, undefined))