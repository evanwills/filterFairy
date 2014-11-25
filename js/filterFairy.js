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
	
	/**
	 * @var array filterFields list of filters to be used
	 */
	var filterFields;
	var filterableItems;

	var hideAllOnEmptyFilter = false;

	// validate filterWrapper
	if( _validateType(filterWrapper) !== 'string' ) {
		console.log( 'The first parameter for filterFairy must be a string' );
		return false;
	};


	function _getFilterableItems() {

		/**
		 * @var array filterableItemsArray list of all the
		 *	filterable items
		 */
		var filterableItemsArray = [];

		/**
		 * @var array filterThisSelectors list of unique selectors matching
		 *	filterable items
		 */
		var filterThisSelectors = [];

		if( $(filterWrapper + ' .filter-this').length === 0 ) {
			// cutting our losses there's nothing to filter.
			// See ya lata Turkey
			console.log( '"' + filterWrapper + '" did not match any items. i.e. it can\'t find anything to filter' );
			return false;
		} else {
			/**
			 * @var string filterThis selector for finding filterable item wrappers
			 */
			var filterThis = filterWrapper + ' .filter-this';
			/**
			 * @var array filterThisTags list of wrapper tags used encountered
			 *	so far
			 */
			var filterThisTags = [];

			/**
			 * @var boolean standardFilterItems TRUE if standard filterable items
			 *	were found
			 */
			var standardFilterItems = false;
			
			/**
			 * @var array nonStandardFilterItems list of wrapper tag names for non
			 *	standard filterable items
			 */
			var nonStandardFilterItems = [];

			/**
			 * @var string tmpItemWrapper the element used for wrapping
			 *	filterable items
			 */
			var tmpItemWrapper = '';
			
			$( filterThis ).each( function() {
				tmpItemWrapper = $(this).prop('tagName').toLowerCase();
				
				// check whether we've encountered this tag name before
				if( $.inArray( tmpItemWrapper , filterThisTags ) > -1 ) {
					// we've done this one before;
					return true;
				};
				// store the tag name so we know we've used it before
				filterThisTags.push(tmpItemWrapper);
				
				/**
				 * @var string filterThisItem the tag name used for filterable
				 *	items within this .filter-this wrapper
				 */
				var filterThisItem = '';
				
				// work out the best tag name to use for filterable items
				switch( tmpItemWrapper ) {
					case 'ul': 
					case 'ol':
						// <LI> is the expected filterable item
						filterThisItem = ' li';
						standardFilterItems = true;
						break;
					case 'table':
						// <TR> is the expected filterable item
						filterThisItem = ' tbody tr';
						standardFilterItems = true;
						break;
					case 'section':
					case 'aside':
						// <ARTICLE> is the expected filterable item
						filterThisItem = ' article';
						standardFilterItems = true;
						break;
					default:
						// Assuming custom filterable item so either .filter-this nodes or
						// .filter-this .filter-item nodes are the filterable items
						filterThisItem = ' .filter-item';
						if( $(filterWrapper + ' ' + tmpItemWrapper + '.filter-this' + filterThisItem).length === 0 ) {
							// this is a non-standard filterable item wrapper have to assume that
							// it is the filterable item itself
							nonStandardFilterItems.push(tmpItemWrapper);
							console.log( 'This non-standard filterable item wrapper (' + filterWrapper + ' ' + tmp + '.filter-this' + filterThisItem + ') didn\'t contain any .filter-item nodes. It may be useable as a filterable item itself');
							return;
						};
						tmpItemWrapper = '';
				};
				/**
				 * @var string tmpFilterThis the selector for this group of
				 *	filterable items.
				 */
				var tmpFilterThis = filterWrapper + ' ' + tmpItemWrapper + '.filter-this' + filterThisItem;
				// check whether the selector matches any items and has not
				// been found before
				if( $(tmpFilterThis).length > 0 && $.inArray( tmpFilterThis , filterThisSelectors ) === -1 ) {
					// It's unique. We'll add it to the list
					filterThisSelectors.push( tmpFilterThis );
				};
			});

			if( standardFilterItems === false && nonStandardFilterItems.length > 0 ) {
				// no standard filterable items were found
				// some non-standard filterable items were found but contained no
				// standard filterable items.
				// filterable items must be the .filter-this node itself
				filterThisSelectors.push( filterWrapper + ' .filter-this' );
			};

			if ( $(filterThisSelectors).length > 0 ) {
				// We found something to filter
				if( nonStandardFilterItems.length > 0 ) {
					// But there were some duds too. (We'll just ignore them)
					console.log( 'Found a number of non-standard filter item wrappers ("' + nonStandardFilterItems.join('.filter-this" , "') + '.filter-this") these will be ignored');
				};
				// make a single selector for all the filterable items
//				filterThis = filterThisSelectors.join(' , ');
			} else {
				// Well that sucks! Couldn't find any filterable items.
				console.log( 'Couldn\'t find any filterable items using "' + filterThis + '". Nothing to do!!!');
				return false;
			};

			/**
			 * @var array filterableItemsArray list of all the
			 *	filterable items
			 */
			var filterableItemsArray = [];

			/**
			 * @var numeric a local itterator for looping through an
			 *	array
			 */
			var a = -1;

			// build an array where each filterable item is represented by
			// a function that tests whether a supplied string is matched
			// by an item in an array within the function
			for( var i = 0 ; i < filterThisSelectors.length ; i += 1 ) {
				$(filterThisSelectors[i]).each(function() {
					if( $(this).attr('class') == undefined ) { 
						return;
					};
					var tmpItem = $(this).get();

					var classes = _splitValueOnWhiteSpace( $(this).attr('class') );
					var jQueryRef = $(this);
					/**
					 * @function filterableItem() does everything to do with filtering an item.
					 */
					
					a += 1;

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
								filterListType = 'array';
							};
							if( filterListType !== 'array' ) {
								console.log( 'parameter one for filterableItem.testFilter() must be an array! "' + filterListType + '" given.' );
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
				});
			};
		};

		var _selectorCount = filterThisSelectors.length;

		var _filterableItems = function () {
			this.getAll = function() {
				return filterableItemsArray;
			};
			this.getSelectors = function() {
				return filterThisSelectors;
			};
			this.selectorCount = function() {
				return _selectorCount;
			};
			this.hideAll = function() {
				for( var i = 0 ; i < filterThisSelectors.length ; i += 1 ) {
					$(filterThisSelectors[i]).removeClass('filter-show').addClass('filter-hide');
				}
			}
			this.showAll = function() {
				for( var i = 0 ; i < filterThisSelectors.length ; i += 1 ) {
					$(filterThisSelectors[i]).removeClass('filter-hide').addClass('filter-show');
				}
			}
		};
		return new _filterableItems();
	};


	function _getFilterFields() {
		var tmpFilterFields = [];
		var _filterFieldTypes = [ 'select' , 'textarea' , 'input' ];
		var filterFieldSelectors = [];
		for( var i = 0 ; i < 3 ; i += 1 ) {
			
			$( filterWrapper + ' ' + _filterFieldTypes[i] ).each(function() {
				/**
				 * @var string fieldType HTML element the filter form field is
				 */
				var _fieldType = $(this).prop('tagName').toLowerCase();

				/**
				 * @var string _selector the selector that can be used to act on the
				 *	form field
				 */
				var _selector = '';

				/**
				 * @var array _matchingSelectors possible selectors that can be used
				 *	to match when presetting a field from URL
				 */
				var _matchingSelectors = [];

				/**
				 * @var string id the ID of the form field
				 */
				var _id = $(this).prop('id');

				/**
				 * @var string _name the value of the name attribute of a field
				 */
				var _name = $(this).prop('name');

				/**
				 * @var boolean _inclusive whether
				 */
				var _inclusive = false;

				/**
				 * @var funcion _useFilter() used to test whether the
				 *	object matches the selector provided
				 */
				var _useFilter;

				/**
				 * @var function _getSelector returns the selector
				 *	used to match the filter field
				 */
				var _getSelector;

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
				var _getType ;

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

				if( _fieldType === 'input' ) {
					// becaues this is an input we need to know what type of input
					_fieldType = $(this).prop('type').toLowerCase();
					if( _fieldType === 'submit' || _fieldType === 'button' ) {
						// buttons are no good as filters.
						return false;
					} else if ( _fieldType !== 'checkbox' && _fieldType !== 'radio' ) {
						// if it's not a checkbox or radio field treat it as text
						_fieldType = 'text';
					};
				} else if( _fieldType === 'textarea' ) {
					// if it's a <TEXTAREA>
					_fieldType = 'text';
				};

				if( $(this).prop('id') ) {
					// grab the ID if there is one
					_id = $(this).prop('id');
					// add the ID to a list of possible selectors used for finding which
					// filter to preset
					_matchingSelectors.push(_id);
					// create a usable selector for the node using its ID
					_selector = '#' + _id;
					// add that _selector as another possible match fir finding which
					// filter to preset
					_matchingSelectors.push(_selector);
				};

				if( ( _id === '' || _fieldType === 'radio' ) && $(this).prop('name') ) {
					// there was no ID or this is a usable radio field
					_selector = filterWrapper + ' ' + filterFieldTypes[i] + '[name="' + _name + '"]';
					if( _fieldType === 'radio' && $.inArray( _selector , filterFieldSelectors ) > -1 ) {
						// we've aready got this radio field
						return true;
					} else {
						_matchingSelectors.push(_name);
						$(_selector).each(function() {
							if( $(this).prop('id') ) {
								// grab all the possible selectors for this radio field
								_matchingSelectors.push( $(this).prop('id') );
								_matchingSelectors.push( '#' + $(this).prop('id') );
							};
						});
					};
				};

				if( _selector !== '' &&  filterFieldSelectors.indexOf( _selector ) === -1 ) {
					filterFieldSelectors.push(_selector);
				} else {
					// already got this one.
					return true;
				}
				
				_getSelector = function() {
					return _selector;
				};

				if( $(this).data('inclusive') ) {
					// this is an inclusive filter. i.e. items matched by this filter
					// will be shown regardless of preceeding or succeeding filters
					_inclusive = true;
				};

				_useFilter=  function( selector ) {
					if( _validateType(selector) === 'string' && $.inArray( selector , _matchingSelectors ) !== -1 ) {
						return true;
					};
					return false;
				};

				_getSelector = function() {
					return _selector;
				};

				_getType = function() {
					return _fieldType;
				};

				
				if( _fieldType === 'checkbox' ) {
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
					goodToGo = true;
				} else if ( _fieldType === 'text' ) {

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
				} else  if ( _fieldType === 'select' || _fieldType === 'radio' ) {
					if( _fieldType === 'select' ) {
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
						this.getMatchingSelectors = function() { return _matchingSelectors; };
						this.useFilter = _useFilter;
						this.getType = _getType;
						this.getFilterValues = _getFilterValues;
						this.preset = _preset;
						this.attrType = null;
						this.inclusive = function() { return _inclusive; };
					};

					tmpFilterFields.push( new usableFilterField() );
					goodToGo = false;
				} else {
					console.log('Supplied filterField (' + _getSelector() + ') did not return a valid form field type. ' + _name + ' was returned. Was expecting, select; input or textarea');
					return false;
				};
				
			});
		};
		if( tmpFilterFields.length === 0 ) {
			console.log('"' + filterWrapper + '" did not contain any form fields. i.e. can\'t find any thing to use as a filter.' );
			return false;
		};
		return function() {
			return tmpFilterFields;
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


	// did anything go wrong?

	filterableItems = _getFilterableItems();
	filterFields = _getFilterFields();

	if( filterFields === false || filterableItems === false ) {
		console.log( 'Because of the previously mentioned errors, filterFairy cannot continue. Goodbye!' );
		return false;
	};

	// check postFilterFunc is a function
	if( _validateType(postFilterFunc) !== 'function' ) {
		postFilterFunc = function(){};
	};
	
	this.setHideAllOnEmptyFilter = function( input ) {
		if( _validateType(input) === 'boolean' ) {
			hideAllOnEmptyFilter = input;
			return true;
		};
		return false;
	};

	this.hideAll = function() {
		var selectors = filterableItems.getSelectors();
		for( var i = 0 ; i < selectors.length ; i += 1 ) {
			$(selectors[i]).removeClass('filter-show').addClass('filter-hide');
		}
	}

	this.showAll = function() {
		var selectors = filterableItems.getSelectors();
		for( var i = 0 ; i < selectors.length ; i += 1 ) {
			$(selectors[i]).removeClass('filter-hide').addClass('filter-show');
		}
	}

	var fields = filterFields();console.log(fields);
	if( fields.length > 0 ) {
		
		// Build the list of inclusive and exclusive filters
		var exclusiveFilterFields = [];
		var inclusiveFilterFields = [];
		for( var i = 0 ; i < fields.length ; i += 1 ) {
			if( fields[i].inclusive() ) {
				inclusiveFilterFields.push(fields[i]);
			} else {
				exclusiveFilterFields.push(fields[i]);
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
			
			var tmpExcluded = excluded;
			
			/**
			 * @var array included filterable items that are to be shown
			 */
			var included = [];
			
			/**
			 * @var array filterStrings temporarily holds the list of filter strings for
			 *	a given filter
			 */
			var filterStrings = [];
			var filterType = false;
			while( filterType !== 'inclusive' ) {
				if( filterType === false ) {
					filterType = 'exclusive';
					var fields = exclusiveFilterFields;
				} else {
					filterType = 'inclusive';
					var fields = inclusiveFilterFields;
					excluded = tmpExcluded;
				}
			
				if( fields.length > 0 ) {

					// loop through all the exclusive filters and try against all of the
					// items that are still not visible
					for( var i = 0 ; i < fields.length ; i += 1 ) {

						// reset included to empty array
						included = [];

						// get the filter strings for this exclusive filter's current state
						filterStrings = fields[i].getFilterValues();
						if( tmp.length > 0 ) {
							// there is something to use lets try it on all the excluded items
							for( var j = 0 ; j < excluded.length ; j += 1 ) {
								// test this the list of filter strings against this filterable item
								if( excluded[j].testFilter( filterStrings ) ) {
									// Yay the filter matched something for this item lets include it
									included.push(excluded[j]);
								} else {
									// Oh well, we'll save this one for later
									tmpExcluded.push(excluded[j]);
								};		
							};
						};
						if( filterType === 'exclusive' ) {
							// make included excluded so that the next filter only has a limited
							// subset of filterable items to work with.
							excluded = included;
						} else {
							// since this is an inclusive filter, we only want to add itmes that
							// are not already being shown
							excluded = tmpExcluded;
						};
					};
				};
			};


			// loop through each filter fields adding matched items to the
			// included array
			if( included.length > 0 ) {
				// hide all items
				filterableItems.hideAll()
				var filterList = [];
				
				// loop through all the included items
				for( var i = 0 ; i < included.length ; i += 1 ) {
					// show the included items
					included[i].showItem();
					$.merge( filterList , included[i].getFilterValues() );
				};

				postFilterFunc(filterList);
			} else {
				// hide or show all items as appropriate
				if( hideAllOnEmptyFilter === true ) {
					filterableItems.hideAll()
				} else {
					filterableItems.showAll()
				};
			};
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
	 * @param string attrName the data attribute name used and get
	 *        variable used to store the value to be matched
	 *
	 * @param string getName the data attribute name used and get variable
	 *        used to store the value to be matched
	 *
	 * @param string isDataAttr the data attribute name used and get
	 *        variable used to store the value to be matched
	 *
	 * @return boolean TRUE if filter was preset. FALSE otherwise
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
	
		var goodToGo = false;
	
		for( var i = 0 ; i < filterFields.length ; i += 1 ) {
			if( filterFields[i].useFilter(selector) === true ) {

				// loop through the GET variables
				for( var j = 0 ; j < _get.length ; j += 1 ) {

					// check the key to see if it matches
					if( _get[j][0] == getName ) {
						// asign the value
						filterFields[i].preset( _get[j][1] , attrName , isDataAttr );
						return true;
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
		return false;
	};


// ==================================================================
	return this;
}
