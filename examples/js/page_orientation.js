
$('document').ready(function () {
	'use strict';
	/**
	 * @function tabSelectFunction() shows desired tab based on filter
	 *           class value
	 */
	var tabSelectFunction, fairy, presetter, config, selector;
	tabSelectFunction = function () {

		var filterStrings = $('#course-filter option:selected').val().replace(/\s+/, ' '),

		/**
		 * @var RegExp reg regular expression for cleaning up the
		 *      value to be used to find the ID of the correct tab
		 *      to be shown
		 */
			reg = new RegExp('^grp__((mon|tues|wednes|thrus|fri|satur|sun)day)$'),
			i = 0,
			tabName = '';

		filterStrings = $.trim(filterStrings);
		filterStrings = filterStrings.split(' ');

		for (i = 0; i < filterStrings.length; i += 1) {

			if (filterStrings[i].match(reg)) {
				// clean up the tab neame
				tabName = filterStrings[i].replace('grp__', '', 'i');

				// show the tab
				$('#oWeek-tabs a[href="#oWeek-' + tabName + '"]').tab('show');
				return true;
			}
		}
		$('#oWeek-tabs a[href="#oWeek-Monday"]').tab('show');
		return false;
	};


	fairy = new $.FilterFairy('#filter-select');
	fairy.setHideAllOnEmptyFilter(true);
	fairy.optimiseForSequential();

	$('#course-filter').on('change',tabSelectFunction);

	$('#oWeek-tabs a').click(function (e) {
		e.preventDefault();
		$(this).tab('show');
	});

	$('#oWeek-tabs a[href="#oWeek-monday"]').tab('show');

	presetter = new $.PresetFormFields();

	presetter.preset('#course-filter', 'course', 'coursecode', 'data');
	presetter.preset('#agecohort', 'cohort', 'agecohort');
	presetter.preset('#international', 'region', 'international', 'data');


	config = {
		'.chosen-select'		: {},
		'.chosen-select-deselect'	: {allow_single_deselect: true},
		'.chosen-select-no-single'	: {disable_search_threshold: 10},
		'.chosen-select-no-results'	: {no_results_text: 'Oops, nothing found!'},
		'.chosen-select-width'		: {width: "95%"}
	};
	for (selector in config) {
		$('#course-filter').chosen(config[selector]);
	}


	$('#international').on('change', function (e) {
		if ($(this).is(':checked')) {
			$('#int-tab').removeAttr('style');
			$('#oWeek-tabs').addClass('has-int').removeClass('no-int');
			$('#oWeek-int-thursday').removeAttr('style');
//			$('#oWeek-tabs #int-tab a').tab('show');

		} else {
			$('#int-tab').attr('style', 'display:none;');
			$('#oWeek-tabs').addClass('no-int').removeClass('has-int');
			$('#oWeek-int-thursday').attr('style', 'display:none;');
			if ($('#int-tab').hasClass('active')) {
				$('#int-tab').removeClass('active');
				$('#course-filter').trigger('change');
			}
		}
	});

	$('#international').trigger('change');
});
