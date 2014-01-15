
/**
 * This is a singleton that holds all application views and data
 */
App = {

		initialize: function(config) {
			
			this.initLogger(config.logging);
			
			this.logger.debug('App.initialize()');
			
			this.config = config || {};
			
			/** This will hold the main PageManager which is a movl.ui.ViewManager */
			this.pages = null;
			
			/** This will hold all page/view html templates*/
			this.templates = null;
			
			/** PushManagerClient handles all controller/host messages related to push notification registrations */
			this.pushManagerClient = null; // created on startApp()
			
			/** The data from the raw data.csv */
			this.data = new AppData();
			this.data.load(_.bind(function() {
				// Init Templates
				this.initTemplates();
			}, this));
		},
		
		initTemplates: function() {
			var file = this.config.templates;
			$.get(file, _.bind(function(data) {
				this.templates = $(data);
				
				// Init KontrolTV
				this.initKontrolTV();
				
			}, this), 'text');
		},

		initKontrolTV: function() {

			var appKey = this.config.appKey;

			// Create the KontrolTV client
			this.kontrolTV = new movl.KontrolTVFaker(this.config.debug);

			// Initialize KontrolTV
			this.kontrolTV.initialize(appKey, function(result) {
				if (result.isOk()) {
					this.kontrolTV.application.on(movl.KTVApplication.EVENTS.backButton,		_.bind(this.onAppBackButton, this));
					this.kontrolTV.application.on(movl.KTVApplication.EVENTS.paused,			_.bind(this.onAppPaused, this));
					this.kontrolTV.application.on(movl.KTVApplication.EVENTS.resumed,			_.bind(this.onAppResumed, this));
					this.kontrolTV.application.on(movl.KTVApplication.EVENTS.online,			_.bind(this.onAppOnline, this));
					this.kontrolTV.application.on(movl.KTVApplication.EVENTS.offline,			_.bind(this.onAppOffline, this));

					// LISTEN FOR CLOUD CONNECT EVENTS
					this.kontrolTV.cloudConnect.on(movl.Connect.EVENTS.connectionLost, 			_.bind(this.onConnectionLost, this));
					this.kontrolTV.cloudConnect.on(movl.Connect.EVENTS.joinRoom, 				_.bind(this.onJoinRoom, this));
					this.kontrolTV.cloudConnect.on(movl.Connect.EVENTS.userLeft, 				_.bind(this.onUserLeft, this));
					this.kontrolTV.cloudConnect.on(movl.Connect.EVENTS.leaveRoom, 				_.bind(this.onLeaveRoom, this));
					this.kontrolTV.cloudConnect.on(movl.Connect.EVENTS.roomAttributesChange, 	_.bind(this.onRoomAttributesChanged, this));
					
					// Preload Assets
					this.preloadAssets();
					
				} else {
					// TODO: WHAT HAPPENS HERE?
				}
			}, this, this.config);
		},
		
		initLogger: function(logging) {

			if (this.loggingInitialized) return;

			this.logger = log4javascript.getLogger("Hyundai-Controller");
			this.logger.setLevel(log4javascript.Level.ALL);
			this.ajaxAppender = null;
			this.consoleAppender = null;
	        
			if (logging.enabled) {

				if (logging.remoteLogging.enabled) {
					this.ajaxAppender = new log4javascript.AjaxAppender(logging.remoteLogging.url);
					this.logger.addAppender(this.ajaxAppender);
				}

				if (logging.consoleLogging.enabled) {
					this.consoleLogger = new log4javascript.BrowserConsoleAppender();
					this.logger.addAppender(this.consoleLogger);
				}
				
				if (logging.logMovl) {
					movl.logging.Log.on("log", _.bind(function(evt){
						switch(evt.level){
						case "TRACE":
							this.logger.trace(evt.message);
							break;
						case "DEBUG":
							this.logger.debug(evt.message);
							break;
						case "INFO":
							this.logger.info(evt.message);
							break;
						case "WARN":
							this.logger.warn(evt.message);
							break;
						case "ERROR":
							this.logger.error(evt.message);
							break;
						case "FATAL":
							this. logger.fatal(evt.message);
							break;
						default:
							this.logger.log(evt.levelNum,evt.message);
	
						}
					}, this));
				}
			}

			this.loggingInitialized = true;
		},
		
		preloadAssets: function() {
			this.logger.debug('App.preloadAssets()');
			
			var preloaderView = new PreloaderView();
			
			if (_.size(this.config.preloader) == 0) {
				preloaderView.el.remove();
				this.startApp();
				return;
			}
			
			// PRELOAD ASSETS
			preloaderView.bind('complete', function(e) {
				
				preloaderView.el.remove();
				this.logger.debug('App.preloadAssets() PRELOAD COMPLETE');
				
				// Start the app
				this.startApp();
				
			}, this);
			preloaderView.el.show();
			preloaderView.preloadAssets();
		},
		
		startApp: function() {
			this.logger.debug('App.startApp()');
			
			this.pages = new PageManager();
			
			this.pushManagerClient = new PushManagerClient();
			
			if (this.kontrolTV.isActive()) {
				// By passing null arguments, it will use the userAccount and roomInfo from kontrolTV
				this.kontrolTV.cloudConnect.joinRoomAsController();
			} else {
				this.scrollToTop();
				setInterval(_.bind(this.scrollToTop, this), 3000);
				
				if (this.config.roomCode) {
					this.kontrolTV.cloudConnect.joinRoomAsController(this.config.roomCode, this.config.userName || "Test");
				} else {
					// TODO
					this.kontrolTV.application.alert("When running outside KontrolTV, must supply roomCode and userName as url params");
				}
			}
		},

		scrollToTop: function() {
			if (this.config.scrollToTop) {
				setTimeout(function() { window.scrollTo(0, 1) }, 100);
			}
		},
		
		onBackButton: function() {
			var handled = false;
			if (this.pages.handleBackButton) {
				handled = this.pages.handleBackButton();
			}
			if (!handled && this.kontrolTV && this.kontrolTV.isActive()) {
				handled = true;
				this.kontrolTV.application.exit(); // TODO
			}
			return handled;
		},
		
		onAppBackButton: function(event) {
			this.onBackButton();
		},

		onAppPaused: function(event) {

		},

		onAppResumed: function(event) {

		},

		onAppOnline: function(event) {

		},

		onAppOffline: function(event) {

		},

		/**
		 * Leaves a MOVL Connect room
		 */
		logout: function() {
			if (this.kontrolTV.isActive()) {
				// Let KontrolTV know to kill the controller page
				this.kontrolTV.application.exit();
			} else {
				// Leave the room
				this.kontrolTV.cloudConnect.leaveRoom();
				// TODO
			}
		},

		/**
		 * Called by the MOVL Connect client when the connection is lost
		 * @param event
		 */
		onConnectionLost : function(event) {
			var result = event.result;
			if (this.kontrolTV.isActive()) {
				// TODO
			} else {
				// TODO
			}
		},

		/**
		 * Called by the MOVL Connect client in response to the joinRoomAsController() call
		 * @param event
		 */
		onJoinRoom : function(event) {
			var result = event.result;

			if (result.isOk()) {

				// Let KontrolTV know we are ready to be shown
				this.kontrolTV.application.ready();
				
				this.pages.setView('main');
				
			} else {

				// If we are in kontroltv, then exit, otherwise, show an error
				if (this.kontrolTV.isActive()) {
					// Let KontrolTV know to kill the controller page
					this.kontrolTV.application.exit();
				} else {
					this.kontrolTV.application.alert("Are you sure that TV Code is right? I can't seem to connect.");
					// TODO
				}
			}
		},

		/**
		 * Called by the MOVL Connect client in response to the leaveRoom() call
		 * @param event
		 */
		onLeaveRoom: function(event) {
			var result = event.result;
			if (result.isOk()) {
				// TODO
			} else {
				// TODO: SHOULD WE EXIT THE APP HERE?
				this.kontrolTV.application.alert(result.message);
			}
		},
		
		onUserLeft: function(event) {
			var numHosts = this.kontrolTV.cloudConnect.getRoom().getHosts().size();
			if (numHosts == 0) {
				this.kontrolTV.application.exit();
			}
		},
		
		onRoomAttributesChanged: function(event) {
			
		}
		
};
