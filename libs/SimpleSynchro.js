/**
* SimpleSynchro
* A JavaScript solution to control a single
* event and synchronize all listeners.
* 
* Version 0.4b
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
	
	SimpleSynchro.VERSION = "0.4b";
	
	SimpleSynchro = function() {
		throw "SimpleSynchro can not be instantiated.";
	}
	
	SimpleSynchro._listeners = [];
	SimpleSynchro._init = false;
	SimpleSynchro._startTime = 0;
	SimpleSynchro.FPS = 100;
	
	SimpleSynchro.addListener = function(o) {
		if (!SimpleSynchro._init) {
			SimpleSynchro._init = true;
			requestAnimFrame(SimpleSynchro._tick);
		}
		SimpleSynchro.removeListener(o);
		SimpleSynchro._listeners.push(o);
	};
	
	
	SimpleSynchro.removeListener = function(o) {
		if (SimpleSynchro._listeners == []) { return; }
		var index = SimpleSynchro._listeners.indexOf(o);

		if (index != -1) {
			SimpleSynchro._listeners.splice(index, 1);
		}
	};
	
	SimpleSynchro.removeAllListeners = function() {
		SimpleSynchro._listeners = [];
	};
	
	SimpleSynchro.getTime = function() {
		return (SimpleSynchro._getTime() - SimpleSynchro._startTime) / 1000;
	};
	
	SimpleSynchro.toString = function() {
		return "[object SimpleSynchro]";
	};
	
	SimpleSynchro._getTime = function() {
		return new Date().getTime();
	};
	SimpleSynchro._startTime = SimpleSynchro._getTime();
		
	SimpleSynchro._tick = function() {
		var time = SimpleSynchro.getTime(),
			len = SimpleSynchro._listeners.length;
			
		while(len--){
			SimpleSynchro._listeners[len].tick(time);
		};
		
		requestAnimFrame(SimpleSynchro._tick);
	};
	
	window.SimpleSynchro = SimpleSynchro;
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