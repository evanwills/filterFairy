if (window.console === undefined) {
	var Console = function () {
		"use strict";
		this.log = function () { };
		this.warn = function () { };
		this.error = function () { };
		this.info = function () { };
//		this.debugger = function () { };
	};
	window.console = new Console();
}

/**
 * PresetFormFields provides an easy way to set HTML form field
 * states from URL GET variables
 *
 * If you only have one field to preset, then call this as a
 * function, passing in the following parameters
 *
 * If you are presetting multiple form fields, create a
 * $.PresetFormFields object then call the preset() method for each
 * form field you wish to preset
 *
 * @param   {String}   fieldSelector ID or Name attribute or CSS
 *                                   selector of field to be preset
 * @param   {string}   getName       [optional] name of URL GET
 *                                   variable.
 *                                   If undefined, it defaults to the
 *                                   fieldSelector value (excluding
 *                                   everything up to and inclusding
 *                                   the last white space char and
 *                                   any CSS special chars
 * @param   {string}   attrName      [optional] name of attribute
 *                                   whose value is to matched
 *                                   against the URL GET variable's
 *                                   value.
 *                                   If undefined, defaults to the
 *                                   getName value
 * @param   {string}   attrType      the type of HTML attribute to be
 *                                   checked ['data', 'standard', 'normal', 'norm' ]
 *                                   If undefined, the field's value
 *                                   is checked first, then (if defined)
 *                                   the data attribute matching the
 *                                   attribute name finally the
 *                                   attrName is checked as a normal
 *                                   attribute
 * @returns {Boolean}  TRUE if form field was set. FALSE otherwise
 */
