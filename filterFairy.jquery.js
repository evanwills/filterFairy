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
$.FilterFairy = function () {
	"use strict";


// ==================================================================
// Start declaring variables

	var a = 0,
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
	 * @var function/object filterFields list of filters to be used
	 */
		filterFields = [],

	/**
	 * @ver function/object filterableItems an object that manages
	 *	all the filterable items as a group
	 */
		filterableItems = [],

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

	function getFilterableItems() {

	}

	function getFilterFields() {

	}

// END:   declaring functions
// ==================================================================
// START: checking if it's worth continuing

	if ($('.filterFairy-block').length < 1) {
		console.warn('FilterFairy() could not find any filterable blocks.');
		return;
	}
	console.log($('.filterFairy-block').length);
	$('.filterFairy-block').each(function () {
		var hideAllonEmpty = $(this).data('hide-all-on-empty'),
			optimiseForSequential = $(this).data('optimise-sequential');

		a += 1;

		if (hideAllonEmpty !== undefined && hideAllonEmpty !== false) {
			hideAllonEmpty = true;
		} else {
			hideAllonEmpty = false;
		}
		if (optimiseForSequential !== undefined && optimiseForSequential !== false) {
			optimiseForSequential = true;
		} else {
			optimiseForSequential = false;
		}

		$(this).find('input, textarea, select').each(function() {
			if ($(this).data('notfilter') !== undefined) {
				return true;
			}
			console.log($(this));
		});
	});

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
		if (typeof input === 'boolean') {
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



};

