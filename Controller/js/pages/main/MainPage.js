
MainPage = movl.ui.View.extend({
	
	initialize: function(options) {
		movl.ui.View.prototype.initialize.call(this, options);
		
		App.logger.debug('initialize()');
		
		this.el = $($('#mainPageTemplate', App.templates).html());
		this.delegateEvents();
		
		this.content = new movl.ui.ViewStack({el: this.$('#content')});
		this.header = new MainPageHeader({el: this.$('.header'), mainPage: this});
		this.footer = new MainPageFooter({el: this.$('.footer'), mainPage: this});
		
		this.content.bind('viewChanged', _.bind(this.onContentChanged, this));
	},
	
	activate: function() {
		App.logger.debug('activate()');
		this.content.push(new ModelPage());
	},
	
	deactivate: function() {
		App.logger.debug('deactivate()');
		
		// Remove content
		this.content.clear();
	},
	
	onContentChanged: function() {
		App.logger.debug('MainPage.onContentChanged()');
	},
	
	handleBackButton: function() {
		App.logger.debug('handleBackButton()');
		
		var handled = false;
		
		// Pop the content view stack
		handled = this.content.handleBackButton();
		
		if (handled) {
			if (this.content.currentView && this.content.currentView.refresh) {
				this.content.currentView.refresh();
			}
		}
		
		App.logger.debug('handleBackButton() handled: ' + handled);
		return handled;
	},
	
	toggleSettings: function() {
		if (this.isSettingsVisible()) {
			this.hideSettings();
		} else {
			this.showSettings();
		}
	},
	
	isSettingsVisible: function() {
		return (this.content.currentView instanceof SettingsPage);
	},
	
	showSettings: function() {
		if (!this.isSettingsVisible()) {
			this.content.push(new SettingsPage());
		}
	},
	
	hideSettings: function() {
		if (this.isSettingsVisible()) {
			App.onBackButton();
		}
	}
	
});