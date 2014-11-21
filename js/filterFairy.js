"use strict";

// step 1 build an array of filterable items 
//
// object filterableItem {
// 	item : (reference to the jQuery DOM object to have classes added to or removed from to show or hide it)
// 	filterTest : function that checks a supplied string against the items in its array
// 	filterShow : function that makes an item visible
// 	filterHide : function that makes an item hidden

/**
 * @function filterFairy() uses form fields to dynamically filter a group of items
 */
$.filterFairy = function( filterSubject , filterFields , postFilterFunc ) {
	

	/**
	 * @var numeric i itterator for looping through an array
	 */
	var i = 0;
	var j = 0;
	
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
	}

	// validate filterFields
	tmp = _validateType(filterFields);
	if( tmp === 'string' ) {
		filterFields = [ filterFields ];
	}
	if ( tmp !== 'array' ) {
		console.log( 'The second paramater for filterFairy must be a string or an array' );
		canDo = false;
	}
	var tmpFilterFields = [];
	// valiate each item in filterFields;

	for( i = 0 ; i < filterFields.length ; i += 1 ) {
		// check if item is a string
		if( _validateType(filterFields[i]) === 'string' ) {
			// check if item finds any fields;
			if( $(filterFields[i]).length > 0 )  {
				tmp = _getFormFieldDetails(filterFields[i]);
				if( tmp !== false ) {
					tmpFilterFields.push(tmp);
				} else {
					console.log( 'filterFairy\'s second parameter, Item ' + ( i + 1 ) + ' ("' + filterFields[i] + '") was not an HTML form field.i.e. it can\'t be used as a filter!' );
				}
			} else {
				console.log( 'filterFairy\'s second parameter, Item ' + ( i + 1 ) + ' ("' + filterFields[i] + '") didn\'t match any items. i.e. it can\'t be used as a filter!' );
			}
		} else {
			console.log( 'filterFairy\'s second parameter, Item ' + ( i + 1 ) + ' must be a string.' ); 
		}
	}
	if( tmpFilterFields.length === 0 ) {
		console.log( 'filterFairy\'s second paramater did not have any usable filter fields.');
		canDo = false;
	} else {
		filterFields = tmpFilterFields;
	}

	// did anything go wrong?
	if( canDo === false ) {
		console.log( 'Because of the previously mentioned errors, filterFairy cannot continue. Goodbye!' );
	}

	// check postFilterFunc is a function
	if( _validateType(postFilterFunc) !== 'function' ) {
		postFilterFunc = function(){};
	}

	// END: paramater validation
	// ======================================

	/**
	 * @var array resetFilterFunc a function that first hides all
	 *	filterable items then returns an array of all the
	 *	unfiltered filterable items 
	 */
	var resetFilterFunc;

	function getFilterableItems( ) {

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
			}
			var tmpItem = $(this).get();

			var classes = _splitValueOnWhiteSpace( $(this).attr('class') );
			var jQueryRef = $(this);
			function filterableItem() { 
				/**
				 * @function filterFunc()  takes a string and checks if it matches
				 *	     any of the items in its array if the string is empty
				 *
				 * @param string filterString the string to be matched
				 *
				 * @return boolean numeric If the string is not empty, then TRUE is
				 *	   returned if the string was matched or FALSE otherwise.
				 *	   If filterString is empty then the ID of the filterable
				 *	   item is returned.
				 */
				this.testFilter = function( filterString ) {

					/**
					 * @var string classArray the list of items applied to the
					 *	filterable item (split on space)
					 */
					var classArray = classes;

					// check if the string is empty or not
					if( filterString !== '' ) {
						// get clean up the input string
						filterString = filtersString.trim();
		
						// loop through the class array
						for( i = 0 ; i < classArray.length ; i += 1 ) {
							// check if the string was matched by an item in the array
							if( filterString === classArray[a] ) {
								// yes we have a match
								return true;
							}
						}
					}
					// no there was no match for this item.
					return false;
				}

				this.getID = function() {
					var id = a;
					return id;
				}
				this.showItem = function() {
					jQueryRef.addClass('filter-show').removeClass('filter-hide');
				}
				this.hideItem = function() {
					jQueryRef.addClass('filter-hide').removeClass('filter-show');
				}
			}
			// Add the function to an array
			filterableItemsArray[a] = new filterableItem();
			a += 1;
		});

		this.getAll = function() {
			var output = filterableItemsArray;
			return output;
		};

		this.showAll = function() {
			$(filterSubject).addClass('filter-show').removeClass('filter-hide');
		};

		this.hideAll = function() {
			console.log('about to hide al filterable items');
			$(filterSubject).addClass('filter-hide').removeClass('filter-show');
		};
	}
		
	function hideItem( id ) {
		if( typeof(id) == 'number' ) {
			$(filterSubject).eq(id).addClass('filter-hide').removeClass('filter-show');
		}
	}
	
	function showItem( id ) {
		if( typeof(id) == 'number' ) {
			$(filterSubject).eq(id).addClass('filter-show').removeClass('filter-hide');
		}
	}

	var filterableItems = new getFilterableItems();

	this.hideAll = filterableItems.hideAll;
	this.showAll = filterableItems.showAll;
