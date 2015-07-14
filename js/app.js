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

		// setter
		this.setter();

		// event listeners
		this.listener();

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

	},

	listener: function () {

		window.addEventListener("mousewheel", this.onMouseWheel.bind(this), false);
		window.addEventListener("DOMMouseScroll", this.onMouseWheel.bind(this), false);

	},

	onMouseWheel: function (e) {

		var d = e.wheelDelta;

		this.calculated_scroll_y += d;

		if (this.calculated_scroll_y > 0) {
			this.calculated_scroll_y = 0;
		}

		// deal with different browsers calculating the delta differently
		this.mouseDelta = d;

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
					percentage = Math.abs(context.getPercentage(context.eased_scroll_y, el.offsetHeight));

				// set fixed
				el.style.position = 'fixed';

				if (percentage <= 100) {

					context.scrollLock = true;
					column.style[context.transformProperty] = "translate3d(" + (-1 * percentage) + "%, 0, 0)";

				} else {

					context.scrollLock = false;
					column.style[context.transformProperty] = "translate3d(-100%, 0, 0)";				

				}

			},

			'panel-2': function (context) {

				context.breakpoint['panel-1'].el.style.position = '';

			}
		}
	});

	window.scrollAnimator = scrollAnimator;

}, false);