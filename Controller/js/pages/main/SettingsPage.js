SettingsPage = movl.ui.View.extend({
	
	initialize: function(options) {
		movl.ui.View.prototype.initialize.call(this, options);
		
		App.logger.debug('SettingsPage: initialize()');
        
		this.el = $($('#settingsPageTemplate', App.templates).html());
		this.delegateEvents();
		
		this.$('.configTitle').hide();
		
		this.resizeDelegate = _.bind(this.onResize, this);
		$(window).on('resize', this.resizeDelegate);
		
		this.initScroller();
		
		this.render();
	},
	
	events: {
		'click #testDrive' 	: 	'onTestDrive',
		'click #quitTVApp'	:	'onQuitTVApp',
		'click #logout'		:	'onLogout',
		'click #facebook'	: 	'onFacebook',
		'click #twitter'	: 	'onTwitter',
		'click #notifications':	'onNotifications'
	},
	
	beforeDeactivate: function() {
		$(window).off('resize', this.resizeDelegate);
	},
	
	activate: function() {
		
		setTimeout(_.bind(function() {
			this.updateHeight();
			this.scroller.refresh();
		}, this), 0);
		

		// Fade up the title
		this.$('.configTitle').hide();
		this.$('.configTitle').fadeIn(1000); 
	},
	
	onResize: function() {
		this.updateHeight();
		this.scroller.refresh();
	},
	
	updateHeight: function() {
		var mainHeight = App.pages.views.main.el.height();
		var headerHeight = App.pages.views.main.header.el.height();
		var footerHeight = App.pages.views.main.footer.el.height();
		var settingsHeight = (mainHeight - (headerHeight + footerHeight));
		this.el.css({
			height: settingsHeight 
		});
	},
	
	initScroller: function() {
		this.scroller = new iScroll(this.el.get(0), {
				desktopCompatibility:true,
				scrollbarColor:'#595959',
				checkDOMChanges: false,
				preventGhostClick: true
			}
		);
		this.scroller.refresh(); 
	},
	
	scrollerMoving: function() {
		return (this.scroller.moved || this.scroller.zoomed || this.scroller.animating);
	},
	
	onTestDrive: function() {
		App.kontrolTV.application.browserWindow.open(App.config.testDriveLink);
	},
	
	onFacebook: function() {
		App.kontrolTV.application.alert('Your car has been posted to Facebook');
	},
	
	onTwitter: function() {
		App.kontrolTV.application.alert('You car has been posted to Twitter');
	},
	
	onLogout: function() {
		App.logout();
	},
	
	onNotifications: function() {
		var notificationStatus = App.pushManagerClient.getNotificationStatus();
		App.pushManagerClient.setNotificationStatus(!notificationStatus);
		this.render();
	},
	
	onQuitTVApp: function() {
		App.kontrolTV.cloudConnect.sendToHosts('quit', {});
	},
	
	render: function() {
		var notificationStatus = App.pushManagerClient.getNotificationStatus();
		if (notificationStatus) {
			this.$('#notifications').html('Disable Notifications');
		} else {
			this.$('#notifications').html('Enable Notifications');
		}
	}

});

