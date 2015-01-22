# FilterFairy & PresetFormFields

## FilterFairy (filterFairy.jquery.js)

(Named for my 4 year old daughter, because it works like magic.)

FilterFairy allows you to filter large lists of information based on values in form fields.

In it's most basic form:

``` javascript
new $.FilterFairy('#filterWrapperID');
```

FilterFairy finds all the form fields wrapped by ID '#filterWrapperID' and then all the items wrapped by the class 'filter-this'. Items within the .filter-this wrapper will be filter based on class names that match values in the form fields.

Values in the form fields must be valid HTML class names (multiple values can be white space separated).

By default, each field is exclusive, meaning that (when you have multiple filter fields), only items matched by the preceding field can be included in the next round of filtering.

**NOTE:** fields with empty values selected will be ignored. i.e. they will not be used to filter

**NOTE also:** Only valid HTML form fields can be used as filters. (Buttons will be ignored!)


|  filter-this wrapper | filterable item |
| -------------------- | --------------- |
| `<ul class="filter-this">` or `<ol class="filter-this">` | `<li>` |
| `<table class="filter-this">` | `<tr>` |
| `<section class="filter-this">` or `<aside class="filter-this">` | `<article>` |
| (non standard wrapper) `.filterthis` | `.filter-item` |



### Changing FilterFairy's default behaviour

There are a number of data attributes that can be used to modify filter behaviour

| attribute name | possible values | purpose |
| ------------------- | --------------- | ------- |
| data-inclusive | true, 'inclusive', 'checkbox' |
| data-inverse | true, 'inverse' |
| data-priority | 'high', 'low' |
| data-required / required | true, 'required' |
| data-notfilter | true, 'notfilter' |

#### data-inclusive

By default filterFairy processes fields as exclusive, meaning that if an item has not been matched by a preceding filter, it cannot be matched again.

##### `inclusive` or `true`

There are times when you might want to show items matched by a particular filter regardless of whether it has been matched by a preceding filter.
To do this you can add an the data attribute `data-inclusive="inclusive"` or `data-inclusive` or `data-inclusive="true"` e.g.

``` html
<input type="checkbox" data-inlcusive="true" value="sample" id="inclusive-field" name="inclusive-field" />
```
or
``` html
<input type="checkbox" data-inlcusive value="sample" id="inclusive-field" name="inclusive-field" />
```

