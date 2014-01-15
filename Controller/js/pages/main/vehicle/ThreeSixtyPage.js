ThreeSixtyPage = movl.ui.View.extend({
	
	initialize: function(options) {
		movl.ui.View.prototype.initialize.call(this, options);
		
		App.logger.debug('initialize()');
		this.el = $($('#threeSixtyPageTemplate', App.templates).html());
		
		// el set by MainPage
		this.delegateEvents();
		
		App.data.logList(App.data.threeSixtyViews, '360: views');
		
		this.mouseIsDown = false;
		this.mouseDownPosition = 0;
		this.mouseDownIndex = null;
		this.threeSixtyIndex = 0;
		
		this.$('#prev').hide();
		this.$('#next').hide();
		this.$('#threeSixtyView img').hide();
	},
	
	events: {
		'click #next' : 'onNext',
		'click #prev' : 'onPrev'	
	},
	
	events: function() {
		if (movl.ui.isTouchDevice()) {
			return {
				'touchend' : 'onMouseUp',
				'touchstart #threeSixtyView': 'onMouseDown',
				'touchmove #threeSixtyView': 'onMouseMove'
			}
		} else {
			return {
				'mouseup' : 'onMouseUp',
				'mousedown #threeSixtyView': 'onMouseDown',
				'mousemove #threeSixtyView': 'onMouseMove',
				'mouseout' : 'onMouseOut'
			}
		}
	},
	
	preloadImages: function(callback) {
		var views = App.data.threeSixtyViews;
		var images = [];
		for(var i = 0; i < views.length; i++) {
			var image = views[i];
			var imagePath = App.config.imagesPath + image;
			images.push(imagePath);
		}
		var preloader = new ImagePreloader();
		preloader.bind('complete', _.bind(function() {
			App.logger.debug('ThreeSixtyPage.preloadSelectionsImages() COMPLETE');
			//App.kontrolTV.application.alert('ThreeSixtyPage.preloadSelectionsImages() COMPLETE');
			callback();
		}, this));
		preloader.loadImages(images);
	},
	
	onMouseDown: function(event) {
		event.stopImmediatePropagation();
		
		this.mouseIsDown = true;
		
		this.mouseDownPosition = this.getMousePosition(event, this.$('#threeSixtyView'));
		this.displayThreeSixtyView(this.mouseDownPosition);
		
		return false;
	},
	
	onMouseUp: function(event) {
		this.mouseIsDown = false;
		this.mouseDownPosition = 0;
		this.threeSixtyIndex = this.mouseDownIndex;
	},
	
	onMouseMove: function(event) {
		event.stopImmediatePropagation();
		
		if (!this.mouseIsDown) {
			return;
		}
		
		var mouse = this.getMousePosition(event, this.$('#threeSixtyView'));
		this.displayThreeSixtyView(mouse);
		
		return false;
	},
	
	onMouseOut: function(event) {
		App.logger.debug('ThreeSixtypage.onMouseOut()');
		this.mouseIsDown = false;
		this.threeSixtyIndex = this.mouseDownIndex;
	},
	
	activate: function() {
		// Fade up the title
		this.$('.configTitle').hide();
		this.$('.configTitle').fadeIn(1000);
		
		this.preloadImages(_.bind(function() {
			this.render();
			this.displayThreeSixtyView();
		}, this));
		
	},
	
	displayThreeSixtyView: function(mouse) {
		
		var index = this.threeSixtyIndex;
		if (mouse) {
			var mouseOffset = mouse.x - this.mouseDownPosition.x;
			var indexOffset = Math.floor(mouseOffset / (this.$('#threeSixtyView').width() / 10));
			
			index = this.threeSixtyIndex + indexOffset;
			if (index > 9) {
				index = index - 9;
			} else if (index < 0) {
				index = 10 - -index;
			}
		}
		
		if (index != this.mouseDownIndex) {
			this.mouseDownIndex = index;
			
			var image = App.data.threeSixtyViews[index];
			var imagePath = App.config.imagesPath + image; 
			this.$('#threeSixtyView img').attr('src', imagePath);
			this.$('#threeSixtyView img').show();
			App.kontrolTV.cloudConnect.sendToHosts('set360Index', {
				index: index,
				image: image
			});
		}
	},
	
	render: function() {
		
		var selection = App.data.selectedData;
		this.$('.configSelectionModel').html(selection.ModelName);
		this.$('.configSelectionTrim').html(selection.TrimName);
		this.$('.configSelectionColor').html(selection.ColorName);
		this.$('.configSelectionPrice').html(App.data.formatPrice(selection.TrimMSRP));

		// Hide the trim name if it is the same as the modelname
		if(selection.ModelName.toLowerCase() == selection.TrimName.toLowerCase()){
			this.$('.configSelectionTrim').hide();
		}else{
			this.$('.configSelectionTrim').show();
		}
		
		// Show any ui tips		
		var navTip = this.$('.ui-tip-drag');
		navTip.fadeIn(1000, function(){
			//setTimeout(function(){navTip.fadeOut();}, 4000);
		});
		
	},
	
	getMousePosition: function(e, element) {
		e.preventDefault();
		
		var x,y;
		
		if (movl.ui.isTouchDevice()) {
			x = e.originalEvent.targetTouches[0].pageX - element.offset().left;
			y = e.originalEvent.targetTouches[0].pageY - element.offset().top;
		} else {
			x = e.pageX - element.offset().left;
			y = e.pageY - element.offset().top;
		}
		
		if (x > element.width()) {
			x = element.width();
		}
		
		if (y > element.height()) {
			y = element.height();
		}
		
		return {
			x: x,
			y: y
		};
	},
	
	/**
	 * Maps a value from one range to another.
	 * Most useful method I ever wrote ;)
	 */
	map: function( val, inLow, inHi, outLow, outHi ) {
		var result = (  ( ( val - inLow ) / ( inHi - inLow ) ) * ( outHi - outLow) ) + outLow;
		if ( result < outLow ) result = outLow;
		if ( result > outHi ) result = outHi;
		return result;
	}

});