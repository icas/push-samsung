MainPageHeader = movl.ui.View.extend({
	
	initialize: function(options) {
		movl.ui.View.prototype.initialize.call(this, options);
		
		App.logger.debug('initialize()');
		
		// Reference to the main page
		this.mainPage = options.mainPage;
		
		// LISTEN FOR WHEN THE VIEW CHANGES IN THE MAIN CONTENT VIEW STACK
		this.mainPage.content.bind(movl.ui.ViewManager.EVENTS.viewChanged, this.onViewChanged, this);
		
		// el set by MainPage
		this.delegateEvents();
		
		this.render();
	},
	
	events: {
		'fastclick #backButton' : 'onBackButton',
		'fastclick #settingsButton': 'onSettingsButton'		
	},
	
	onViewChanged: function(view) {
		App.logger.debug('onViewChanged() view: ' + view);
		this.render();
	},
	
	onBackButton: function() {
		App.logger.debug('onBackButton()');
		App.onBackButton();
	},
	
	onSettingsButton: function() {
		App.logger.debug('onSettingsButton()');
		App.pages.views.main.toggleSettings();
	},
	
	showBackButton: function(show) {
		if (show && !movl.ui.isAndroid()) {
			this.$('#backButton').show();
		} else {
			this.$('#backButton').hide();
		}
	},
			
	render: function() {
		// WE ONLY SHOW REFRESH IF THERE'S 1 VIEW ON THE STACK
		if (App.kontrolTV.isActive()) {
			this.showBackButton(true);
		} else {
			if (this.mainPage.content.stackSize() <= 1 ) {
				this.showBackButton(false);
			} else {
				this.showBackButton(true);
			}
		}
		
	}

});