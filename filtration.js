"use strict";

:var INFILTRATION = { };
:(function($) {
    INFILTRATION.FILTER = {

        /**
         * @property string filterWrapper the CSS selector for the wrapper of
         *        the items to be filtered
         * /
        filterWrapper : '',

        /**
         * @param string filterItem the element or class defining which items
         *        should be filtered
         * /
        filterItem : '',


        /**
         * @var string selector selector string to be passed to jQuery
         */
         selector : '',

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
        primary : function( filterID , filterWrapper , filterItem , secondaryFilterIDs , postFilterFunction ) {

            var formFieldDetails = $._getFormFieldDetails(filterField);
            if( formFieldDetails === false ) {
                return false;
            }

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



            if( $(filterField).length == 0 ) {
                console.log('could not find anything to use as a filter using the selector: "' + filterField + '"' );
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
                $(formFieldDetails.baseSelector).on('change',function(e){
                    /**
                     * @var array list of class names to be filtered on from the
                     *      selected option's value
                     */
                    var filterClasses = $._splitValueOnWhiteSpace( $(formFieldDetails.valueSelector).val() );

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
        },


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
        secondary : function( filterID ) {
            /**
             * @var object formFieldDetails list of info about the filter form
             *      element
             *
             * @property string baseSelector The selector that finds the filter
             *           form element
             *
             * @property string itemSelector the selector that selects which
             *           item in the field is selected (used for select box and
             *           radio buttons)
             *
             * @property string valueSelector The selector for the selected item
             *           (used for select box and radio buttons)
             *
             * @property string fieldChosen the selector that finds which part
             *           of the element is selected (used for select box and
             *           radio buttons)
             *
             * @property string fieldType HTML element the filter form field is
             */
            var formFieldDetails = INFILTRATION.FILTER._getFormFieldDetails(filterField);
            if( formFieldDetails === false ) {
                return false;
            }

            /**
             * @var array list of class names to be filtered on from the
             *      selected option's value
             */
            var filterClasses = INFILTRATION.FILTER._splitValueOnWhiteSpace( $( formFieldDetails.valueSelector ).val() );

            if( filterClasses.length < 0 ) {
                if( formFieldDetails.fieldType === 'checkbox' ) {
                    $( formFieldDetails.baseSelector ).on('change',function(e){

                        var selector = filterWrapper + ' ' + filterItem + '.' + filterClass[0];console.log(selector);

                        if( $( formFieldDetails.valueSelector ).is(':checked') == false ) {
                                // find all the visible items that match the secondary filter
                                $( selector ).each(function(){
                                    // step through each matched item
                                    // check if it was matched by the primary filter
                                    if( $(this).data('visible','true') && $(this).hasClass('filter-show') ) {
                                        // hide the item by removing the filter-show class and adding the filter-hide class
                                        $(this).addClass('filter-hide').removeClass('filter-show');
                                    }
                                });
                        } else {
                            // find all the visible items that match the secondary filter
                           $( selector ).each(function(){
                                // step through each matched item
                                // check if it was matched by the primary filter
                                if( $(this).data('visible','true') && $(this).hasClass('filter-show') ) {
                                    // show the item by adding the filter-show class and removing the filter-hide class
                                    $(this).addClass('filter-show').removeClass('filter-hide');
                                }
                            });
                        }
                    });
                } else {

                    var selector = filterWrapper + ' ' + filterItem + '.';
                    $( formFieldDetails.baseSelector ).on('change',function(e){
                        for( var i = 0 ; i < filterClasses.length ; i += 1 ) {  
                            $( selector + filterClasses[i] ).each(function() {
                                // step through each matched item
                                // check if it was matched by the primary filter
                                if( $(this).data('visible','true') && $(this).hasClass('filter-hide') ) {
                                    // hide the item by removing the filter-show class and adding the filter-hide class
                                    $(this).addClass('filter-hide').removeClass('filter-hide');
                                }
                            });
                        }
                    });
                }
            }

        },

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
        presetFromUrl : function( filterID , dataAttr ) {

            /**
             * @var string sPageUrl the GET string part of the URL
             */
            var getString = window.location.search.substring(1);

            /**
             * @var array getVars all of the GET variables in the url
             */
            var getVars = getString.split('&');

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

            var formField = INFILTRATION.FILTER._getFormFieldDetails(filterField);

            if( formField === false ) {
                return false;
            }

            // we have a value to use for preselecting
            if( dataAttrVal !== false ) {
                // loop through each option
                if( formField.fieldType == 'select' || formField.fieldType == 'checkbox' || formField.fieldType == 'radio' ) {
                    $( formField.itemSelector ).each(function() {
                        // check if the option has the appropriate data attribute
                        // containing with the correct value
                        if( $(this).data(dataAttr) == dataAttrVal ) {
                            // YAY, we have a match. Make this option preselected
                            $(this).attr(formField.fieldChosen,formField.fieldChosen);
                        }
                    });
                } else {
                    $( formField.itemSelector ).val(dataAttrVal);
                }
                return dataAttrVal;
            } else {
                return '';
            }
        },

        bookmarkThis : function() {

        },

        /**
         * @function _getFormFieldDetails() find the element matched by a given
         *           ID and returns its input type
         *
         * @param string filterField the ID of a given form field
         *
         * @return string false form field type if ID belonged to a form
         *         field or FALSE if it did not
         */
        _getFormFieldDetails : function( filterField ) {
            try {
                $(filterField).prop('tagName');
            } catch(e) {
                console.log('Supplied filter field selector (' + filterField + ') did not match anything in the DOM.'); 
                return false;
            }

            /**
             * @var object formFieldDetails list of info about the filter form
             *      element
             *
             * @property string baseSelector The selector that finds the filter
             *           form element
             *
             * @property string itemSelector the selector that selects which
             *           item in the field is selected (used for select box and
             *           radio buttons)
             *
             * @property string valueSelector The selector for the selected item
             *           (used for select box and radio buttons)
             *
             * @property string fieldChosen the selector that finds which part
             *           of the element is selected (used for select box and
             *           radio buttons)
             *
             * @property string fieldType HTML element the filter form field is
             */
            var output = {
                baseSelector: filterField,
                valueSelector: filterField,
                itemSelector: filterField,
                fieldChosen: '',
                fieldType: $(filterField).prop('tagName').toLowerCase()
            }

            switch( output.fieldType  ) {
                case 'input':
                        output.fieldType = $(filterField).attr('type').toLowerCase();
                        switch( output.fieldType ) {

                            case 'radio':
                                var radioName = $(filterField).attr('name');
                                output.baseSelector = 'input[name="' + radioName + '"]';
                                output.itemSelector = output.baseSelector;
                                output.valueSelector = output.baseSelector + ':checked';
                                output.fieldChosen = 'checked';
                                break;

                            case 'checkbox':
                                output.fieldChosen = 'checked';
                                break;

                            case 'text':
                                break;
                            default:
                                output.fieldType = 'text';
                                break;
                        }
                        break;
                case 'textarea':
                        output.fieldType = 'text';
                        break;
                case 'select':
                        output.itemSelector = output.baseSelector + ' option'
                        output.valueSelector = output.itemSelector + ':selected'
                        output.fieldChosen = 'selected';
                        break;
                default:
                        console.log('Supplied filter ID (' + filterField + ') did not return a valid form field type. ' + tagname + ' was returned. Was expecting, select; input or textarea');
                        output = false;
                        break;
            }
            console.log(output);
            return output;
        },


        /**
         * @function _splitValueOnWhiteSpace() takes a string, trims white
         *           space from begining and end, converts multiple white
         *           space characters into single space characters then splits
         *           the string into an array
         *
         * @param string input the string to be split
         *
         * @return array a list of items that were separated by one or more
         *         white space characters
         */
        _splitValueOnWhiteSpace : function( inputValue ) {
            var regex = /\s+/;
            return inputValue.trim().replace(regex,' ').split(' ');
        },
    }
});
