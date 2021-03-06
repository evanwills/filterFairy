// ==================================================================
// see https://github.com/evanwills/filterFairy/ for documentation


if (typeof window.console !== 'object') {
	var Console = function () {
		"use strict";
		this.log = function () { };
		this.warn = function () { };
		this.error = function () { };
		this.info = function () { };
//		this.debug = function () { };
	};
	var console = new Console();
}


/**
 * @function filterFairy() uses form fields to dynamically filter a
 *			group of items
 *
 * @param string filterWrapper a CSS selector to match the tag that
 *		  will wrap a single filter block (usually an ID or some
 *		  other unique selector)
 *
 * @retur object
 */
$.FilterFairy = function (filterWrapper, showLog) {
	"use strict";


// ==================================================================
// Start declaring variables

	var
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
		applyFilter,

	/**
	 * @var boolean canDo whether or not filteFairy is viable.
	 */
		canDo = true,

	/**
	 * @var logToConsole
	 */
		logToConsole = function () {}, // by default no logging

	/**
	 * @var function/object filterFields list of filters to be used
	 */
		filterFields,

	/**
	 * @ver function/object filterableItems an object that manages
	 *	all the filterable items as a group
	 */
		filterableItems,

	/**
	 * @var boolean hideAllOnEmptyFilter if you want the items to be
	 *	hidden if nothing is matched, set this to true
	 */
		hideAllOnEmptyFilter = false,

	/**
	 * @var array fields list of filterFields
	 */
		fields = [],

		g = 0,

	/**
	 * @var GetGet get object managing accessing get variable info
	 */
		get,

		filterOptimiser,

		items = [],

		tmp;

// END:   declaring variables
// ==================================================================
// START: declaring functions

	if (typeof showLog === 'boolean' && showLog === true) {
		logToConsole = function () {
			console.log.apply(this, arguments);
		};
	}


	/**
	 * @function varType() takes a variable tries to get its type.
	 *	     If successful it returns the string name of the type if
	 *	     not, it returns false
	 *
	 * @param mixed input a varialbe whose type is to be tested.
	 *
	 * @return string false string name of the variable type or false if
	 *	   type couldn't be determined
	 */
	function varType(input) {
		try {
			return $.type(input);
		} catch (e) {
			return false;
		}
	}

	/**
	 * @function splitValueOnWhiteSpace() takes a string, trims white
	 *           space from begining and end, converts multiple white
	 *           space characters into single space characters then splits
	 *           the string into an array
	 *
	 * @param string inputValue the string to be split
	 *
	 * @return array a list of items that were separated by one or more
	 *         white space characters
	 */
	function splitValueOnWhiteSpace(inputValue) {
		var regex = /\s+/,
			output;
		try {
			output = $.trim(inputValue.replace(regex, ' '));

			if (output !== '') {
				return output.split(' ');
			} else {
				return [];
			}
		} catch (e) {
			return [];
		}
	}

	/**
	 * @function getValAsList() returns the value of a form field's
	 *	     current state as an array split on spaces
	 *
	 * @param string selector jQuery selector to be used to find the
	 *	  string to split
	 *
	 * @return array a list of items that were separated by one or more
	 *         white space characters
	 */
	function getValAsList(selector) {
		if ($(selector).val() !== undefined) {
			return splitValueOnWhiteSpace($(selector).val());
		} else {
			return [];
		}
	}

	/**
	 * @function getFieldType() gets the tag name of a DOM/jQuery object
	 *
	 * @param jQuery DOM object
	 *
	 * @return string false name of DOM object or FALSE if not a usable form field
	 */
	function getFieldType(domObj) {
		var tagName = $(domObj).prop('tagName').toLowerCase(),
			propType = '';
		if ($(domObj).data('notfilter') !== undefined) {
			return false;
		}
		if (tagName === 'input') {
			propType = $(domObj).prop('type').toLowerCase();
			switch (propType) {
				case 'submit':
				case 'reset':
				case 'button':
					return false;
				case 'radio':
				case 'checkbox':
					return propType;
				default:
					return 'text';
			}
		} else if (tagName === 'textarea') {
			return 'text';
		} else if (tagName === 'select') {
			return tagName;
		}
		return false;
	}

	/**
	 * @function getFilterableItems() handles building an array of
	 *	     filterableItem objects which are then used for
	 *	     interacting with the DOM
	 *
	 * @return function/object that has a number of property
	 *	   functions to facilitate doing stuff
	 */
	function getFilterableItems() {

		/**
		 * @var array filterableItemsArray list of all the
		 *      filterable items
		 */
		var filterableItemsArray = [],

		/**
		 * @var array filterThisSelectors list of unique selectors matching
		 *      filterable items
		 */
			filterThisSelectors = [],

		/**
		 * @var string filterThis selector for finding filterable item wrappers
		 */
			filterThis = filterWrapper + ' .filter-this',

		/**
		 * @var array filterThisTags list of wrapper tags used encountered
		 *      so far
		 */
			filterThisTags = [],

		/**
		 * @var boolean standardFilterItems TRUE if standard filterable items
		 *      were found
		 */
			standardFilterItems = false,

		/**
		 * @var array nonStandardFilterItems list of wrapper tag names for non
		 *      standard filterable items
		 */
			nonStandardFilterItems = [],

		/**
		 * @var string tmpItemWrapper the element used for wrapping
		 *      filterable items
		 */
			tmpItemWrapper = '',

		/**
		 * @var numeric index local itterator for looping through an
		 *		array
		 */
			index = -1,
			h = 0,
			FilterableItems;



		if ($(filterWrapper + ' .filter-this').length === 0) {
			// cutting our losses there's nothing to filter.
			// See ya lata Turkey
			console.error('"' + filterWrapper + '" did not match any items. i.e. it can\'t find anything to filter');
			return false;
		} else {

			$(filterThis).each(function () {

				/**
				 * @var string filterThisItem the tag name used for filterable
				 *	items within this .filter-this wrapper
				 */
				var filterThisItem = '',

				/**
				 * @var string tmpFilterThis the selector for this group of
				 *	filterable items.
				 */
					tmpFilterThis = '';
				tmpItemWrapper = $(this).prop('tagName').toLowerCase();
				logToConsole(284, $(this), tmpItemWrapper);

				// check whether we've encountered this tag name before
				if ($.inArray(tmpItemWrapper, filterThisTags) > -1) {
					// we've done this one before;
					return;
				}

				// store the tag name so we know we've used it before
				filterThisTags.push(tmpItemWrapper);

				// work out the best tag name to use for filterable items
				switch (tmpItemWrapper) {
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
					if ($(filterWrapper + ' ' + tmpItemWrapper + '.filter-this' + filterThisItem).length === 0) {
						// this is a non-standard filterable item wrapper have to assume that
						// it is the filterable item itself
						nonStandardFilterItems.push(tmpItemWrapper);
						console.warn('This non-standard filterable item wrapper (' + filterWrapper + ' ' + tmp + '.filter-this' + filterThisItem + ') didn\'t contain any .filter-item nodes. It may be useable as a filterable item itself');
						return;
					}
					tmpItemWrapper = '';
				}

				tmpFilterThis = filterWrapper + ' ' + tmpItemWrapper + '.filter-this' + filterThisItem;

				// check whether the selector matches any items and has not
				// been found before
				if ($(tmpFilterThis).length > 0 && $.inArray(tmpFilterThis, filterThisSelectors) === -1) {
					// It's unique. We'll add it to the list
					filterThisSelectors.push(tmpFilterThis);
					logToConsole(335, "Filterable item selector: '" + tmpFilterThis + "'");
				}
			});

			if (standardFilterItems === false && nonStandardFilterItems.length > 0) {
				// no standard filterable items were found
				// some non-standard filterable items were found but contained no
				// standard filterable items.
				// filterable items must be the .filter-this node itself
				filterThisSelectors.push(filterWrapper + ' .filter-this');
			} else if ($(filterThisSelectors).length > 0) {
				// We found something to filter
				if (nonStandardFilterItems.length > 0) {
					// But there were some duds too. (We'll just ignore them)
					// console.log( 'Found a number of non-standard filter item wrappers ("' + nonStandardFilterItems.join('.filter-this", "') + '.filter-this") these will be ignored');
				}
				// make a single selector for all the filterable items
//				filterThis = filterThisSelectors.join(', ');
			} else {
				// Well that sucks! Couldn't find any filterable items.
				console.warn('Couldn\'t find any filterable items using "' + filterThis + '". Nothing to do!!!');
				return;
			}


			// build an array where each filterable item is represented by
			// a function that tests whether a supplied string is matched
			// by an item in an array within the function
			for (h = 0; h < filterThisSelectors.length; h += 1) {

				$(filterThisSelectors[h]).each(function () {
					/**
					 * @var object filterableItem an object for extracting information
					 *      about a particular filterable item
					 */
					var FilterableItem,

					/**
					 * @var object item the jQuery reference object for this filterable
					 *	item, used as a permanent connection to the DOM element.
					 */
						item = $(this).get(),

					/**
					 * @var array classes list of classes for this filterable item used
					 *	to decide whether or not this filterable itme should be
					 *	hidden or visible
					 */
						classes = splitValueOnWhiteSpace($(this).attr('class'));

					if (classes.length < 1) {
						return;
					}


					/**
					 * @function filterableItem() does everything to do with filtering an item.
					 */
					FilterableItem = function () {
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
						this.testFilter = function (filterList) {

							var filterListType = varType(filterList),
								i = 0;

							if (filterListType === 'string') {
								filterList = [ filterList ];
								filterListType = 'array';
							}

							if (filterListType !== 'array') {
								return false;
							}

							for (i = 0; i < filterList.length; i += 1) {
								// loop through the class array
								if ($.inArray(filterList[i], classes) !== -1) {
									return true;
								}
							}
							// no there was no match for this item.
							return false;
						};

						/**
						 * @function showItem() makes the the item visible if it was hidden
						 */
						this.showItem = function () {
							$(item).removeClass('filter-hide').addClass('filter-show');
						};

						/**
						 * @function hideItem() hides the item if it was visible
						 */
						this.hideItem = function () {
							$(item).removeClass('filter-show').addClass('filter-hide');
						};

						/**
						 * @function isVisible() returns true
						 *	     if the item is currently
						 *	     visible or false if hidden
						 */
						this.isVisible = function () {
							if ($(item).hasClass('filter-hide')) {
								return true;
							} else {
								return false;
							}
						};

						this.getClasses = function () {
							return classes;
						};
					};
					// Add the function to an array
					filterableItemsArray.push(new FilterableItem());
				});
			}
		}

		FilterableItems = function () {
			this.itemCount = function () {
				return filterableItemsArray.length;
			};
			this.getAll = function () {
				return filterableItemsArray;
			};
			this.getSelectors = function () {
				return filterThisSelectors;
			};
			this.hideAll = function () {
				var i = 0;
				for (i = 0; i < filterThisSelectors.length; i += 1) {
					$(filterThisSelectors[i]).removeClass('filter-show').addClass('filter-hide');
				}
			};
			this.showAll = function () {
				var i = 0;
				for (i = 0; i < filterThisSelectors.length; i += 1) {
					$(filterThisSelectors[i]).removeClass('filter-hide').addClass('filter-show');
				}
			};
		};
		return new FilterableItems();
	}



	/**
	 * @function getFilterFields() handles building an array of
	 *	     filterField objects which are used for acting on the
	 *	     filterableItems
	 *
	 * @return function/object that has a number of property
	 *	   functions to facilitate doing stuff
	 */
	function getFilterFields() {
		/**
		 * @var array filterFieldsRepo the repository for all filterField items
		 */
		var filterFieldsRepo = [],

		/**
		 * @var array filterFieldSelectors the list of selector used to match
		 *	form filter fields
		 */
			filterFieldSelectors = [],
			FilterFieldsObj,

			/**
			 * @var bolean goodToGo whether or not the selector
			 *	provided is a usable filter field
			 */
			goodToGo = false,

			tmpLowPriorityFields = [],
			tmpHighPriorityFields = [],
			tmpFilterFieldsRepo = [],

			lastInclusive = 0,
			h = 0;

		$(filterWrapper + ' *').each(function () {

			var

			/**
			 * @var string chooser the string used to check
			 *	whether a select/radio/checkbox field is selected
			 */
				chooser = 'checked',

			/**
			 * @var boolean exclusiveField whether or not this field is exclusive
			 *	or not.
			 *	i.e.	if not exclusive, matching items should be shown
			 *		regardles of whether they might have already been
			 *		filtered out.
			 */
				exclusiveField = true,

			/**
			 * @var string fieldType HTML element the filter form field is
			 */
				fieldType = getFieldType(this),

			/**
			 * @var function getFilterValuesFunc() returns an array
			 *	of filterField values of the selected/checked
			 *	item (or an empty array in the case of checkboxes
			 *	if the box isn't checked
			 */
				getFilterValuesFunc,

			/**
			 * @var string getName
			 */
				getName = '',

			/**
			 * @var boolean priority whether or not an inclusive field should be
			 *		processed before or after exclusive fields
			 */
				highPriority = null,

			/**
			 * @var string id the ID of the form field
			 */
				idAttr = '',

			/**
			 * @var boolean inclusiveCheckbox inclusive checkboxes need to be handled
			 *		handled slightly differently since their value is unchanging but
			 *		their state can change. The state of an inclusive checkbox should
			 *		only effect items that it matches and are already visible. To do
			 *		this inclusive checkboxes are processed with the exclusive filter
			 *		fields but must have an internal state to differentiate them from
			 *		exclusive checkboxes.
			 */
				inclusiveCheckbox = false,

			/**
			 * @function inverseResult() returns the opposite of the boolean supplied
			 *
			 * @var boolean result
			 *
			 * @return boolean FALSE if result is TRUE, or TRUE otherwise
			 */
				inverseResult,

				lowPriority =  false,

			/**
			 * @var array matchingSelectors possible selectors that can be used
			 *	to match when presetting a field from URL
			 */
				matchingSelectors = [],

			/**
			 * @ver boolean isMulti whether this field is part of a group of fields to be
			 *		processed as a single filter
			 */
				isMulti = false,

			/**
			 * @var string nameAttr the value of the name attribute of a field
			 */
				nameAttr = '',

			/**
			 * @var boolean required whether or not the field is required
			 */
				required = false,

			/**
			 * @var string selector the selector that can be used to act on the
			 *	form field
			 */
				selector = '',

				/**
				 * @var string selectorSub the selector string individual
				 *	items <select> <option>s or <input type="radio"> fields
				 */
				selectorSub = '',
				selectorSelected = '',

			/**
			 * @function setGetNameFunc()
			 */
				setGetNameFunc,

			/**
			 * @function testItemFunc() checks whether any items in the supplied
			 *	array match any of the values in this filterField's list of
			 *	values
			 *
			 * @param array itemClasses list of classes supplied by the
			 *	  filterable item being processed
			 *
			 * @return boolean TRUE if a class matched one of the filter's values
			 *	   FALSE otherwise
			 */
				testItemFunc,

			/**
			 * @var object thisField javascript object for the field.
			 */
				thisField = $(this).get(),

				tmpField,
				tmpDataRequired = null,
				tmpRequired = null,
			/**
			 * @object for handling everything to do with individual filter fields
			 */
				UsableFilterField,

			/**
			 * @var funcion useFilterFunc() used to test whether the
			 *	object matches the selector provided
			 */
				useFilterFunc,

				localGetValAsList = getValAsList;


			if (fieldType === false) {
				// this is either not a form field or we shouldn't use this field as a filter.
				return;
			}

			if($(this).data('filtervalue') !== undefined) {
				/**
				 * @function getValAsList() returns the value of a form field's
				 *	     current state as an array split on spaces
				 *
				 * @param string selector jQuery selector to be used to find the
				 *	  string to split
				 *
				 * @return array a list of items that were separated by one or more
				 *         white space characters
				 */
				localGetValAsList = function (selector) {
					if ($(selector).data('filtervalue') !== undefined) {
						return splitValueOnWhiteSpace($(selector).data('filtervalue'));
					} else {
						return [];
					}
				};
			}
			/*
			getValAsList = function (selector) {
				if ($(selector).val() !== undefined) {
					return splitValueOnWhiteSpace($(selector).val());
				} else {
					return [];
				}
			};
			*/


			if (varType($(this).prop('name')) === 'string') {
				nameAttr = $(this).prop('name');
			}

			if (varType($(this).prop('id')) === 'string') {
				// grab the ID if there is one
				idAttr = $(this).prop('id');
				// add the ID to a list of possible selectors used for finding which
				// filter to preset
				matchingSelectors.push(idAttr);
				// create a usable selector for the node using its ID
				selector = '#' + idAttr;

				// add that selector as another possible match fir finding which
				// filter to preset
				matchingSelectors.push(selector);
			}

			if ((idAttr === '' || fieldType === 'radio' || typeof $(this).data('multi') !== 'undefined')) {

				if (typeof $(this).data('multi') !== 'undefined') {
					if (varType($(this).data('multi')) === 'string' && $(this).data('multi') !== 'multi' && $(this).data('multi') !== '' && $(this).data('multi') !== 'true' && $(this).data('multi') !== 'multi') {
						selector = filterWrapper + ' ' + $(this).prop('tagName').toLowerCase() + '[data-multi="' + $(this).data('multi') + '"]';
						nameAttr = $(this).data('multi');
						isMulti = true;
					} else if ($(this).attr('name') !== '') {
						selector = filterWrapper + ' ' + $(this).prop('tagName').toLowerCase() + '[name="' + nameAttr + '"]';
						isMulti = true;
					} else {
						// reporte warning notice about dud multi field.
						if ($(this).prop('id') !== undefined) {
							nameAttr = '[id="' + $(this).val() + '"]';
						} else if ($(this).val() !== undefined) {
							nameAttr = '[value="' + $(this).val() + '"]';
						}

						if (nameAttr === '') {
							nameAttr = ' (with no "name", "id" or "value" attribute)';
						}
						console.warn(fieldType + nameAttr + ' was defined as a multi part field but the field could not be identified by either it\'s data-multi attribute value or it\'s name attribute value. So it will be ignored');
						return;
					}
				}

				if (isMulti === false) {
					// there was no ID or this is a usable radio field
					selector = filterWrapper + ' ' + $(this).prop('tagName').toLowerCase() + '[name="' + nameAttr + '"]';
				}

				if ((fieldType === 'radio' || isMulti === true) && $.inArray(selector, filterFieldSelectors) > -1) {
					// we've seen this one before.
					return;
				} else {
					matchingSelectors.push(nameAttr);
					$(selector).each(function () {
						if ($(this).prop('id')) {
							// grab all the possible selectors for this radio/multi field
							matchingSelectors.push($(this).prop('id'));
							matchingSelectors.push('#' + $(this).prop('id'));
						}
					});
				}
			}


			if (selector !== '' &&  $.inArray(selector, filterFieldSelectors) === -1) {
				// we haven't seen this one before. Add it to the list
				filterFieldSelectors.push(selector);
			} else {
				// already got this one.
				return;
			}

			if ($(this).data('inclusive')) {
				// this is an inclusive filter. i.e. items matched by this filter
				// will be shown regardless of preceeding or succeeding filters
				exclusiveField = false;

				switch ($(this).data('inclusive').toLowerCase()) {
					case 'exclusive':
					case 'checkbox':
						if (fieldType === 'checkbox') {
							// this filter needs to be treated as a normal exclusive filter because
							exclusiveField = true;
							// but we want the filter to know that it's sort of inclusive.
							inclusiveCheckbox = true;
						}
						break;
				}
			}

			if ($(this).data('required') !== undefined) {
				if ($(this).data('required') !== false) {
					required = true;
				} else {
					required = false;
				}
			} else if ($(this).attr('required') !== undefined && $(this).attr('required') !== false) {
				required = true;
			}

			if ($(this).data('inverse') !== undefined && $(this).data('inverse') !== false) {
				inverseResult = function (result) { return !result; };
			} else {
				inverseResult = function (result) { return result; };
			}

			if ($(this).data('priority') !== undefined && $(this).data('priority') !== false) {
				$(this).data('priority', $(this).data('priority').toLowerCase());
				if ($(this).data('priority') === 'low') {
					lowPriority = true;
				} else {
					highPriority = true;
				}
			}

			// if a field is marked as required and the priority hasn't been set make it high priority.
			if (required === true && lowPriority !== true) {
				highPriority = true;
			}

			useFilterFunc = function (selector) {
				// does the supplied selector match any of the possible selectors
				if ($.inArray(selector, matchingSelectors) !== -1) {
					return true;
				}
				return false;
			};

			setGetNameFunc = function (input) {
				if (varType(input) === 'string' && input !== '') {
					// we have something useful asign it to getName
					getName = input;
					return true;
				} else if (getName === '') {
					// getName has never been defined, we'll give it a default value
					if (nameAttr !== '') {
						getName = nameAttr;
						return true;
					} else if (idAttr !== '') {
						getName = idAttr;
						return true;
					}
				}
				return false;
			};

			if (isMulti === true) {

				getFilterValuesFunc = function () {
					var value = [],
						typeOfField;
					$(selector).each(function() {
						typeOfField = getFieldType(this);

						switch (typeOfField) {
							case 'radio':
							case 'checkbox':
							case 'text':
								if ($(this).is(':checked')) {
									value = value.concat(splitValueOnWhiteSpace($(this).val()));
								}
								break;
							case 'select':
								$(this).find('option:selected').each(function() {
									value = value.concat(splitValueOnWhiteSpace($(this).val()));
								})
						}
					});
					return value;
				};

				// an inclusiveCheckbox checkbox works slightly differently to other filters.
				// if an item has matching classes it will be shown or hidden based
				// on whether the checkbox is ticked or not respectively however, if
				// the item doesn't match, it will be shown anyway.
				testItemFunc  = function (itemClasses) {

					/**
					 * @var array value list of strings split on space to be used
					 *	to check items against
					 */
					var value = getFilterValuesFunc(),

					/**
					 * @var boolean usable just because an item doesn't match
					 *	doesn't mean it shouldn't be shown
					 */
						usable = false,
						i = 0;

					logToConsole(900, 'itemClasses: ', itemClasses);
					logToConsole(901, 'value: ', value);

					if (value.length === 0) {
						return inverseResult(true);
					}

					// loop through each itemClass to see if any match
					for (i = 0; i < itemClasses.length; i += 1) {
						logToConsole(909, 'itemClasses[' + i + ']: ', itemClasses[i]);
						logToConsole(910, 'value: ', value);
						if ($.inArray(itemClasses[i], value) !== -1) {
							// how about that, this one matches.
							return inverseResult(true);
						}
					}
					// bummer it didn't match
					return inverseResult(false);
				};
				goodToGo = true;

			} else if (fieldType === 'checkbox') {

				if (inclusiveCheckbox) {

					getFilterValuesFunc = function () {
						return localGetValAsList(selector);
					};

					// an inclusiveCheckbox checkbox works slightly differently to other filters.
					// if an item has matching classes it will be shown or hidden based
					// on whether the checkbox is ticked or not respectively however, if
					// the item doesn't match, it will be shown anyway.
					testItemFunc  = function (itemClasses) {

						/**
						 * @var array value list of strings split on space to be used
						 *	to check items against
						 */
						var value = localGetValAsList(selector),

						/**
						 * @var boolean usable just because an item doesn't match
						 *	doesn't mean it shouldn't be shown
						 */
							usable = false,
							i = 0;

						logToConsole(948, 'itemClasses: ', itemClasses);
						logToConsole(949, 'value: ', value);

						// loop through each itemClass to see if any match
						for (i = 0; i < itemClasses.length; i += 1) {
							logToConsole(953, 'itemClasses[' + i + ']: ', itemClasses[i]);
							logToConsole(954, 'value: ', value);
							if ($.inArray(itemClasses[i], value) !== -1) {
								// how about that, this one matches.
								usable = true;
								break;
							}
						}

						if (usable === false || inverseResult($(selector).is(':checked'))) {
							return true;
						} else {
							return false;
						}
					};
				} else {
					getFilterValuesFunc = function () {
						return localGetValAsList(selector + ':checked');
					};

					// exclusive (default) checkboxes work in the normal way, you're
					// either in or you're out
					testItemFunc  = function (itemClasses) {
						/**
						 * @var array value list of strings split on space to be used
						 *	to check items against
						 */
						var value = localGetValAsList(selector),

						/**
						 * @var boolean output
						 */
							output = false,
							i = 0;

						logToConsole(988, 'itemClasses: ', itemClasses);
						logToConsole(989, 'value: ', value);

						if ($(selector).is(':checked')) {
							// loop through each itemClass to see if any match
							for (i = 0; i < itemClasses.length; i += 1) {
								logToConsole(994, 'itemClasses[' + i + ']: ', itemClasses[i]);
								logToConsole(995, 'value: ', value);
								if ($.inArray(itemClasses[i], value) !== -1) {

									// how about that, this one matches.
									output = true;
									break;
								}
							}
						}

						return inverseResult(output);
					};
				}
				goodToGo = true;

			} else if (fieldType === 'select' || fieldType === 'radio') {

				selectorSub = selector;
				if (fieldType === 'select') {
					selectorSub += ' option';
					chooser = 'selected';
				}

				/**
				 * @var string selectorSelected the selector that matches the
				 *	selected <option> or <input type="radio">
				 */
				selectorSelected = selectorSub + ':' + chooser;

				getFilterValuesFunc = function () {
					// give'm the list of filter strings as an array
					return localGetValAsList(selectorSelected);
				};

				testItemFunc  = function (itemClasses) {

					/**
					 * @var array value list of strings split on space to be used
					 *	to check items against
					 */
					var value = localGetValAsList(selectorSelected),
						i = 0;

					logToConsole(1038, 'itemClasses: ', itemClasses);
					logToConsole(1039, 'value: ', value);

					if (value.length === 0) {
						return inverseResult(true);
					}

					for (i = 0; i < itemClasses.length; i += 1) {

						logToConsole(1047, 'itemClasses[' + i + ']: ', itemClasses[i]);
						logToConsole(1048, 'value: ', value);

						// loop through each itemClass to see if any match
						if ($.inArray(itemClasses[i], value) !== -1) {

							// how about that, this one matches.
							return inverseResult(true);
						}
					}
					// bummer it didn't match
					return inverseResult(false);
				};
				goodToGo = true;
			} else {

				getFilterValuesFunc = function () {
					return localGetValAsList(selector);
				};

				testItemFunc  = function (itemClasses) {

					/**
					 * @var array value list of strings split on space to be used
					 *	to check items against
					 */
					var value = localGetValAsList(selector),
						i = 0;

					logToConsole(1076, 'itemClasses: ', itemClasses);
					logToConsole(1077, 'value: ', value);

					if (value.length === 0) {
						return inverseResult(true);
					}

					// loop through the classes to see if any match
					for (i = 0; i < itemClasses.length; i += 1) {
						logToConsole(1085, 'itemClasses[' + i + ']: ', itemClasses[i]);
						logToConsole(1086, 'value: ', value);
						if ($.inArray(itemClasses[i], value) !== -1) {

							// yay one of the classes matches one of the sub-strings in the value
							return inverseResult(true);
						}
					}
					return inverseResult(false);
				};
				goodToGo = true;
			}

			if (goodToGo === true) {

				// create the object for this filter field
				UsableFilterField = function () {

					this.attrType = null;

					this.getFilterValues = getFilterValuesFunc;

					/**
					 * @method getFilterValuesCount() for getting the number of filter
					 *		   values for the current state of the filter field
					 *
					 * @returns {numeric} the number of items in the array of filter
					 *			values for the current state of this filterField
					 */
					this.getFilterValuesCount = function () {
						var output = getFilterValuesFunc();
						return output.length;
					};

					/**
					 * method for getting an array of strings used to match this
					 * filterField
					 *
					 * @returns {array} list of strings that could be used to identify
					 *					this field
					 */
					this.getMatchingSelectors = function () { return matchingSelectors; };
					/**
					 * method for getting the cononical string for matching this filterField
					 * @returns {string} the string used to uniquely identify this
					 *                   filterField
					 */
					this.getSelector = function () { return selector; };

					this.getType = function () {
						// give 'em the form field type
						// [ 'text', 'radio', 'checkbox', 'select' ]
						return fieldType;
					};

					/**
					 * @method isExclusive() returns whether this field is an inlcusive
					 *			filterField
					 *
					 * @returns {boolean} TRUE if the filterField is inclusive.
					 *					  FALSE otherwise
					 */
					this.isExclusive = function () { return exclusiveField; };

					/**
					 * @method isInclusiveCheckbox() returns the incState of this filterField
					 * @returns {boolean} TRUE if this is an inclusive checkbox FALSE
					 *                    otherwise.
					 */
					this.isInclusiveCheckbox = function () { return inclusiveCheckbox; };

					/**
					 * @method isHighPriority() returns the whether or not this field is a high
					 *         priority field.
					 * @return {boolean} whether or not this field should be processed before
					 *         other fields
					 */
					this.isHighPriority = function () { return highPriority; };

					/**
					 * @method isLowPriority() returns the whether or not this field is a low
					 *         priority field.
					 * @return {boolean} whether or not this field should be processed after
					 *         other fields
					 */
					this.isLowPriority = function () { return lowPriority; };

					/**
					 * @method isRequired
					 * @returns {boolean} whether or not this field is required
					 */
					this.isRequired = function () { return required; };
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
					this.testItem = testItemFunc;

					/**
					 * @method triggerChange() causes this field to trigger change
					 */
					this.triggerChange = function () { $(thisField).trigger('change'); };

					/**
					 * method for working out if this filter should be used based on selector provided
					 *
					 * @param {string} selector to try and match this field
					 *
					 * @return {boolean} TRUE if the filterField was matched by the
					 *					 selector. FALSE otherwise
					 */
					this.useFilter = useFilterFunc;
				};

				// add the object to the list of filter fields
				filterFieldsRepo.push(new UsableFilterField());

				goodToGo = false;

			} else {
				// bummer
				console.warn('Supplied filterField (' + selector + ') did not return a valid form field type. ' + fieldType + ' was returned. Was expecting, select; input or textarea');
				return;
			}
		});

		if (filterFieldsRepo.length === 0) {
			console.error('"' + filterWrapper + '" did not contain any form fields. i.e. can\'t find any thing to use as a filter.');
			return false;
		} else {

			// pull high & low priority fields out and put them in a separate arrays
			for (h = 0; h < filterFieldsRepo.length; h += 1) {
				if (filterFieldsRepo[h].isExclusive() === false) {
					lastInclusive = h;
				}
				if (filterFieldsRepo[h].isLowPriority() === true) {
					tmpLowPriorityFields.push(filterFieldsRepo[h]);
				} else if (filterFieldsRepo[h].isHighPriority() === true) {
					tmpHighPriorityFields.push(filterFieldsRepo[h]);
				} else {
					tmpFilterFieldsRepo.push(filterFieldsRepo[h]);
				}
			}
			filterFieldsRepo = [];

			// put high priority fields first (in their DOM order)
			if (tmpHighPriorityFields.length > 0) {
				for (h = 0; h < tmpHighPriorityFields.length; h += 1) {
					filterFieldsRepo.push(tmpHighPriorityFields[h]);
				}
			}
			// then put all the other fields next (in their DOM order)
			if (tmpFilterFieldsRepo.length > 0) {
				for (h = 0; h < tmpFilterFieldsRepo.length; h += 1) {
					filterFieldsRepo.push(tmpFilterFieldsRepo[h]);
				}
			}
			// then put low priority fields at the end of the list of fields
			if (tmpLowPriorityFields.length > 0) {
				for (h = 0; h < tmpLowPriorityFields.length; h += 1) {
					filterFieldsRepo.push(tmpLowPriorityFields[h]);
				}
			}
			logToConsole(1256, filterFieldsRepo);

			FilterFieldsObj = function () {
				var i = 0;
				// all good so far we
				this.getAll = function () { return filterFieldsRepo; };
				this.getField = function (selector) {
					for (i = 0; i < filterFieldsRepo.length; i += 1) {
						goodToGo = false;
						if (filterFieldsRepo[i].useFilter(selector) === true) {
							return filterFieldsRepo[i];
						}
					}
					return false;
				};
				this.noMoreInclusiveFilters = function (a) {
					if (a >= lastInclusive) {
						return true;
					}
					return false;
				};
			};
			return new FilterFieldsObj();
		}
		logToConsole(1280, filterFieldsRepo);
	}


	/**
	 * @function setPushState() updates the page's URL so that it can be
	 *	     bookmarked and be in the browser history
	 *
	 * @return boolean TRUE if the push state was updated FALSE otherwise
	 */
	function setPushState() {
// console.log(window.location);
	}

	function optimiseSequentialFiltering(input) {
		return filterFields.noMoreInclusiveFilters(input);
	}

	function optimiseStandardFiltering(input) {
		return false;
	}



// END:   declaring functions
// ==================================================================
// START: checking if it's worth continuing


	// validate filterWrapper
	if (varType(filterWrapper) !== 'string') {
		console.error('The first and only parameter for filterFairy must be a string');
		return false;
	}

	filterableItems = getFilterableItems();

	filterFields = getFilterFields();

	// did anything go wrong?
	if (filterFields === false || filterableItems === false) {
		console.error('Because of the previously mentioned errors, filterFairy cannot continue. Goodbye!');
		return false;
	}


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
	this.setHideAllOnEmptyFilter = function (input) {
		if (varType(input) === 'boolean') {
			hideAllOnEmptyFilter = input;
			return true;
		}
		return false;
	};

	this.hideAllOnEmpty = function (input) {
		if (input !== false) {
			hideAllOnEmptyFilter = true;
		} else {
			hideAllOnEmptyFilter = false;
		}
	};


	/**
	 * @function hideAll() hides all filterable items
	 */
	this.hideAll = function () {
		filterableItems.hideAll();
	};


	/**
	 * @function showAll() exposes all filterable items
	 */
	this.showAll = function () {
		filterableItems.showAll();
	};

	/**
	 * returns a filterField object for use outside FilterFairy.
	 * @param   {string} fieldSelector selector string that can be used
	 *                                 to identify filterField object
	 * @returns {Boolean,filterField} filterField object if matched by
	 *                                fieldSelector or FALSE otherwise
	 */
	this.getFormField = function (fieldSelector) {
		if (varType(fieldSelector) === 'string') {
			return filterFields.getField(fieldSelector);
		}
		return false;
	};

	this.optimiseForSequential = function (input) {
		if (input !== false) {
			filterOptimiser = optimiseSequentialFiltering;
		} else {
			filterOptimiser = optimiseStandardFiltering;
		}
	};

// END:   declaring property functions
// ==================================================================
// START: create the filter field event function


	fields = filterFields.getAll();
	items = filterableItems.getAll();
	if (fields.length > 0) {

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
		applyFilter = function () {

			var itemStrings = [],
				exlcusiveField = true,
				show = true,
				activeFields = [],
				lastInclusive = 0,
				activeCount = 0,
				i = 0,
				j = 0,
				tmp;

			// Lets do a quick check on which fields are active
			// don't bother testing inactive fields
			for (j = 0; j < fields.length; j += 1) {

				if (fields[j].getFilterValuesCount() > 0) {
					// this field is active
					activeCount = activeFields.push(fields[j]);
					if (fields[j].isExclusive() === false) {
						// it's inclusive
						lastInclusive = (activeCount - 1);
					}
				} else if (fields[j].isRequired() || filterOptimiser(j)) {
					// this field is not active and there is no hope
					j = fields.length;
				}
			}

			// OK, so there are no active fields
			// hide filterable items if appropriate
			if (activeCount === 0) {
				j = items.length;
				if (hideAllOnEmptyFilter === true) {
					for (i = 0; i < j; i += 1) {
						items[i].hideItem();
					}
				} else {
					for (i = 0; i < j; i += 1) {
						items[i].showItem();
					}
				}
				setPushState();
				return;
			}


			// loop through all the items
			for (i = 0; i < items.length; i += 1) {

				// get the filter strings for the item
				itemStrings = items[i].getClasses();

				logToConsole(1467, 'itemStrings: ', itemStrings);

				// loop through all the fields
				for (j = 0; j < activeCount; j += 1) {

					// try this filter if it's inclusive or if the item hasn't already been excluded
					if (activeFields[j].isExclusive() === false) {
						if (show === false) {
							logToConsole(1475, itemStrings, activeFields[j].testItem(itemStrings));
							show = activeFields[j].testItem(itemStrings);
						}
					} else if (show === true) {
							logToConsole(1479, activeFields[j].testItem(itemStrings));
						show = activeFields[j].testItem(itemStrings);
					}
					if (show === false && j > lastInclusive) {
						logToConsole(1483, 'j: ', j);
						logToConsole(1484, 'lastInclusive: ', lastInclusive);
						// there are no more inclusive filters so don't bother checking any
						// other filters for this item
						j = activeCount;
					}
				}
				if (show === true) {
					logToConsole(1491, 'show item');
					items[i].showItem();
				} else {
					logToConsole(1494, '-- hide item --');
					items[i].hideItem();
				}
				show = true;
			}



			// set push state
			setPushState();

		};

		// loop through each filter field adding the applyFilter
		for (g = 0; g < fields.length; g += 1) {
			if (fields[g].getType() === 'text') {
				// if a filter field is text then only apply filter on blur
				$(fields[g].getSelector()).on('blur', applyFilter);
			} else {
				// if a filter field is not text then try applying the filter every time it changes
				$(fields[g].getSelector()).on('change', applyFilter);
			}
		}

		filterOptimiser = optimiseStandardFiltering;
	} else {
		// there were no filter fields so complain
		console.error('There are no filter fields to use');
	}

};

