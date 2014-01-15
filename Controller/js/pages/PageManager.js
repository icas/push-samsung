
PageManager = movl.ui.ViewManager.extend({
	
	initialize: function(options) {
		movl.ui.ViewManager.prototype.initialize.call(this, options);
	
		App.logger.debug('PageManager: initialize()');
		
		this.el = $($('#pagesTemplate', App.templates).html());
		$('body').append(this.el);
		
		 // Add a small border if we are NOT on TV
		if (!movl.tv.isTV()) {
			this.el.addClass('pagesBorder');
		}
		
		this.delegateEvents();
				
		// Initialize all the pages
		this.views = {
			'main':	new MainPage()
		};
	},
	
	handleBackButton: function() {
		App.logger.debug('PageManager: handleBackButton()');
		if (this.currentView && this.currentView.handleBackButton) {
			return this.currentView.handleBackButton();
		} else {
			return false;
		}
	},
	
	setView: function(idOrView) {
		App.logger.debug('PageManager: setView() idOrView: ' + idOrView);
		var view = null;
		if (idOrView instanceof movl.ui.View) {
			view = idOrView;
		} else if (_.isString(idOrView)) {
			view = this.views[idOrView];
		}
		if (view) {
			movl.ui.ViewManager.prototype.setView.call(this, view);
		}
	}
	
});