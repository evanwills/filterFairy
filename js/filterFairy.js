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
console.log($(filterSubject).length);
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

//	this.hideAll = filterableItems.hideAll;
//	this.showAll = filterableItems.showAll;
	filterableItems.hideAll();

	function getFilterFields() {
		
		console.log(filterFields);
	}
	getFilterFields();

console.log(filterableItems);
	
	var _applyFilter = function( hideAll ) {
		if( hideAll === true ) {
			filterableItems.hideAll();
		}
		var excluded = filterableItems.getAll();
		var tmpExcluded = excluded;
		var included = [];

		// loop through each filter fields adding matched items to the included array;
		//
		for( i = 0 ; i < included.length ; i += 1 ) {
			showItem( included[i].getID() );
		}
	};

	// loop through each filter field adding the applyFilter
	for( i = 0 ; i < filterFields.length ; i += 1 ) {
		$(filterFields[i]).on('change',_applyFilter);
	}

	/**
	* @function presetFilterFromUrl() takes the filter ID and the data
	*           attribute name/get variable and searches through the
	*           select field to find the option with the matching data
	*           key/value pair. If found, that option is preselected
	*
	* @param string filterField the CSS selector for the select field to be
	*        used as the filter
	*
	* @param string dataAttr the data attribute name used and get variable
	*        used to store the value to be matched
	*/
	this.presetFilterFromUrl = function( filterField , dataAttr ) {
		/**
		* @var string sPageUrl the GET string part of the URL
		*/
		var getString = window.location.search.substring(1);

		/**
		* @var array getVars all of the GET variables in the url
		*/
		var getVars = getString.split('&');

		/**
		* @var boolean string dataAttrVal the value of the data Attribute
		*      to be matched
		*/
		var dataAttrVal = false;

		// loop through the GET variables
		for( var i = 0 ; i < getVars.length ; i += 1) {
			/**
			 * @var array getVarParts individual GET variable split into
			 *      its key/value pair parts
			 */
			var getVarParts = getVars[i].split('=');

			// check the key to see if it matches
			if( getVarParts[0] == dataAttr ) {
				// asign the value
				dataAttrVal = getVarParts[1];
			}
		}

		var formFieldDetails = $._getFormFieldDetails(filterField);

		if( formFieldDetails === false ) {
			return false;
		}

		// we have a value to use for preselecting
		if( dataAttrVal !== false ) {
			// loop through each option
			if( formFieldDetails.fieldType == 'select' || formFieldDetails.fieldType == 'checkbox' || formFieldDetails.fieldType == 'radio' ) {
				$( formFieldDetails.itemSelector ).each(function() {
					// check if the option has the appropriate data attribute
					// containing with the correct value
					if( $(this).data(dataAttr) == dataAttrVal ) {
						// YAY, we have a match. Make this option preselected
						$(this).attr(formFieldDetails.fieldChosen,formFieldDetails.fieldChosen);
					}
				});
			} else {
				$( formFieldDetails.itemSelector ).val(dataAttrVal);
			}
			return dataAttrVal;
		} else {
			return '';
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

	this.presetFilter = function( selector , attrName , getName ) {

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
		}
	
		for( i = 0 ; i < filterFields.length ; i += 1 ) {
			if( filterFields[i].select(selector) === true ) {
				console.log('Yay, we have a filter to preset: '+filterFields[i].getSelector());
				/**
				 * @var string sPageUrl the GET string part of the URL
				 */
				var getString = window.location.search.substring(1);
				if( getString === '' ) {
					break;
				}

				/**
				 * @var array getVars all of the GET variables in the url
				 */
				var getVars = getString.split('&');

				/**
				 * @var boolean string dataAttrVal the value of the data Attribute
				 *      to be matched
				 */
				var dataAttrVal = false;

				// loop through the GET variables
				for( var i = 0 ; i < getVars.length ; i++ ) {
					/**
					 * @var array getVarParts individual GET variable split into
					 *      its key/value pair parts
					 */
					var getVarParts = getVars[i].split('=');console.log(getVarParts);

					// check the key to see if it matches
					if(getVarParts[0] == getName ) { console.log('getVarParts[0] ("' + getVarParts[0] + '") == getName ("' + getName + '")');
						// asign the value
						filterFields[i].preset(getVarParts[1],attrName);
					}
				}
				break;
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
		console.log(filterField);
		try {
			$(filterField).prop('tagName');console.log($(filterField).prop('tagName'));
		} catch(e) {
			console.log('Supplied filter field selector (' + filterField + ') did not match anything in the DOM.'); 
			return false;
		}

		/**
		 * @var object formFieldDetails list of info about the filter form
		 *      element
		 */
		/**
		 * @var string baseSelector The selector that finds the filter
		 *           form element
		 */
		var baseSelector = filterField;

		/**
		 * @var string itemSelector the selector that selects which
		 *           item in the field is selected (used for select box and
		 *           radio buttons)
		 */

		var itemSelector = filterField;
		/**
		 * @var string valueSelector The selector for the selected item
		 *           (used for select box and radio buttons)
		 */

		var valueSelector = filterField;
		/**
		 * @var string fieldChosen the selector that finds which part
		 *           of the element is selected (used for select box and
		 *           radio buttons)
		 */
		var fieldChosen = '';

		/**
		 * @var string fieldType HTML element the filter form field is
		 */
		
		var fieldType = $(filterField).prop('tagName').toLowerCase();
		
		var _tmpFilterField = filterField;
		
		var _useFilter=  function( selector ) {
			if( selector === filterField  ) {
				return true;
			}
			return false;
		}
	
		var _.getSelector = function() {
			console.log(filterField);
			return filterField;
		}
		var goodToGo = false;

		if( fieldType == 'input' ) {
			fieldType = $(filterField).attr('type').toLowerCase();
			if( fieldType === 'checkbox' ) {
				preset = function( attrValue , attrName ) {
					console.log('filterField = ' + filterField);
					console.log('presetting checkbox field');
					console.log('attrValue = ' + attrValue );console.log('attrName = ' + attrName );
					if( _validateType(attrValue) !== 'string' ) {
						console.log( 'first praramater for preset() must be a string' );
						return;
					}
					if( _validateType(attrName) !== 'string' ) {
						console.log( 'second praramater for preset() must be a string' );
						return;
					}
					if( this.attrType !== false ) {
						if( this.attrType === null || this.attrType === 'data' ) {
							console.log($(filterField).data(attrName) );
							if( $(filterField).data(attrName) === attrValue ) {
								attrIsSet = data;
								$(filterField + '[' + attrName + '="' + attrValue +'"]' ).attr('checked','checked');
							}
						}
						if( this.attrType === null || attrIsSet == 'attr' ) {
							console.log($(filterField).attr(attrName) );
							if( $(filterField).attr(attrName) === attrValue ) {
								attrIsSet = attr;
								$(filterField + '[' + attrName + '="' + attrValue +'"]' ).attr('checked','checked');
							}
						}
					}
					if( this.attrType === null ) {
						console.log( 'preset() could not find a data attribute or normal attribute with identified by "' + attrName + '"');
						this.attrType = false;
					}
				}
			} else if( fieldType !== 'radio' ) {
				fieldType = 'text';
		-	}
			goodToGo = true;
		}
		if( fieldType === 'text' || fieldType === 'textarea' ) {
			fieldType = 'text';

			_getFilterValues = function() {
				if( $(filterField).is(':checked') ) {
					return _splitValueOnWhiteSpace( $(filterField).val() );
				} else {
					return [];
				}
			}

			_preset = function( attrValue , attrName ) {
				console.log('presetting checkbox textarea field');
				if( _validateType(attrValue) !== 'string' ) {
					console.log( 'first praramater for preset() must be a string' );
				}
				$(fieldSelector).val(attrValue ) ;
			}
		
			goodToGo = true;
		}
	
		if ( fieldType === 'select' || fieldType === 'radio' ) {
			if( fieldType === 'select' ) {
				_tmpFilterField = filterField + ' option';
				var _chooser = 'selected';
			} else { // radio
				_tmpFilterField = 'input[name="' + $(baseSelector).attr('name') + '"]';
				var _chooser = 'checked';
			}
		
			_useFilter =  function( selector ) {
				if( selector === filterField || selector ===  tmpFilterField ) {
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
			_preset = function( attrValue , attName ) {
				console.log('presetting select field');
				if( _validateType(attrValue) !== 'string' ) {
					console.log( 'first praramater for preset() must be a string' );
				}
				if( _validateType(attName) !== 'string' ) {
					console.log( 'second praramater for preset() must be a string' );
				}
				if( this.attrType !== false ) {
					if( this.attrType === null || this.attrType === 'data' ) {
						$( fieldSelector ).each(function(){
							if( $(this).data(attrName) === attrValue ) {
								attrIsSet = data;
								$(this).data(attrName).attr( _chooser , _chooser );
							}
						});
					} else {
						if( attrIsSet !== 'data' ) {
							$( fieldSelector ).each(function(){
								if( $(this).attr(attrName) === attrValue ) {
									attrIsSet = attr;
									$(this).attr(attrName).attr( _chooser , _chooser );
								}
							});
						}
					}
				}
				if( this.attrType === null ) {
					console.log( 'preset() could not find a data attribute or normal attribute with identified by "' + attrName + '"');
					this.attrType = false;
				}
			}
			goodToGo = true;
		}
		
		if( goodToGo === true ) {
			var _getType = function() {
				return fieldType;
			}
			var usableFilterField = function() {
				this.getSelector = _getSelector;
				this.useFilter = _useFilter;
				this.getType = _getType;
				this.getFilterFalues = _getFilterValues;
				this.preset = _preset;
			}
		
			console.log(usableFilterField);
			return new usableFilterField();
		} else {
			console.log('Supplied filterField (' + filterField + ') did not return a valid form field type. ' + tagname + ' was returned. Was expecting, select; input or textarea');
			formFieldDetails = false;
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
			return input ? $.type(input) : false;
		} catch(e) {
			return false;
		}
	}

	return this;
}