//	filterableItems.hideAll();

	if( filterFields.lenght > 0 ) {
		var exclusiveFilterFields = [];
		var inclusiveFilterFields = [];
		for( i = 0 ; i < filterFields.length ; i += 1 ) {
			if( filterFields[i].exclusive ) {
				exclusiveFilterFields.push(filterField[i]);
			} else {
				inclusiveFilterFields.push(filterField[i]);
			}
		}
		var _applyFilter = function( hideAll ) {
			console.log('about to apply filter');
			if( hideAll === true ) {
				filterableItems.hideAll();
			}
			var excluded = filterableItems.getAll();
			var included = [];
			var filters = [];
			if( exclusiveFilterFields.length > 0 ) {
				for( j = 0 ; j < exclusiveFilters.length ; j += 1 ) {
					included = [];
					for( i = 0 ; i < excluded.length ; i += 1 ) {
						if( excluded[i].testFilter( exclusiveFilters[i].getFilterValues() ) ) {
							included.push(excluded[i]);
						}							
					}
					excluded = included;
				}
			}

			if( inclusiveFilterFields.lenght > 0 && excluded.length > 0 ) {
				var tmpExcluded = [];
				for( j = 0 ; j < inclusiveFilters.length ; j += 1 ) {
					for( i = 0 ; i < excluded.length ; i += 1 ) {
						if( excluded[i].testFilter( exclusiveFilters[i].getFilterValues() ) ) {
							included.push(excluded[i]);
						} else {
							tmpExcluded.push(excluded[i]);
						}
					}
					excluded = tmpExcluded;
				}
			}
			// loop through each filter fields adding matched items to the included array;
			//
			for( i = 0 ; i < included.length ; i += 1 ) {
				included[i].showItem();
			}
		};

		// loop through each filter field adding the applyFilter
		for( i = 0 ; i < filterFields.length ; i += 1 ) {
			$(filterFields[i]).on('change',_applyFilter);
		}
	} 



	/**
	 * @function getFiltered() takes an array of filter strings then
	 *	     loops through all the still excluded filterable items any
	 *	     items that were matched are added to the included array and
	 *	     omitted from the excluded array
	 *
	 * @param array filterBy list of strings a match to any one of which
	 *	  will cause the filterable item to be shown.
	 *
	 * @return array list of funtions representing each filterable item.
	 */
	var getFiltered = function( filterBy ) {
		/**
		 * @var array tmpExclude the current list of excluded items
		 */
		var tmpExcluded = [];
		/**
		 * @var boolean tmp
		 */
		var tmp = false;

		/**
		 *  @var function func function for a particular filterable item
		 */
		var func;
		/**
		 * @var numeric j
		 */
		var j = 0;
		
		for( i = 0 ; i < excluded.length ; i += 1 ) {
			tmp = false;
			func = excluded[i];
			for( var j = 0 ; j < filterBy.length ; j += 1 ) {
				tmp = func( filterBy[j] );
				if( tmp === true ) {
					included.push(func);
					break;
				}
			}
			if( tmp === false ) {
				tmpExcluded.push(func);
			}
			
		}
		excluded = tmpExcluded;
		return included;
	}

	var _get = [];
	var getString = window.location.search.substring(1);
	if( getString !== '' ) {
		getString = getString.split('&');
		for( i = 0 ; i < getString.length ; i += 1 ) {
			_get.push( getString[i].split('=') );
		}
	}		


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
		}
		if( _validateType(attrName) !== 'string' ) {
			console.log( 'presetFilter\'s second paramater must be a string' );
			return;
		}
		if( _validateType(getName) !== 'string' ) {
			getName = attrName;
		};
		if( _validateType(isDataAttr) !== 'boolean' ) {
			isDataAttr = true;
		}
	
		var _get_ = _get;
		var goodToGo = false;
	
		for( i = 0 ; i < filterFields.length ; i += 1 ) {
			if( filterFields[i].useFilter(selector) === true ) {

				// loop through the GET variables
				for( j = 0 ; j < _get_.length ; j += 1 ) {

					// check the key to see if it matches
					if( _get_[j][0] == getName ) {
						// asign the value
						filterFields[i].preset( _get_[j][1] , attrName , isDataAttr );
						goodToGo = true;
						break;
					}
				}
				if( goodToGo === true ) {
					break;
				}
			}
		}
	}


