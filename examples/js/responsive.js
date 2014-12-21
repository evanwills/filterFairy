// Responsive  and BS JavaScript

//used to ensure widow size makes a real difference
((function(){
	var _sizematch = $(window).width();//how big is your screen
	var _sizetrigger = 799;//what size should trigger stuff
	var _livemenu;//holds the currently open menu
	var _posmenu;
	var _liveTimer;//used as a setTimout holder
	var _livecounterdelay=10;//how long to delay in micro seconds
	var _feedback;
	//deal with stuff that needs to change on resize
	function small_settings(){
		//$('#main-body').css({width: _sizematch + 'px'});
		$('#autosug').remove();
   		if(_sizematch <= _sizetrigger) {
    		//deal with 
    		if(!document.getElementById('fake_menu_button')) {
    			$('#global-main').css('min-height',($(window).height()) + 'px');
				//make a menu button
				var fmb = $('<div>').attr('id','fake_menu_button');
				//$(fmb).html('Menu');
				$(fmb).html('Menu <img src="//www.acu.edu.au/?a=594229" width="14" height="15" alt="menu">');
				$(fmb).addClass('btn btn-primary');
				$(fmb).click(toggle_menu);
				$('#h_wrap').append(fmb);
				//copy the search into the menu 
				fmb = $('<div>').attr('id','fake_search').html($('#site-search').html());
				$(fmb).insertBefore($('#global-main').find('ul').first());
				//need to add a feedbackform link to mega menu
				create_feedback_button();
				$('#vidlib').val('ACUi');
				
    		};
    	} else {
    		//check to see if its comming from a small size
    		if(document.getElementById('fake_menu_button')) {
    			$('#global-main').removeAttr('style');
    			$('#main-body, #global-main').removeClass('is_open');
    			$('#fake_menu_button, #fake_search, #fake_feedback').remove();
    			$('#vidlib').val('ACU');
    		};
    	};
	};
	function create_feedback_button() {
		
		if(document.getElementById('slide-out-div')) {
			fmb = $('<li>').html('<h2><a>Feedback</a></h2>');
			$(fmb).attr({id: 'fake_feedback'});
			$(fmb).click(function(){
				var _s = $('#slide-out-div');
				if($(_s).attr('class').indexOf('opened') >= 0) {
	    				$(_s).removeClass('opened');
	    				$(_s).addClass('closed');
	    			} else {
	    				$(_s).addClass('opened');
	    				$(_s).removeClass('closed');
	    			};
			});
			$('#mega-menu').append(fmb);
			
  		};
	};
	
	//open and close the menu
	function toggle_menu() {
		$('#autosug').remove();
		if($('#main-body').attr('class').indexOf('is_open') >= 0) {
			$('#main-body, #global-main').removeClass('is_open');
			$('#main-body').css('left','0px');
			$('#fake_menu_button').html('Menu <img src="//www.acu.edu.au/?a=594229" width="14" height="15" alt="menu">');
			//$('.carousel').carousel('cycle');
			var _s = $('.slide-out-div')[0];
			if($(_s) && $(_s).attr('class') && $(_s).attr('class').indexOf('opened')) {
				$(_s).removeClass('opened');
				$(_s).addClass('closed');
			};
			window.scrollTo(0, 0);
		} else {
			$('#main-body, #global-main').addClass('is_open');
			//$('#main-body').css('left','-260px');
			$('#main-body').css('left','-260px');
			$('#fake_menu_button').html('Close <img src="//www.acu.edu.au/?a=594229" width="14" height="15" alt="menu">');
			$('.carousel').carousel('pause');
		};
	};
	
	//makes sure the menu closes while we wait for the new window to open
	//over ride the click action of second level when inner ul not displayed
	function menu_calls(e) {
		//only while in small screen
    	if(_sizematch < _sizetrigger) {
    		//lets see if it has children and show them
    		e = ( e ) ? e : event;
			var el = e.target || e.srcElement;
			//test for h3 parent and parent parent containing ul
			if($(el).parent().is("h3") && $(el).parent().parent().find('ul').length > 0) {
				//test for open by added class
				if($(el).parent().parent().find('ul').first().attr('class') && $(el).parent().parent().find('ul').first().attr('class').indexOf('show_it_small') >= 0) {
					//must be second click on link complete action
					toggle_menu();
    				return(true);
				} else {
					//first click open child list
					e.preventDefault();
					//see if we have one open already
					if(_livemenu) {
						//close the open one
						$(_livemenu).parent().parent().find('ul').first().removeClass('show_it_small');
					};
					//remember open link
					_livemenu = $(el);
					//display link child
					$(_livemenu).parent().parent().find('ul').first().addClass('show_it_small');
					//move the menu to make this the top
					var _to = parseInt($(_livemenu).offset().top,10);
					window.scrollTo(0, _to);
					//stop it going to href
					return(false);
				};
			} else {
				//complete click action
				if($(el).attr('href')) {
					toggle_menu();
    				return(true);
				} else {
					//alert('correct');
					return(false);
				};
				
				
			};
    	} else {
    		//ignore
    		return(true);
    	};
	};
	

	
	//change _sizematch on window resize
	$(window).resize(function(){
    	_sizematch = $(window).width();
    	small_settings();
    	
    });
    
//initialise class
    //make sure the setting are set to screen size
    small_settings();
    //make sure menu clicks toggle side menu in small screens only
    $('#global-main').find('a').each(function(){
    	$(this).click(function(e) {
    		menu_calls(e);
    	});
    });

    if(document.getElementById('myCarousel')) {
    	//randomise initial picture in carousel
		var lst = $('#myCarousel').find('div.item');
		var ste = Math.floor((Math.random()*lst.length));
		var cnt=0;
		$(lst).each(function(){
		    if(cnt === ste){
		        $(this).addClass('active');
		    } else {
		        $(this).removeClass('active');
		    };
		    cnt+=1;
		});
		lst =$('#myCarousel').find('ol.carousel-indicators li');
		cnt=0;
		$(lst).each(function(){
		    if(cnt === ste){
		        $(this).addClass('active');
		    } else {
		        $(this).removeClass('active');
		    };
		    cnt+=1;
		});
    	/*$('#myCarousel').swiperight(function() {  
      		$('#myCarousel').carousel('prev');  
    	});  
   		$('#myCarousel').swipeleft(function() {  
      		$('#myCarousel').carousel('next');  
   		}); */
    }; 
    window.scrollTo(0, 0);
})());




