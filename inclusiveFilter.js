"use strict";

// step 1 build an array of filterable items 
//
// object filterableItem {
// 	item : (reference to the jQuery DOM object to have classes added to or removed from to show or hide it)
// 	filterTest : function that checks a supplied string against the items in its array
// 	filterShow : function that makes an item visible
// 	filterHide : function that makes an item hidden

$.inclusiveFilter = function( filterSubject , filterIDs ) {
	/**
	 * @var array resetFilterFunc a function that first hides all
	 *	filterable items then returns an array of all the
	 *	unfiltered filterable items 
	 */
	var resetFilterFunc;

	/**
	 * @var numeric i itterator for looping through an array
	 */
	var i = 0;

	function getResetFilterFunc( filterSubjectSelector ) {

		var filterSubjectsArray = [];
		/**
		 * @var numeric a local itterator for looping through an
		 *	array
		 */
		var a = 0;

		// build an array where each filterable item is represented by
		// a function that tests whether a supplied string is matched
		// by an item in an array within the function
		$( filterSubjectSelector ).each(function(){
			var classes = _splitValueOnWhiteSpace( $(this).classes() );

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
			var filterFunc = function( filterString ) {
				/**
				 * @var numeric id the index of the filterable item that has been
				 *	matched
				 */
				var item = $(this);

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
					// no there was no match for this item.
					return false;
				} else {
					// there was nothing to match so return the ID of the item.
					return item;
				}
			}
			// Add the function to an array
			filterSubjectsArray[a] = filterFunc;
			a += 1;
		});
	
		return = function() {
			var output = filterSubjectsArray;
			for( i = 0 ; i < output.len ; i += 1 ) {
				var item = output[i];
				var DOMobject = item();
				DOMobject.addClass('filter-hide').removeClass('filter-show');
			}
			return output;
		}
	}
	
	applyfilter = function() {
		var excluded = getFilterSubjects();
		var included = [];

		// reset filter state to everything hidden.
		var item;
		var tmp;
		for( i = 0 ; i < exclude.length ; i += 1 ) {
			tmp = exclued[i];
			item = tmp();
			item.addClass('filter-hide').removeClass('filter-show');
		}

		// loop through each filter field adding matched items to the included array;
		//
	
	}

	for( i = 0 ; i < filterIDs.length ; i += 1 ) {
		$(filterIDs[i]).change(applyfilter);
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
	getFiltered = function( filterBy ) {
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
		
		for( i = 0 ; i < excluded.length ; i += 1 ) {
			tmp = false;
			func = excluded[i];
			for( var j = 0 ; j < filterBy.length ; j += 1 ) {
				tmp = func( filterBy[j] );
				if( tmp === true ) {
					included[] = func;
					break;
				}
			}
			if( tmp === false ) {
				tmpExcluded[] = func;
			}
			
		}
		excluded = tmpExcluded;
		return included;
	}
	

	resetFilter = getResetFilterFunc( filterSuject );
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
		$(filterField).prop('tagName');
	    } catch(e) {
		console.log('Supplied filter field selector (' + filterField + ') did not match anything in the DOM.'); 
		return false;
	    }

	    /**
	     * @var object formFieldDetails list of info about the filter form
	     *      element
	     *
	     * @property string baseSelector The selector that finds the filter
	     *           form element
	     *
	     * @property string itemSelector the selector that selects which
	     *           item in the field is selected (used for select box and
	     *           radio buttons)
	     *
	     * @property string valueSelector The selector for the selected item
	     *           (used for select box and radio buttons)
	     *
	     * @property string fieldChosen the selector that finds which part
	     *           of the element is selected (used for select box and
	     *           radio buttons)
	     *
	     * @property string fieldType HTML element the filter form field is
	     */
	    var formFieldDetails = {
		baseSelector: filterField,
		itemSelector: filterField,
		valueSelector: filterField,
		fieldChosen: '',
		fieldType: $(filterField).prop('tagName').toLowerCase()
	    }

	    switch( formFieldDetails.fieldType  ) {
		case 'input':
			formFieldDetails.fieldType = $(filterField).attr('type').toLowerCase();
			switch( formFieldDetails.fieldType ) {

			    case 'radio':
				var radioName = $(filterField).attr('name');
				formFieldDetails.baseSelector = 'input[name="' + radioName + '"]';
				formFieldDetails.itemSelector = formFieldDetails.baseSelector;
				formFieldDetails.valueSelector = formFieldDetails.baseSelector + ':checked';
				formFieldDetails.fieldChosen = 'checked';
				break;

			    case 'checkbox':
				formFieldDetails.fieldChosen = 'checked';
				break;

			    case 'text':
				break;
			    default:
				formFieldDetails.fieldType = 'text';
				break;
			}
			break;
		case 'textarea':
			formFieldDetails.fieldType = 'text';
			break;
		case 'select':
			formFieldDetails.itemSelector = formFieldDetails.baseSelector + ' option'
			formFieldDetails.valueSelector = formFieldDetails.itemSelector + ':selected'
			formFieldDetails.fieldChosen = 'selected';
			break;
		default:
			console.log('Supplied filterField (' + filterField + ') did not return a valid form field type. ' + tagname + ' was returned. Was expecting, select; input or textarea');
			formFieldDetails = false;
			break;
	    }
	    console.log(formFieldDetails);
	    return formFieldDetails;
	}


	/**
	 * @function _splitValueOnWhiteSpace() takes a string, trims white
	 *           space from begining and end, converts multiple white
	 *           space characters into single space characters then splits
	 *           the string into an array
	 *
	 * @param string input the string to be split
	 *
	 * @return array a list of items that were separated by one or more
	 *         white space characters
	 */
	function _splitValueOnWhiteSpace( inputValue ) {
	    var regex = /\s+/;
	    return inputValue.trim().replace(regex,' ').split(' ');
	}
}
