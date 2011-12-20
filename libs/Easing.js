/**********************************************************************
TERMS OF USE - EASING EQUATIONS
Open source under the BSD License.
Copyright (c) 2001 Robert Penner
JavaScript version copyright (C) 2006 by Philippe Maegerman
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

   * Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.
   * Redistributions in binary form must reproduce the above
copyright notice, this list of conditions and the following disclaimer
in the documentation and/or other materials provided with the
distribution.
   * Neither the name of the author nor the names of contributors may
be used to endorse or promote products derived from this software
without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*****************************************/
Easing = {
	backEaseIn : function(t,b,c,d,a,p){
		if (s == undefined) var s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	
	backEaseOut : function(t,b,c,d,a,p){
		if (s == undefined) var s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	
	backEaseInOut : function(t,b,c,d,a,p){
		if (s == undefined) var s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	
	elasticEaseIn : function(t,b,c,d,a,p){
			if (t==0) return b;  
			if ((t/=d)==1) return b+c;  
			if (!p) p=d*.3;
			if (!a || a < Math.abs(c)) {
				a=c; var s=p/4;
			}
			else 
				var s = p/(2*Math.PI) * Math.asin (c/a);
			
			return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		
	},
	
	elasticEaseOut : function (t,b,c,d,a,p){
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
	},
	
	elasticEaseInOut : function (t,b,c,d,a,p){
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) var p=d*(.3*1.5);
		if (!a || a < Math.abs(c)) {var a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	
	bounceEaseOut : function(t,b,c,d){
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	
	bounceEaseIn : function(t,b,c,d){
		return c - Tween.bounceEaseOut (d-t, 0, c, d) + b;
	},
	
	bounceEaseInOut : function(t,b,c,d){
		if (t < d/2) return Tween.bounceEaseIn (t*2, 0, c, d) * .5 + b;
		else return Tween.bounceEaseOut (t*2-d, 0, c, d) * .5 + c*.5 + b;
	},
	
	strongEaseInOut : function(t,b,c,d){
		return c*(t/=d)*t*t*t*t + b;
	},
	
	regularEaseIn : function(t,b,c,d){
		return c*(t/=d)*t + b;
	},
	
	regularEaseOut : function(t,b,c,d){
		return -c *(t/=d)*(t-2) + b;
	},
	
	regularEaseInOut : function(t,b,c,d){
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	
	strongEaseIn : function(t,b,c,d){
		return c*(t/=d)*t*t*t*t + b;
	},
	
	strongEaseOut : function(t,b,c,d){
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	
	strongEaseInOut : function(t,b,c,d){
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	
	linear : function (t, b, c, d) { 
		return c*t/d + b; 
	}
}
