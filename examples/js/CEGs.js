


$('document').ready(function () {
	'use strict';

	var	fairy,
		tmp = [],
		i = 0;


	$('.printMe').each(function () {
		$(this).on('change', function () {
			var sybClass = '.syb-' + $(this).data('syblings'),
				v = $(this).val();

			if ($(this).is(':checked')) {
				$('#' + v).addClass('printMe').removeClass('doNotPrint');


				// check if this unit has been selected multiple times
				if( $('.printMe' + sybClass).length > 1 ) {
					$('.printMe' + sybClass).each(function() {
						if (!$(this).hasClass('printMeDud')) {
							$(this).addClass('printMeDud');
						}
					});
				}
			} else {
				$('#' + v).addClass('doNotPrint').removeClass('printMe');

				// check if this unit now has only one selection.
				if( $('.printMe' + sybClass).length <= 1 ) {
					$(sybClass).each(function() {
						if ($(this).hasClass('printMeDud')) {
							$(this).removeClass('printMeDud');
						}
					});
				}
			}
		});
	});

	fairy = new $.FilterFairy('#filterBlock');
	fairy.setHideAllOnEmptyFilter(true);



});
