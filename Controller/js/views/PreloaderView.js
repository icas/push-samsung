
PreloaderView = movl.ui.View.extend({
	
	initialize: function(options) {
		movl.ui.View.prototype.initialize.call(this, options);
		
		this.log.setPrefix('PreloaderView');
		this.log.setLevel(movl.Log.INFO);
		if (this.log.isDebug()) this.log.debug('initialize()');
		
		this.el = $('#preloaderView');
		this.delegateEvents();
	},
	
	preloadAssets: function() {
		if (this.log.isDebug()) this.log.debug('preloadAssets()');
		var preloadData = App.config.preloader;		
		if (this.log.isDebug()) this.log.debug('preloadAssets() preloadData: ' + JSON.stringify(preloadData));
		
		this.loader = new PxLoader();
		_.each(preloadData, function(value, key) {
			this.addImagesForTag(this.loader, key, value);
		}, this);
		this.loader.addProgressListener(_.bind(function(e) {
			if (this.log.isDebug()) this.log.debug('preloadAssets() PROGRESS: completed: ' + e.completedCount + ', total: ' + e.totalCount)
			this.renderProgress(e.completedCount, e.totalCount);
		}, this));
		this.loader.addCompletionListener(_.bind(function(e) {
			if (this.log.isDebug()) this.log.debug('preloadAssets() COMPLETE');
			this.trigger('complete');
		}, this));
		this.loader.start();
	},
	
	addImagesForTag: function(loader, tag, images) {
		if (this.log.isDebug()) this.log.debug('addImagesForTag() tag: ' + tag + ', images: ' + images);
		for(var i = 0; i < images.length; i++) {
			var imageUrl = images[i];
			var pxImage = new PxLoaderImage(imageUrl, tag);
			pxImage.imageNumber = i + 1;
			loader.add(pxImage);
		}
		loader.addProgressListener(_.bind(function(e) {
			//if (this.log.isDebug()) this.log.debug('addImageForTag() TAG: ' + tag + ', PROGRESS: completed: ' + e.completedCount + ', total: ' + e.totalCount)
		}, this), tag);
	},
	
	renderProgress: function(completed, total) {
		this.$('#progressBar').css({
			width: (completed / total) * this.$('#progressContainer').width()
		});
	}
});