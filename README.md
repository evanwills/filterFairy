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

By default, each field is exclusive, meaning that (when you have multiple filter fields), only items matched by the preceeding field can be included in the next round of filtering.

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

| data attribute name | possible values |
| ------------------- | --------------- |
| data-inclusive | true, 'inclusive', 'checkbox' |
| data-inverse | true, 'inverse' |
| data-priority | 'high', 'low' |
| data-notfilter | true, 'notfilter' |

### Inclusive filters

There are times when you might want to show items matched by a particular filter regardless of whether it has been matched by a preceeding filter to do this you can add an the data attribute data-inclusive="inclusive" or data-inclusive or data-inclusive="true" e.g.

``` html
<input type="checkbox" value="sample" id="inclusive-field" name="inclusive-field" data-inlcusive="true" />
```

### Checkboxes

Sometimes it is useful for a checkbox to only show or hide matched item within a list of already filtered items you can add the data attribute data-inclusive="checkbox"

``` html
<input type="checkbox" value="sample" id="inclusive-checkbox" name="inclusive-checkbox" data-inlcusive="checkbox" />
```
This causes any items matched by the checkbox field to be shown or hidden (depending on the field's state).

### Inverting the filter

Say you want to hide all the items matched by a filter value you can add the data attribute data-inverse or data-inverse="true" or data-inverse="inverse"
``` html
<label for="inverse-field">Hide sample</label>
<input type="checkbox" value="sample" id="inverse-field" name="inverse-field" data-inverse="inverse" />
```
When the checkbox is checked any items with the class 'sample' will be hidden.

### Low and high priority fields

By default filter fields are proccessed in the order they appear in the HTML DOM. To alter this you can set the data attribute data-priority. To make fields be processed before other fields, you can use data-priority or data-priority="high" or data-priority="true". To make them be proccessed after other fields you can use data-priority="low"

``` html
<input type="checkbox" value="me-first" id="high-priority" name="high-priority" data-priority="high" />
```
or
``` html
<input type="checkbox" value="me-last" id="low-priority" name="low-priority" data-priority="low" />
```

**NOTE:*** if you have multiple fields set with the same priority, they will be processed together in the order they appear in the HTML. If their prioity is high, they will be proccessed before the other fields. If the prority is low, they will be processed after other fields.

#### Why set priority?

Say you have a list of restaurants they are filtered by nationality and by Suburb. The nationality field is a select box and the suburbs are each a checkbox. You would make the checkboxes data-inclusive="incluisve" and data-priority="high" Therefore, a list of restaurants in each of the suburbs is created. That list is then filtered by nationality.

### How to ignore a form field

Say you have a form that is being submitted to the server and have fields that are used for the filter and some that are only used by the server. To hide the server only fields use the data attribute data-notfilter or data-notfilter="true" or data-notfilter="notfilter"

``` html
<input type="hidden" value="random server stuff" id="ignore-me" name="ignore-me" data-notfilter="true" />
```

### Hiding all items when filters are blank

Sometimes, you want to force people to use the filters. One way to do this is to have all the items hidden if all the filter fields are blank. To do this you need to assign FilterFairy to a variable then call the setHideAllOnEmptyFilter() method

``` javascript
var myFilter = new $.FilterFairy('#filterWrapperID');
myFilter.setHideAllOnEmptyFilter(true);
```

## PresetFormFields (presetFormFields.jquery.js)

###