/**
* SimpleSynchro
* A JavaScript solution to control a single
* event and synchronize all listeners.
* 
* Version 0.4b
* 
* usage:
* <script type="text/javascript" src="libs/SimpleSynchro.js"></script>
* 
* Copyright (c) 2011 Noel Tibbles (noel.tibbles.ca)
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
	// IE shim for array.indexOf
	if(!Array.prototype.indexOf){
	    Array.prototype.indexOf = function(obj){
	        for(var i=0; i<this.length; i++){
	            if(this[i]==obj){
	                return i;
	            }
	        }
	        return -1;
	    }
	}
	
	SimpleSynchro = function() {
		throw "SimpleSynchro can not be instantiated.";
	}
	
	SimpleSynchro.VERSION = "0.4b";
	
	/**
	 * @private
	 * Private array of listeners
	 * @type {array}
	 */
	SimpleSynchro._listeners = [];
	
	/**
	 * @private
	 * Private flag to identify if the 
	 * script has been initialized
	 * @type {boolean}
	 */
	
	SimpleSynchro._init = false;
	
	/**
	 * @private
	 * Private number of the time this 
	 * script was initialized
	 * @type {number}
	 */
	SimpleSynchro._startTime = 0;
	
	/**
	 * The interval time to use if we're using
	 * an setInterval
	 * @type {number}
	 */
	SimpleSynchro.FPS = 100;
	
	
	/**
	 * addListener
	 * Checks if the listener has already been added
	 * and removes it if it has.
	 * Adds the object to the listeners array
	 * @param {Object} Object to add
	 */
	SimpleSynchro.addListener = function(o) {
		if (!SimpleSynchro._init) {
			SimpleSynchro._init = true;
			requestAnimFrame(SimpleSynchro._tick);
		}
		SimpleSynchro.removeListener(o);
		SimpleSynchro._listeners.push(o);
	};
	
	/**
	 * removeListener
	 * Removes an object from the listener array.
	 * @param {Object} Object to be removed
	 */
	SimpleSynchro.removeListener = function(o) {
		if (SimpleSynchro._listeners == []) { return; }
		var index = SimpleSynchro._listeners.indexOf(o);

		if (index != -1) {
			SimpleSynchro._listeners.splice(index, 1);
		}
	};
	
	/**
	 * removeAllListeners
	 * Removes all the listeners from the listener array
	 */
	SimpleSynchro.removeAllListeners = function() {
		SimpleSynchro._listeners = [];
	};
	
	/**
	 * getTime
	 * Gets the current time.
	 * @return number in seconds
	 */
	SimpleSynchro.getTime = function() {
		return (SimpleSynchro._getTime() - SimpleSynchro._startTime) / 1000;
	};
	
	/**
	 * toString
	 * Gets the name of this object
	 * @return the name of this object
	 */
	SimpleSynchro.toString = function() {
		return "[object SimpleSynchro]";
	};
	
	/**
	 * @private
	 * _getTime
	 * Gets a new time
	 */
	SimpleSynchro._getTime = function() {
		return new Date().getTime();
	};
	SimpleSynchro._startTime = SimpleSynchro._getTime();
		
	/**
	 * @private
	 * _tick
	 * Dispatchs the tick event to all listeners
	 */
	SimpleSynchro._tick = function() {
		var time = SimpleSynchro.getTime(),
			len = SimpleSynchro._listeners.length;
			
		while(len--){
			SimpleSynchro._listeners[len].tick(time);
		};
		
		requestAnimFrame(SimpleSynchro._tick);
	};
	
	window.SimpleSynchro = SimpleSynchro;
	/*
	 * @private
	 */
	window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function(){
                window.setTimeout(SimpleSynchro._tick, 1000 / SimpleSynchro.FPS);
              };
    })();
	
}(window, document, undefined))