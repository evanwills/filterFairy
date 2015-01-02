# FilterFairy & PresetFormFields

## FilterFairy (filterFairy.jquery.js)

(Named for my 4 year old daughter, because it works like magic.)

FilterFairy allows you to filter large lists of information based on values in form fields.

In it's most basic form:
``` javascript
new $.FilterFairy('#filterWrapperID');
```
FilterFairy finds all the form fields wrapped by '#filterWrapperID' and then all the items wrapped by the class 'filter-this'. Items within the .filter-this wrapper will be filter based on class names that match values in the form fields.

Values in the form fields must be valid HTML class names (multiple values can be white space separated).

By default, each field is exclusive, meaning that (when you have multiple filter fields), only items matched by the preceeding field can be included in the next round of filtering.

**NOTE:** fields with empty values selected will be ignored.

|  filter-this wrapper | filterable item |
| -------------------- | --------------- |
| &gt;ul class="filter-this"&lt; or &gt;ol class="filter-this"&lt; | &gt;li&lt; |
| &gt;table class="filter-this"&lt; | &gt;tr&lt; |
| &gt;section class="filter-this"&lt; or &gt;aside class="filter-this"&lt; | &gt;article&lt; |
| (non standard wrapper) .filterthis | .filter-item |

### Checkboxes



## PresetFormFields (presetFormFields.jquery.js)

##