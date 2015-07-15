function ScrollAnimator(params) {
	this.init(params);
}

ScrollAnimator.prototype = {
	init: function (params) {

		window.scroll(0, 0);

		this.scrollWrapper = params.scrollWrapper;
		this.scrollLock = false;
		this.calculated_scroll_y = 0;
		this.yPosition = 0;
		this.ease = 0.1;
		this.eased_scroll_y = 0;
		this.mouseDelta = 0;
		this.breakpoint = {};
		this.callback = params.callback;
		this.transforms;
		this.transformProperty;
		this.pinSpacer;
		
		// setter
		this.setter();

		// event listeners
		this.listener();

		this.generatePinSpacer();

		// start loop
		this.loop();

	},

	setter: function () {

		// set [breakpoint] elements
		var bpNodeList = document.querySelectorAll('[data-breakpoint]'),
			bpArrList = [].slice.call(bpNodeList);
		
		bpArrList.forEach(function (el, index) {

			var panelName = el.getAttribute('data-breakpoint');

			this.breakpoint[panelName] = {

				pos: {
					top: el.offsetTop,
					bottom: el.offsetTop + el.offsetHeight
				},

				callback: typeof this.callback[panelName] === "function" ? this.callback[panelName] : null,

				width: el.offsetWidth,

				height: el.offsetHeight,

				el: el

			};

		}.bind(this));

		// set vendor transforms
		this.transforms = ["transform", "msTransform", "webkitTransform", "mozTransform", "oTransform"];
		this.transformProperty = (function () {

			for (var i = 0; i < this.transforms.length; i++) {

				if (typeof document.body.style[this.transforms[i]] !== "undefined") {

					return this.transforms[i];

				}

			}

			return null;

		}.bind(this)());

		// position absolutely
		for(var name in this.breakpoint) {
			//this.breakpoint[name].el.style.position = 'absolute';
			this.breakpoint[name].el.style.top = this.breakpoint[name].pos.top + 'px';
			this.breakpoint[name].el.style.left = '0px';
		}

	},

	listener: function () {

		window.addEventListener("mousewheel", this.onMouseWheel.bind(this), false);
		window.addEventListener("DOMMouseScroll", this.onMouseWheel.bind(this), false);

	},

	onMouseWheel: function (e) {

		this.calculated_scroll_y = window.scrollY;

	},

	breakpointCallbackFinder: function () {

		for (var k in this.breakpoint) {

			var bp = this.breakpoint[k];

			if (Math.abs(this.calculated_scroll_y) >= bp.pos.top) {

				if (typeof bp.callback === "function") {

					bp.callback(this);

				}

			}

		}

	},

	loop: function () {

		this.eased_scroll_y += ( (this.calculated_scroll_y) - this.eased_scroll_y) * this.ease;

		//this.smoothScroll();

		this.breakpointCallbackFinder();

	    requestAnimationFrame(this.loop.bind(this));

	},

	smoothScroll: function () {

		this.scrollWrapper.style[this.transformProperty] = "translate3d(0px, " + this.eased_scroll_y + "px, 0px)";

	},

	getPercentage: function (a, b) {

		return (a / b) * 100;

	},

	generatePinSpacer: function () {

		var newDiv = document.createElement("div");
			newDiv.setAttribute("id", "pinSpacer");
			newDiv.style.height = "0px";

		this.scrollWrapper.insertBefore(newDiv, this.breakpoint['panel-1'].el);

		this.pinSpacer = newDiv;

	}

};

document.addEventListener('DOMContentLoaded', function(){ 

	var scrollAnimator = new ScrollAnimator({
		scrollWrapper: document.querySelector('.scrollWrap'),
		callback: {
			'panel-1': function (context) { 

				// cached element select
				var el = context.breakpoint['panel-1'].el,
					column = el.querySelector('.cat-column'),
					startPos = context.eased_scroll_y - context.breakpoint['panel-1'].pos.top,
					endPos = context.breakpoint['panel-1'].pos.bottom,
					percentage = Math.abs(context.getPercentage(startPos, endPos));

				if (percentage <= 100) {
					
					// set fixed
					el.style.position = 'fixed';
					el.style.zIndex = 2;

					context.pinSpacer.style.height = "100vh";

					column.style[context.transformProperty] = "translate3d(" + (-1 * percentage) + "%, 0, 0)";

				} else {

					el.style.position = '';
					el.style.zIndex = '';
					column.style[context.transformProperty] = "translate3d(-100%, 0, 0)";

				}

			},

			'panel-2': function (context) {
				 
			}
		}
	});

	window.scrollAnimator = scrollAnimator;

}, false);