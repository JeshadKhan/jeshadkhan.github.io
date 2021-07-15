/**
 * Turn.js Catalog App
 * Based on turn.js 5th release available on turnjs.com
 *
 * All rights reserved
 */
(function(window, $, Backbone) {
'use strict';
/* Singlethon abstract class */

var SingleView = Backbone.View.extend({},
// Static properties
{
  getInstance: function(context, options) {
    context = context || this;
    if (!context.instance) {
      context.instance = new this(options);
      context.instance.render();
    }
    return context.instance;
  },

  remove: function(context) {
    context = context || this;
    if (context.instance) {
      context.instance.remove();
      delete context.instance;
    }
  }
});

/* * Flipbook View * */

var FlipbookView = SingleView.extend({
  el: '#flipbook',
  events: {
    'missing': '_missingEvent',
    'pinch': '_pinchEvent',
    'zoomed': '_zoomedEvent',
    'turned': '_turnedEvent',
    'vmouseover .ui-arrow-control': '_hoverArrowEvent',
    'vmouseout .ui-arrow-control': '_nohoverArrowEvent',
    'vmousedown .ui-arrow-control': '_pressArrowEvent',
    'vmouseup .ui-arrow-control': '_releaseArrowEvent',
    'vmouseover .ui-region': '_mouseoverRegion',
    'vmouseout .ui-region': '_mouseoutRegion',
    'tap .ui-region': '_tapRegion'
  },

  initialize: function() {
    this.events[(Turn.isTouchDevice) ? 'doubletap' : 'tap'] = '_toggleZoomEvent';
    $(window).keydown($.proxy(this, '_keydownEvent'));
    $('body').on('tap', '.ui-arrow-next-page', $.proxy(this, '_tapNextArrowEvent'));
    $('body').on('tap', '.ui-arrow-previous-page', $.proxy(this, '_tapPreviousArrowEvent'));

    // Tooltip for regions
    this.$el.tooltips({
      selector: '.ui-region',
      className: 'ui-tooltip ui-region-tooltip'
    });
  },

  render: function() {
    var settings = window.FlipbookSettings;
    var options = $.extend({
      responsive: true,
      animatedAutoCenter: true,
      smartFlip: true,
      autoScaleContent: true,
      swipe: true
    }, settings.options);

    this.$el.turn(options);
  },

  _toggleZoomEvent: function(event) {
    this.$el.turn('toggleZoom', {pageX: event.pageX, pageY: event.pageY, animate: true});
  },

  _missingEvent: function(event, pages) {
    for (var i = 0; i < pages.length; i++) {
      this.$el.turn('addPage', this._getPageElement(pages[i]), pages[i]);
    }
  },

  _pinchEvent: function(event) {
    this.$el.turn('zoom', 1, event);
  },

  _zoomedEvent: function(event, zoom) {
    if (zoom==1) {
      $('.ui-arrow-control').show();
    } else {
      $('.ui-arrow-control').hide();
    }
  },

  _turnedEvent: function(event, page) {
    AppRouter.getInstance().navigate('page/' + page, {trigger: false});
    if (window.FlipbookSettings.loadRegions) {
      this._loadRegions(page);
    }
  },

  _hoverArrowEvent: function(event) {
    $(event.currentTarget).addClass('ui-arrow-control-hover');
  },
  
  _nohoverArrowEvent: function(event) {
    $(event.currentTarget).removeClass('ui-arrow-control-hover');
  },
  
  _pressArrowEvent: function(event) {
    $(event.currentTarget).addClass('ui-arrow-control-tap');
  },

  _releaseArrowEvent: function(event) {
    $(event.currentTarget).removeClass('ui-arrow-control-tap');
  },
  
  _tapNextArrowEvent: function(event) {
    this.$el.turn('next');
  },

  _tapPreviousArrowEvent: function(event) {
    this.$el.turn('previous');
  },

  _keydownEvent: function(event) {
    var nextArrow = 39, prevArrow = 37;
    if (event.keyCode==prevArrow) {
      this.$el.turn('previous');
    } else if (event.keyCode==nextArrow) {
      this.$el.turn('next');
    }
  },

  _getPageElement: function(pageNumber) {
    var $el = $('<div />'),
      settings = window.FlipbookSettings,
      imgSrc = settings.pageFolder+'/'+pageNumber+'/'+pageNumber+'.jpg',
      $img = $('<img />', {width: '100%', height: '100%', css: {display: 'none'}});

    // Do we need a spinner?
    var timerAddLoader = setTimeout(function() {
      var $loader = $('<div />', {'class': 'ui-spinner'});
      $el.append($loader);
      timerAddLoader = null;
    }, 150);
    
    $img.on('load', function(event) {
      $img.show();
      if (timerAddLoader===null) {
        $el.find('.ui-spinner').hide();
      } else {
        clearInterval(timerAddLoader);
      }
    });

    $img.attr('src', imgSrc);
    $el.append($img);

    return $el;
  },

  _loadRegions: function(pageNumber) {
    var pageData = $('#flipbook').turn('pageData', pageNumber);
    if (!pageData.regions) {
      pageData.regions = new Regions([], {pageNumber: pageNumber});
      pageData.regions.fetch();
    }
  },
  _mouseoverRegion: function(event) {
    $(event.currentTarget).addClass('ui-region-hover');
  },

  _mouseoutRegion: function(event) {
    $(event.currentTarget).removeClass('ui-region-hover');
  },

  _tapRegion: function(event) {
    event.stopPropagation();

    var $el = $(event.currentTarget);
    var view = $el.data('view');

    view.processAction();
  }
});


var RegionModel = Backbone.Model.extend({
  idAttribute: 'id',
  className: 'none'
});

var RegionView = Backbone.View.extend({
  tagName: 'div',
  className: 'ui-region',
  initialize: function(options) {
    this.render();
  },
  render: function() {
    var attr = this.model.attributes;

    if (attr.points) {
      var $pageElement = $('#flipbook').turn('pageElement', this.model.pageNumber);

      this.$el.css({
        left: (attr.points[0]*100)+'%',
        top: (attr.points[1]*100)+'%',
        width: (attr.points[2]*100)+'%',
        height: (attr.points[3]*100)+'%'
      });

      this.$el.attr('title', attr.hint);
      this.$el.addClass('ui-region-' + attr.className);
      this.$el.data({view: this});
      $pageElement.append(this.$el);
    }
  },

  processAction: function() {
    var attr = this.model.attributes,
      data = attr.data;
  
    switch (attr.className) {
      case 'page':
        $('#flipbook').turn('page', data.page);
      break;
      case 'link':
        window.open(data.url);
      break;
    }

    $('#flipbook').tooltips('hide');
  }
});

var Regions = Backbone.Collection.extend({
  model: RegionModel,
  initialize: function(models, options) {
    this.pageNumber = options.pageNumber;
    this.on('add', this._add, this);
  },
  url: function() {
    return FlipbookSettings.pageFolder + this.pageNumber + '/regions.json';
  },

  _add: function(regionModel) {
    // Add the view
    regionModel.pageNumber = this.pageNumber;
    new RegionView({model: regionModel});
  }
});

/* * Page Slider View * */

var PageSliderView = SingleView.extend({
  el: '#page-slider',

  events: {
    'changeValue': '_changeValueEvent',
    'slide': '_slideEvent',
    'vmousedown': '_pressEvent',
    'vmouseover': '_hoverEvent'
  },

  initialize: function() {
    var $el = this.$el;

    $('#flipbook').on('turned', function(event, page) {
      if (!$el.slider('isUserInteracting')) {
        $el.slider('value', page);
      }
    });
  },

  render: function() {
    this.$el.slider({
      min: 1,
      max: $('#flipbook').turn('pages'),
      value: $('#flipbook').turn('page')
    });
  },

  _changeValueEvent: function(event, newPage) {
    var currentVal = this.$el.slider('value');
    if ($.inArray(currentVal, $('#flipbook').turn('view', newPage))!=-1 ) {
      event.preventDefault();
      return;
    }
    if ($('#flipbook').turn('page', newPage)===false) {
      event.preventDefault();
    }
  },

  _slideEvent: function(event, newPage) {
    $('#miniatures').miniatures('page', newPage);
  },

  _pressEvent: function(event) {
    $('#miniatures').miniatures('listenToFlipbook', false);
    MiniaturesView.getInstance().show();

    $(document).one('vmouseup', $.proxy(this, '_releasedEvent'));

  },

  _releasedEvent: function(event) {
    $('#miniatures').miniatures('listenToFlipbook', true);
    if (!$('#miniatures').hasClass('ui-miniatures-slider-open')) {
      MiniaturesView.getInstance().hide();
    }
  },

  _hoverEvent: function(event) {
    event.stopPropagation();
  }
});


/* * Table of Contents * */

var TableContentsView = SingleView.extend({
  tagName: 'div',
  events: {
    'itemRequested': '_itemRequested',
    'itemSelected': '_itemSelected',
    'vmouseover': '_vmouseover',
    'vmouseout': '_vmouseout',
    'vmousemove': '_vmousemove'
  },

  _nextItemPage: 1,
  _itemPage: {},

  initialize: function() {
    $('#ui-icon-table-contents').on('vmouseover', $.proxy(this, 'show'));
    $('#ui-icon-table-contents').on('vmouseout', $.proxy(this, 'hide'));
  },

  render: function() {
    this.$el.menu({
      itemCount: this.itemCount()
    });

    this._menuDisplay = $('#flipbook').turn('display');
    this.$el.appendTo($('body'));
  },

  itemCount: function() {
    var settings = window.FlipbookSettings;
    if (settings.table) {
      return settings.table.length;

    } else {
      if ($('#flipbook').turn('display')=='single') {
        return $('#flipbook').turn('pages');
      } else {
        return Math.round($('#flipbook').turn('pages')/2) + 1;
      }
    }
  },

  clear: function() {
    this.$el.menu('clear');
    this._itemPage = {};
    this._nextItemPage = 1;
    this.$el.menu('options', {itemCount: this.itemCount()});
  },

  _itemRequested: function(event, itemNum) {
    var text, settings = window.FlipbookSettings;
    if (settings.table) {
      text = settings.table[itemNum].text;
      this._itemPage[settings.table[itemNum].page] = itemNum;
    } else {
      var pages = $('#flipbook').turn('view', this._nextItemPage, true);
      text = (pages.length==1) ? 'Page '+pages[0] : 'Pages '+pages.join('-');
      this._itemPage[pages[0]] = itemNum;
      this._nextItemPage = pages[pages.length-1] + 1;
    }
    this.$el.menu('addTextItem', text);
  },
  
  _itemSelected: function(event, itemNum) {
    var settings = window.FlipbookSettings;

    if (settings.table) {
      $('#flipbook').turn('page', settings.table[itemNum].page);
    } else {
      if ($('#flipbook').turn('display')=='single') {
        $('#flipbook').turn('page', itemNum+1);
      } else {
        $('#flipbook').turn('page', itemNum === 0 ? 1 : itemNum*2 );
      }
    }
  },

  show: function() {
    var flipbookDisplay = $('#flipbook').turn('display');
    if (flipbookDisplay!=this._menuDisplay) {
      this.clear();
      this._menuDisplay = flipbookDisplay;
    }

    var currentPage = $('#flipbook').turn('page');
    // Select the item that corresponds to the current page
    if ( this._itemPage[currentPage]!==undefined ) {
      this.$el.menu('selectItem', this._itemPage[currentPage], true);
    } else {
      var currentView = $('#flipbook').turn('view', null, true);
      if ( this._itemPage[currentView[0]]!==undefined ) {
        this.$el.menu('selectItem', this._itemPage[currentView[0]], true);
      } else if ( this._itemPage[currentView[1]]!==undefined ) {
        this.$el.menu('selectItem', this._itemPage[currentView[1]], true);
      } else {
         this.$el.menu('clearSelection');
      }
    }
    this.hide(false);
    this.$el.menu('showRelativeTo', $('#ui-icon-table-contents'));
  },

  hide: function(confirmation) {
    var that = this;

    if ( confirmation ) {
      if (!this._hideTimer) {
        this._hideTimer = setTimeout(function() {
          that.$el.menu('hide');
          this._hideTimer = null;
        }, 200);
      }
    } else {
      if (this._hideTimer) {
        clearInterval(this._hideTimer);
        this._hideTimer = null;
      }
    }
  },

  _vmouseover: function() {
    ControlsView.getInstance().hideOptions(false);
    this.hide(false);
  },

  _vmouseout: function() {
    this.hide(true);
  },

  _vmousemove: function(event) {
    ControlsView.getInstance().stopFade();
    event.donotFade = true;
  }
});

/* * Miniatures View * */

var MiniaturesView = SingleView.extend({
  el: '#miniatures',

  events: {
    refreshPicture: '_refreshPictureEvent'
  },

  initialize: function() {
    var that = this;
    $(window).on('orientationchange', function(event) {
      that.hide();
    });
    this.$el.hide();
  },

  render: function() {
    this.$el.miniatures({
      flipbook: $('#flipbook'),
      disabled: true
    });
  },

  _refreshPictureEvent: function(event, pageNumber, $pageElement) {
    var settings = window.FlipbookSettings,
      imgPrefix = settings.pageFolderFilePrefix ? settings.pageFolderFilePrefix : 'page_',
      imgSrc = settings.pageFolder+'/'+imgPrefix+pageNumber+'.jpg',
      $img = $pageElement.find('img');

    if (!$img[0]) {
      $pageElement.html('<img width="100%" height="100%" src="'+imgSrc+'"/>');
    } else {
     $img.attr('src', imgSrc);
    }
  },
  
  show: function() {
    var that = this;
    this.$el.show();
    this._visible = true;

    $('#viewer').one('vmousedown', $.proxy(MiniaturesView.getInstance(), 'hide'));
    if (this.$el.hasClass('ui-miniatures-slider-open')) {
      $('#ui-icon-miniature').addClass('ui-ui-icon-on');
    }
    setTimeout(function() {
      if ( that._visible ) {
        $('body').addClass('show-miniatures');
        that.$el.miniatures('disable', false).miniatures('refresh');
      }
    }, 5);
  },

  hide: function() {
    var that = this;

    this._visible = false;

    $('body').removeClass('show-miniatures');
    $('#ui-icon-miniature').removeClass('ui-ui-icon-on');
    $('#viewer').off('vmousedown', MiniaturesView.getInstance().hide);
    
    this.$el.removeClass('ui-miniatures-slider-open');
    setTimeout(function() {
      if ( !that._visible ) {
        that.$el.hide().miniatures('disable', true);
      }
    }, 300);
  },

  isOpened: function() {
    return this.$el.hasClass('ui-miniatures-slider-open');
  }
});

/* * * * */
var ControlsView = SingleView.extend({
  el: '#flipbook-controls',
  _fadeTimer: null,
  _hasFadeListener: true,
  events: {
    'vmouseover #ui-icon-expand-options': '_vmouseoverIconExpand',
    'vmouseover #ui-icon-toggle': '_vmouseoverIconExpand',
    'vmouseover #options': '_vmouseoverOptions',
    'vmouseout #options': '_vmouseoutOptions',
    'tap #ui-icon-expand-options': '_tapIconExpand'
  },

  initialize: function() {
    var eventNameToFade = (Turn.isTouchDevice) ? 'vmousedown' : 'vmousemove';
    $(document).on(eventNameToFade, $.proxy(this, '_fade'));

    this.events[eventNameToFade+' .all'] = '_preventFade';
    $('#miniatures').on(eventNameToFade, $.proxy(this, '_preventFade'));
    $('#zoom-slider-view').on(eventNameToFade, $.proxy(this, '_preventFade'));
  },

  _fade: function(event) {
    if (!event.donotFade) {
      var that = this;

      if (event.pageY > $('#viewer').height()-20) {
        if (this.$el.hasClass('hidden-controls')) {
          this.$el.removeClass('hidden-controls');
        }
      }

      if (this._fadeTimer) {
        clearInterval(this._fadeTimer);
      }

      this._fadeTimer = setTimeout(function() {
        if (!MiniaturesView.getInstance().isOpened()) {
          that.$el.removeClass('extend-ui-options');
          that.$el.addClass('hidden-controls');
          ZoomSliderView.getInstance().hide();
        }
      }, 1000);
   }
  },

  stopFade: function() {
    if (this._fadeTimer) {
      clearInterval(this._fadeTimer);
      this._fadeTimer = null;
    }
  },

  _preventFade: function(event) {
    this.stopFade();
    event.donotFade = true;
  },

  _vmouseoverIconExpand: function(event) {
    if (!Turn.isTouchDevice) {
      this.showOptions();
    }
  },

  _vmouseoverOptions: function() {
    this.hideOptions(false);
  },
  _vmouseoutOptions: function() {
    this.hideOptions(true);
  },
  
  _tapIconExpand: function() {
    this.showOptions();
  },

  showOptions: function() {
    this.$el.removeClass('hidden-controls');
    this.$el.addClass('extend-ui-options');
    this.hideOptions(false);
  },

  hideOptions: function( confirmation ) {
    var that = this;
    if ( confirmation ) {
      if (! this._hideOptionTimer ) {
        this._hideOptionTimer = setTimeout(function() {
          that._hideOptionTimer = null;
          that.$el.removeClass('extend-ui-options');
        }, 100);
      }
    } else {
      if (this._hideOptionTimer) {
        clearInterval(this._hideOptionTimer);
        this._hideOptionTimer = null;
      }
    }
  }
});

/* * Options View * */

var OptionsView = SingleView.extend({
  el: '#options',

  events: {
    'willShowHint': '_willShowHint',
    'vmouseover #ui-icon-zoom': '_vmouseoverIconZoom',
    'vmouseout #ui-icon-zoom': '_vmouseoutIconZoom',
    'vmousedown': '_vmousedown',
    'tap .ui-icon': '_tapIcon'
  },

  initialize: function() {
    var $el = this.$el;
  },

  render: function() {
    this.$el.tooltips({
      positions: 'top,left'
    });
  },

  _willShowHint: function(event, $target) {
    this.$el.tooltips('options', {positions: 'top,left'});
  },

  _vmouseoverIconZoom: function(event) {
    var $sliderView = $('#zoom-slider-view'),
      $zoomIcon = $(event.currentTarget),
      thisOffset = Turn.offsetWhile($zoomIcon[0], function(el) { return el.className!='catalog-app'; });

    $sliderView.css({
        left: thisOffset.left,
        top: 'auto',
        bottom: 5,
        right: 'auto'
      });

    $('#zoom-slider').slider('style', 'vertical');
    ZoomSliderView.getInstance().show();
  },

  _vmouseoutIconZoom: function(event) {
    ZoomSliderView.getInstance().hide(true);
  },

  _vmousedown: function(event) {
    event.stopPropagation();
  },

  _tapIcon: function(event) {
    var $icon = $(event.currentTarget);
    switch ($icon.attr('id')) {
      case 'ui-icon-table-contents':
      break;
      case 'ui-icon-miniature':
        var miniatures = MiniaturesView.getInstance(),
          willHide =  miniatures.isOpened();

        if (willHide) {
          miniatures.hide();
        } else {
          $('#miniatures').addClass('ui-miniatures-slider-open');
          miniatures.show();
        }
      break;
      case 'ui-icon-zoom':
        // Will show the zoom slider
      break;
      case 'ui-icon-share':
        ShareBox.getInstance().show();
      break;
      case 'ui-icon-full-screen':
        Turn.toggleFullScreen();
      break;

      case 'ui-icon-toggle':
        $('#flipbook-controls').toggleClass('extend-ui-options');
      break;
    }
  }
});


/* * Zoom Slider View * */

var ZoomSliderView = SingleView.extend({
  el: '#zoom-slider-view',

  events: {
    'changeValue #zoom-slider': '_changeValueEvent',
    'slide #zoom-slider': '_slideEvent',
    'vmousedown #zoom-slider': '_vmousedown',
    'vmouseover': '_vmouseover',
    'vmouseout': '_vmouseout'
  },

  render: function() {
    this.$el.find('#zoom-slider').slider({
      style: 'vertical',
      min: 0,
      max: 10
    });
  },
  
  _changeValueEvent: function(event, val) {
    var zoom = val/10 * ($('#flipbook').turn('maxZoom')-1) + 1;
    $('#flipbook').turn('zoom', zoom, {animate: false});
  },

  _slideEvent: function(event, val) {
    var zoom = val/10 * ($('#flipbook').turn('maxZoom')-1) +1;
    $('#flipbook').turn('zoom', zoom, {animate: false});
  },

  _vmousedown: function(event) {
    event.stopPropagation();
  },

  _vmouseover: function(event) {
    this.show();
    ControlsView.getInstance().hideOptions(false);
  },

  _vmouseout: function(event) {
    var that = this;
    this.hide(true);
  },

  show: function() {
    var $sliderEl = this.$el.find('#zoom-slider');

    $sliderEl.slider('disable', false);

    $('#zoom-slider-view').addClass('show-zoom-slider');
    $('#ui-icon-zoom').addClass('ui-icon-contrast');

    // Recalculate the slider's value
    $sliderEl.slider('value',
      Math.round(($('#flipbook').turn('zoom')-1) / ($('#flipbook').turn('maxZoom')-1) * 10), true);
    
    $('body').one('vmousedown', $.proxy(this, 'hide'));

    this.hide(false);
  },

  hide: function(confirmation) {
    var that = this;
    if ( confirmation ) {
      if (!this._hideTimer) {
        this._hideTimer = setTimeout(function() {
          var $sliderEl = that.$el.find('#zoom-slider');

          $sliderEl.slider('disable', true);
          $('#zoom-slider-view').removeClass('show-zoom-slider');
          $('#ui-icon-zoom').removeClass('ui-icon-contrast');
          setTimeout(function() {
            if (!$('#zoom-slider-view').hasClass('show-zoom-slider')) {
              $('#zoom-slider-view').css({top: '', left: ''});
            }
          }, 300);
          $('body').off('vmousedown', that.hide);
          that._hideTimer = null;
        }, 100);
      }
    } else {
      if (this._hideTimer) {
        clearInterval(this._hideTimer);
        this._hideTimer = null;
      }
    }
  }
});


/* * Share Box View * */

var ShareBox = SingleView.extend({
  className: 'ui-share-box',
  tagName: 'div',
  events: {
    'tap': '_tapEvent',
    'tap .ui-icon': '_tapIconEvent'
  },

  initialize: function() {
    var html = '';

    html +='<i class="close-mark"></i>';
    html +='<div class="ui-share-options">';
    html +='<a title="LinkedIn" class="ui-icon show-hint"><i class="fa fa-linkedin-square"></i></a>';
    html +='<a title="Facebook" class="ui-icon show-hint"><i class="fa fa-facebook-square"></i></a>';
    html +='<a title="Twitter" class="ui-icon show-hint"><i class="fa fa-twitter-square"></i></a>';
    // html +='<a title="Google+" class="ui-icon show-hint"><i class="fa fa-google-plus-square"></i></a>';
    html +='<a title="Email" class="ui-icon show-hint"><i class="fa fa-envelope"></i></a>';
    html +='</div>';

    this.$el.html(html);
    this.$el.appendTo($('body'));
  },

  render: function() {
    this.$el.tooltips({positions: 'top'});
  },

  _tapEvent: function(event) {
    this.hide();
  },

  _tapIconEvent: function(event) {
    var $target = $(event.currentTarget),
    currentUrl = encodeURIComponent(window.location.href),
    title = $target.attr('title') || $target.attr('v-title'),
    text = encodeURIComponent(window.FlipbookSettings.shareMessage),
    winOptions = 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600';

    switch (title) {
      case 'Facebook':
        window.open('https://www.facebook.com/sharer/sharer.php?u='+currentUrl+'&t='+text, '', winOptions);
      break;
      case 'Twitter':
        window.open('https://twitter.com/share?text='+text+' '+currentUrl, '', winOptions);
      break;
      case 'Google+':
        window.open('https://plus.google.com/share?url='+currentUrl, '', winOptions);
      break;
      case 'LinkedIn':
        window.open('http://www.linkedin.com/shareArticle?mini=true&url='+currentUrl+'&title='+text, '',  winOptions);
      break;
      case 'Email':
      window.location.href='mailto:?body='+text+' '+currentUrl;
      break;
    }

    event.stopPropagation();
  },

  show: function() {
    var that = this;
    setTimeout(function() {
      that.$el.addClass('show-ui-share-box');
    }, 1);
  },

  hide: function() {
    this.$el.removeClass('show-ui-share-box');
  }
});

var AppRouter = Backbone.Router.extend({
  routes: {
    'page/:page': '_page',
  },
  _page: function(page) {
    if ( FlipbookView.instance ) {
      $('#flipbook').turn('page', page);
    } else {
      window.FlipbookSettings.options.page = parseInt(page, 10);
    }
  }
}, {
  getInstance: function(context) {
    context = context || this;
    if (!context.instance) {
      context.instance = new this();
    }
    return context.instance;
  }
});


/* *  * */
function bootstrap() {
  // Initialize routes
  AppRouter.getInstance();
  Backbone.history.start();

  // Initialize views
  FlipbookView.getInstance();
  PageSliderView.getInstance();
  MiniaturesView.getInstance();
  OptionsView.getInstance();
  ZoomSliderView.getInstance();
  ControlsView.getInstance();
  TableContentsView.getInstance();


  $(window).on('orientationchange', function(event) {
    $(window).scrollTop(0);
    $(window).scrollLeft(0);
  });

  $(document).on('vmousemove', function(event) {
    event.preventDefault();
  });

  $(window).load(function() {
    $(window).scrollTop(0);
  });
}

$(document).ready(bootstrap);

})(window, jQuery, Backbone);
