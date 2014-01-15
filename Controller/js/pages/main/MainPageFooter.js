MainPageFooter = movl.ui.View.extend({
	
	initialize: function(options) {
		movl.ui.View.prototype.initialize.call(this, options);
		
		App.logger.debug('initialize()');
		
		// Reference to the main page
		this.mainPage = options.mainPage;
		
		// LISTEN FOR WHEN THE VIEW CHANGES IN THE MAIN CONTENT VIEW STACK
		this.mainPage.content.bind(movl.ui.ViewManager.EVENTS.viewChanged, this.onViewChanged, this);
		
		App.kontrolTV.cloudConnect.on('joinRoom', _.bind(this.onJoinRoom, this));
		App.kontrolTV.cloudConnect.on('roomAttributesChanged', _.bind(this.onRoomAttributesChanged, this));
		
		// el set by MainPage
		this.delegateEvents();
		
		this.render();
	},
	
	events: function() {
		if (movl.ui.isTouchDevice()) {
			return {
				'touchstart #toggleTV' : 'onToggleTV',
				'touchstart #toggleVideo' : 'onToggleVideo'
			}
		} else {
			return {
				'mousedown #toggleTV' : 'onToggleTV',
				'mousedown #toggleVideo' : 'onToggleVideo'
			}
		}
	},
	
	onViewChanged: function(view) {
		App.logger.debug('onViewChanged() view: ' + view);
	},
	
	onToggleTV: function() {
		App.logger.debug('onToggleTV()');
		App.pages.views.main.hideSettings();
		App.kontrolTV.cloudConnect.sendToHosts('toggleTV');
	},

	onToggleVideo : function(){
		App.logger.debug('onToggleVideo()');
		App.pages.views.main.hideSettings();
		App.kontrolTV.cloudConnect.sendToHosts('toggleVideo', {
			video: App.data.getVideoByModel(App.data.selectedData)
		});
	},
	
	onJoinRoom: function(event) {
		this.render();
	},
	
	onRoomAttributesChanged: function(event) {
		this.render();
	},
	
	render: function() {
		var room = App.kontrolTV.cloudConnect.getRoom();
		
		var tvEnabled = room && room.attributes.tvEnabled;
		var videoEnabled = room && room.attributes.videoEnabled;
		
		this.$('#toggleTV').html(tvEnabled ? 'View On TV': 'Resume TV');
		
		
		this.$('#toggleVideo').html(videoEnabled ? 'Hide Video': 'Watch Video');
		
		/*
		var video = null; 
		if (room) {
			video = room.attributes.video;
		}
		this.$('#toggleVideo').html(video ? video: 'no video');
		*/
		
	}

});