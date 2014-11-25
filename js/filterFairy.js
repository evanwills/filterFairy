"use strict";


// todo refactor so that filterWrapper becomes becomes an ID for the wrapper of filterable items and the filter fields.
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
$.filterFairy = function( filterWrapper , postFilterFunc ) {
	

	// ======================================
	// START paramater validation
	
	/**
	 * @var boolean canDo whether or not filteFairy is viable.
	 */
	var canDo = true;
	var filterFields = [];
	// validate filterWrapper
	if( _validateType(filterWrapper) !== 'string' ) {
		console.log( 'The first parameter for filterFairy must be a string' );
		canDo = false;
	};

	if( $(filterWrapper + ' .filter-this').length === 0 ) {
		console.log( '"' + filterWrapper + '" did not match any items. i.e. it can\'t find anything to filter' );
		return false;
	} else {
		var filterThis = filterWrapper + ' .filter-this';
		var filterThisTags = [];
		var filterThisSelectors = [];
		$( filterThis ).each( function() {
			tmp = $(this).prop('tagName');
			if( $.inArray( tmp , filterThisTags ) === -1 ) {
				var filterThisItem = '';
				switch( tmp ) {
					case 'ul': 
					case 'ol':
						filterThisItem = ' li';
						break;
					case 'table':
						filterThisItem = ' tbody tr';
						break;
					case 'section':
						filterThisItem = ' article';
						break;
					default:
						console.log( );
				};
				filterThisSelectors.push(filterWrapper + ' ' + tmp + '.filter-this' + filterThisItem );
			}
		});
	};

	var filterFieldTypes = [ 'select' , 'textarea' , 'input' ];
	var filterFieldRadioIDs = [];
	for( var i = 0 ; i < 3 ; i += 1 ) {
		
		$(filterWrapper + ' ' + filterFieldTypes[i] ).each(function() {
			/**
			 * @var string fieldType HTML element the filter form field is
			 */
			var _fieldType = $(this).prop('tagName').toLowerCase();
			/**
			 * @var string _selector the selector that can be used to act on the
			 *	form field
			 */
			var _selector = '';
			var _matchingSelectors[];
			var _id = '';
			/**
			 *
			 */
			var _inclusive = false;
			
			if( _fieldType === 'input' ) {
				// becaues this is an input we need to know wht type of input
				_fieldType = $(filterField).attr('type').toLowerCase();
				if( _fieldType === 'submit' || _fieldType === 'button' ) {
					// buttons are no good as filters.
					return false;
				} else if ( _fieldType !== 'checkbox' && _fieldType !== 'radio' ) {
					_fieldType = 'text';
				};
			} else if( _fieldType === 'textarea' ) {
				_fieldType = 'text';
			};

			if( $(this).prop('id') {
				_id = $(this).prop('id');
				_matchingSelectors.push(_id);
				_selector = '#' + _id;
				_matchingSelectors.push(_selector);
				if( $(this).data('inclusive') ) {
					_inclusive = true;
				};
			};
			if( ( _id === '' || _fieldType === 'radio' ) && $(this).prop('name') ) {
				var _name = $(this).prop('name');
				_selector = filterWrapper + ' ' + filterFieldTypes[i] + '[name="' + _name + '"]' );
				if( _fieldType === 'radio' && $.inArray( _selector , filterFieldRadioIDs ) > -1 ) {
					// we've aready got this radio field
					return false;
				} else {
					_matchingSelectors.push(_name);
					$(_selector).each(function() {
						if( $(this).prop('id') {
							_matchingSelectors.push( $(this).prop('id') );
							_matchingSelectors.push( '#' + $(this).prop('id') );
						};
						if( $(this).data('inclusive') ) {
							_inclusive = true;
						};
					});
				};
			};

			/**
			 * @var funcion _useFilter() used to test whether the
			 *	object matches the selector provided
			 */
			var _useFilter=  function( selector ) {
				if( _validateType(selector) === 'string' && $.inArray( selector , _matchingSelectors ) !== -1 ) {
					return true;
				};
				return false;
			};

			/**
			 * @var function _getSelector returns the selector
			 *	used to match the filter field
			 */
			var _getSelector = function() {
				return _selector;
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
			var _getType = function() {
				return _fieldType;
			};

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
						if( $(_selector).data(attrName) === attrValue ) {
							$(_selector).attr( 'checked' , 'checked' );
							return true;
						};
					} else {
						if( $(_selector).attr(attrName) === attrValue ) {
							$(_selector).attr( 'checked' , 'checked' );
							return true;
						};
					};
					return false;
				};
			
				_getFilterValues = function() {
					var output = $( _selector + ':' + _chooser).val();console.log('$(' + filterField + ':' + _chooser + ').val() = "' + output + '"');
					if( _validateType(output) === 'string' && output.trim() !== '' ) {
						return _splitValueOnWhiteSpace(output);
					} else {
						return [];
					};
				};
			} else if ( fieldType === 'text' ) {

				_getFilterValues = function() {
					return _splitValueOnWhiteSpace( $(_selector).val() );
				};

				_preset = function( attrValue , attrName , isData ) {
					if( _validateType(attrValue) !== 'string' ) {
						console.log( 'first praramater for preset() must be a string' );
						return false;
					};
					$(_selector).val(attrValue ) ;
				};
			
				goodToGo = true;
			} else  if ( fieldType === 'select' || fieldType === 'radio' ) {
				if( fieldType === 'select' ) {
					var _selectorSelected = _selector + ' option';
					_chooser = 'selected';
				} else { // radio
					var _selectorSelected = _selector + ':' + __chooser;
				}

				_getFilterValues = function() {
					var output = $( _selectorSelected ).val();console.log('$(' + _tmpFilterField + ':' + _chooser + ').val() = "' + output + '"');
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

					if( isData !== false ) {
						$( _selector ).each(function(){
							if( $(this).data(attrName) === attrValue ) { 
								$(this).attr( _chooser , _chooser );
								preset = true;
							};
						});
					} else {
						$( _selector ).each(function(){
							if( $(this).attr(attrName) === attrValue ) {
								$(this).attr( _chooser , _chooser );
								preset = true;
							};
						});
					};
					return preset;
				};
				goodToGo = true;
			};
			
			if( goodToGo === true ) {
				var usableFilterField = function() {
					this.getSelector = _getSelector;
					this.useFilter = _useFilter;
					this.getType = _getType;
					this.getFilterValues = _getFilterValues;
					this.preset = _preset;
					this.attrType = null;
					this.inclusive = function() { return _inclusive; };
				};

				filterFields.push( new usableFilterField() );
			} else {
				console.log('Supplied filterField (' + filterField + ') did not return a valid form field type. ' + tagname + ' was returned. Was expecting, select; input or textarea');
				return false;
			};
			
		});
	};
	if( filterFields.length === 0 ) {
		console.log('"' + filterWrapper + '" did not contain any form fields. i.e. can\'t find any thing to use as a filter.' );
		return false;
	}
	
	

	var filterableItemsSrc = $(filterWrapper + ' .filter-this');



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

	/**
	 * @function _validateType() takes a variable tries to get its type.
	 *	     If successful it returns the string name of the type if
	 *	     not, it returns false
	 *
	 * @param mixed input a varialbe whose type is to be tested.
	 *
	 * @return string false string name of the variable type or false if
	 *	   type couldn't be determined
	 */
	function _validateType( input ) {
		try {
			return $.type(input);
		} catch(e) {
			return false;
		};
	};


