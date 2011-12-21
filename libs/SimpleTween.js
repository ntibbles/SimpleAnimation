/**
* SimpleTween
* A JavaScript solution to animate any single
* enumerable CSS property
* 
* Copyright (c) 2011 Noel Tibbles (noel.tibbles.ca)
* 
* Version 0.4b
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
					}
				}
			}
		};
		
		this._setUID = function() {
			var curUID = this.target.getAttribute("data-tweenId");
			if(curUID != null) SimpleSynchro.removeListener(SimpleTween.getTweenByUID(curUID).stop());

			this.uid = SimpleTween.TWEENS.push(this) - 1;
			this.target.setAttribute("data-tweenId", this.uid);
		};
		
		this._getSuffix = function(prop) {
			return (prop !== "opacity") ? this._suffix : " ";
		};
		
		this.initialize(obj, props);
		SimpleSynchro.addListener(this);
		
		if(!this.isPaused) this.start();
	}
	
	SimpleTween.VERSION = "0.4b";
	SimpleTween.TWEENS = [];
	
	var p = SimpleTween.prototype;
		// public properties
		p.target = null;
		p.isPlaying = false;
		p.isComplete = false;
		p.uid = 0;
		SimpleSynchro = window.SimpleSynchro;
	
	p.initialize = function(obj, props) {
		this.target = obj;
		this._setProps(props);
		this._setUID();
	};
	
	p.tick = function(time) {
		if(this.isPlaying && !this.isPaused) { 
			var elapsed = time - this._time - this._pausedTime.end;
			
			if(elapsed < 0) return;
				
			// set the position on each property
			for(prop in this._changeProps) {
				this.setPosition(prop, this.getPosition(elapsed, this._changeProps[prop]));
			}
			
			if(elapsed > this._duration) {
				this.isPlaying = false;
				this.isComplete = true;
				this.target.removeAttribute("data-tweenId");
				this.dispatch("onComplete");
			}
		}
	};
	
	p.delay = function(value) {
		this._delay = value || 0;
		return this;
	};
	
	p.setPosition = function(prop, p){
		this.target.style[prop] = p + this._getSuffix(prop);
	};
	
	p.callback = function(obj) {
		this._callback = obj || null;
		return this;
	};
	
	p.getPosition = function(t, prop){
		var pos = this._ease(t, prop.start, prop.change, this._duration);
	
		if(prop.trigger && this.checkTrigger(pos, prop)) {
			this._triggers--;
			if(this._triggers == 0) {
				this._trigger.callback.call(this, {target: this.target});
			}
			prop.trigger = null;
		}
		return pos;
	};
	
	p.checkTrigger = function(pos, prop) {
		if(prop.start < prop.end) { 
			if(pos > prop.trigger) return true;
		} else {
			if(pos < prop.trigger) return true;
		}
		return false;
	};
	
	p.start = function() {
		this._time = SimpleSynchro.getTime() + this._delay;
		this._totalTime = this._time + this._duration;
		this.isPlaying = true;
		this.isPaused = false;
		this.dispatch("onStart");
		
		return this;
	};
	
	p.stop = function() {
		this.isPlaying = false;
		this.dispatch("onStop");
		
		return this;
	};
	
	p.destroy = function() {
		this.stop();
		this.target.removeAttribute("data-tweenId");
		SimpleSynchro.removeListener(this);
		SimpleTween.TWEENS.splice(this.uid, 1);
	};
	
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
	
	p.dispatch = function(evt) {
		if(this._callback && this._callback[evt]) this._callback[evt].call(this, {type:evt, tween: this});
	};
	
	p.getElapsedTime = function() {
		return (SimpleSynchro.getTime() - this._time) - this._pausedTime.end;
	};
	
	p.toString = function() {
		return "[object SimpleTween "+ this.uid +"]";
	};
	
	// public static methods
	SimpleTween.to = function(obj, duration, props, vars) {
		return new SimpleTween(obj, duration, props, vars);
	};
	
	SimpleTween.getTweenByUID = function(uid) {
		 return SimpleTween.TWEENS[uid];
	};
	
	// private static methods
	SimpleTween._getCurrentStyle = function(obj) {
	  	var computedStyle;
	  	if (typeof obj.currentStyle != 'undefined') { 
	 		computedStyle = obj.currentStyle; 
		} else { 
	 		computedStyle = document.defaultView.getComputedStyle(obj, null); 
		};
	
	  	return computedStyle;
	};
	
	SimpleTween._removeSuffix = function(value, suffix) {
		return Number((value != '' && suffix != ' ') ? value.substring(0, value.indexOf(suffix)) : value);
	};
	
	window.SimpleTween = SimpleTween;
}(window, document, undefined))