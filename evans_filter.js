"use strict";
// TODO make both primary and secondary filters work for all input types and select fields

/**
 * @function primaryFilterBySelect() shows or hides 
 *
 * @param string filterID the CSS selector (usually ID) for the
 *        select field to be used as the filter
 *
 * @param string filterWrapper the CSS selector for the wrapper of
 *        the items to be filtered
 *
 * @param string filterItem the element or class defining which items
 *        should be filtered
 *
 * @param string array secondaryFilterIDs [optiona] list of IDs of
 *        secondary filter inputs to be run after the primary filter
 *        completes
 *
 * @param function postFilterFunction [optional] if you want to do
 *        extra stuff based on filter values pass in a function to
 *        handle it with a single string param
 */
$.primaryFilterBySelect = function( filterID , filterWrapper , filterItem , secondaryFilterIDs , postFilterFunction ) {

    // validate checkboxIds value
    try {
        var secondaryFilterIDsType = secondaryFilterIDs ? $.type(secondaryFilterIDs) : false;
    } catch(e) {
        var secondaryFilterIDsType = false;
    }

    try {
        var postFilterFunctionOK = $.isFunction(postFilterFunction) ? true : false ;
    } catch(e) {
        var postFilterFunctionOK = false ;
    }
    if( postFilterFunctionOK === false ) {
        postFilterFunction = function( filterClass ) {};
    }

    /**
     * @var function false triggerSecondaryFilter sets up a function to
     *      trigger change events on secondary filters after the
     *      primary filter has run.
     */
    var triggerSecondaryFilter;
    if( secondaryFilterIDsType == 'array' ) {
        // there are multiple filters
        var i = 0;
        triggerSecondaryFilter = function() {
            for( i = 0 ; i < secondaryFilterIDs.length ; i += 1 ) {
                if( secondaryFilterIDs[i] != '' ) {
                    // trigger change event for each filter
                    $(secondaryFilterIDs[i]).trigger('change');
                }
            }
        }
    } else if( secondaryFilterIDsType == 'string' && secondaryFilterIDsType != '' ) {
        // only one secondary filter
        triggerSecondaryFilter = function() {
            // trigger change event for that filter
            $(secondaryFilterIDs).trigger('change');
        }
    } else {
        // there are no filters do nothing
        triggerSecondaryFilter = function() {}
    }

    console.log($.getFormFieldType(filterID));

    if( $(filterID).length == 0 ) {
        console.log('could not find anything to use as a filter using the selector: "' + filterID + '"' );
        return;
    } else {
        if( $(filterWrapper).length == 0 ) {
            console.log('Could not find wrapper for items to filter using the selector: "' + filterWrapper +'"' );
        }

        /**
         * @var string selector selector string to be passed to jQuery
         */
        var selector = filterWrapper + ' ' + filterItem;

        /**
         * @function filter change event finds the selected option, gets the
         *           values and splits it on space. Then resets the filter to
         *           hide all. Then finds all the items that match one or more
         *           of the filter values removes the filter hide class, adds
         *           the filter show class and adds a data attribute
         *           (data-visible="true")
         */
        $(filterID).on('change',function(e){
            /**
             * @var array list of class names to be filtered on from the
             *      selected option's value
             */
            var filterClasses = $(filterID + ' option:selected').val().split(' ');

            // reset filter so nothing is shown
            $( selector ).removeClass('filter-show').addClass('filter-hide').attr('data-visible',false);

            /**
             * @var string tabName part of the selected tab's ID
             */
            var tabName = '';

            var i = 0;

            // loop through all the class names from the selected option
            for( i = 0 ; i < filterClasses.length ; i += 1 ) {

                // check if the class name is empty
                if( filterClasses[i] != '' ) {

                    // unhide all items matching the selector
                    // add the data attribute data-visible="true" to allow
                    //   secondary filters to know what should and shouldn't
                    //   be displayed
                    $( selector + '.' + filterClasses[i] ).removeClass('filter-hide').addClass('filter-show').attr('data-visible',true);

                    // do additional stuff based on the this filter value
                    postFilterFunction( filterClasses[i] );
                }
            }
            // process the secondary filters (if any)
            triggerSecondaryFilter();
        });
    }
}


