(function(){

	// Create the namespace if not there
	window.app = window.app || {};
	app.components = app.components || {};


	app.components.ColorSelector = movl.ui.View.extend({
		
		tagName: "ul",
	  	className: "component-color-selector",

		initialize: function(options) {

			movl.ui.View.prototype.initialize.call(this, options);

			// KLUDGE: 
			// These should already be built in Backbone
			// but for some reason it is not there so I am setting for now
			this.$el = $(this.el);
			
			this.index = options.startIndex || 0;
			this.colors = options.colors || [];
			this.swatchTemplate = _.template('<li><div style="background-color:{{color}}; border-color:{{color}}"></div></li>');

			this.render();
		},
		
		events: function() {
			if (movl.ui.isTouchDevice()) {
				return {
					'touchstart li' : 'onColorSelect'
				}
			} else {
				return {
					'mousedown li' : 'onColorSelect'
				}
			}
		},
		
		onColorSelect: function(evt) {		
			var index = this.$el.find('li').index(evt.currentTarget);
			var color = this.colors[index];
			this.setActiveIndex(index);
			this.trigger('select',{index:index, color:color});
		},

		setColors : function(colors){
			this.colors = colors;
			this.index = 0;
			this.render();
		},

		setActiveIndex : function(index){
			this.index = index;
			var items = this.$el.find('li');
			items.removeClass('active');
			items.eq(index).addClass('active');
		},

		next : function(){
			if(this.colors.length > 1){
				if(this.index < this.colors.length - 1){
					this.setActiveIndex(this.index + 1);
				}else{
					this.setActiveIndex(0);
				}
			}
		},

		prev : function(){
			if(this.colors.length > 1){
				if(this.index > 0){
					this.setActiveIndex(this.index - 1);
				}else{
					this.setActiveIndex(this.colors.length - 1);
				}
			}
		},
				
		render: function() {

			this.$el.empty();
			
			for(var i=0; i<this.colors.length; i++){
				var color = this.colors[i];
				var cHtml = this.swatchTemplate({color:color});
				this.$el.append(cHtml);
			}

			this.setActiveIndex(this.index);

			return this;
		}
	});


})();