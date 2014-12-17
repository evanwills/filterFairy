"use strict";


if( typeof console !== 'object' ) {
	var Console = function() {
		this.log = function() { };
		this.warn = function() { };
		this.error = function() { };
		this.info = function() { };
	};
	var console = new Console();
};


/**
 * @function filterFairy() uses form fields to dynamically filter a
 *	     group of items
 *
 * @param string filterWrapper a selector for a tag that wraps both
 *	  filter fields and filter items
 */
$.FilterFairy = function( filterWrapper ) {

	// validate filterWrapper
	if( _validateType(filterWrapper) !== 'string' ) {
		console.error( 'The first and only parameter for filterFairy must be a string' );
		return false;
	};



// ==================================================================
// Start declaring variables

	/**
	 * @var boolean canDo whether or not filteFairy is viable.
	 */
	var canDo = true;

	/**
	 * @var function/object filterFields list of filters to be used
	 */
	var filterFields;

	/**
	 * @ver function/object filterableItems an object that manages
	 *	all the filterable items as a group
	 */
	var filterableItems;

	/**
	 * @var boolean hideAllOnEmptyFilter if you want the items to be
	 *	hidden if nothing is matched, set this to true
	 */
	var hideAllOnEmptyFilter = false;

	/**
	 * @var array fields list of filterFields
	 */
	var fields;

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

	/**
	 * @function applyFilter when any of the filter fields
	 *	     are changed (or blurred in the case of
	 *	     text/textare fields) this function is executed
	 *
	 * This function firstly hides all items. Then builds
	 * an array of which items should be shown, firstly
	 * by running exclusive filters then by adding the
	 * inclusive filters
	 */
	var applyFilter

// END:   declaring variables
// ==================================================================
// START: declaring functions

	/**
	 * @function _getFilterableItems() handles building an array of
	 *	     filterableItem objects which are then used for
	 *	     interacting with the DOM
	 *
	 * @return function/object that has a number of property
	 *	   functions to facilitate doing stuff
	 */
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

		/**
		 * @var numeric index local itterator for looping through an
		 *		array
		 */
		var index = -1;

		if( $(filterWrapper + ' .filter-this').length === 0 ) {
			// cutting our losses there's nothing to filter.
			// See ya lata Turkey
			console.error( '"' + filterWrapper + '" did not match any items. i.e. it can\'t find anything to filter' );
			return false;
		} else {

			$( filterThis ).each( function() {

				/**
				 * @var string filterThisItem the tag name used for filterable
				 *	items within this .filter-this wrapper
				 */
				var filterThisItem = '';

				/**
				 * @var string tmpFilterThis the selector for this group of
				 *	filterable items.
				 */
				var tmpFilterThis = '';

				tmpItemWrapper = $(this).prop('tagName').toLowerCase();

				// check whether we've encountered this tag name before
				if( $.inArray( tmpItemWrapper , filterThisTags ) > -1 ) {
					// we've done this one before;
					return;
				};

				// store the tag name so we know we've used it before
				filterThisTags.push(tmpItemWrapper);

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
							console.warning( 'This non-standard filterable item wrapper (' + filterWrapper + ' ' + tmp + '.filter-this' + filterThisItem + ') didn\'t contain any .filter-item nodes. It may be useable as a filterable item itself');
							return;
						};
						tmpItemWrapper = '';
				};

				tmpFilterThis = filterWrapper + ' ' + tmpItemWrapper + '.filter-this' + filterThisItem;


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
			} else if ( $(filterThisSelectors).length > 0 ) {
				// We found something to filter
				if( nonStandardFilterItems.length > 0 ) {
					// But there were some duds too. (We'll just ignore them)
					// console.log( 'Found a number of non-standard filter item wrappers ("' + nonStandardFilterItems.join('.filter-this" , "') + '.filter-this") these will be ignored');
				};
				// make a single selector for all the filterable items
//				filterThis = filterThisSelectors.join(' , ');
			} else {
				// Well that sucks! Couldn't find any filterable items.
				console.warning( 'Couldn\'t find any filterable items using "' + filterThis + '". Nothing to do!!!');
				return;
			};


			// build an array where each filterable item is represented by
			// a function that tests whether a supplied string is matched
			// by an item in an array within the function
			for( var i = 0 ; i < filterThisSelectors.length ; i += 1 ) {

				$(filterThisSelectors[i]).each(function() {

					/**
					 * @var object item the jQuery reference object for this filterable
					 *	item, used as a permanent connection to the DOM element.
					 */
					var item = $(this).get();

					/**
					 * @var object tmpClasses the jQuery object containing the list of
					 *	classes for this filterable tiem
					 */
//					var classes = _extractDOMTokenList($(this).prop('classList'));

					/**
					 * @var array classes list of classes for this filterable item used
					 *	to decide whether or not this filterable itme should be
					 *	hidden or visible
					 */
					var classes = _splitValueOnWhiteSpace($(this).attr('class'));

					if( classes.length < 1 ) {
						return;
					};



					/**
					 * @function filterableItem() does everything to do with filtering an item.
					 */
					function FilterableItem() {
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
						 * @function showItem() makes the the item visible if it was hidden
						 */
						this.showItem = function() {
							if( $(item).hasClass('filter-hide') ) {
								$(item).removeClass('filter-hide').addClass('filter-show');

							};
						};

						/**
						 * @function hideItem() hides the item if it was visible
						 */
						this.hideItem = function() {
							if( $(item).hasClass('filter-show') ) {
								$(item).removeClass('filter-show').addClass('filter-hide');
							};
						};

						/**
						 * @function isVisible() returns true
						 *	     if the item is currently
						 *	     visible or false if hidden
						 */
						this.isVisible = function() {
							if( $(item).hasClass('filter-hide') ) {
								return true;
							} else {
								return false;
							};
						};

						this.getClasses = function() {
							return classes;
						}
					};
					// Add the function to an array
					filterableItemsArray.push(new FilterableItem());
				});
			};
		};

		var FilterableItems = function () {
			this.getAll = function() {
				return filterableItemsArray;
			};
			this.getSelectors = function() {
				return filterThisSelectors;
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
		return new FilterableItems();
	};



	/**
	 * @function _getFilterFields() handles building an array of
	 *	     filterField objects which are used for acting on the
	 *	     filterableItems
	 *
	 * @return function/object that has a number of property
	 *	   functions to facilitate doing stuff
	 */
	function _getFilterFields() {
		/**
		 * @var array filterFieldsRepo the repository for all filterField items
		 */
		var filterFieldsRepo = [];
		/**
		 * @var array _filterFieldTypes the tree possible HTML form field types
		 */
		var _filterFieldTypes = [ 'select' , 'textarea' , 'input' ];

		/**
		 * @var array filterFieldSelectors the list of selector used to match
		 *	form filter fields
		 */
		var filterFieldSelectors = [];

		for( var i = 0 ; i < 3 ; i += 1 ) {

			$( filterWrapper + ' ' + _filterFieldTypes[i] ).each(function() {

				if( $(this).data('nofilter') || $(this).data('notfilter') ) {
					// we shouldn't use this field as a filter.
					return;
				};

				/**
				 * @var string fieldType HTML element the filter form field is
				 */
				var _fieldType = $(this).prop('tagName').toLowerCase();

				/**
				 * @var object thisField javascript object for the field.
				 */
				var thisField = $(this).get();

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
				var _id = ''

				/**
				 * @var string _name the value of the name attribute of a field
				 */
				var _name = '';

				/**
				 * @var boolean exclusiveField whether or not this field is exclusive
				 *	or not.
				 *	i.e.	if not exclusive, matching items should be shown
				 *		regardles of whether they might have already been
				 *		filtered out.
				 */
				var exclusiveField = true;

				/**
				 * @var boolean inclusiveCheckbox inclusive checkboxes need to be handled
				 *		handled slightly differently since their value is unchanging but
				 *		their state can change. The state of an inclusive checkbox should
				 *		only effect items that it matches and are already visible. To do
				 *		this inclusive checkboxes are processed with the exclusive filter
				 *		fields but must have an internal state to differentiate them from
				 *		exclusive checkboxes.
				 */
				var inclusiveCheckbox = false;

				/**
				 * @var boolean priority whether or not an inclusive field should be
				 *		processed before or after exclusive fields
				 */
				var priority = false;

				/**
				 * @var funcion _useFilter() used to test whether the
				 *	object matches the selector provided
				 */
				var _useFilter;

				/**
				 * @function _preset() presets the filter field
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
				 * @function _testItem() checks whether any items in the supplied
				 *	array match any of the values in this filterField's list of
				 *	values
				 *
				 * @param array itemClasses list of classes supplied by the
				 *	  filterable item being processed
				 *
				 * @return boolean TRUE if a class matched one of the filter's values
				 *	   FALSE otherwise
				 */
				var _testItem;
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

				/**
				 * @var string getName
				 */
				var _getName = '';

				/**
				 * @function _setGetName()
				 */
				var _setGetName = function( input ) {
					if( _validateType(input) === 'string' && input !== '' ) {
						// we have something useful asign it to _getName
						_getName = input;
						return true;
					} else if( _getName === '' ) {
						// _getName has never been defined, we'll give it a default value
						if( _name !== '' ) {
							_getName = _name;
							return true;
						} else if( _id !== '' ) {
							_getName = _id;
							return true;
						};
					};
					return false;
				};

				/**
				 * @function inverseResult() returns the opposite of the boolean supplied
				 *
				 * @var boolean result
				 *
				 * @return boolean FALSE if result is TRUE, or TRUE otherwise
				 */
				var inverseResult;

				/**
				 * @object for handling everything to do with individual filter fields
				 */
				var UsableFilterField;


				if( _validateType($(this).prop('id')) === 'string' ) {
					var _id = $(this).prop('id');
				};

				if( _validateType($(this).prop('name')) === 'string' ) {
					var _id = $(this).prop('name');
				};


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

				if( _selector !== '' &&  $.inArray( _selector , filterFieldSelectors ) === -1 ) {
					// we haven't seen this one before. Add it to the list
					filterFieldSelectors.push(_selector);
				} else {
					// already got this one.
					return true;
				}

				if( $(this).data('inclusive') ) {
					// this is an inclusive filter. i.e. items matched by this filter
					// will be shown regardless of preceeding or succeeding filters
					exclusiveField = false;

					switch( $(this).data('inclusive').toLowerCase() ) {
						case 'exclusive':
						case 'checkbox':
							if( _fieldType === 'checkbox' ) {
								// this filter needs to be treated as a normal exclusive filter because
								exclusiveField = true;
								// but we want the filter to know that it's sort of inclusive.
								inclusiveCheckbox = true;
							}
							break;
						case 'priority':
						case 'first':
						case 'before':
							priority = true;
							break;
					}
				}

				if( $(this).data('inverse') !== undefined && $(this).data('inverse') !== false ) {
					inverseResult = function( result ) { return !result; };
				} else {
					inverseResult = function( result ) { return result; };
				}

				_useFilter=  function( selector ) {
					// does the supplied selector match any of the possible selectors
					if( $.inArray( selector , _matchingSelectors ) !== -1 ) {
						return true;
					};
					return false;
				};

				if( _fieldType === 'checkbox' ) {

					// checkbox fields need a custom function for presetting
					_preset = function( attrValue , attrName , isData , tryValue ) {
						if( ( isData === true && $(_selector).data(attrName) === attrValue ) || ( isData === false && $(_selector).attr(attrName) === attrValue ) || (tryValue === true && $(_selector).val() === attrValue ) ) {
							// Yay! it matched make the checkbox checked
							$(_selector).attr( 'checked' , 'checked' );
							return true;
						};
						return false;
					};

					if( inclusiveCheckbox ) {

						_getFilterValues = function() {
							return _getValAsList( _selector );
						};


						// an inclusiveCheckbox checkbox works slightly differently to other filters.
						// if an item has matching classes it will be shown or hidden based
						// on whether the checkbox is ticked or not respectively however, if
						// the item doesn't match, it will be shown anyway.
						_testItem  = function ( itemClasses ) {

							/**
							 * @var array value list of strings split on space to be used
							 *	to check items against
							 */
							var value = _getValAsList( _selector );

							/**
							 * @var boolean usable just because an item doesn't match
							 *	doesn't mean it shouldn't be shown
							 */
							var usable = false;


							// loop through each itemClass to see if any match
							for( var i = 0 ; i < itemClasses.length ; i += 1 ) {
								if( $.inArray( itemClasses[i] , value ) !== -1 ) {
									// how about that, this one matches.
									usable = true;
									break;
								};
							};

							if( usable === false || inverseResult($(_selector).is(':checked')) ) {
								return true;
							} else {
								return false;
							}
						};
					} else {

						_getFilterValues = function() {
							return _getValAsList( _selector + ':checked' );
						};
						// exclusive (default) checkboxes work in the normal way, you're
						// either in or you're out
						_testItem  = function ( itemClasses ) {
							/**
							 * @var array value list of strings split on space to be used
							 *	to check items against
							 */
							var value = _getValAsList( _selector );

							// loop through each itemClass to see if any match
							for( var i = 0 ; i < itemClasses.length ; i += 1 ) {
								if( $.inArray( itemClasses[i] , value ) !== -1 ) {

									// how about that, this one matches.
									return inverseResult(true);
								};
							};
							// oh well better luck next time.
							return inverseResult(false);
						};
					};
					goodToGo = true;

				} else if ( _fieldType === 'text' ) {

					_getFilterValues = function() {
						return _getValAsList( _selector );
					};

					_preset = function( attrValue , attrName , isData , tryValue ) {
						// since a text[area] field only has text. presetting it is just about
						// adding text
						$(_selector).val(attrValue ) ;
					};

					_testItem  = function ( itemClasses ) {

						/**
						 * @var array value list of strings split on space to be used
						 *	to check items against
						 */
						var value = _getValAsList( _selector );

						// loop through the classes to see if any match
						for( var i = 0 ; i < itemClasses.length ; i += 1 ) {
							if( $.inArray( itemClasses[i] , value ) !== -1 ) {

								// yay one of the classes matches one of the sub-strings in the value
								return inverseResult(true);
							};
						};
						return inverseResult(false);
					};
					goodToGo = true;
				} else  if ( _fieldType === 'select' || _fieldType === 'radio' ) {

					/**
					 * @var string _selectorSub the selector string individual
					 *	items <select> <option>s or <input type="radio"> fields
					 */
					var _selectorSub = _selector;
					if( _fieldType === 'select' ) {
						_selectorSub += ' option';
						_chooser = 'selected';
					};

					/**
					 * @var string _selectorSelected the selector that matches the
					 *	selected <option> or <input type="radio">
					 */
					var _selectorSelected = _selectorSub + ':' + _chooser;

					_getFilterValues = function() {
						// give'm the list of filter strings as an array
						return _getValAsList( _selectorSelected );
					}

					_preset = function( attrValue , attrName , isData , tryValue ) {

						if( isData !== false ) {
							// check the if this has a data attribute that matches the value
							$( _selectorSub ).each(function(){
								if( $(this).data(attrName) === attrValue ) {
									// Yay! it matched make the checkbox checked
									$(this).attr( _chooser , _chooser );
									return true;
								}
							});
						} else if ( tryValue === true ) {
							// check if it has a normal attribute that matches the value
							$( _selectorSub ).each(function(){

								if( $(this).val() === attrValue ) {
									// Yay! it matched make the checkbox checked{
									$(this).attr( _chooser , _chooser );
									return true;
								};
							});
						} else {
							// check if it has a normal attribute that matches the value
							$( _selectorSub ).each(function(){
								if( $(this).attr(attrName) === attrValue ) {
									// Yay! it matched make the checkbox checked{
									$(this).attr( _chooser , _chooser );
									return true;
								}
							});
						};
						return false;
					};

					_testItem  = function ( itemClasses ) {

						/**
						 * @var array value list of strings split on space to be used
						 *	to check items against
						 */
						var value = _getValAsList( _selectorSelected );

						for( var i = 0 ; i < itemClasses.length ; i += 1 ) {

							// loop through each itemClass to see if any match
							if( $.inArray( itemClasses[i] , value ) !== -1 ) {

								// how about that, this one matches.
								return inverseResult(true);
							};
						};
						// bummer it didn't match
						return inverseResult(false);
					};
					goodToGo = true;
				};

				if( goodToGo === true ) {
					// create the object for this filter field
					var UsableFilterField = function() {
						/**
						 * method for getting the cononical string for matching this filterField
						 * @returns {string} the string used to uniquely identify this
						 *                   filterField
						 */
						this.getSelector = function() { return _selector; };

						/**
						 * method for getting an array of strings used to match this
						 * filterField
						 *
						 * @returns {array} list of strings that could be used to identify
						 *					this field
						 */
						this.getMatchingSelectors = function() { return _matchingSelectors; };

						/**
						 * method for working out if this filter should be used based on selector provided
						 *
						 * @param {string} selector to try and match this field
						 *
						 * @return {boolean} TRUE if the filterField was matched by the
						 *					 selector. FALSE otherwise
						 */
						this.useFilter = _useFilter;
						this.getType = function() {
							// give 'em the form field type
							// [ 'text' , 'radio' , 'checkbox' , 'select' ]
							return _fieldType;
						};
						this.getFilterValues = _getFilterValues;

						/**
						 * @method getFilterValuesCount() for getting the number of filter
						 *		   values for the current state of the filter field
						 *
						 * @returns {numeric} the number of items in the array of filter
						 *			values for the current state of this filterField
						 */
						this.getFilterValuesCount = function() {
							var output = _getFilterValues();
							return output.length;
						};
						this.preset = _preset;
						this.attrType = null;

						/**
						 * @method testItem() checks whether any items in the supplied
						 *	array match any of the values in this filterField's list of
						 *	values
						 *
						 * @param array itemClasses list of classes supplied by the
						 *	  filterable item being processed
						 *
						 * @return boolean TRUE if a class matched one of the filter's values
						 *	   FALSE otherwise
						 */
						this.testItem = _testItem;

						/**
						 * @method isInclusiveCheckbox() returns the incState of this filterField
						 * @returns {boolean} TRUE if this is an inclusive checkbox FALSE
						 *                    otherwise.
						 */
						this.isInclusiveCheckbox = function() { return inclusiveCheckbox; };

						/**
						 * @method inclusive() returns whether this field is an inlcusive
						 *			filterField
						 *
						 * @returns {boolean} TRUE if the filterField is inclusive.
						 *					  FALSE otherwise
						 */
						this.isExclusive = function() { return exclusiveField; };

						/**
						 * @method setGetName() sets the name of the GET variable used to
						 *		   preset this filterField's value
						 *
						 * @param {string}
						 */
						this.setGetName = _setGetName;

						/**
						 * @method getGetName() returns the name of the GET variable used to
						 *		   preset this filter field
						 * @returns {string} the GET varialbe name used to preset this field
						 */
						this.getGetName = function() { return _getName; };

						/**
						 * @method triggerChange() causes this field to trigger change
						 */
						this.triggerChange = function() { $(thisField).trigger('change'); };

						/**
						 * @method hasPriority() returns the priority state of the field.
						 * @return {boolean} whether or not this field should be processed as inclusive
						 *                   with priority
						 */
						this.hasPriority = function() { return priority; };
					};

					// add the object to the list of filter fields
					filterFieldsRepo.push( new UsableFilterField() );
					goodToGo = false;
				} else {
					// bummer
					// console.log('Supplied filterField (' + _Selector + ') did not return a valid form field type. ' + _fieldType + ' was returned. Was expecting, select; input or textarea');
					return;
				};

			});
		};
		if( filterFieldsRepo.length === 0 ) {
			console.error('"' + filterWrapper + '" did not contain any form fields. i.e. can\'t find any thing to use as a filter.' );
			return false;
		} else {
			var FilterFieldsObj = function() {
				// all good so far we
				this.getAll = function() { return filterFieldsRepo; };
				this.getField = function ( selector ) {
					for( var i = 0 ; i < filterFieldsRepo.length ; i += 1 ) {
						if( filterFieldsRepo[i].useFilter(selector) === true ) {
							return filterFieldsRepo[i];
						};
					};
					return false;
				};
			};
			return new FilterFieldsObj();
		};
	};

	/**
	 * @function _getValAsList() returns the value of a form field's
	 *	     current state as an array split on spaces
	 *
	 * @param string selector jQuery selector to be used to find the
	 *	  string to split
	 *
	 * @return array a list of items that were separated by one or more
	 *         white space characters
	 */
	function _getValAsList( selector ) {
		if( $(selector).val() !== undefined ) {
			return _splitValueOnWhiteSpace( $(selector).val() );
		} else {
			return [];
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
			var output = $.trim(inputValue.replace(regex,' '));

			if( output !== '' ) {
				return output.split(' ');
			} else {
				return [];
			}
		} catch(e) {
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
 * @function _setPushState() updates the page's URL so that it can be
 *	     bookmarked and be in the browser history
 *
 * @return boolean TRUE if the push state was updated FALSE otherwise
 */
	function _setPushState() {
// console.log(window.location);
	};

// END:   declaring functions
// ==================================================================
// START: checking if it's worth continuing


	filterableItems = _getFilterableItems();
	filterFields = _getFilterFields();

	// did anything go wrong?
	if( filterFields === false || filterableItems === false ) {
		console.error( 'Because of the previously mentioned errors, filterFairy cannot continue. Goodbye!' );
		return false;
	};


// END:   checking if it's worth continuing
// ==================================================================
// START: declaring property functions




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

		var tryValue = false;
		if( _validateType(selector) !== 'string' ) {
			console.error( 'presetFilter\'s first paramater must be a string' );
			return;
		};
		if( _validateType(attrName) !== 'string' ) {
			attrName = selector;
			tryValue = true;
		};
		if( _validateType(getName) !== 'string' ) {
			getName = attrName;
		};
		if( _validateType(isDataAttr) !== 'boolean' ) {
			isDataAttr = true;
		};
		/**
		 * @var array fields list of filterField objects
		 */
		var field = filterFields.getField(selector);

		if( fields !== false ) {
			// loop through the GET variables
			for( var j = 0 ; j < _get.length ; j += 1 ) {
				// check the key to see if it matches
				if( _get[j][0] == getName ) {
					// asign the value
					field.preset( _get[j][1] , attrName , isDataAttr , tryValue );
					field.setGetName(getName);
					field.triggerChange();
					return true;
				};
			};
		};
		return false;
	};


	/**
	 * @function setHideAllOnEmptyFilter() sets the hideAllOnEmpty
	 *	     property of this object. i.e. if your filter matches
	 *	     nothing, it hides everything. Default is FALSE.
	 *
	 * @param boolean input
	 *
	 * @return boolean TRUE if hideAllOnEmptyFilter was updated
	 *	   FALSE otherwise
	 */
	this.setHideAllOnEmptyFilter = function( input ) {
		if( _validateType(input) === 'boolean' ) {
			hideAllOnEmptyFilter = input;
			return true;
		};
		return false;
	};


	/**
	 * @function hideAll() hides all filterable items
	 */
	this.hideAll = function() {
		filterableItems.hideAll();
	}


	/**
	 * @function showAll() exposes all filterable items
	 */
	this.showAll = function() {
		filterableItems.showAll();
	}

	/**
	 * @object for storing and handling filterFields of a given type
	 */
	function FilterFieldsObj() {
		/**
		 * @var array typeFields list of filterField objects that are
		 *		of the same type (i.e. checkbox, inclusive, exclusive)
		 */
		var typeFields = [];

		/**
		 * @var array fieldSelectors list of selectors that identify
		 *		the filterFields of this type
		 */
		var fieldSelectors = [];


		/**
		 * @function addField() checks whether the given field has
		 *		already been added to the list of filterFields of
		 *		this type, if not it just appends it to the end of
		 *		the list, if so it removes the last instance and
		 *		appends it to the end of the list.
		 *
		 * @param filterField object being added
		 */
		this.addField = function ( thisField ) {
			/**
			 * @var string selector the selector that matches the field being
			 *		added
			 */
			var selector = thisField.getSelector();

			/**
			 * @var numeric ind the index of the filterField's position in the
			 *		list of fields being used
			 */
			var ind = $.inArray( selector , fieldSelectors );

			/**
			 * @var array tmpTypeFields a temporary storage place for typeFields
			 *		while the order is being updated.
			 */
			var tmpTypeFields = [];

			/**
			 * @var array tmpFieldSelectors a temporary storage place for
			 *		fieldSelectors while their order is being updated.
			 */
			var tmpFieldSelectors = [];

			if( ind > -1 ) {
				// we've used this field before lets pull it out of list
				for( var i = 0 ; i < typeFields.length ; i += 1 ) {

					if( i !== ind ) {
						// this is not the field we're adding
						tmpTypeFields.push( typeFields[i] );
						tmpFieldSelectors.push( fieldSelectors[i] );
					}
				}
				// replace the lists with the temporary lists, excluding the field
				// we're adding now
				typeFields = tmpTypeFields;
				fieldSelectors = tmpFieldSelectors
			}

			if( thisField.getFilterValuesCount() > 0 ) {
				// add this field to the end of the list
				typeFields.push( thisField );
				fieldSelectors.push( selector );
			}

		}

		/**
		 * @function getFields() returns the list of filterField objects that
		 *			 are stored in this object
		 *
		 * @returns {array} list of filterFields that have been changed by the user
		 */
		this.getFields = function() {
			return typeFields;
		}

	}


// END:   declaring property functions
// ==================================================================
// START: create the filter field event function


	fields = filterFields.getAll();
	if( fields.length > 0 ) {

		// Build the list of inclusive and exclusive filters
//		var priorityInclusiveFitlerFields = new FilterFieldsObj();
		var exclusiveFilterFields = new FilterFieldsObj();
		var inclusiveFilterFields = new FilterFieldsObj();
		var priorityInclusiveFields = new FilterFieldsObj();


		/**
		 * @function applyFilter when any of the filter fields
		 *	     are changed (or blurred in the case of
		 *	     text/textare fields) this function is executed
		 *
		 * This function firstly hides all items. Then builds
		 * an array of which items should be shown, firstly
		 * by running exclusive filters then by adding the
		 * inclusive filters
		 */
		applyFilter = function() {

			/**
			 * @var array excluded initialy a list o fall the filterable items
			 *	available. Later, after a filter has been processed, it
			 *	contains items that have not been shown.
			 */
			var source = filterableItems.getAll();

			var tmpSource = [];

			/**
			 * @var array Excluded a storage bucket for filterable items that
			 *	were not included by the current filter
			 */
			var excluded = [];

			/**
			 * @var array included filterable items that are to be shown
			 */
			var included = [];

			/**
			 * @var array filterStrings temporarily holds the list of filter strings for
			 *	a given filter
			 */
			var filterStrings = [];

			/**
			 * @var string filterType the current type of filter being processed
			 */
			var filterType = false;

			/**
			 * @var array the list of fields of this filter type
			 */
			var fields = [];

			/**
			 * @var array list of filter types
			 */
			var types = [ 'priorityInclusive' , 'exclusive' , 'inclusive' ];

			/**
			 * @var numeric processedFilters the number of filters that have been
			 *		processed so far
			 */
			var processedFilters = 0;

			/**
			 * @var filterField thisField the filterField that triggered this
			 *		round of filtering
			 */
			var thisField = false;


			if( $(this).attr('name') !== undefined ) {
				thisField = filterFields.getField($(this).attr('name'));
			}

			if( thisField === false && $(this).attr('id') !== undefined ) {
				thisField = filterFields.getField($(this).attr('id'));
			}

			if( thisField === false ) {
				// nothing has changed, give up now.
				return false;
			}

			// add this filterField to the list of fields to be processed
			if( thisField.isExclusive() === true ) {
				exclusiveFilterFields.addField(thisField);
			} else {
				if( thisField.hasPriority() === true ) {
					priorityInclusiveFields.addField(thisField);
				} else {
					inclusiveFilterFields.addField(thisField);
				}
			}

			for( var h = 0 ; h < 3 ; h += 1 ) {

				switch( types[h] ) {
					case 'priorityInclusive':
						fields = priorityInclusiveFields.getFields();
						tmpSource = filterableItems.getAll();
						break;
					case 'exclusive':
						fields = exclusiveFilterFields.getFields();
						if( processedFilters > 0 ) {
							tmpSource = included;
						} else {
							tmpSource = filterableItems.getAll();
						}
						break;
					case 'inclusive':
						fields = inclusiveFilterFields.getFields();
						tmpSource = excluded;
						break;
				}

				if( fields.length > 0 ) {
					source = tmpSource;
					tmpSource = null;

					// loop through this type of filters
					for( var i = 0 ; i < fields.length ; i += 1 ) {
						if( fields[i].getFilterValuesCount() > 0 || fields[i].isInclusiveCheckbox() === true ) {
							processedFilters += 1;
							// there is something to use lets try it on all the excluded items
							for( var j = 0 ; j < source.length ; j += 1 ) {

								// test this the list of filter strings against this filterable item
								if( fields[i].testItem(source[j].getClasses()) ) {
									// Yay the filter matched something for this item lets include it
									if( $.inArray(source[j],included) === -1 ) {
										included.push(source[j]);
									}
								} else {
									if( $.inArray(source[j],excluded) === -1 ) {
									// Oh well, we'll save this one for later
										excluded.push(source[j]);
									}
								};
							};
						};
						if( i < ( fields.length - 1 ) ) {
							if( types[h] === 'exclusive' ) {
								// make included excluded so that the next filter only has a limited
								// subset of filterable items to work with.
								source = included;
								if( source.length === 0 ) {
									break;
								}
								excluded = [];
								included = [];
							} else {
								// since this is an inclusive filter, we only want to add itmes that
								// are not already being shown
								source = excluded;
								excluded = [];
							};
						};
					};
				};
			};

			if( processedFilters > 0 ) {
				// loop through each filter fields adding matched items to the
				// included array
				filterableItems.hideAll();

				// loop through all the included items
				for( var i = 0 ; i < included.length ; i += 1 ) {
					// show the included items
					included[i].showItem();
				};
			} else if ( hideAllOnEmptyFilter === true ) {
				filterableItems.hideAll();
			} else {
				filterableItems.showAll();
			};

			// set push state
			_setPushState();

		};

		// loop through each filter field adding the applyFilter
		for( var i = 0 ; i < fields.length ; i += 1 ) {

			if( fields[i].getType() === 'text' ) {
				// if a filter field is text then only apply filter on blur
				$(fields[i].getSelector()).on('blur',applyFilter);
			} else {
				// if a filter field is not text then try applying the filter every time it changes
				$(fields[i].getSelector()).on('change',applyFilter);
			};
		};
	} else {
		// there were no filter fields so complain
		console.error('There are no filter fields to use');
	};
	if( getString !== '' ) {
		// split the GET into its individual key/value pairs
		getString = getString.split('&');
		for( var i = 0 ; i < getString.length ; i += 1 ) {
			// add the key/value pairs
			_get.push( getString[i].split('=') );
		};
	};

};
