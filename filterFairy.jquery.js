"use strict";


if( typeof console !== 'object' ) {
	var Console = function() {
		this.log = function() { };
		this.warn = function() { };
		this.error = function() { };
		this.info = function() { };
//		this.debug = function() { };
	};
	var console = new Console();
};


/**
 * @function filterFairy() uses form fields to dynamically filter a
 *			group of items
 *
 * @param string filterWrapper a CSS selector to match the tag that
 *		  will wrap a single filter block (usually an ID or some
 *		  other unique selector)
 *
 * Default action when instantiated:
 *	-	Finds all form fields inside the filterWrapper (excluding
 *		submit and buttons fields)
 *
 *	-	Finds all items wrapped by an element with the class
 *		'filter-this'
 *		NOTE:	if the filter this element is a
 *			-	<UL> or <OL> then the filter able items will be <LI>s
 *			-	<TABLE> then the filterable items will be <TR>s
 *			-	<SECTION> or <ASIDE> then the filterable items will
 *				be <ARTICLE>s
 *			-	otherwise filterable items will be any element will
 *				the classs 'filter-item'
 *
 *	-	Filter fields are exclusive, meaning that each field limits
 *		items that can be filtered by the next field
 *
 *	-	Filter fields are processed in the order that they are changed.
 *		e.g. field A is changed. Items not matching field a are hidden
 *			field B is changed. Items are cleared. Then field A is
 *				processed, followed by field B
 *			field C is changed. Items are cleared. Then field A is
 *				processed, followed by field B, followed by field C
 *			field B is changed again. Items are cleared. Then field A
 *				is processed, followed by field C, followed by field B
 *
 * Modifying filter behav
 *
 * <div id="filter-wrapper">
 *	 <select id="my-select-field">
 *		<option value="option1" data-my="one">Option one</option>
 *		<option value="option2" data-my="two">Option two</option>
 *		<option value="option3" data-my="three">Option three</option>
 *	 </select>
 *
 *	 <label><input type="radio" id="anotherRadioField1" name="anotherRadioField" value="option-1" /> Option 1</label>
 *	 <label><input type="radio" id="anotherRadioField2" name="anotherRadioField" value="option-2" /> Option 2</label>
 *	 <label><input type="radio" id="anotherRadioField3" name="anotherRadioField" value="option-3" /> Option 3</label>
 *
 * <!--
 *  ! data-inclusive attribute allows you to make filters inclusive
 *  !	  i.e.  items with classes match the values of the filter will
 *  !		be shown regardless of whether they may have been
 *  !		filtered out earlier
 *  !		CHECKBOXES with data-inclusive="exclusive" cause matching
 *  !		items (who have not yet been excluded) to be excluded
 *  !		only if the checkbox is checked. Items not matching the
 *  !		checkbox filter will always be shown.
 *  -->
 *	<label><input type="checkbox" id="checkboxfield" name="checkboxfield" data-cbfield="oi" value="hey-you" /> Hey you</label>
 *
 *	<ul class="filter-this">
 *		<li class="option1">filter this one</li>
 *		<li class="option2 see">filter this one instead</li>
 *		<li class="option1 option3 hey-you">filter this one</li>
 *		<li class="option2 hey-you">filter this one</li>
 *		<li class="option1 ay bee">filter this one</li>
 *		<li class="option1 hey-you">filter this one</li>
 *	</ul>
 * </div>
 *
 * @usage basic
 *
 * <script type="text/javascript">
 *	 new $.filterFairy( '#filter-wrapper');
 * </script>
 *
 *	  This will create the filters based on form fields and items with .filter-this wrappers
 *	 standard filterable item wrappers are
 *		ul.filter-this, ol.filter-this (<LI> for filter items)
 *		table.filter-this (<TR> for filter items)
 *		section.filter-this, aside.filter-this (<ARTICLE> for filter item)
 *	  or	.filter-this (.filter-item for filter item)
 * 	  the values from input (not button or submit), select and/or textarea are used as filters
 *
 *	  If you have a GET variable named anotherRadioField with a value of "ay", "bee" or "cee" the appropriate radio button will be checked automatically
 *
 *
 * @usage hiding all when no filter
 *	If you want nothing shown when the filter doesn't match
 *	anything or is blank:
 *
 * <script type="text/javascript">
 *		var filter = $.filterFairy('#filter-wrapper');
 *		filter.setHideAllOnEmptyFilter(true);
 * </script>
 *
 *
 * @usage inclusive filters
 *	  By default, filters are exclusive, meaning that when an item
 *	  is excluded by a filter, it cannot be included again.
 *	  If you want a filter to be inclusive i.e. if an item is
 *	  matched it will be shown regardless of preceeding filters,
 *	  add the data attribute 'data-inclusive="inclusive"' e.g.
 *
 *	<select id="my-select-field" data-inclusive="inclusive">
 *
 *	  NOTE:	inclusive filters are processed after exclusive
 *		filters so matched items will always be shown.
 *
 *	  Checkbox fields have the additional functionality that if
 *	  you want to hide items that are matched by the checkbox
 *	  when the checkbox is NOT checked and show them when it is
 *	  checked, use 'data-inclusive="exclusive" e.g.
 *	<input type="checkbox" id="checkboxfield" name="checkboxfield" data-cbfield="oi" value="hey-you" data-inclusive="exclusive" />
 *
 * data attributes:
 *		inclusive [ checkbox , true , first ]
 *		inverse [ true , false ]
 *		notfilter [ true , false ]
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
	var fields = [];

	var items = [];
	/**
	 * @var GetGet get object managing accessing get variable info
	 */
	var get;

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

	var tmp;

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
							$(item).removeClass('filter-hide').addClass('filter-show');
						};

						/**
						 * @function hideItem() hides the item if it was visible
						 */
						this.hideItem = function() {
							$(item).removeClass('filter-show').addClass('filter-hide');
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
			this.itemCount = function() {
				return filterableItemsArray.length;
			}
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

		$( filterWrapper + ' *' ).each( function() {

			/**
			 * @var string fieldType HTML element the filter form field is
			 */
			var fieldType = $(this).prop('tagName').toLowerCase();

			/**
			 * @var object thisField javascript object for the field.
			 */
			var thisField;

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
			var _setGetName;

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

			if( fieldType !== 'input' && fieldType !== 'select' && fieldType !== 'textarea' ) {
				return;
			}


			thisField = $(this).get();

			if( $(this).data('nofilter') || $(this).data('notfilter') ) {
				// we shouldn't use this field as a filter.
				return;
			};

			if( _validateType($(this).prop('id')) === 'string' ) {
				var _id = $(this).prop('id');
			};

			if( _validateType($(this).prop('name')) === 'string' ) {
				var _id = $(this).prop('name');
			};


			if( fieldType === 'input' ) {
				// becaues this is an input we need to know what type of input
				fieldType = $(this).prop('type').toLowerCase();

				if( fieldType === 'submit' || fieldType === 'button' ) {
					// buttons are no good as filters.
					return false;
				} else if ( fieldType !== 'checkbox' && fieldType !== 'radio' ) {
					// if it's not a checkbox or radio field treat it as text
					fieldType = 'text';
				};
			} else if( fieldType === 'textarea' ) {
				// if it's a <TEXTAREA>
				fieldType = 'text';
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

			if( ( _id === '' || fieldType === 'radio' ) && $(this).prop('name') ) {

				// there was no ID or this is a usable radio field
				_selector = filterWrapper + ' ' + _filterFieldTypes[i] + '[name="' + _name + '"]';

				if( fieldType === 'radio' && $.inArray( _selector , filterFieldSelectors ) > -1 ) {
					return;
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
						if( fieldType === 'checkbox' ) {
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

			_setGetName = function( input ) {
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

			if( fieldType === 'checkbox' ) {


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

						/**
						 * @var boolean output
						 */
						var output = false;

						if( $(_selector).is(':checked') ) {
							// loop through each itemClass to see if any match
							for( var i = 0 ; i < itemClasses.length ; i += 1 ) {
								if( $.inArray( itemClasses[i] , value ) !== -1 ) {

									// how about that, this one matches.
									output = true;
									break;
								}
							}
						}

						return inverseResult(output);
					};
				};
				goodToGo = true;

			} else if ( fieldType === 'text' ) {

				_getFilterValues = function() {
					return _getValAsList( _selector );
				};

				_testItem  = function ( itemClasses ) {

					/**
					 * @var array value list of strings split on space to be used
					 *	to check items against
					 */
					var value = _getValAsList( _selector );

					if( value.length === 0 ) {
						return inverseResult(true);
					}

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
			} else  if ( fieldType === 'select' || fieldType === 'radio' ) {

				/**
				 * @var string _selectorSub the selector string individual
				 *	items <select> <option>s or <input type="radio"> fields
				 */
				var _selectorSub = _selector;
				if( fieldType === 'select' ) {
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
				};

				_testItem  = function ( itemClasses ) {

					/**
					 * @var array value list of strings split on space to be used
					 *	to check items against
					 */
					var value = _getValAsList( _selectorSelected );

					if( value.length === 0 ) {
						return inverseResult(true);
					}

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
						return fieldType;
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
				console.warning('Supplied filterField (' + _Selector + ') did not return a valid form field type. ' + fieldType + ' was returned. Was expecting, select; input or textarea');
				return;
			};


		});

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

	function GetGet() {
		/**
		 * @var array string getString the GET part of a URL split up into
		 *	individual GET variable key/value pairs
		 */
		var getString = window.location.search.substring(1);
		var getName = [];
		var getValue = [];
		if( getString !== '' ) {
			// split the GET into its individual key/value pairs
			getString = getString.split('&');
			for( var i = 0 ; i < getString.length ; i += 1 ) {
				// add the key/value pairs
				getString[i] = getString[i].split('=');
				getName.push( getString[i][0] );
				getValue.push( getString[i][1] );
			}
		}
		this.getGET = function(varName) {
			var index = $.inArray( varName , getName );
			if( index > -1 ) {
				return getValue[index];
			} else {
				return undefined;
			}
		}
	}



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

	get = new GetGet();

// END:   checking if it's worth continuing
// ==================================================================
// START: declaring property functions


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
	 * returns a filterField object for use outside FilterFairy.
	 * @param   {string} fieldSelector selector string that can be used
	 *                                 to identify filterField object
	 * @returns {Boolean,filterField} filterField object if matched by
	 *                                fieldSelector or FALSE otherwise
	 */
	this.getFormField = function( fieldSelector ) {
		if( _validateType(fieldSelector) === 'string' ) {
			return filterFields.getField(fieldSelector);
		}
		return false;
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
	items = filterableItems.getAll();
	if ( fields.length > 0 ) {


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

			var itemStrings = [];
			var exlcusiveField = true;
			var show = true;

			// loop through all the items
			for ( var i = 0 ; i < items.length ; i += 1 ) {

				// get the filter strings for the item
				itemStrings = items[i].getClasses();

				// loop through all the fields
				for ( var j = 0 ; j < fields.length ; j += 1 ) {
//					exlcusiveField = fields[j].isExclusive();
//					if ( ( exlcusiveField === false &&  show === false ) || ( exlcusiveField === true && show === true ) ) {

					// try this filter if it's inclusive or if the item hasn't already been excluded
					if ( fields[j].isExclusive() === false ) {
console.log('itemStrings = '+itemStrings+"\nfields["+j+"].getFilterValues() = "+fields[j].getFilterValues());
						if ( show === false )  {
							show = fields[j].testItem(itemStrings);
console.log('show = '+show);
						}
					} else if ( show === true ) {
						show = fields[j].testItem(itemStrings);
					}
				}

				if( show === true ) {
					items[i].showItem();
				} else {
					items[i].hideItem();
				}
				show = true;
			}
			// set push state
			_setPushState();

		};

		// loop through each filter field adding the applyFilter
		for ( var i = 0 ; i < fields.length ; i += 1 ) {

			if ( fields[i].getType() === 'text' ) {
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
	}
};
