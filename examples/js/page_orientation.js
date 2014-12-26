"use strict";


$('document').ready(function(){
	/**
	 * @function tabSelectFunction() shows desired tab based on filter
	 *           class value
	 */
	var tabSelectFunction = function() {

		var filterStrings = $('#course-filter option:selected').val().replace(/\s+/,' ');
		filterStrings = $.trim(filterStrings);
		filterStrings = filterStrings.split(' ');

		/**
		 * @var RegExp reg regular expression for cleaning up the
		 *      value to be used to find the ID of the correct tab
		 *      to be shown
		 */
		var reg = new RegExp('^grp__((mon|tues|wednes|thrus|fri|satur|sun)day)$');

		for( var i = 0 ; i < filterStrings.length ; i += 1 ) {

			if( filterStrings[i].match( reg ) ) {
				// clean up the tab neame
				var tabName = filterStrings[i].replace( 'grp__' , '' ,'i' );

				// show the tab
				$( '#oWeek-tabs a[href="#oWeek-' + tabName + '"]').tab('show');
				return true;
			};
		};
		$( '#oWeek-tabs a[href="#oWeek-Monday"]').tab('show');
		return false;
	};


	var fairy = new $.FilterFairy( '#filter-select' );
//	fairy.presetFilter( '#course-filter' , 'coursecode' , 'course');
//	fairy.presetFilter( 'agecohort' );
	fairy.setHideAllOnEmptyFilter(true);

	//$('#course-filter').on('change',tabSelectFunction);

	$('#oWeek-tabs a').click(function (e) {
		e.preventDefault()
		$(this).tab('show');
	});

	$('#oWeek-tabs a[href="#oWeek-monday"]').tab('show');

	var presetter = new $.PresetFormFields();

	presetter.preset('#course-filter' , 'course' , 'coursecode' , 'data' );
	presetter.preset('#agecohort');


	var config = {
		'.chosen-select'		: {},
		'.chosen-select-deselect'	: {allow_single_deselect:true},
		'.chosen-select-no-single'	: {disable_search_threshold:10},
		'.chosen-select-no-results'	: {no_results_text:'Oops, nothing found!'},
		'.chosen-select-width'		: {width:"95%"}
	}
	for (var selector in config) {
		$('#course-filter').chosen(config[selector]);
	}


	$('#course-filter').trigger('change');
});