// ==================================================================
/**
 * @function _getFormFieldDetails() find the element matched by a given
 *           ID and returns its input type
 *
 * @param string filterField the ID of a given form field
 *
 * @return string false form field type if ID belonged to a form
 *         field or FALSE if it did not
 */
	function _getFormFieldDetails( filterField ) {
		try {
			/**
			 * @var string fieldType HTML element the filter form field is
			 */
			var fieldType = $(filterField).prop('tagName').toLowerCase();
		} catch(e) {
			console.log('Supplied filter field selector (' + filterField + ') did not match anything in the DOM.'); 
			return false;
		}

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
			}
			return false;
		}

		/**
		 * @var function _getSelector returns the selector
		 *	used to match the filter field
		 */
		var _getSelector = function() {
			return filterField;
		}

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
					}
					if( _validateType(attrName) !== 'string' ) {
						console.log( 'second praramater for preset() must be a string' );
						return;
					}

					if( isData === true ) {
						if( $(filterField).data(attrName) === attrValue ) {
							$(filterField).attr( 'checked' , 'checked' );
							return true;
						}
					} else {
						if( $(filterField).attr(attrName) === attrValue ) {
							$(filterField).attr( 'checked' , 'checked' );
							return true;
						}
					}
					return false
				}
			
				_getFilterValues = function() {
					var output = $( filterField + ':' + _chooser).val();
					if( _validateType(output) === 'string' ) {
						return _splitValueOnWhiteSpace(output);
					} else {
						return [];
					}
				}
			} else if( fieldType !== 'radio' ) {
				// if the input field is not a radio or checkbox, treat it like a text field
				fieldType = 'text';
			}
			goodToGo = true;
		}
		if( fieldType === 'text' || fieldType === 'textarea' ) {
			fieldType = 'text';

			_getFilterValues = function() {
				return _splitValueOnWhiteSpace( $(filterField).val() );
			}

			_preset = function( attrValue , attrName , isData ) {
				if( _validateType(attrValue) !== 'string' ) {
					console.log( 'first praramater for preset() must be a string' );
					return false;
				}
				$(filterField).val(attrValue ) ;
			}
		
			goodToGo = true;
		}
		if( fieldType === 'radio' ) {
			var round = false;
			$(_tmpFilterField).each(function() {
				if( round === false ) {
					if( $(this).data('exclusive') ) {
						_exclusive = true;
					}
				}
			});
		} else {
			if( $(filterField).data('exclusive') ) {
				_exclusive = true;
			}
		}
	
		if ( fieldType === 'select' || fieldType === 'radio' ) {
			if( fieldType === 'select' ) {
				_tmpFilterField = filterField + ' option';
				_chooser = 'selected';
			} else { // radio
				_tmpFilterField = 'input[name="' + $(filterField).attr('name') + '"]';
			}
		
			_useFilter =  function( selector ) {
				if( selector === filterField || selector ===  _tmpFilterField ) {
					return true;
				}
				return false;
			}

			_getFilterValues = function() {
				var output = $( _tmpFilterField + ':' + _chooser ).val();
				if( _validateType(output) === 'string' ) {
					return _splitValueOnWhiteSpace(output);
				} else {
					return [];
				}
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
							$(this).data( _chooser , _chooser );
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
			}
			goodToGo = true;
		}
		
		if( goodToGo === true ) {
			_getType = function() {
				return fieldType;
			}
			var usableFilterField = function() {
				this.getSelector = _getSelector;
				this.useFilter = _useFilter;
				this.getType = _getType;
				this.getFilterValues = _getFilterValues;
				this.preset = _preset;
				this.attrType = null;
				this.exclusive = function() { return _exclusive; };
			}

			return new usableFilterField();
		} else {
			console.log('Supplied filterField (' + filterField + ') did not return a valid form field type. ' + tagname + ' was returned. Was expecting, select; input or textarea');
			return false;
		}
}


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
		}
	}

	function _validateType( input ) {
		try {
			return $.type(input);
		} catch(e) {
			return false;
		}
	}

	return this;
}
