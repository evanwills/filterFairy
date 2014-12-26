"use strict";


$('document').ready(function(){


	new $.FilterFairy('#admin-list');


	var field = new $.PresetFormFields();
	field.preset('#acu_campuses' , 'campus' );
});