/**
* hoverIntent r6 // 2011.02.26 // jQuery 1.5.1+
* <http://cherne.net/brian/resources/jquery.hoverIntent.html>
* 
* @param  f  onMouseOver function || An object with configuration options
* @param  g  onMouseOut function  || Nothing (use configuration options object)
* @author    Brian Cherne brian(at)cherne(dot)net
*/
(function($){$.fn.hoverIntent=function(f,g){var cfg={sensitivity:7,interval:100,timeout:0};cfg=$.extend(cfg,g?{over:f,out:g}:f);var cX,cY,pX,pY;var track=function(ev){cX=ev.pageX;cY=ev.pageY};var compare=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);if((Math.abs(pX-cX)+Math.abs(pY-cY))<cfg.sensitivity){$(ob).unbind("mousemove",track);ob.hoverIntent_s=1;return cfg.over.apply(ob,[ev])}else{pX=cX;pY=cY;ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}};var delay=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);ob.hoverIntent_s=0;return cfg.out.apply(ob,[ev])};var handleHover=function(e){var ev=jQuery.extend({},e);var ob=this;if(ob.hoverIntent_t){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t)}if(e.type=="mouseenter"){pX=ev.pageX;pY=ev.pageY;$(ob).bind("mousemove",track);if(ob.hoverIntent_s!=1){ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}}else{$(ob).unbind("mousemove",track);if(ob.hoverIntent_s==1){ob.hoverIntent_t=setTimeout(function(){delay(ev,ob)},cfg.timeout)}}};return this.bind('mouseenter',handleHover).bind('mouseleave',handleHover)}})(jQuery);
function drops_show(){
	$(this).addClass('js-hover');
	$(this).removeClass('li-js');
	if($(this).children('div').hasClass('align_right'))
	{$(this).children('div').addClass('showMega-right');
		}
		else{$(this).children('div').addClass('showMega-left');}
	$(this).children('div').removeClass('with-js');
	}
function drops_hide(){
	$(this).removeClass('js-hover');
	$(this).addClass('li-js');
	if($(this).children('div').hasClass('align_right'))
	{$(this).children('div').removeClass('showMega-right');
		}
		else{$(this).children('div').removeClass('showMega-left');}
	$(this).children('div').addClass('with-js');
	}

