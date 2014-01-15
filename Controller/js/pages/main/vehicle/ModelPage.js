ModelPage = movl.ui.View.extend({
	
	initialize: function(options) {
		movl.ui.View.prototype.initialize.call(this, options);
		
		App.logger.debug('initialize()');
		
		this.el = $($('#modelPageTemplate', App.templates).html());
		
		// el set by MainPage
		this.delegateEvents();
		
		this.selections = App.data.getModelSelections();
		App.data.logList(this.selections, 'ModelPage: selections');
		
		this.hasShowTips = false;
		
		this.$('.configTitle').hide();
		
		this.$('#prev').hide();
		this.$('#next').hide();
	},
	
	events: {
		'click #sliderContainer' : 'onSelectModel',
		'click #next' : 'onNext',
		'click #prev' : 'onPrev'
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
			this.$('#position').html(bulletItemsHtml);
			callback();
		}, this));
	},
	
	preloadSelectionsImages: function(selections, callback) {
		App.logger.debug('ModelPage.preloadSelectionsImages()');
		var images = [];
		for(var i = 0; i < selections.length; i++) {
			var selection = selections[i];
			var imagePath = App.config.imagesPath + selection.MovlImageName;
			images.push(imagePath);
		}
		var preloader = new ImagePreloader();
		preloader.bind('complete', _.bind(function() {
			App.logger.debug('ModelPage.preloadSelectionsImages() COMPLETE');
			//App.kontrolTV.application.alert('ModelPage.preloadSelectionsImages() COMPLETE');
			callback();
		}, this));
		preloader.loadImages(images);
	},
	
	activate: function() {
		
		App.logger.debug('ModelPage.activate()');
		
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
	},
	
	onPrev: function() {
		this.swipe.prev();
	},
	
	onItemSelected: function(index) {
		this.render();
		
		var index = this.swipe.getPos();
		var selection = this.selections[index];
		App.data.setSelectedData(selection);
	},
	
	onSelectModel: function() {
		var index = this.swipe.getPos();
		var selection = this.selections[index];
		App.data.setSelectedData(selection);
		App.pages.views.main.content.push(new TrimPage());
		//App.pages.views.main.content.push(new ColorPage());
	},
	
	render: function() {
		if (!movl.ui.isTouchDevice()) {
			this.$('#prev').show();
			this.$('#next').show();
		} else {
			this.$('#prev').hide();
			this.$('#next').hide();
		}
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