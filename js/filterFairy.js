"use strict";


// todo refactor so that filterSubject becomes becomes an ID for the wrapper of filterable items and the filter fields.
// first paramater must be the CSS selector for the wrapper
//
// if .filter-this is a <UL> or <OL> filterable items will be <LI>s
// if .filter-this is a <TABLE> then filterable items will be <TR>s
// if .filter-this is a <SECTION> then filterable items will be <ARTICLE>s
// additional paramaters:
//	if string use it as an alternate child selector
//	if boolean set hideAllOnEmptyFilter
//	if function set postFilterFunc

/**
 * @function filterFairy() uses form fields to dynamically filter a group of items
 */
$.filterFairy = function( filterSubject , filterFields , postFilterFunc ) {
	

	// ======================================
	// START paramater validation
	
	/**
	 * @var boolean canDo whether or not filteFairy is viable.
	 */
	var canDo = true;
	var tmp;
	// validate filterSubject
	if( _validateType(filterSubject) !== 'string' ) {
		console.log( 'The first parameter for filterFairy must be a string' );
		canDo = false;
	} else if( $(filterSubject).length === 0 ) {
		console.log('The first parameter for filterFairy "' + filterSubject + '" did not match any items. i.e. it can\'t find anything to filter' );
		canDo = false;
	};

	// validate filterFields
	tmp = _validateType(filterFields);
	if( tmp === 'string' ) {
		filterFields = [ filterFields ];
	};

	if ( tmp !== 'array' ) {
		console.log( 'The second paramater for filterFairy must be a string or an array' );
		canDo = false;
	};

	var tmpFilterFields = [];
	// valiate each item in filterFields;

	for( var i = 0 ; i < filterFields.length ; i += 1 ) {
		// check if item is a string
		if( _validateType(filterFields[i]) === 'string' ) {
			// check if item finds any fields;
			if( $(filterFields[i]).length > 0 )  {
				tmp = _getUsableFilterField(filterFields[i]);
				if( tmp !== false ) {
					tmpFilterFields.push(tmp);
				} else {
					console.log( 'filterFairy\'s second parameter, Item ' + ( i + 1 ) + ' ("' + filterFields[i] + '") was not an HTML form field.i.e. it can\'t be used as a filter!' );
				};
			} else {
				console.log( 'filterFairy\'s second parameter, Item ' + ( i + 1 ) + ' ("' + filterFields[i] + '") didn\'t match any items. i.e. it can\'t be used as a filter!' );
			};
		} else {
			console.log( 'filterFairy\'s second parameter, Item ' + ( i + 1 ) + ' must be a string.' ); 
		};
	};
	if( tmpFilterFields.length === 0 ) {
		console.log( 'filterFairy\'s second paramater did not have any usable filter fields.');
		canDo = false;
	} else {
		filterFields = tmpFilterFields;
	};

	// did anything go wrong?
	if( canDo === false ) {
		console.log( 'Because of the previously mentioned errors, filterFairy cannot continue. Goodbye!' );
	};

	// check postFilterFunc is a function
	if( _validateType(postFilterFunc) !== 'function' ) {
		postFilterFunc = function(){};
	};

	// END: paramater validation
	// ======================================

	/**
	 * @var array resetFilterFunc a function that first hides all
	 *	filterable items then returns an array of all the
	 *	unfiltered filterable items 
	 */
	var resetFilterFunc;

	var hideAllOnEmptyFilter = false;
	
	this.setHideAllOnEmptyFilter = function( input ) {
		if( _validateType(input) === 'boolean' ) {
			hideAllOnEmptyFilter = input;
			return true;
		};
		return false;
	};

	function getFilterableItems( ) {

		/**
		 * @var array filterableItemsArray list of all the
		 *	filterable items
		 */
		var filterableItemsArray = [];

		/**
		 * @var numeric a local itterator for looping through an
		 *	array
		 */
		var a = 0;

		// build an array where each filterable item is represented by
		// a function that tests whether a supplied string is matched
		// by an item in an array within the function
		$( filterSubject ).each(function(){
			if( $(this).attr('class') == undefined ) { 
				return;
			};
			var tmpItem = $(this).get();

			var classes = _splitValueOnWhiteSpace( $(this).attr('class') );
			var jQueryRef = $(this);
			/**
			 * @function filterableItem() does everything to do with filtering an item.
			 */
			function filterableItem() { 
				/**
				 * @function testFilter()  takes a string and checks if it matches
				 *	     any of the items in its array if the string is empty
				 *
				 * @param string filterString the string to be matched
				 *
				 * @return boolean numeric If the string is not empty, then TRUE is
				 *	   returned if the string was matched or FALSE otherwise.
				 *	   If filterString is empty then the ID of the filterable
				 *	   item is returned.
				 */
				this.testFilter = function( filterList ) {debugger;
					var filterListType = _validateType(filterList);
					if( filterListType === 'string' ) {debugger;
						filterList = [ filterList ];
					};debugger;
					if( filterListType !== 'array' ) {debugger;
						console.log( 'parameter one for filterableItem.testFilter() must be an array! "' + _validateType(filterString) + '" given.' );
					};debugger;
					/**
					 * @var string classArray the list of items applied to the
					 *	filterable item (split on space)
					 */
					var classArray = classes;

					for( var i = 0 ; i < filterList.length ; i += 1 ) {debugger;
						// loop through the class array
						for( var j = 0 ; j < classArray.length ; j += 1 ) {
							console.log( 'filterList[' + i + '] = ' + filterList[i] );console.log('classArray[' + j + '] = ' + classArray[j] );console.log( filterList[i] == classArray[j] );
							debugger;
							// check if the string was matched by an item in the array
							if( filterList[i] == classArray[j] ) {debugger;
								// yes we have a match
								return true;
							};
						};
					};debugger;
					// no there was no match for this item.
					return false;
				};

				/**
				 * @function getID() returns the index of the filterable item
				 */
				this.getID = function() {
					var index = a;
					return index;
				};

				/**
				 * @function showItem() makes the the
				 *	     item visible if it was hidden
				 */
				this.showItem = function() {
					var index = a;console.log('index = ' + index );
					$(filterSubject).eq(index).addClass('filter-show').removeClass('filter-hide');
				};

				/**
				 * @function hideItem() hides the item
				 *	     if it was visible
				 */
				this.hideItem = function() {
					var index = a;
					$(filterSubject).eq(index).addClass('filter-hide').removeClass('filter-show');
				};

				/**
				 * @function isVisible() returns true
				 *	     if the item is currently
				 *	     visible or false if hidden
				 */
				this.isVisible = function() {
					var index = a;
					if( $(filterSubject).eq(index).hasClass('filter-hide') ) {
						return true;
					} else {
						return false;
					};
				};
			};
			// Add the function to an array
			filterableItemsArray[a] = new filterableItem();
			a += 1;
		});

		/**
		 * @function getAll() returns an array of filterabe item objects
		 *
		 * @return array a list of all the filterable items
		 */
		this.getAll = function() {
			var output = filterableItemsArray;
			return output;
		};

		/**
		 * @function showAll() makes all the filterable items
		 *	     visible
		 */
		this.showAll = function() {
			$(filterSubject).addClass('filter-show').removeClass('filter-hide');
		};

		/**
		 * @function hideAll() hides all the filterable items
		 */
		this.hideAll = function() {
			$(filterSubject).addClass('filter-hide').removeClass('filter-show');
		};
	};



	var filterableItems = new getFilterableItems();

	this.hideAll = filterableItems.hideAll;
	this.showAll = filterableItems.showAll;

	if( filterFields.length > 0 ) {
		
		// Build the list of inclusive and exclusive filters
		var exclusiveFilterFields = [];
		var inclusiveFilterFields = [];
		for( var i = 0 ; i < filterFields.length ; i += 1 ) {
			if( filterFields[i].exclusive() ) {
				exclusiveFilterFields.push(filterFields[i]);
			} else {
				inclusiveFilterFields.push(filterFields[i]);
			};
		};

		/**
		 * @function _applyFilter when any of the filter fields
		 *	     are changed (or blurred in the case of
		 *	     text/textare fields) this function is executed
		 *
		 * This function firstly hides all items. Then builds
		 * an array of which items should be shown, firstly
		 * by running exclusive filters then by adding the
		 * inclusive filters
		 */
		var _applyFilter = function() {
			/**
			 * @var array excluded initialy a list o fall the filterable items
			 *	available. Later, after a filter has been processed, it
			 *	contains items that have not been shown.
			 */
			var excluded = filterableItems.getAll();
			
			/**
			 * @var array included filterable items that are to be shown
			 */
			var included = [];
			
			/**
			 * @var array tmp temporarily holds the list of filter strings for
			 *	a given filter
			 */
			var tmp = [];

			// loop through all the exclusive filters and try against all of the
			// items that are still not visible
			for( var i = 0 ; i < filterFields.length ; i += 1 ) {
				// reset included to empty array
				included = [];
				// get the filter strings for this exclusive filter's current state
				tmp = filterFields[i].getFilterValues();
				if( tmp.length > 0 ) {
					// there is something to use lets try it on all the excluded items
					for( var j = 0 ; j < excluded.length ; j += 1 ) {
						// test this the list of filter strings against this filterable item
						if( excluded[j].testFilter( tmp ) ) {
							// Yay the filter matched something for this item lets include it
							included.push(excluded[j]);
						};							
					};
				};
				// make included excluded so that the next filter only has a limited
				// subset of filterable items to work with.
				excluded = included;
			};

			// loop through each filter fields adding matched items to the
			// included array
			if( included.length > 0 ) {
				// hide all items
				filterableItems.hideAll()
				
				// loop through all the included items
				for( var i = 0 ; i < included.length ; i += 1 ) {
					// show the included items
					included[i].showItem();
				};
			} else {
				// hide or show all items as appropriate
				if( hideAllOnEmptyFilter === true ) {
					filterableItems.hideAll()
				} else {
					filterableItems.showAll()
				};
			};
		
			postFilterFunc(included);
		};

		// loop through each filter field adding the applyFilter
		for( var i = 0 ; i < filterFields.length ; i += 1 ) {
			if( filterFields[i].getType() === 'text' ) {
				// if a filter field is text then only apply filter on blur
				$(filterFields[i].getSelector()).on('blur',_applyFilter);
			} else {
				// if a filter field is not text then try applying the filter every time it changes
				$(filterFields[i].getSelector()).on('change',_applyFilter);
			};
		};
	} else {
		// there were no filter fields so complain
		console.log('There are no filter fields to use');
	};

	/**
	 * @var array _get two dimensional array where each top level item
	 *	contains an array where the first item is the get variable
	 *	name and the second is the get variable value
	 */
	var _get = [];
	/**
	 * @var array string getString the GET part of a URL split up into
	 *	individual GET variable key/value pairs
	 */
	var getString = window.location.search.substring(1);
	if( getString !== '' ) {
		// split the GET into its individual key/value pairs
		getString = getString.split('&');
		for( var i = 0 ; i < getString.length ; i += 1 ) {
			// add the key/value pairs
			_get.push( getString[i].split('=') );
		};
	};	


	/**
	* @function presetFilter() takes the filter ID and the data
	*           attribute name/get variable and searches through the
	*           select field to find the option with the matching data
	*           key/value pair. If found, that option is preselected
	*
	* @param string selector the CSS selector for the select field to be
	*        used as the filter
	*
	* @param string attrName the data attribute name used and get variable
	*        used to store the value to be matched
	*
	* @param string getName the data attribute name used and get variable
	*        used to store the value to be matched
	*
	* @param string isDataAttr the data attribute name used and get variable
	*        used to store the value to be matched
	*/
	this.presetFilter = function( selector , attrName , getName , isDataAttr ) {

		if( _validateType(selector) !== 'string' ) {
			console.log( 'presetFilter\'s first paramater must be a string' );
			return;
		};
		if( _validateType(attrName) !== 'string' ) {
			console.log( 'presetFilter\'s second paramater must be a string' );
			return;
		};
		if( _validateType(getName) !== 'string' ) {
			getName = attrName;
		};
		if( _validateType(isDataAttr) !== 'boolean' ) {
			isDataAttr = true;
		};
	
		var _get_ = _get;
		var goodToGo = false;
	
		for( var i = 0 ; i < filterFields.length ; i += 1 ) {
			if( filterFields[i].useFilter(selector) === true ) {

				// loop through the GET variables
				for( var j = 0 ; j < _get_.length ; j += 1 ) {

					// check the key to see if it matches
					if( _get_[j][0] == getName ) {
						// asign the value
						filterFields[i].preset( _get_[j][1] , attrName , isDataAttr );
						goodToGo = true;
						break;
					};
				};
				if( goodToGo === true ) {
					// nothing left to do, break out of the out of the outer loop.
					break;
				};
			};
		};
	};


// ==================================================================
/**
 * @function _getUsableFilterField() find the element matched by a given
 *           ID and returns its input type
 *
 * @param string filterField the ID of a given form field
 *
 * @return string false form field type if ID belonged to a form
 *         field or FALSE if it did not
 */
	function _getUsableFilterField( filterField ) {
		try {	/**
			 * @var string fieldType HTML element the filter form field is
			 */
			var fieldType = $(filterField).prop('tagName').toLowerCase();
		} catch(e) {
			console.log('Supplied filter field selector (' + filterField + ') did not match anything in the DOM.'); 
			return false;
		};

		/**
		 * @var string _tmpFilterField contains possible modified
		 *		filterField selector
		 */
		var _tmpFilterField = filterField;

		/**
		 * @var funcion _useFilter() used to test whether the
		 *	object matches the selector provided
		 */
		var _useFilter=  function( selector ) {
			if( selector === filterField  ) {
				return true;
			};
			return false;
		};

		/**
		 * @var function _getSelector returns the selector
		 *	used to match the filter field
		 */
		var _getSelector = function() {
			return filterField;
		};

		/**
		 * @var function _preset() presets the filter field
		 *	based on the value of a GET variable
		 */
		var _preset;

		/**
		 * @var function _getFilterValues() returns an array
		 *	of filterField values of the selected/checked
		 *	item (or an empty array in the case of checkboxes
		 *	if the box isn't checked
		 */
		var _getFilterValues;

		/**
		 * @var function _getType() returns the type of
		 *	filterField [ text , select , radio , checkbox ]
		 */
		var _getType;

		/**
		 * @var bolean goodToGo whether or not the selector
		 *	provided is a usable filter field
		 */
		var goodToGo = false;
		
		/**
		 * @var string _chooser the string used to check
		 *	whether a select/radio/checkbox field is selected
		 */
		var _chooser = 'checked';
		
		var _exclusive = false;
		
		if( fieldType == 'input' ) {
			// becaues this is an input we need to know wht type of input
			fieldType = $(filterField).attr('type').toLowerCase();
			
			if( fieldType === 'checkbox' ) {
				// checkbox fields need a custom function for presetting
				_preset = function( attrValue , attrName , isData ) {
					if( _validateType(attrValue) !== 'string' ) {
						console.log( 'first praramater for preset() must be a string' );
						return;
					};
					if( _validateType(attrName) !== 'string' ) {
						console.log( 'second praramater for preset() must be a string' );
						return;
					};

					if( isData === true ) {
						if( $(filterField).data(attrName) === attrValue ) {
							$(filterField).attr( 'checked' , 'checked' );
							return true;
						};
					} else {
						if( $(filterField).attr(attrName) === attrValue ) {
							$(filterField).attr( 'checked' , 'checked' );
							return true;
						};
					};
					return false;
				};
			
				_getFilterValues = function() {
					var output = $( filterField + ':' + _chooser).val();console.log('$(' + filterField + ':' + _chooser + ').val() = "' + output + '"');
					if( _validateType(output) === 'string' && output.trim() !== '' ) {
						return _splitValueOnWhiteSpace(output);
					} else {
						return [];
					};
				};
			} else if( fieldType !== 'radio' ) {
				// if the input field is not a radio or checkbox, treat it like a text field
				fieldType = 'text';
			};
			goodToGo = true;
		};

		if( fieldType === 'text' || fieldType === 'textarea' ) {
			fieldType = 'text';

			_getFilterValues = function() {
				return _splitValueOnWhiteSpace( $(filterField).val() );
			};

			_preset = function( attrValue , attrName , isData ) {
				if( _validateType(attrValue) !== 'string' ) {
					console.log( 'first praramater for preset() must be a string' );
					return false;
				};
				$(filterField).val(attrValue ) ;
			};
		
			goodToGo = true;
		};

		if( fieldType === 'radio' ) {
			var round = false;
			$(_tmpFilterField).each(function() {
				if( round === false && $(this).data('exclusive') ) {
					_exclusive = true;
				};
			});
		};
		if( $(filterField).data('exclusive') ) {
			_exclusive = true;
		};
	
		if ( fieldType === 'select' || fieldType === 'radio' ) {
			if( fieldType === 'select' ) {
				_tmpFilterField = filterField + ' option';
				_chooser = 'selected';
			} else { // radio
				_tmpFilterField = 'input[name="' + $(filterField).attr('name') + '"]';

				_getSelector = function() {
					return _tmpFilterField;
				};
			};
		
			_useFilter =  function( selector ) {
				if( selector === filterField || selector ===  _tmpFilterField ) {
					return true;
				};
				return false;
			};

			_getFilterValues = function() {
				var output = $( _tmpFilterField + ':' + _chooser ).val();console.log('$(' + _tmpFilterField + ':' + _chooser + ').val() = "' + output + '"');
				if( _validateType(output) === 'string' && output.trim() !== '' ) {
					return _splitValueOnWhiteSpace(output);
				} else {
					return [];
				};
			}
			_preset = function( attrValue , attrName , isData ) {

				var preset = false;
				var msg = '';

				if( _validateType(attrValue) !== 'string' ) {
					console.log( 'first praramater for preset() must be a string' );
				};

				if( _validateType(attrName) !== 'string' ) {
					console.log( 'second praramater for preset() must be a string' );
				};

				if( isData === true ) {
					$( _tmpFilterField ).each(function(){
						if( $(this).data(attrName) === attrValue ) { 
							$(this).attr( _chooser , _chooser );
							preset = true;
						};
					});
				} else {
					$( _tmpFilterField ).each(function(){
						if( $(this).attr(attrName) === attrValue ) {
							$(this).attr( _chooser , _chooser );
							preset = true;
						};
					});
				};
				return preset;
			};
			goodToGo = true;
		} else {
			
		};
		
		if( goodToGo === true ) {
			_getType = function() {
				return fieldType;
			};
			var usableFilterField = function() {
				this.getSelector = _getSelector;
				this.useFilter = _useFilter;
				this.getType = _getType;
				this.getFilterValues = _getFilterValues;
				this.preset = _preset;
				this.attrType = null;
				this.exclusive = function() { return _exclusive; };
			};

			return new usableFilterField();
		} else {
			console.log('Supplied filterField (' + filterField + ') did not return a valid form field type. ' + tagname + ' was returned. Was expecting, select; input or textarea');
			return false;
		};
	};


	/**
	 * @function _splitValueOnWhiteSpace() takes a string, trims white
	 *           space from begining and end, converts multiple white
	 *           space characters into single space characters then splits
	 *           the string into an array
	 *
	 * @param string inputValue the string to be split
	 *
	 * @return array a list of items that were separated by one or more
	 *         white space characters
	 */
	function _splitValueOnWhiteSpace( inputValue ) {
		var regex = /\s+/; 
		try {
			return inputValue.trim().replace(regex,' ').split(' ');
		} catch(e) {
//			console.log(e);
			return [];
		};
	};

	function _validateType( input ) {
		try {
			return $.type(input);
		} catch(e) {
			return false;
		};
	};

	return this;
}