/**
 * @function secondaryFilterByCheckbox() shows or hides items if they
 *           were already matched by the primary filter and also match
 *           the secondary filter
 *
 * NOTE: secondaryFilterByCheckbox relies on the primary filter to identify
 *       which items can and cannot be made visible. It will not work on its
 *       own unless the data attribute is rendered in the served HTML
 *
 * @param string filterID the CSS selector (usually ID) for the
 *        checkbox field to be used as the filter
 *
 * @param string filterWrapper the CSS selector for the wrapper of
 *        the items to be filtered
 *
 * @param string filterItem the element or class defining which items
 *        should be filtered
 */
$.secondaryFilterByCheckbox = function( filterID , filterWrapper , filterItem ) {

    var filterType = $.getFormFieldType(filterID)

    if( filterType === )
    /**
     * @var string filterVal the value of the checkbox filter
     */
    var filterVal = $(filterID).val();

    console.log(;);

    if( filterVal != '' ) {
        $(filterID).on('change',function(e){

            var selector = filterWrapper + ' ' + filterItem + '.' + $(filterID).val();

            if( $(filterID).is(':checked') == false ) {
                // find all the visible items that match the secondary filter
                $( selector ).each(function(){
                    // step through each matched item
                    // check if it was matched by the primary filter
                    if( $(this).data('visible','true') ) {
                        // hide the item by removing the filter-show class and adding the filter-hide class
                        $(this).addClass('filter-hide').removeClass('filter-show');
                    }
                });
            } else {
                // find all the visible items that match the secondary filter
                $( selector ).each(function(){
                    // step through each matched item
                    // check if it was matched by the primary filter
                    if( $(this).data('visible','true') ) {
                        // show the item by adding the filter-show class and removing the filter-hide class
                        $(this).addClass('filter-show').removeClass('filter-hide');
                    }
                });
            }
        });
    }
}

$.getFormFieldType = function( filterID ) {
    var tagName = $(filterID).prop('tagName').toLowerCase();console.log(tagName);
    if( tagName == 'input' ) {
        console.log( $(filterID).attr('type') );
        return $(filterID).attr('type').toLowerCase();
    } else if ( tagName === 'textarea' ) {
        return 'text';
    } else if ( tagname === 'select' ) {
        return tagName;
    } else {
        console.log('Supplied filter ID did not return a valid input type. ' + tagname + ' was returned. Was expecting, select; input or textarea');
        return false;
    }
}

/**
 * @function presetFilterFromUrl() takes the filter ID and the data
 *           attribute name/get variable and searches through the
 *           select field to find the option with the matching data
 *           key/value pair. If found, that option is preselected
 *
 * @param string filterID the CSS selector for the select field to be
 *        used as the filter
 *
 * @param string dataAttr the data attribute name used and get variable
 *        used to store the value to be matched
 */
$.presetFilterFromUrl = function( filterID , dataAttr ) {

    /**
     * @var string sPageUrl the GET string part of the URL
     */
    var sPageURL = window.location.search.substring(1);

    /**
     * @var array getVars all of the GET variables in the url
     */
    var getVars = sPageURL.split('&');

    /**
     * @var boolean string dataAttrVal the value of the data Attribute
     *      to be matched
     */
    var dataAttrVal = false;

    // loop through the GET variables
    for(var i = 0; i < getVars.length; i++) {
 
        /**
         * @var array getVarParts individual GET variable split into
         *      its key/value pair parts
         */
        var getVarParts = getVars[i].split('=');

        // check the key to see if it matches
        if(getVarParts[0] == dataAttr ) {
            // asign the value
            dataAttrVal = getVarParts[1];
        }
    }

    console.log($.getFormFieldType(filterID));

    // we have a value to use for preselecting
    if( dataAttrVal !== false ) {
        // loop through each option
        $(filterID + ' option').each(function(){
            // check if the option has the appropriate data attribute
            // containing with the correct value
            if( $(this).data(dataAttr) == dataAttrVal ) {
                // YAY, we have a match. Make this option preselected
                $(this).attr('selected','selected');
            }
        });
        return dataAttrVal;
    } else {
        return '';
    }

}

$.bookmarkThisFilter = function() {

}