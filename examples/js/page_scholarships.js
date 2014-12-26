


$('document').ready(function () {
	'use strict';
	var filter, presetter;
	$.add_regions = function (tID) {
		if ($('#' + tID).find('tr').length > 0) {
			$('#' + tID + ' tr').each(function () {
				var classStr = $(this).prop('className').toLowerCase();

				if (classStr.indexOf('north_sydney') >= 0) {
					if (classStr.indexOf('nsw') < 0) {
						$(this).addClass('nsw');
					}
					if (classStr.indexOf('sydney') < 0) {
						$(this).addClass('sydney');
					}
				}
				if (classStr.indexOf('strathfield') >= 0) {
					if (classStr.indexOf('nsw') < 0) {
						$(this).addClass('nsw');
					}
					if (classStr.indexOf('sydney') < 0) {
						$(this).addClass('sydney');
					}
				}
				if (classStr.indexOf('canberra') >= 0) {
					if (classStr.indexOf('nsw') < 0) {
						$(this).addClass('nsw');
					}
				}
				if (classStr.indexOf('ballarat') >= 0) {
					if (classStr.indexOf('vic') < 0) {
						$(this).addClass('vic');
					}
				}
				if (classStr.indexOf('melbourne') >= 0) {
					if (classStr.indexOf('vic') < 0) {
						$(this).addClass('vic');
					}
				}
			});
		}
	};

	$.add_regions('scholarships-list');
	filter = new $.FilterFairy('#table-filter');
	presetter = new $.PresetFormFields();

	presetter.preset('hide_closed');
//	presetter.preset('campus');
	$('#hide_closed').trigger('change');
});
