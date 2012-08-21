

window.Turtle = function(canvas){

	var slice = [].slice;

	var ctx = canvas.getContext("2d");
	var canvasWidth = canvas.width;
	var canvasHeight = canvas.height;
	ctx.lineCap = 'round';

	var T = this;

	var showTurtle = true;
	var defaultFg = '#fff';
	var defaultBg = '#222';
	var defaultWidth = '1';
	var origin = {
		x: Math.floor(canvasWidth / 2) + .5,
		y: Math.floor(canvasHeight / 2) + .5,
	};

	var penDown = true;
	var pos = {};
	var heading = 0;

	// convenience function
	function go(x,y){
		ctx.beginPath();
		ctx.moveTo(pos.x, pos.y);
		pos.x = x;
		pos.y = y;
		ctx.lineTo(pos.x, pos.y);
		if (penDown) {
			ctx.stroke();
		}
		trigger('move');
	}

	var q = (function(){	
		var funs = [];
		(function run(){
			if (funs.length > 0) {
				funs.shift()();
				setTimeout(run,0);
			} else {
				setTimeout(run, 200);
			}
		})();
		return function(fun){
			funs.push(fun);
		}
	})();

	function get(val){
		if (typeof val === 'function') { val = val(); }
		return val;
	}

	// ######################################################
	// event handlers
	var events = {};
	T.on = function(ev, handler){
		var handlers = events[ev];
		if (!handlers) { handlers = events[ev] = []; }
		handlers.push(handler);
	};
	function trigger(ev){
		var args = slice.call(arguments);
		args.shift();
		var handlers = events[ev];
		if (handlers) {
			for (var i=0; i<handlers.length; i++) {
				handlers[i].call(T, args);
			}
		}
	}

	// ######################################################
	// move forward, back, left, right
	T.fd = function(amount) {
		q(function(){
			amount = get(amount);
			var deltaX = Math.sin(heading) * -amount;
			var deltaY = Math.cos(heading) * -amount;
			go(pos.x + deltaX, pos.y + deltaY);
		});
		return T;
	};
	T.bk = function(amount) {
		q(function(){
			amount = -get(amount);
			var deltaX = Math.sin(heading) * -amount;
			var deltaY = Math.cos(heading) * -amount;
			go(pos.x + deltaX, pos.y + deltaY);
		});
		return T;
	};

	// ######################################################
	// move to absolute positions
	T.absXY = function(x, y){
		q(function(){
			x = get(x);
			y = get(y);
			go(origin.x+x, origin.y-y);
		});
		return T;
	};
	T.absX = function(x){
		q(function(){
			x = get(x);
			go(origin.x+x, pos.y);
		});
		return T;
	};
	T.absY = function(y){
		q(function(){
			y = get(y);
			go(pos.x, origin.y-y);
		});
		return T;
	};
	T.absHeading = function(deg){
		q(function(){
			deg = get(deg);
			heading = deg * (Math.PI/180);
			trigger('rotate');
		});
		return T;
	};

	// ######################################################
	// left turn, right turn
	T.rt = function(deg) {
		q(function(){
			deg = get(deg);
			var delta = deg * (Math.PI/180);
			heading -= delta;
			trigger('rotate');
		});
		return T;
	};
	T.lt = function(deg) {
		q(function(){
			deg = -get(deg);
			var delta = deg * (Math.PI/180);
			heading -= delta;
			trigger('rotate');
		});
		return T;
	};

	// ######################################################
	// pen up, pen down
	T.pu = function() {
		q(function(){
			penDown = false;
			trigger('pen');
		});
		return T;
	};
	T.pd = function() {
		q(function(){
			penDown = true;
			trigger('pen');
		});
		return T;
	};

	// ######################################################
	// misc
	T.fg = function(color) {
		q(function(){
			color = get(color);
			ctx.strokeStyle = color;
			trigger('color');
		});
		return T;
	};
	T.hide = function(){
		showTurtle = false;
		trigger('visibility');
		return T;
	};
	T.show = function(){
		showTurtle = true;
		trigger('visibility');
		return T;
	};
	T.width = function(width){
		q(function(){
			width = get(width);
			ctx.lineWidth = width;
		});
		return T;
	};
	T.bg = function(color) {
		q(function(){
			color = get(color);
			ctx.fillStyle = color;
		});
		return T;
	};
	T.clean = function(){
		q(function(){
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);
			ctx.fillRect(0, 0, canvasWidth, canvasHeight);
		});
		return T;
	};
	T.home = function(){
		q(function(){
			var pen = penDown;
			penDown = false;
			go(origin.x, origin.y);
			penDown = pen;
			heading = 0;
			trigger('rotate');
		});
		return T;
	};
	T.clear = function(){
		return T
		.clean()
		.home()
		.pd();
	};
	T.reset = T.init = function(){
		return T
		.fg(defaultFg)
		.bg(defaultBg)
		.width(defaultWidth)
		.show()
		.clear();
	};

	// ######################################################
	// loopers
	T.repeat = function(amount, fun){
		for (var i=0; i<amount; i++) {
			var result = fun.call(T, i);
			if (!result && result !== undefined) break;
		}
		return T;
	};
	T.forever = function(fun){
		var i = 0;
		while (true) {
			var result = fun.call(T, i);
			if (!result && result !== undefined) break;
			i++;
		}
		return T;
	};

	// ######################################################
	// misc getters
	T.async = {
		rand: function(lower, upper){
			return function(){
				if (upper === undefined) upper = lower, lower = 0;
				var diff = upper - lower;
				return Math.random() * diff + lower;
			};
		},
		x: function(){
			return function(){
				return pos.x - origin.x;
			};
		},
		y: function(){
			return function(){
				return pos.y - origin.y;
			};
		},
		tlX: function(){
			return function(){
				return pos.x; // from top left
			};
		},
		tlY: function(){
			return function(){
				return pos.y; // from top left
			};
		},
		heading: function(){
			return function(){
				return heading * (180/Math.PI);
			};
		},
		pen: function(){
			return function(){
				return penDown ? 'down' : 'up';
			};
		},
		fg: function(){
			return function(){
				return ctx.strokeStyle;
			};
		},
		bg: function(){
			return function(){
				return ctx.fillStyle;
			};
		},
		visibility: function(){
			return function(){
				return showTurtle;
			};
		}
	};

	// ######################################################
	// misc getters
	T.info = {};
	for (var m in T.async) {
		T.info[m] = T.async[m]();
	}

	// init this turtle
	T.init();
};





