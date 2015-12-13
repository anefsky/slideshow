var BaseSlider = function () { // abstract
    'use strict';

    this._sliderEl$ = null;
    this._numberItems = null;

    this.setSliderEl = function (el$) {
        this._sliderEl$ = el$;
    };
    this.setNumberItemsVisible = function (qty) {
        this._numberItems = qty;
    };
    this.getNumberItemsVisible = function () {
        return this._numberItems;
    };
    this.setSlideToSelected = function (positionIndex) {
        $(this._sliderEl$).find('.slide').removeClass('selected').eq(positionIndex).addClass('selected');
    };
    this.getSliderHandle = function () {
        return $(this._sliderEl$).data('owlCarousel');
    };
    this.moveToPosition = function (positionIndex) {
        this.getSliderHandle().goTo(positionIndex);
    };
    this.getVisibleItems = function () {
        return this.getSliderHandle().visibleItems;
    };
    this.getCurrentSliderPosition = function () {
        return this.getSliderHandle().currentItem;
    };
    this.getTotalNumberItems = function () {
        return this.getSliderHandle().itemsAmount;
    };
    this.getSlideElementAtPosIdx = function (posIdx) {
        return $(this._sliderEl$).find('.slide').eq(posIdx);
    };
    this.getSelectedSlidePosIdx = function () {
        return $(this._sliderEl$).find('.slide').index($(this._sliderEl$).find('.selected'));
    };
    this.addNavigation = function () {  // creates navigation for each slider
        var navLeft$, navRight$;

        var navArray = [
            {
                navEl$: navLeft$,
                className: 'to-left',
                signedIncrement: -1,
                text: '&lt'
            },
            {
                navEl$: navRight$,
                className: 'to-right',
                signedIncrement: 1,
                text: '&gt'
            }
        ];
        var self = this;
        navArray.forEach(function (navItem) {
            navItem.navEl$ = $('<a href="#" class="slider-nav ' + navItem.className + '">' + navItem.text + '</a>');
            $(self._sliderEl$).parent().append(navItem.navEl$);
            $(navItem.navEl$).click(function (event) {
                event.preventDefault();
                self.doMoveFromNav(navItem.signedIncrement);
            });

        });
    };
    this.adjustNavEnabling = function () {
        var firstItemIdx = 0;
        var lastItemIdx = this.getTotalNumberItems() - 1;

        var containsNavEl$ = $(this._sliderEl$).parent();
        $(containsNavEl$).find('.slider-nav').removeClass('disabled'); // clear all
        if (this.getPosIdxFirstShown() === firstItemIdx) {
            $(containsNavEl$).find('.slider-nav.to-left').addClass('disabled');
        } else if (this.getPosIdxLastShown() === lastItemIdx) {
            $(containsNavEl$).find('.slider-nav.to-right').addClass('disabled');
        }
    };
    this.getPosIdxFirstShown = function () {
        return this.getVisibleItems()[0];
    };
    this.getPosIdxLastShown = function () {
        return this.getVisibleItems()[this.getVisibleItems().length - 1];
    };
    this.createSlider = function (specificOwlOptions) {
        var owlOptions = {};
        var self = this;
        var commonOwlOptions = {
            items: this._numberItems,
            afterMove: function () {
                self.handleAfterMove();
            }
        };
        $.extend(owlOptions, commonOwlOptions);
        $.extend(owlOptions, specificOwlOptions);  // specific overwrites common if clash
        $(this._sliderEl$).owlCarousel(owlOptions);
        this.setSlideToSelected(0);  // default first slide
    };
};

