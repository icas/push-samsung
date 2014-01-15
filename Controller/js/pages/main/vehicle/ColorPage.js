ColorPage = movl.ui.View.extend({
	
	initialize: function(options) {
		movl.ui.View.prototype.initialize.call(this, options);
		
		App.logger.debug('initialize()');
		this.el = $($('#colorPageTemplate', App.templates).html());
		
		// el set by MainPage
		this.delegateEvents();
		
		this.selections = App.data.getColorSelections(App.data.selectedData);
		if (this.selections.length > 6) {
			this.selections.length = 6;
		}
		App.data.logList(this.selections, 'ColorPage: selections');
		
		this.$('#prev').hide();
		this.$('#next').hide();
	},
	
	events: {
		'click #sliderContainer' : 'onSelectColor',
	},
	
	initSliderTemplate: function(selections, callback) {
		this.preloadSelectionsImages(selections, _.bind(function() {
			var imageItemsHtml = "";
			var bulletItemsHtml = "";
			for(var i = 0; i < selections.length; i++) {
				var selection = selections[i];
				var imagePath = App.config.imagesPath + selection.MovlImageName;
				imageItemsHtml+= '<div style="display:block"><img src="' + imagePath + '"></div>';
				bulletItemsHtml+= '<em>&bull;</em>';
			}
			this.$('#sliderContainer').html(imageItemsHtml);
			callback();
		}, this));
	},
	
	preloadSelectionsImages: function(selections, callback) {
		App.logger.debug('ColorPage.preloadSelectionsImages()');
		var images = [];
		for(var i = 0; i < selections.length; i++) {
			var selection = selections[i];
			var imagePath = App.config.imagesPath + selection.MovlImageName;
			images.push(imagePath);
		}
		var preloader = new ImagePreloader();
		preloader.bind('complete', _.bind(function() {
			App.logger.debug('ColorPage.preloadSelectionsImages() COMPLETE');
			//App.kontrolTV.application.alert('ColorPage.preloadSelectionsImages() COMPLETE');
			callback();
		}, this));
		preloader.loadImages(images);
	},
	
	activate: function() {
		
		App.logger.debug('ColorPage.activate()');
		
		// Fade up the title
		this.$('.configTitle').hide();
		this.$('.configTitle').fadeIn(1000);
		
		if (!this.swipe) {
			this.initSliderTemplate(this.selections, _.bind(function() {
				this.swipe = new Swipe(this.$('#slider').get(0), {
					callback: _.bind(this.onItemSelected, this)
				});
				
				this.render();
				
				var index = this.swipe.getPos();
				var selection = this.selections[index];
				App.data.setSelectedData(selection);
				
			}, this));
			
		} else {
		
			this.render();
		
			var index = this.swipe.getPos();
			var selection = this.selections[index];
			App.data.setSelectedData(selection);
		}
		
	},
	
	onNext: function() {
		this.swipe.next();
		this.colorSelector.next();
	},
	
	onPrev: function() {
		this.swipe.prev();
		this.colorSelector.prev();
	},
	
	onItemSelected: function(event, index, elem) {
		this.render();
		
		var index = this.swipe.getPos();
		var selection = this.selections[index];
		App.data.setSelectedData(selection);
	},
	
	onSelectColor: function() {
		var index = this.swipe.getPos();
		var selection = this.selections[index];
		App.data.setSelectedData(selection);
		App.pages.views.main.content.push(new ThreeSixtyPage());
	},
			
	render: function() {

		// Kludge :
		// This should really all be done in initialization but something in the movl.ui.View
		// keeps breaking my event delegation unless I do my initialization within the render for the subcomponent
		var colors = _.map(this.selections, function(selection){ return selection.Color.replace('0x','#'); });
		var startIndex = this.swipe ? this.swipe.getPos() : 0;
		this.colorSelector = new app.components.ColorSelector({colors : colors, startIndex : startIndex});		
		this.colorSelector.bind('select', function(data){ this.swipe.slide(data.index, 500); }, this);

		// Render this colorSelector component
		this.$('.color-selector').html(this.colorSelector.$el);		

		if (this.swipe) {
			this.$('#position em').removeClass('on');
			var index = this.swipe.getPos();
			this.$('#position em:nth-child(' + (index + 1) + ')').addClass('on');
			var selection = this.selections[index];
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
		}

		// Show any ui tips
		if(!this.hasShowTips){
			var navTip = this.$('.ui-tip');
			navTip.fadeIn(1000, function(){
				//setTimeout(function(){navTip.fadeOut();}, 4000);
			});
			this.hasShowTips = true;
		}
		
	}

});