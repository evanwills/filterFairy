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
// START: IFilterFairyItem




function IFilterFairyItem(itemObj, filterons) {
	"use strict";
}

IFilterFairyItem.prototype = new Object();
IFilterFairyItem.prototype.constructor = IFilterFairyItem;

IFilterFairyItem.prototype.obj = null;
IFilterFairyItem.prototype.filterOn = {};
IFilterFairyItem.prototype.status = false;
IFilterFairyItem.prototype.hasChanged = false;

IFilterFairyItem.prototype.stripHideClass = new RegExp('\s*ff-hide\s*', 'g');
IFilterFairyItem.prototype.normaliseClsSep = new RegExp('\s+', 'g');

IFilterFairyItem.prototype.isHidden = function () {
	"use strict";
};

IFilterFairyItem.prototype.filterOnField = function (fullFilterState) {
	"use strict";
};

IFilterFairyItem.prototype.updateDOM = function () {
	"use strict";
};



//  END:  filterFairyInterface
// ==================================================================
// START: FilterFairyFieldMulti





function FilterFairyItem(itemObj, filterOns) {
	"use strict";
	var a = 0,
		b = 0,
		classes = [],
		tmp = '';

	this.obj = itemObj;
	tmp = this.obj.className.replace(this.normaliseClsSep, ' ');
	classes = tmp.split(' ');

	for (a = 0; a < filterOns.length; a += 1) {
		this.filterOn.a = [];
		for (b = 0; b < classes.length; b += 1) {
			tmp = filterOns[a].getIndex(classes[b]);
			if (tmp !== false) {
				this.filterOn.a.push(tmp);
			}
		}
	}
}

FilterFairyItem.prototype = new IFilterFairyItem();
FilterFairyItem.prototype.constructor = FilterFairyItem;

FilterFairyItem.prototype.isHidden = function () {
	"use strict";
	return this.status;
};

FilterFairyItem.prototype.filterOnField = function (fullFilterState) {
	"use strict";

};

FilterFairyItem.prototype.updateDOM = function () {
	"use strict";
	if (this.hasChanged === true) {
		if (this.status === true) {
			this.obj.className += ' ff-hide';
		} else {
			this.obj.className = this.obj.className.replace(this.stripHideClass, ' ');
		}
	}
};