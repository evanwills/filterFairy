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


// ==================================================================
// START: IFilterFairyField



function IFilterFairyField() {
	"use strict";
}
IFilterFairyField.prototype = new Object();
IFilterFairyField.prototype.constructor = IFilterFairyField;

IFilterFairyField.name = '';
IFilterFairyField.values = [];
IFilterFairyField.originalValues = [];
IFilterFairyField.state = 0;

IFilterFairyField.prototype.updateState = function (index, newState) {
	"use strict";
};

IFilterFairyField.prototype.getIndex = function (className) {
	"use strict";
};

IFilterFairyField.prototype.checkFilter = function (filterOn) {
	"use strict";
};




//  END:  filterFairyInterface
// ==================================================================
// START: FilterFairyFieldMulti




function FilterFairyField(fieldObjs, defaultState) {
	"use strict";

	if (Array.isArray(fieldObjs) !== true) {
		throw {"message": this.constructor.name + '.constructor() expects first parameter "fieldObjs" to be an array'};
	}

	if (defaultState === undefined) {
		this.defaultState = true;
	} else if (typeof defaultState !== 'boolean') {
		throw {"message": this.constructor.name + '.constructor() expects second parameter "defaultState" to be boolean'};
	} else {
		this.defaultState = defaultState;
	}

}
FilterFairyField.prototype = new IFilterFairyField();
FilterFairyField.prototype.constructor = FilterFairyField;

FilterFairyField.prototype.updateState = function (index, newState) {
	"use strict";

	if (typeof index !== 'number' || index < 1 || this.values.length < index) {
		throw {'message': this.constructor.name + '.updateState() expects first parameter "index" to be a number between than 1 and ' + this.values.length};
	}

	if (typeof newState !== 'boolean') {
		throw {'message': this.constructor.name + '.updateState() expects second parameter "state" to be boolean'};
	}
	if (newState === false) {
		this.state = 0;
	} else {
		this.state = index;
	}
};

FilterFairyField.prototype.getIndex = function (className) {
	"use strict";
	var a = 0;
	if (typeof className !== 'string' || className === '') {
		throw {"message": this.constructor.name + '.getIndex() expects only parameter "ClassName" to be a non-empty string'};
	}
	for (a = 0; a < this.values; a += 1) {
		if (this.values[a] === className) {
			return a;
		}
	}
	return false;
};

FilterFairyField.prototype.checkFilter = function (filterOn) {
	"use strict";

	var output = this.defaultState;

	if (typeof filterOn !== 'array') {
		throw {"message": this.constructor.name + '.checkFilter() expects only parameter "filterOn" to be an array'};
	}

};




//  END:  FilterFairyField
// ==================================================================
// START: FilterFairyFieldMulti




function FilterFairyFieldMulti(fieldObjs, defaultState) {
	"use strict";

	if (Array.isArray(fieldObjs) !== true) {
		throw {"message": this.constructor.name + '.constructor() expects first parameter "fieldObjs" to be an array'};
	}

	if (defaultState === undefined) {
		this.defaultState = true;
	} else if (typeof defaultState !== 'boolean') {
		throw {"message": this.constructor.name + '.constructor() expects second parameter "defaultState" to be boolean'};
	} else {
		this.defaultState = defaultState;
	}

}
FilterFairyFieldMulti.prototype = new FilterFairyField([1]);
FilterFairyFieldMulti.prototype.constructor = FilterFairyFieldMulti;


FilterFairyFieldMulti.prototype.updateState = function (index, newState) {
	"use strict";

	if (typeof index !== 'number' || index < 1 || this.values.length < index) {
		throw {'message': this.constructor.name + '.updateState() expects first parameter "index" to be a number between than 1 and ' + this.values.length};
	}

	if (typeof newState !== 'boolean') {
		throw {'message': this.constructor.name + '.updateState() expects second parameter "state" to be boolean'};
	}

	this.state[index] = newState;
};