$("#mega-menu>li").hoverIntent({
		interval: 200, // milliseconds delay before onMouseOver
		over: drops_show, 
		timeout: 200, // milliseconds delay before onMouseOut
		out: drops_hide
	});
if($(window).width() > 799) {
       	$("#mega-menu>li").children('ul').addClass('with-js');
		$("#main-menu>li").addClass('li-js');
//if its touch set off the click in mega menu
		if('ontouchstart' in window || 'onmsgesturechange' in window) {
			$('#global-main').find('h2').each(function(){
				$(this).find('a').first().click(function(e) {
						e.preventDefault();
						$(this).focus();
				});
			});
		};
//end touch over ride
		$('div.tab-content').each(function(){
		var ste = 0;
		$(this).find('section').each(function(){
			if(ste != 0) {
				$(this).removeClass('active');
			};
			ste+=1;
		});
	});
		
};

//ie placeholder hack create an input see if it has placeholder attribute
//would work for any attribute, such as required
function supports_input_placeholder(vers) {
  var i = document.createElement('input');
  return vers in i;
}

//check for placeholder support add it if not part of browser
if(!supports_input_placeholder('placeholder')){
	$("input[placeholder], textarea[placeholder]").each(function(){
		if($(this).val() == ""){
			$(this).val($(this).attr("placeholder"));
			$(this).focus(function(){
				if($(this).val() == $(this).attr("placeholder")){
					$(this).val("");
				};
			});
			$(this).blur(function(){
				if($(this).val() == "") {
					$(this).val($(this).attr("placeholder"));
				};
			});
		};
	});
};

/**
  *Over ride old pop ups using the dom identifier
  *size will default to 630 X 320 unless width=[size] or height=[size] found in URL (Thick box style)
  *currently works on li.libraryvideo a, a.trickbox, a.thickbox
  *Add more selectors to add more pop up over rides
  */
