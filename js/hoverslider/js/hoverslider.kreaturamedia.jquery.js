(function($) {

	// hoverSlider Preinit

	$.fn.hoverSlider = function( options ){

		var method = arguments[0];

		if(methods[method]) {
			method = methods[method];
			arguments = Array.prototype.slice.call(arguments, 1);
		} else if( typeof(method) == 'object' || !method ) {
			method = methods.init;
		} else {
			$.error( 'Method ' +  method + ' does not exist in hoverSlider!');
			return this;
		}

		return method.apply(this, arguments);		
	};

	// hoverSlider Methods

	var methods = {

		init: function(options) {
 
			// Repeat over each element in selector

			return this.each(function() {
 
				// Attempt to grab the hoverSlider data of element

				// If we could't grab data...*
				
				if( !$(this).data('hoverSlider') ){
					
					// Default Options. You can change them here or by calling $(element).hoverSlider({ optionName1 : optionPoperty1, optionName2 : optionProperty2 });

					var defaults = {

						skin				: 'lightskin2',				// You can change the skin of the Slider.
						skinsPath			: '/hoverslider/skins/',	// You can change the default path of the skins folder. Note, that you must use the slash at the end of the path.
						yourLogo			: false,					// You can add an image that will be shown above HoverSlider container. This can be important if you want to display your own logo for example. You have to add the correct path to your image file.
						yourLogoStyle		: 'position: absolute; z-index: 1001; left: 10px; top: 10px;', // You can style your logo. You are allowed to use any CSS properties, for example add left and top properties to place the image inside the HoverSlider container anywhere you want.
						yourLogoLink		: 'http://yourdomain.com',	// You can add a link to your logo. Set false is you want to display only an image without a link.
						yourLogoTarget		: '_blank',					// If '_blank', the clicked url will open in a new window.

						autoStart			: true,						// If true, slideshow will automatically start after loading the page.
						fadeDuration		: 500,						// Duration of fading (in ms)
						slideDelay			: 7000,						// Time between changing images (in ms) if autoStart is true.
						firstImage			: 1,						// HoverSlider will display this image at first.
						pauseOnHover		: true,						// SlideShow will pause when mouse pointer is over HoverSlider.
						imagePreload		: true,						// Image preload. HoverSlider preloads all images before it shows up.

						showImageTitles		: true,						// If true, HoverSlider will display the alt property of the images instead of numbers.
						alignImageTitles	: 'center',					// 'center', 'left' or 'right'
						titleColor			: '#777',					// Color of the image titles.
						activeTitleColor	: '#333',					// Color of the active image title.
						alignImages			: 'centered',				// 'centered' or 'streched' - If streched, images will resized to the size of the HoverSlider container, if centered, images will positioned center center in their original size as backgrounds. See the documentation for Ken Burns effect!

						// NEW FEATURE v1.5 kbZoomType

						kbZoomType			: 'random',					// Zoom type of Ken Burns effect: 'in', 'out' or 'random'
						kbZoomFactor		: 1.3,						// Zoom factor of Ken Burns effect
						kbEasing			: 'easeInOutQuad',			// Easing (type of transition) of the Ken Burns effect.
						kbDuration			: 7000, 					// Duration of Ken Burns effect
						sliderColor			: false,					// Color of the slider. Set false if you want to use the default color (added by the skin).
						sliderDuration		: 750,						// Duration of the slider animation (in ms).
						sliderEasing		: 'easeOutQuint',			// Easing (type of transition) of the slider animation.

						// NEW FEATURES v1.5 HTML animation properties

						htmlDurationIn		: 750,						// Duration In of the HTML animation (in ms).
						htmlDurationOut		: 750,						// Duration Out of the HTML animation (in ms).
						htmlEasingIn		: 'easeOutQuint',			// Easing In (type of transition) of the HTML animation.
						htmlEasingOut		: 'easeOutQuint',			// Easing Out (type of transition) of the HTML animation.
						htmlDelay			: 500,						// Delay (In) of the HTML animation.

						showShadow			: true						// If true, HoverSlider will show hs-shadow.png (the image with this file name must be present in the selected skin folder!)

					};
					
					// *..creating it from defaults and global and passing options

					var hs = {

						o : $.extend({}, defaults, options),
						g : {
							
							version				: '1.5',

							autoSlideshow		: false,
							imagesNum			: null,
							slideTimer			: null,
							hasCanvas			: function(){
													var canvas = $('<canvas>');
													if( canvas[0].getContext && canvas[0].getContext('2d') ){
														return true;
													}else{
														return false;
													}
												  },
							debugMode			: false		// For future debugging...
						}
						
					};
 
					// Saving the newly created settings to hoverSlider data of element
					
					$(this).data('hoverSlider', hs);
					
					// Calling hsInit private function
					
					hsInit( $(this) );
					
				}else{
					
					// If hoverSlider data is present (reserved for future features)
				}
 			});
		},

		change: function( num ) {

			return $(this).each(function() {

				hsChange( $(this), num );
			});
		},
		
		start: function(){
			
			return $(this).each(function() {

				hsStart( $(this) );
			});
		},
		
		stop: function(){
			
			return $(this).each(function() {

				hsStop( $(this) );
			});
		}
	};

	// HoverSlider Private Functions
	
	var hsInit = function( el ){

		var hs = el.data('hoverSlider');

		// Setting Debug Mode
		
		if( hs.g.debugMode ){

			hs.g.d = $('<div id="hs-debug">').appendTo('body').css({
				position : 'fixed',
				background : 'black',
				right : 0,
				top : 0,
				color : 'white',
				padding : 10,
				width : 400,
				zIndex : 10000,
				opacity : .85
			});

		}

		// Setting variables

		hs.g.imagesNum = el.find('.hs-image').length;
		hs.o.firstImage = hs.o.firstImage < hs.g.imagesNum + 1 ? hs.o.firstImage : 1;
		hs.o.firstImage = hs.o.firstImage < 1 ? 1 : hs.o.firstImage;

		hs.g.nextImageIndex = hs.o.firstImage;

		// Adding styles

		el.addClass('hs-container');

		if( el.css('position') == 'static' ){
			el.css('position','relative');
		}

		// Creating functions to recheck slider dimensions and ratio

		hs.g.sliderWidth = function(){
			return el.width();
		}
		
		hs.g.sliderHeight =	function(){
			return el.height();
		}
		
		// Moving all images and divs to .hs-inner container

		el.find('.hs-image, .hs-html').wrapAll('<div class="hs-inner"></div>');

		// NEW FEATURE v1.5 added per slide settings

		el.find('.hs-image, .hs-html').each(function(){
			
			if( $(this).attr('rel') || $(this).attr('style') ){
				if( $(this).attr('rel') ){
					var params = $(this).attr('rel').toLowerCase().split(';');
				}else{
					var params = $(this).attr('style').toLowerCase().split(';');						
				}
				for(x=0;x<params.length;x++){
					param = params[x].split(':');
					if( param[0].indexOf('easing') != -1 ){
						param[1] = hsEasing( param[1] );
					}
					$(this).data( $.trim(param[0]), $.trim(param[1]) );
				}
			}				
		});
		
		el.find('.hs-image').each(function(){

			$(this).wrapAll('<div class="hs-image-container"></div>');
			if( $(this).hasClass('hs-kenburns') ){
				$(this).css({
					display : 'none'
				});
				
				if( hs.g.hasCanvas() == true ){
					$('<canvas class="hs-canvas">').appendTo( $(this).closest('.hs-image-container') ).attr('width',hs.g.sliderWidth()).attr('height',hs.g.sliderHeight());
				}else{
					
					$('<img>').appendTo( $(this).closest('.hs-image-container') ).attr('src', $(this).attr('src')).addClass('hs-canvas');
				}
				
				// IE7-8 sizing fix

				if( $.browser.msie ){
					$('.hs-canvas').css({
						position : 'absolute'
					});
				}
			}
		});
		
		// Aligning images
		
		el.find('.hs-inner .hs-image').each(function(){
			if( !$(this).hasClass('hs-kenburns') ){
				if( hs.o.alignImages == 'centered' ){
					$(this).css({
						backgroundImage : 'url(' + $(this).attr('src') + ')'
					}).attr('src',hs.o.skinsPath+'defaultskin/blank.gif');
				}
				$(this).css({
					display: 'block'
				});
			}
		});


		// Appending yourLogo into HoverSlider container

		if( hs.o.yourLogo ){
			var yourLogo = $('<img>').appendTo(el).attr( 'src', hs.o.yourLogo ).attr('style', hs.o.yourLogoStyle ).css({
				outline : 'none',
				border : 'none'
			});
			if( hs.o.yourLogoLink != false ){
				$('<a>').appendTo(el).attr( 'href', hs.o.yourLogoLink ).attr('target', hs.o.yourLogoTarget ).css({
					textDecoration : 'none',
					outline : 'none'
				}).append( yourLogo );
			}
		}

		// Creating shadow and controls

		hs.g.hsBottom = $('<div>');
		hs.g.hsBottom.addClass('hs-btm').css({
			width: hs.g.sliderWidth()
		}).insertAfter(el).fadeIn( hs.o.fadeDuration );
					
		if( hs.o.showShadow == true ){
			var hsShadow = $('<img>');
			hsShadow.addClass('hs-shadow').attr('src',hs.o.skinsPath+hs.o.skin+'/hs-shadow.png').css({
				width : hs.g.sliderWidth()
			}).appendTo( hs.g.hsBottom );				
		}

		var hsControls = $('<div>');
		hsControls.addClass('hs-controls').appendTo( hs.g.hsBottom );

		for(x=1;x<hs.g.imagesNum+1;x++){

			if( hs.o.showImageTitles == true ){
				var liHTML = el.find('.hs-image:eq('+(x-1)+')').attr('alt');
			}else{
				var liHTML = x;
			}

			$('<span>').appendTo( hsControls ).mouseover(function(){
				el.hoverSlider('change', $(this).index() );
			}).css({
				textAlign : hs.o.alignImageTitles
			}).html(liHTML);
		}

		// Appedning slideline

		var hsSlideLine = $('<div>');
		hsSlideLine.addClass('hs-slideline').prependTo( hsControls );

		var hsSlider = $('<div>');
		hsSlider.addClass('hs-slider').appendTo( hsSlideLine );
		
		if( hs.o.sliderColor ){
			hsSlider.css({
				backgroundColor : hs.o.sliderColor
			});		
		}

		// Adding touch-control navigation
		
		if('ontouchstart' in window){

		   el.bind('touchstart', function( e ) {
				var t = e.touches ? e.touches : e.originalEvent.touches;
				if( t.length == 1 ){
					hs.g.touchStartX = hs.g.touchEndX = t[0].clientX;
				}
		    });

		   el.bind('touchmove', function( e ) {
				var t = e.touches ? e.touches : e.originalEvent.touches;
				if( t.length == 1 ){
					hs.g.touchEndX = t[0].clientX;
				}
				if( Math.abs( hs.g.touchStartX - hs.g.touchEndX ) > 45 ){
					e.preventDefault();							
				}
		    });

			el.bind('touchend',function( e ){
				if( Math.abs( hs.g.touchStartX - hs.g.touchEndX ) > 45 ){
					if( hs.g.touchStartX - hs.g.touchEndX > 0 ){
						var prev = hs.g.curImageIndex > 1 ? hs.g.curImageIndex - 1 : hs.g.imagesNum
						el.hoverSlider('change', prev);
					}else{
						var next = hs.g.curImageIndex < hs.g.imagesNum ? hs.g.curImageIndex + 1 : 1
						el.hoverSlider('change', next);
					}
				}
			});
		}
		
		// PauseOnHover
		
		if( hs.o.pauseOnHover == true ){
			
			hs.g.hsBottom.hover(
				function(){

					if( hs.g.autoSlideshow ){
						hsStop(el);
						hs.g.paused = true;
					}
				},
				function(){
					if( hs.g.paused ){
						hsStart(el);
						hs.g.paused = false;
					}						
				}
			);
			el.find('.hs-inner').hover(
				function(){

					if( hs.g.autoSlideshow ){
						hsStop(el);
						hs.g.paused = true;
					}
				},
				function(){
					if( hs.g.paused ){
						hsStart(el);
						hs.g.paused = false;
					}						
				}
			);
		}

		// Applying skin
		
		el.addClass('hs-'+hs.o.skin);
		hs.g.hsBottom.addClass('hs-btm-'+hs.o.skin);

		var skinStyle = hs.o.skinsPath+hs.o.skin+'/skin.css';

		if (document.createStyleSheet){
			document.createStyleSheet(skinStyle);
		}else{
			$('<link rel="stylesheet" href="'+skinStyle+'" type="text/css" />').appendTo( $('head') );
		}				
					
		// If imagePreload is true, preloading all images

		hsImagePreload(el, function(){

			// BUGFIX v1.5 fixed firstImage (curImageIndex changed to nextImageIndex)

			hsChange(el, hs.g.nextImageIndex);

			// If autostart is true, begin to slide
			if( hs.o.autoStart ){
				hsStart(el);
			}
		});
		
		// Setting sizes

		$(window).resize(function() {
		  hsResizeSlider(el);
		});			

		hsResizeSlider(el);
	};
	
	// Formatting easing types

	var hsEasing = function( e ){

		if( $.trim(e.toLowerCase()) == 'swing' || $.trim(e.toLowerCase()) == 'linear'){
			return e.toLowerCase();
		}else{
			return e.replace('easeinout','easeInOut').replace('easein','easeIn').replace('easeout','easeOut').replace('quad','Quad').replace('quart','Quart').replace('cubic','Cubic').replace('quint','Quint').replace('sine','Sine').replace('expo','Expo').replace('circ','Circ').replace('elastic','Elastic').replace('back','Back').replace('bounce','Bounce');				
		}
	};
	
	var hsStart = function(el){

		var hs = el.data('hoverSlider');

		if( hs.g.autoSlideshow ){
			hsChange(el);
		}else{
			hs.g.autoSlideshow = true;
			hsTimer(el);
		}
	};
	
	var hsTimer = function(el){
		
		var hs = el.data('hoverSlider');

		var hsSlideDelay = hs.g.curImage.data('slidedelay') ? hs.g.curImage.data('slidedelay') : hs.o.slideDelay;

		clearTimeout( hs.g.slideTimer );
		hs.g.slideTimer = window.setTimeout(function(){
			hsStart(el);
		}, hsSlideDelay );
	};

	var hsStop = function(el){

		var hs = el.data('hoverSlider');

		clearTimeout( hs.g.slideTimer );
		hs.g.autoSlideshow = false;
	};

	// Preloading images

	var hsImagePreload = function(el, callback){

		var hs = el.data('hoverSlider');

		if( hs.o.imagePreload == true ){
			
			var preImages = [];
			var preloaded = 0;
			el.find('.hs-inner img').each(function(){
				preImages.push($(this).attr('src'));
			});
			el.find('*').each(function(){

				if( $(this).css('background-image') != 'none' && $(this).css('background-image').indexOf('url') != -1 ){
					var bgi = $(this).css('background-image');
					bgi = bgi.match(/url\((.*)\)/)[1].replace(/"/gi, '');
					preImages.push(bgi);
				}
			});

			if(preImages.length == 0){
				callback();
			}else{
				for(x=0;x<preImages.length;x++){
					$('<img>').load(function(){
						if( ++preloaded == preImages.length ){
							callback();
						}
					}).attr('src',preImages[x]);
				}					
			}
		}else{
			callback();
		}
	};

	var hsChange = function(el, num){

		var hs = el.data('hoverSlider');

		// Calculating next image

		if(!num){
			var num = hs.g.curImageIndex < hs.g.imagesNum ? hs.g.curImageIndex + 1 : 1;
		}

		hs.g.nextImageIndex = num;
		hs.g.nextImage = el.find('.hs-image:eq('+(num-1)+')');

		hsAnimate(el);
	};

	var hsAnimate = function(el){

		var hs = el.data('hoverSlider');

		// Animating

		if( hs.g.curImageIndex != hs.g.nextImageIndex ){

			clearTimeout( hs.g.slideTimer );

			// This must be set first because of hover event

			hs.g.curImageIndex = hs.g.nextImageIndex;
			hs.g.curImage = hs.g.nextImage;

			hsAnimateSlider(el, hs.g.nextImageIndex);

			// Animating out .hs-html layers

			el.find('.hs-html').each(function(){

				// Getting per slide settings of all HTML

				var hsHTMLDurationOut = $(this).data('htmldurationout') ? parseInt($(this).data('htmldurationout')) : hs.o.htmlDurationOut;
				var hsHTMLEasingOut = $(this).data('htmleasingout') ? $(this).data('htmleasingout') : hs.o.htmlEasingOut;

				if( $(this).hasClass('hs-left') ){
					
					$(this).stop(true, true).dequeue().animate({
						left : - $(this).outerWidth(true) / 2
					}, hsHTMLDurationOut, hsHTMLEasingOut );
				}else if( $(this).hasClass('hs-right') ){
					
					$(this).stop(true, true).dequeue().animate({
						right : - $(this).outerWidth(true) / 2
					}, hsHTMLDurationOut, hsHTMLEasingOut );					
				}else if( $(this).hasClass('hs-top') ){
					
					$(this).stop(true, true).dequeue().animate({
						top : - $(this).outerHeight(true) / 2
					}, hsHTMLDurationOut, hsHTMLEasingOut );					
				}else if( $(this).hasClass('hs-bottom') ){
					
					$(this).stop(true, true).dequeue().animate({
						bottom : - $(this).outerHeight(true) / 2
					}, hsHTMLDurationOut, hsHTMLEasingOut );					
				}
				
				$(this).dequeue().fadeOut( hs.o.sliderDuration / 2, 'easeOutQuad' );

			});

			// Animating in current .hs-html layer

			var HTML = hs.g.nextImage.parent().next();
			if( HTML.is('.hs-html') ){

				// Getting per slide settings of current HTML

				var hsHTMLDurationIn = HTML.data('htmldurationin') ? parseInt(HTML.data('htmldurationin')) : hs.o.htmlDurationIn;
				var hsHTMLDelay = HTML.data('htmldelay') ? parseInt(HTML.data('htmldelay')) : hs.o.htmlDelay;
				var hsHTMLEasingIn = HTML.data('htmleasingin') ? HTML.data('htmleasingin') : hs.o.htmlEasingIn;

				if( HTML.hasClass('hs-left') ){
					
					HTML.stop(true, true).delay(hsHTMLDelay).queue(function(){
						$(this).dequeue().animate({
							left : 0
						}, hsHTMLDurationIn, hsHTMLEasingIn );
						$(this).dequeue().fadeIn( hsHTMLDurationIn / 2, 'easeOutQuad' );
					});
				}else if( HTML.hasClass('hs-right') ){
					
					HTML.stop(true, true).delay(hsHTMLDelay).queue(function(){
						$(this).dequeue().animate({
							right : 0
						}, hsHTMLDurationIn, hsHTMLEasingIn );
						$(this).dequeue().fadeIn( hsHTMLDurationIn / 2, 'easeOutQuad' );
					});
				}else if( HTML.hasClass('hs-top') ){
					
					HTML.stop(true, true).delay(hsHTMLDelay).queue(function(){
						$(this).dequeue().animate({
							top : 0
						}, hsHTMLDurationIn, hsHTMLEasingIn );
						$(this).dequeue().fadeIn( hsHTMLDurationIn / 2, 'easeOutQuad' );
					});
				}else if( HTML.hasClass('hs-bottom') ){
					
					HTML.stop(true, true).delay(hsHTMLDelay).queue(function(){
						$(this).dequeue().animate({
							bottom : 0
						}, hsHTMLDurationIn, hsHTMLEasingIn );
						$(this).dequeue().fadeIn( hsHTMLDurationIn / 2, 'easeOutQuad' );
					});
				}
			}

			// Getting per slide settings of current image

			var hsFadeDuration = hs.g.nextImage.data('fadeduration') ? parseInt(hs.g.nextImage.data('fadeduration')) : hs.o.fadeDuration;

			// Fading out previous images
			
			// BUGFIX v1.5 function .fadeTo(0) is not working properly on IE8 - changed to .fadeOut()

			el.find('.hs-image-container:not(:eq('+(hs.g.nextImageIndex-1)+'))').each(function(){

				$(this).stop(true,true).fadeOut( hsFadeDuration );
				$(this).find('.hs-image').stop();
			});

			// Fading in current image

			hs.g.nextImage.parent().stop(true,true).css({
				opacity: 0,
				display: 'block'
			}).fadeTo( hsFadeDuration, 1, function(){
				if( hs.o.autoStart == true && hs.g.paused != true ){
					hsTimer(el);
				}
			});

			// Ken Burns effect

			var img = hs.g.nextImage;

			if( img.hasClass('hs-kenburns') ){

				// Getting per slide settings of current image

				var hsKBZoomFactor = img.data('kbzoomfactor') ? parseFloat(img.data('kbzoomfactor')) : hs.o.kbZoomFactor;
				var hsKBZoomType = img.data('kbzoomtype') ? img.data('kbzoomtype') : hs.o.kbZoomType;
				var hsKBDuration = img.data('kbduration') ? parseFloat(img.data('kbduration')) : hs.o.kbDuration;
				var hsKBEasing = img.data('kbeasing') ? img.data('kbeasing') : hs.o.kbEasing;
				
				switch( hsKBZoomType ){
					
					case 'in':
						var zoomType = 0;
					break;
					case 'out':
						var zoomType = 1;
					break;
					case 'random':
						var zoomType = Math.floor(Math.random()*2);
					break;
				}
				
				img.width('auto');
				img.height('auto');

				var imgRatio = img.width() / img.height();

				// Switching zoomType
				
				switch( zoomType ){
					
					// Zoom in
					
					case 0:

						// Calculatin width and height properties

						img.height( hs.g.sliderHeight() );
						if( img.width() < hs.g.sliderWidth() ){
							img.height( hs.g.sliderWidth() / imgRatio );
						}

						img.width( img.height() * imgRatio );
						
						var imgEndW = Math.ceil(img.width() * hsKBZoomFactor);
						var imgEndH = Math.ceil(img.height() * hsKBZoomFactor);

						// Randomizing left and top properties

						var imgStartL = ( hs.g.sliderWidth() - img.width() ) / 2;
						var imgStartT = ( hs.g.sliderHeight() - img.height() ) / 2;
						var imgEndL = Math.random() * ( hs.g.sliderWidth() - imgEndW );
						var imgEndT = Math.random() * ( hs.g.sliderHeight() - imgEndH );

					break;

					// Zoom out

					case 1:

						// Calculating width and height properties

						img.height( hs.g.sliderHeight() * hsKBZoomFactor );

						if( img.width() / hsKBZoomFactor < hs.g.sliderWidth() ){
							img.height( hs.g.sliderWidth() * hsKBZoomFactor / imgRatio );
						}

						img.width( img.height() * imgRatio );

						var imgEndW = img.width() / hsKBZoomFactor;
						var imgEndH = img.height() / hsKBZoomFactor;

						// Randomizing top and left properties
						
						var imgStartL = Math.random() * ( hs.g.sliderWidth() - img.width() );
						var imgStartT = Math.random() * ( hs.g.sliderHeight() - img.height() );
						var imgEndL = Math.floor( ( hs.g.sliderWidth() - imgEndW ) / 2 );
						var imgEndT = Math.floor( ( hs.g.sliderHeight() - imgEndH ) / 2 );

					break;
				}
				
				var W = imgStartW = Math.round(img.width());
				var H = Math.round(img.height());
				var L = Math.round(imgStartL);
				var T = Math.round(imgStartT);

			    var canvas = el.find('.hs-image-container:eq('+(hs.g.nextImageIndex-1)+') .hs-canvas');

				if( hs.g.hasCanvas() == true ){

				    var context = canvas[0].getContext('2d');
				}else{
					
					canvas.width( img.width() );
					canvas.height( img.height() );
					canvas.css({
						left : imgStartL,
						top : imgStartT
					});
					var WW;
				}

				// drawImage

				var drawImage = function(){
					
					// If the browser has canvas capability

					if( hs.g.hasCanvas() == true ){

						context.drawImage(img[0], L, T, W, H );

					}else{

						// If the browser has no canvas capability and it is ie

						if( jQuery.browser.msie ){

							WW = W / imgStartW;
							LL = L - imgStartL;
							TT = T - imgStartT;

							canvas.css({'filter': 'progid:DXImageTransform.Microsoft.Matrix(FilterType="bilinear",M11=' + WW + ',M12=0,M21=0,M22=' + WW + ',Dx='+LL+' ,Dy='+TT+' )'});

						// If the browser has no canvas capability and it is not IF (for example: older version of Mozilla Firefox, etc.)

						}else{

							canvas.css({
								width : W,
								height : H,
								left : L,
								top : T
							});
						}
					}
				};

				// Show image for the first time
				
				drawImage();
				
				// Animate image with delay

				img.css({
					width : W,
					height : H,
					left : L,
					top : T
				}).stop().delay( hs.o.fadeDuration ).animate({
					width : imgEndW,
					height : imgEndH,
					left : imgEndL,
					top : imgEndT
				},
				{
					duration : hsKBDuration,
					easing : hsKBEasing,
				  	step: function(now, fx){

						switch( fx.prop ){
							case 'width':
							W = now;
							break;
							case 'height':
							H = now;
							break;
							case 'left':
							L = now;
							break;
							case 'top':
							T = now;
							break;
						}

						drawImage();
					}
				});				
			}

		}
	};
	
	var hsAnimateSlider = function(el, num){

		var hs = el.data('hoverSlider');

		// Animating the slider at the bottom of HoverSlider

		hs.g.hsBottom.find('.hs-slider').stop().animate({
			left : hs.g.hsBottom.find('.hs-slider').width() * (num - 1)
		}, hs.o.sliderDuration, hs.o.sliderEasing );
		
		hs.g.hsBottom.find('.hs-controls span:eq('+(num-1)+')').css({
			color: hs.o.activeTitleColor
		}).addClass('hs-title-active');

		hs.g.hsBottom.find('.hs-controls span:not(:eq('+(num-1)+'))').css({
			color: hs.o.titleColor
		}).removeClass('hs-title-active');
	};

	var hsResizeSlider = function(el){

		var hs = el.data('hoverSlider');

		// If you are using responsive layout and you resize your browser, some positions and properties must be re-calculated in real-time

		hs.g.hsBottom.css({
			width : hs.g.sliderWidth()
		});
		hs.g.hsBottom.find('.hs-shadow').css({
			width : hs.g.sliderWidth()
		});
		var newWidth = Math.floor(hs.g.sliderWidth() / hs.g.hsBottom.find('.hs-controls span').length);
		hs.g.hsBottom.find('.hs-controls span, .hs-slider').css({
			width : newWidth
		});
		hs.g.hsBottom.find('.hs-slider').css({
			left : newWidth * (hs.g.curImageIndex - 1)
		});
		
		el.find('.hs-canvas').each(function(){
			$(this).attr('width',hs.g.sliderWidth());
			$(this).attr('height',hs.g.sliderHeight());
		});
	};	

})(jQuery);