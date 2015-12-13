
var CoupledSlider = function() { // abstract
    'use strict';

    this._sisterSlider = null;

    this.setSisterSlider = function (sliderObj) {
        this._sisterSlider = sliderObj;
    };
};
CoupledSlider.prototype = new BaseSlider();

var MainSlider = function () {
    'use strict';

    this._captionBlock = null;

    this.handleAfterMove = function () {
        var newPosition = this.getCurrentSliderPosition();
        this.setSlideToSelected(newPosition);
        // make changes in thumbnail slider
        this._sisterSlider.setSlideToSelected(newPosition);
        this._sisterSlider.PaginateIfOutOfRange(newPosition);
        this.adjustNavEnabling();
        this._captionBlock.setHtml(this.getCaptionHtml());
    };
    this.create = function () {
        var specificOwlOptions = {
            singleItem: true
        };
        this.createSlider(specificOwlOptions);
        this.addNavigation();
        this.adjustNavEnabling();
        this._captionBlock.setHtml(this.getCaptionHtml());
    };
    this.doMoveFromNav = function (signedIncrement) {
        var newPosition = this.getSelectedSlidePosIdx() + signedIncrement;
        this.moveToPosition(newPosition);
    };
    this.setCaptionBlock = function (captionBlock) {
        this._captionBlock = captionBlock;
    };
    this.getCaptionHtml = function () {
        var captionSourceRoot$ = this.getSlideElementAtPosIdx(this.getSelectedSlidePosIdx()).
            find('.slide-caption').eq(0);

        var fraction$ = this._captionBlock.getFractionHtml(
            this.getSelectedSlidePosIdx() + 1, this.getTotalNumberItems());

        var slideTitle$ = $(captionSourceRoot$).find('.slide-caption-title').eq(0);
        var slideTitleText = $(slideTitle$).text();
        var titleOut$ = $('<span class="slide-title">' + slideTitleText + '</span>');
        var copyText$ = $(captionSourceRoot$).find('.slide-caption-body').eq(0);
        var copyText = $(copyText$).text();
        var copyTextOut$ = $('<div/>');
        $(copyTextOut$).html(copyText);
        var captionOut$ = $('<div/>');
        var titleLineOut$ = $('<span class="slide-title-line"/>');
        titleLineOut$.append(fraction$);
        titleLineOut$.append(titleOut$);
        $(captionOut$).append(titleLineOut$);
        $(captionOut$).append(copyTextOut$);

        return captionOut$;
    };
};
MainSlider.prototype = new CoupledSlider();

var ThumbnailSlider = function () {
    'use strict';

    this.handleAfterMove = function () {
        this.adjustNavEnabling();
    };
    this.addUnderliners = function () {
        $(this._sliderEl$).find('.slide').append($('<div class=\'image-underliner\'/>'));
    };
    this.create = function () {
        var specificOwlOptions = {
            responsive: false
        };
        this.createSlider(specificOwlOptions);
        this.addUnderliners();
        this.setSlideHandlers();
        this.addNumeration();
        if (this.getTotalNumberItems() > this.getNumberItemsVisible()) { // requires pagination
            this.addNavigation();
            this.adjustNavEnabling();
        }
    };
    this.setSlideHandlers = function () {
        var self = this;
        $(this._sliderEl$).find('.slide').click(function (event) {
            event.preventDefault();
            var positionIndex = $(self._sliderEl$).find('.slide').index(this);
            self._sisterSlider.moveToPosition(positionIndex);
        });
    };
    this.addNumeration = function () {
        var denominator = this.getTotalNumberItems();
        $.each($(this._sliderEl$).find('.slide'), function (index, slide$) {
            var numerator = index + 1;
            var text = numerator + '/' + denominator;
            var text$ = $('<p class="numeration">' + text + '</p>');
            $(slide$).find('.slide-caption').before(text$);
        });
    };
    this.getMaxPosIdxFirstElementShown = function () {
        return this.getTotalNumberItems() - this.getNumberItemsVisible();
    };
    this.getMinPosIdxFirstElementShown = function () {
        return 0;
    };
    this.doMoveFromNav = function (signedIncrement) {
        var newPosition;
        if (signedIncrement === 1) { // to right
            newPosition = Math.min(this.getCurrentSliderPosition() + this.getNumberItemsVisible(),
                this.getMaxPosIdxFirstElementShown());
        } else {
            newPosition = Math.max(this.getCurrentSliderPosition() - this.getNumberItemsVisible(),
                this.getMinPosIdxFirstElementShown());
        }
        this.moveToPosition(newPosition);  // index of slide in first position
    };
    this.PaginateIfOutOfRange = function (newSelectedPositionIdx) {
        var maxIdxCurrentlyShown = Math.max.apply(Math, this.getVisibleItems());
        var minIdxCurrentlyShown = Math.min.apply(Math, this.getVisibleItems());

        var newPosition;
        if (newSelectedPositionIdx > maxIdxCurrentlyShown) { // need to move right
            newPosition = Math.min(newSelectedPositionIdx,
                this.getMaxPosIdxFirstElementShown());
        } else if (newSelectedPositionIdx < minIdxCurrentlyShown) {
            newPosition = Math.max(newSelectedPositionIdx - this.getNumberItemsVisible() + 1,
                this.getMinPosIdxFirstElementShown());
        } else {
            return; // already in range
        }
        this.moveToPosition(newPosition);  // index of slide in first position
    };
};
ThumbnailSlider.prototype = new CoupledSlider();