((function(){
//list old pop up 
	var _oldPopups = $('li.libraryvideo a, a.trickbox, a.thickbox');//, a[rel="prettPhoto"]');//
//id of the modal
	var _modal = 'acuModal';
//current url
	var _current = document.location.href.split('/');//use this to curl remote pages
  	if(_oldPopups.length > 0) {
//we have a pop up to replace
  		$(_oldPopups).each(function() {
	  			$(this).click(function(e) {
	  				e.preventDefault();
	//default width and height
	  				var _wide = '630';
	  				var _high = '320';
	  				var _inline = false;
	  				var _inlineuse = '';
	//get the href
	  				var _ref = $(this).attr('href');
	//check for width
	  				if(_ref.indexOf('width=') >= 0) {
	  					var tmp = _ref.split('width=')[1];
	  					if(tmp.indexOf('&') >= 0) {
	  						tmp = tmp.split('&')[0];
	  					};
	  					_wide = tmp;
	  				};
	//check for height
	  				if(_ref.indexOf('height=') >= 0) {
	  					var tmp = _ref.split('height=')[1];
	  					if(tmp.indexOf('&') >= 0) {
	  						tmp = tmp.split('&')[0];
	  					};
	  					_high = tmp;
	  				};
	//check for inline content
					if(_ref.indexOf('inlineId=') >= 0 || _ref.indexOf('from=') >= 0)  {
	  					var tmp = _ref.indexOf('inlineId=') >= 0 ? _ref.split('inlineId=')[1] : _ref.split('from=')[1];
	  					if(tmp.indexOf('&') >= 0) {
	  						tmp = tmp.split('&')[0];
	  					};
	  					if(document.getElementById(tmp)) {
	  						_inline = true;
	  						_inlineuse = tmp;
	  					};
	  				};
	  				if(_inline) {
	  					$('#'+_modal+' .modal-body').html($('#' + _inlineuse).html());
	  				} else {
	//check for target id
						var _iframe=false;
						if(_ref.indexOf('iframe=') >= 0) {
		  					_iframe=true;
		  				};
						
						
						
		  				if(_ref.indexOf('div=') >= 0) {
		  					var tmp = _ref.split('div=')[1];
		  					if(tmp.indexOf('&') >= 0) {
		  						tmp = tmp.split('&')[0];
		  					};
		//they want only the named div
		  					if(_ref.indexOf(_current[2]) == -1) {
		//it will use the iframe so use passon to strip it
								var _passon = 'passonapp.php';
		  						_ref = _current[0] + '//' + _current[2] + '/apps/' + _passon + '?div=' + tmp + '&to=' + _ref;
		  					} else {
		//using load so add the required ID
		  						_ref+=' #' + tmp;
		  					};
		  				};
		  				
		//check the content is local
		  				if(!_current[2] || _ref.indexOf(_current[2]) == -1 || _iframe == true) {
		//check for youtube
							//alert('following non internal ' + _current[2]);
		  					if(_ref.indexOf('youtube.com') >= 0) {
		  						//fix bad links
		  						if(_ref.indexOf('/v/') >= 0) {
		  							_ref = _ref.replace('/v/','/embed/');
		  						}
		  						//force it to use html5 player
		  						_ref+='?html5=1';
		  						//alert(_ref);
		  					}
		 //set up the remote iFrame
		  					_ref = '<iframe name="externalcontentframe" id="externalcontentframe" src="' + _ref + '" width="' + _wide + '" height="' + _high + '" frameborder="0"></iframe>';
		  					$('#'+_modal+' .modal-body').html(_ref);
		  					
		  				} else {
		  					$('#'+_modal+' .modal-body').load(_ref);
		  				};
	  				};
	//add a little more to the width height for the modal wrapper
	  				_high = (_high * 1) + 40;
	  				_wide = (_wide * 1) + 60;
	  				$('#'+_modal+' .modal-dialog').css({'width': _wide + 'px'});
	  				$('#'+_modal+' .modal-body').css({'height':_high +'px'});
	//check for a title
	  				if($(this).attr('title')) {
	  					$('#'+_modal+' .modal-title').html($(this).attr('title'));
	  				} else {
	  					$('#'+_modal+' .modal-title').html($(this).html());
	  				};
	//show the modal
					$('#'+_modal).modal('show');
	  			});
  			
  			
  		});
  	};
//make sure the modal is cleared once closed
  	$('#'+_modal).on('hidden.bs.modal', function () {
		$('#'+_modal+' .modal-body').html('');
		$('#'+_modal+' .modal-title').html('ACU');
	}); 
})());
 //trigger the slide out both desktop and mobile	
    function set_feedback() {
		//only start if needed
		if(document.getElementById('slide-out-div')) {
				var _s = $('#slide-out-div');
	    		$(_s).addClass('closed');
	    		$(_s).find('a.handle').click(function(e) {
	    			e.preventDefault();
	    			//alert('clicked');
	    			if($(this).parent().attr('class').indexOf('opened') >= 0) {
	    				$(this).parent().removeClass('opened');
	    				$(this).parent().addClass('closed');
	    			} else {
	    				$(this).parent().addClass('opened');
	    				$(this).parent().removeClass('closed');
	    			};
	    		});
	    
		};
    };
    set_feedback();

// Modal popup for Handbook units a.modal-link 
	$('div.handbook td a, a.modal-link').click(function(e) {
		e.preventDefault();
		var ttp = document.location.href.indexOf('https') >= 0 ? 'https' : 'http';
		var passon = document.location.href.indexOf('students.acu.edu.au') >= 0 ? '://students.acu.edu.au/apps/passonapp.php?div=content&to=' : '://www.acu.edu.au/apps/passonapp.php?div=content&to=';
		var newurl= passon + $(this).attr('href');
		$('#acuModal div.modal-body').html('<p>Loading Please Wait</p>');
		$('#acuModal .modal-title').html($(this).html());
		$('#acuModal .modal-body').load(ttp + newurl);
		$('#acuModal').modal('show');
});

// Open - close all accordion tabs
function triggerCollapse() {
    state = $(this).attr('data-state');

    if (state === 'open')
    {
        $('#accordion').find('div.panel-collapse:not(.in)').collapse('show');
        newState = 'close';
        text = 'Close';
    }
    else if (state === 'close')
    {
        $('#accordion').find('div.panel-collapse.in').collapse('hide');
        newState = 'open';
        text = 'Open';
    }

    $(this).attr('data-state', newState).text(text + ' all');

    event.preventDefault();

}
$(function() {
    $('#trigger-collapse').on('click', triggerCollapse);
});