$.PresetFormFields = function (fieldSelector, getName, attrName, attrType) {
	"use strict";

	var getObj,
		compareAttr,
		badSelector = true,
		reg = /[^a-z0-9_\-] + /i,
		isRaw = null,
		presetField;

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
	 * @function a shortcut for checking GET value against field attributes.
	 *
	 * @param   {jQuery DOM object} obj 'this' in the parent function
	 * @param   {boolean} tryAll   Whether or not to try .val(), .attr()
	 *			& .data() properties of the form field
	 * @param   {string} getValue the value to be matched to see if this
	 *			field should be set
	 * @param   {string} attrName the name of the attribute to match
	 *			values with
	 * @param   {string} attrType 'data' [default], 'standard' /
	 *			'normal' / 'norm' the field attribute type ie is it a
	 *			data field or a normal field
	 *
	 * @returns {Boolean} TRUE if this field should be set or FALSE
	 *			otherwise
	 */
	function isItThisOne(obj, tryAll, getValue, attrName, attrType) {

		if (((tryAll === true || attrName === 'value') && $(obj).val() === getValue) || ((tryAll === true || attrType === 'data') && $(obj).data(attrName) === getValue) || ((tryAll === true || attrType === 'norm') && $(obj).attr(attrName) === getValue)) {
			return true;
		}
		return false;
	}

	function GetGet() {
		/**
		 * @var array string getString the GET part of a URL split up into
		 *	individual GET variable key/value pairs
		 */
		var getString = window.location.search.substring(1),
			getName = [],
			getValue = [],
			i = 0;
		if (getString !== '') {
			// split the GET into its individual key/value pairs
			getString = getString.split('&');
			for (i = 0; i < getString.length; i  + = 1) {
				// add the key/value pairs
				getString[i] = getString[i].split('=');
				getName.push(getString[i][0]);
				getValue.push(decodeURI(getString[i][1]));
			}
		}
		this.getGET = function (varName) {
			var index = $.inArray(varName, getName);
			if (index > -1) {
				return getValue[index];
			} else {
				return undefined;
			}
		};
		this.isGet = function () {
			if (getString !== '') {
				return true;
			}
			return false;
		};
	}

	getObj = new GetGet();

	/**
	 * presetField a given form field
	 * @param   {String} fieldSelector CSS selector to match a desired
	 *			form field (NOTE: if a raw string is given that doen't
	 *			match anything it will try prefixing the string with a
	 *			'#' or '.' to see if those match.
	 * @param   {string} getName the name of the GET variable to use as
	 *			one side of the match test (NOTE: if NULL, it is assumed
	 *			that the GET variable is the same as the selector. And
	 *			that it should try and match against the value attribute,
	 *			the data (or normal) attribute with the same name as the
	 *			selector)
	 * @param   {string} attrName the name of the attribute to be used as
	 *			the source of the other side of the match test (NOTE: if
	 *			NULL, it is assumed that the attrName is the same as the
	 *			getName (which may have been automatically set to the
	 *			same as the fieldSelector)
	 * @param   {string} attrType the type of property to be used
	 *			[ 'data', 'standard' / 'normal' / 'norm' ]
	 * @returns {Boolean} TRUE if the form field was preset, FALSE otherwise
	 */
	presetField = function (fieldSelector, getName, attrName, attrType) {
		var tryAll = false,
			getValue = '',
			checked = 'checked',
			isDone = false;

		if (varType(fieldSelector) !== 'string') {
			console.error('presetFilter\'s first paramater must be a string');
			return;
		}
		fieldSelector = fieldSelector.trim();

		if (varType(getName) !== 'string') {
			getName = fieldSelector.replace(/^.*?([a-z0-9_\-] + )['"]?\]?$/i, '$1');
			tryAll = true;
		}

		if (varType(attrName) !== 'string') {
			attrName = getName;
			tryAll = true;
		}

		if (varType(attrType) !== 'string') {
			tryAll = true;
		}

		if (varType(attrType) !== 'string' && attrType !== 'data' && attrType !== 'normal' && attrType !== 'standard' && attrType !== 'norm') {
			tryAll = true;
		} else if (attrType === 'normal' || attrType === 'standard') {
			attrType = 'norm';
		}

		if (getObj.isGet === false) {
			console.info('The URL didn\'t contain any GET variables preset() can\'t do anything');
			return false;
		}

		if ($(fieldSelector).length === 0) {
			isRaw = reg.exec(fieldSelector);
			if (isRaw === null) {
				if ($('#' + fieldSelector).length > 0) {
					fieldSelector = '#' + fieldSelector;
					badSelector = false;
				} else if ($('.' + fieldSelector).length > 0) {
					fieldSelector = '.' + fieldSelector;
					badSelector = false;
				}
			}
			if (badSelector === true) {
				console.warn('Could not find any HTML form fields with ' + fieldSelector);
				return false;
			}
		}

		getValue = getObj.getGET(getName);

		if (getValue === undefined) {
			console.warn('Could not find the get variable "' + getName + '"');
			return false;
		}

		$(fieldSelector).each( function () {
			var fieldType = $(this).prop('tagName').toLowerCase();

			if (fieldType === 'input') {
				fieldType = $(this).prop('type');
				switch( fieldType) {
					case 'button':
					case 'submit':
						// can't use this field
						fieldType = false;
						break;
					case 'radio':
						if ($(this).attr('name') !== undefined) {
							fieldSelector = 'input[name="' + $(this).attr('name') + '"]';
						}
					case 'checkbox':
						break;
					default:
						fieldType = 'text';
						break;
				}
			} else if (fieldType === 'select') {
				fieldSelector  + = ' option';
				checked = 'selected';
			} else if (fieldType !== 'textarea' ) {
				// this is obviously not a form field
				fieldType = false;
			}

			if (fieldType === 'textarea') {

				$(this).html(getValue);
			} else if (fieldType === 'text') {

				$(this).val(getValue);
			} else if (fieldType === 'checkbox') {
				if (isItThisOne( this, tryAll, getValue, attrName, attrType )) {
					$(this).attr('checked','checked');
					isDone = true;
				}
			} else if (fieldType === 'radio' || fieldType === 'select') {
				$(fieldSelector).each(function (){
					if (isItThisOne( this, tryAll, getValue, attrName, attrType )) {

						$(this).attr(checked,checked);
						isDone = true;
					}
				});
			}
			if (isDone === true) {
console.log('Triggering change');
				$(this).trigger('change');
				return false;
			}
		});
		return isDone;
	};

	if (varType(fieldSelector) === 'string') {
		presetField( fieldSelector, getName, attrName, attrType );
	}

	this.preset = presetField;
};