/**
 * @function _getUsableFilterField() find the element matched by a given
 *           ID and returns its input type
 *
 * @param string filterField the ID of a given form field
 *
 * @return string false form field type if ID belonged to a form
 *         field or FALSE if it did not
 */



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


	var hideAllOnEmptyFilter = false;
	
	this.setHideAllOnEmptyFilter = function( input ) {
		if( _validateType(input) === 'boolean' ) {
			hideAllOnEmptyFilter = input;
			return true;
		};
		return false;
	};

	function _getFilterableItems( ) {

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
		$( filterableItemsSrc ).each(function(){
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
				this.testFilter = function( filterList ) {
					var filterListType = _validateType(filterList);
					if( filterListType === 'string' ) {
						filterList = [ filterList ];
					};
					if( filterListType !== 'array' ) {
						console.log( 'parameter one for filterableItem.testFilter() must be an array! "' + _validateType(filterString) + '" given.' );
					};
					/**
					 * @var string classArray the list of items applied to the
					 *	filterable item (split on space)
					 */
					var classArray = classes;

					for( var i = 0 ; i < filterList.length ; i += 1 ) {
						// loop through the class array
						if( $.inArray( filterList[i] , classArray ) !== -1 ) {
							return true;
						}
/*
						for( var j = 0 ; j < classArray.length ; j += 1 ) {
							console.log( 'filterList[' + i + '] = ' + filterList[i] );console.log('classArray[' + j + '] = ' + classArray[j] );console.log( filterList[i] == classArray[j] );
							
							// check if the string was matched by an item in the array
							if( filterList[i] == classArray[j] ) {debugger;
								// yes we have a match
								return true;
							};
						};
*/
					};
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
					$(filterWrapper).eq(index).addClass('filter-show').removeClass('filter-hide');
				};

				/**
				 * @function hideItem() hides the item
				 *	     if it was visible
				 */
				this.hideItem = function() {
					var index = a;
					$(filterWrapper).eq(index).addClass('filter-hide').removeClass('filter-show');
				};

				/**
				 * @function isVisible() returns true
				 *	     if the item is currently
				 *	     visible or false if hidden
				 */
				this.isVisible = function() {
					var index = a;
					if( $(filterWrapper).eq(index).hasClass('filter-hide') ) {
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
			$(filterWrapper).addClass('filter-show').removeClass('filter-hide');
		};

		/**
		 * @function hideAll() hides all the filterable items
		 */
		this.hideAll = function() {
			$(filterWrapper).addClass('filter-hide').removeClass('filter-show');
		};
	};



	var filterableItems = new _getFilterableItems();

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
	return this;
}