**NOTE:** If your inclusive fields are not the last fields in your filter set, you may need to set the [priority](#user-content-data-priority) on the field to `low` to ensure your items are shown.

##### `checkbox`

Normally when a field's state is blank, it is ignored. Sometimes it is useful for a checkbox to explicity hide matched item if the checkbox is unchecked.
You can add the data attribute `data-inclusive="checkbox"`

``` html
<input type="checkbox" data-inlcusive="checkbox" value="sample" id="inclusive-checkbox" name="inclusive-checkbox" />
```
This causes any items matched by the checkbox field to be shown or hidden (depending on the field's state).


#### data-inverse

##### Inverting the filter

Say you want to hide all the items matched by a filter value you can add the data attribute `data-inverse` or `data-inverse="true"` or `data-inverse="inverse"`
``` html
<label for="inverse-field">Hide sample</label>
<input type="checkbox" data-inverse="inverse" value="sample" id="inverse-field" name="inverse-field" />
```
When the checkbox is checked any items with the class 'sample' will be hidden.

#### data-priority

##### Low and high priority fields

By default filter fields are processed in the order they appear in the HTML DOM. To alter this you can set the data attribute `data-priority`. To make fields be processed before other fields, you can use data-priority or `data-priority="high"` or `data-priority="true"`. To make them be processed after other fields you can use `data-priority="low"`

``` html
<input type="checkbox" data-priority="high" value="me-first" id="high-priority" name="high-priority" />
```
or
``` html
<input type="checkbox" data-priority="low" value="me-last" id="low-priority" name="low-priority" />
```

**NOTE:** if you have multiple fields set with the same priority, they will be processed together in the order they appear in the HTML. If their priority is high, they will be processed before the other fields. If the priority is low, they will be processed after other fields.

#### Why set priority?

Say you have a list of restaurants they are filtered by nationality and by Suburb. The nationality field is a select box and the suburbs are each a checkbox. You would make the checkboxes `data-inclusive="incluisve"` and `data-priority="high"` Therefore, a list of restaurants in each of the suburbs is created. That list is then filtered by nationality.

#### data-required / required

There are times when one field the value of one field is essential to the rest of the filter. If that field is blank, there's not point in continuing with the filter.
To achieve this, you can use either the HTML5 attribute `required` or the custom data attribute `data-required`

```html
<input type="checkbox" required value="me-first" id="requiredA" name="requiredA" />

<input type="checkbox" required="required" value="me-first" id="requiredB" name="requiredB" />

<input type="checkbox" required="true" value="me-first" id="requiredC" name="requiredC" />
```
or
```html
<input type="checkbox" data-required value="me-first" id="requiredA" name="requiredA" />

<input type="checkbox" data-required="required" value="me-first" id="requiredB" name="requiredB" />

<input type="checkbox" data-required="true" value="me-first" id="requiredB" name="requiredB" />
```

##### Why have a custom data attribute for required?
If a form is being submitted to a server, it may not be appropriate for that field to block submission by being required (I can't think of a usecase but it is possible). If you don't what the field to block submission but do want the filter to stop if that field is blank then use `data-required` attribute.

**NOTE:** `data-required` takes priority over `required`. If `data-required` is defined (either true, 'required' or false) it will set the required state for the field.

#### data-notfilter
##### How to ignore a form field

Say you have a form that is being submitted to the server and have fields that are used for the filter and some that are only used by the server. To hide the server only fields use the data attribute `data-notfilter` or `data-notfilter="true"` or `data-notfilter="notfilter"`.

``` html
<input type="hidden" data-notfilter="true" value="random server stuff" id="ignore-me" name="ignore-me" />
```

### Hiding all items when filters are blank

Sometimes, you want to force people to use the filters. One way to do this is to have all the items hidden if all the filter fields are blank. To do this you need to assign FilterFairy to a variable then call the `hideAllOnEmpty()` method.

``` javascript
var myFilter = new $.FilterFairy('#filterWrapperID');
myFilter.hideAllOnEmpty();
```
### Optimise for sequential only filtering

If you have a filter set where each filter fields must be filtered in order. Once one field is blank, it and subsequent fields must must be ignored. (This is most likely when you have set `hideAllOnEmpty()`) you can force this by calling the `optimiseForSequential()` method

``` javascript
var myFilter = new $.FilterFairy('#filterWrapperID');
myFilter.optimiseForSequential();
```

**NOTE:** You can achieve the same result by giving the fields the attributes: `data-priority` and `data-required` or just `data-required`.
(This is easier if you have less control over the HTML.)

## PresetFormFields (presetFormFields.jquery.js)

### Preset form fields based on URL get variables

```javascript
var presetter = new $.presetFormFields();
presetter.preset(fieldSelector, getName, attributeName, attributeType);
```
| parameter name | parameter purpose |
| ---------------------- | ------------------------- |
| fieldSelector | usually the field's ID or NAME attribute |
| getName | the name of the GET variable (if different from the ID or NAME) |
| attributeName | the name of the attribute whose value is to be checked against the GET variable value (for when the field's value is needs to be different from the GET value) |
| attributeType | 'data' or 'normal' |

If you've created a page with a form and then want people who land on that page to have parts of the form prepopulated (e.g. a page with form fields used as filters). PresetFormFields makes this easy.

### Basic usage
#### (Field ID/Name = GET variable name & value attribute = GET variable value)

If you've created a page with a form and then want people who land on that page to have parts of the form prepopulated (e.g. a page with form fields used as filters). PresetFormFields makes this easy.

**URL:** `http://my.site.com/path/to/page?myField=my-value`
```html
<input type="text" name="myField" id="myField" value="my-value" />
```
```javascript
var presetter = new $.presetFormFields();
presetter.preset('myField');
```

Because the GET variable `myField` is the same as the input's ID, you don't need to specify anything else. If, however, you need to use a different GET variable, you can specify it's name as the second parameter to `preset()`.


#### (Field ID/Name != GET variable name & value attribute = GET variable value)

**URL:** `http://my.site.com/path/to/page?surprise=my-value`
```html
<input type="text" name="myField" id="myField" value="my-value" />
```
```javascript
var presetter = new $.presetFormFields();
presetter.preset('myField','surprise');
```

#### (Field ID/Name != GET variable name & value attribute != GET variable value)

Sometimes it's undesirable or inappropriate to send a field's value in the GET string. If so, you can check the GET variable's value against another field attribute e.g.


**URL:** `http://my.site.com/path/to/page?surprise=bird`
```html
<input type="text" name="myField" id="myField" value="sexy chicken" class="bird" />
```
```javascript
var presetter = new $.presetFormFields();
presetter.preset('myField','surprise','class','normal');
```

or

**URL:** `http://my.site.com/path/to/page?surprise=bird`
```html
<input type="text" name="myField" id="myField" value="sexy chicken" data-chicken="bird" />
```
```javascript
var presetter = new $.presetFormFields();
presetter.preset('myField','surprise','chicken','data');
```