var CaptionBlock = function () {
    'use strict';

    this._rootEl$ = null;

    this.setRootEl = function (rootEl$) {
        this._rootEl$ = rootEl$;
    };

    this.setHtml = function (html) {
        $(this._rootEl$).html(html);
    };

    this.getFractionHtml = function (numerator, denominator) { // static method
        var container$ = $('<span class="fraction"/>');
        var contents$ = $('<span class="current">' + numerator + '</span>' +
            '<span class="divider" title="of">/</span><span class="total">' + denominator + '</span>');
        $(container$.append(contents$));
        return container$;
    };
};

var ArticleSlider = function (rootEl$) {
    'use strict';

    var _rootEl$ = rootEl$;

    var _createSliders = function () {
        var mainSlider = new MainSlider();
        var thumbnailSlider = new ThumbnailSlider();
        var captionBlock = new CaptionBlock();

        mainSlider.setSliderEl($('.main-slider .eq-article-slider'));
        mainSlider.setSisterSlider(thumbnailSlider);
        mainSlider.setNumberItemsVisible(1);
        mainSlider.setCaptionBlock(captionBlock);
        captionBlock.setRootEl($('.eq-caption-block'));
        mainSlider.create();

        thumbnailSlider.setSliderEl($('.thumbnail-slider .eq-article-slider'));
        thumbnailSlider.setSisterSlider(mainSlider);
        thumbnailSlider.setNumberItemsVisible(5);
        thumbnailSlider.create();
    };

    var _init = function () {
        _generateClones($(_rootEl$));
        _createSliders();
    };

    var _generateClones = function (sourceEl$) {
        var cloneSource$ = $(sourceEl$).eq(0); // only handle one

        // get class name for specific slider details

        var sliderType = $(cloneSource$).data('slider-type');

        // create 2-level outer wrapper to follow clone source div
        var setWrapperEl$ = $('<div class="eq-slider-set"/>');
        $(setWrapperEl$).addClass(sliderType);
        $(setWrapperEl$).insertAfter(cloneSource$);

        var singleWrapperMainEl$ = $('<div class="eq-slider-wrapper main-slider"/>');
        $(setWrapperEl$).append(singleWrapperMainEl$);

        var singleWrapperThumbnailEl$ = $('<div class="eq-slider-wrapper thumbnail-slider"/>');
        if(Utils.isBrowserTouchEnabled()) {
            $(singleWrapperThumbnailEl$).addClass('touch');
        }
        $(setWrapperEl$).append(singleWrapperThumbnailEl$);

        $(cloneSource$).clone().appendTo(singleWrapperMainEl$);
        $(cloneSource$).clone().appendTo(singleWrapperThumbnailEl$);

        var captionBlock$ = $('<div class="eq-caption-block"/>');
        $(setWrapperEl$).append(captionBlock$);


        $(cloneSource$).eq(0).hide(); // hide original
    };

    return {
        init: _init
    };
};

$.fn.articleSlideshow = function () {  // defines jquery plugin
    'use strict';


    var articleSlider = new ArticleSlider(this);
    articleSlider.init();
    return this;  // allows chaining
};
