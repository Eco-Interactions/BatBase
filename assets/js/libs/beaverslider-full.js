/**
 * @param {Object} options
 * @return {?}
 */
function BeaverSlider(options) {
  var self = this;
  /**
   * @param {string} msg
   * @return {?}
   */
  this.error = function(msg) {
    throw new Error(msg);return false;
  };
  /** @type {Object} */
  this.settings = options;
  if (!this.settings) {
    return this.error("Error: no settings parameter is passed");
  }
  if (!this.settings.type || this.settings.type != "slider" && (this.settings.type != "carousel" && this.settings.type != "zoomer")) {
    /** @type {string} */
    this.settings.type = "slider";
  }
  if (!this.settings.structure) {
    return this.error("Error: no structure parameter is passed");
  }
  if (!this.settings.structure.container) {
    return this.error("Error: no container parameter is passed");
  }
  if (!this.settings.structure.container.id && !this.settings.structure.container.selector) {
    return this.error("Error: no id/selector parameter is passed");
  }
  if (!this.settings.structure.container.height) {
    return this.error("Error: no height parameter is passed");
  }
  if (!this.settings.structure.container.width) {
    return this.error("Error: no width parameter is passed");
  }
  if (!this.settings.content) {
    return this.error("Error: no content parameter is passed");
  }
  if (!this.settings.content.images) {
    return this.error("Error: no images parameter is passed");
  }
  if (!this.settings.animation) {
    return this.error("Error: no animation parameter is passed");
  }
  if (!this.settings.animation.effects) {
    return this.error("Error: no effects parameter is passed");
  }
  if (!this.settings.animation.interval) {
    return this.error("Error: no interval parameter is passed");
  }
  this.settings.animation.messageAnimationDuration = this.settings.animation.messageAnimationDuration || 800;
  /** @type {number} */
  i = 0;
  for (;i < options.content.images.length;i++) {
    /** @type {Image} */
    var cubeImage = new Image;
    /**
     * @return {undefined}
     */
    cubeImage.onload = function() {
      self.imagesLoaded++;
    };
    cubeImage.src = options.content.images[i];
  }
  var container = jQuery("#" + this.settings.structure.container.id);
  if (!container.size()) {
    container = jQuery(this.settings.structure.container.selector);
  }
  container.css({
    width : this.settings.structure.container.width
  });
  this.container = jQuery("<div>").appendTo(container);
  /** @type {null} */
  this.areaMain = null;
  /** @type {null} */
  this.areaEffects = null;
  /** @type {null} */
  this.areaEffectsTemplate = null;
  /** @type {null} */
  this.areaStatus = null;
  /** @type {null} */
  this.areaWidgets = null;
  /** @type {null} */
  this.areaMessage = null;
  /** @type {null} */
  this.areaPlayer = null;
  /** @type {number} */
  this.imagesLoaded = 0;
  /** @type {number} */
  this.currentImage = 0;
  /** @type {number} */
  this.currentMessage = 0;
  /** @type {null} */
  this.currentBackground = null;
  /** @type {null} */
  this.nextEffect = null;
  /** @type {boolean} */
  this.stopped = false;
  /** @type {boolean} */
  this.animationNow = false;
  /** @type {boolean} */
  this.playerFadeNow = false;
  /** @type {null} */
  this.cells = null;
  /** @type {null} */
  this.currentEffect = null;
  /** @type {null} */
  this.run = null;
  /** @type {null} */
  this.messagesAnimationCounter = null;
  /** @type {boolean} */
  this.insideOfBeaverHouse = false;
  /** @type {boolean} */
  this.ignoreByBeaverHouse = false;
  /**
   * @return {undefined}
   */
  this.initialize = function() {
    this.constructAreaMain();
    this.constructAreaStatus();
    this.constructMessage();
    this.constructPlayer();
    this.initEffects();
    if (this.settings.animation.runOnInit != false) {
      this.startSliding(true);
    }
  };
  /**
   * @return {?}
   */
  this.initEffects = function() {
    /** @type {Array} */
    this.effects = [{
      id : 0,
      group : "fade",
      name : "fadeOut",
      duration : 1E3,
      size : null,
      steps : null,
      run : this.fadeOut
    }, {
      id : 1,
      group : "slide",
      name : "slideLeft",
      duration : 1E3,
      size : null,
      steps : null,
      run : this.slideLeft
    }, {
      id : 2,
      group : "slide",
      name : "slideRight",
      duration : 1E3,
      size : null,
      steps : null,
      run : this.slideRight
    }, {
      id : 3,
      group : "slide",
      name : "slideUp",
      duration : 1E3,
      size : null,
      steps : null,
      run : this.slideUp
    }, {
      id : 4,
      group : "slide",
      name : "slideDown",
      duration : 1E3,
      size : null,
      steps : null,
      run : this.slideDown
    }, {
      id : 5,
      group : "chessBoard",
      name : "chessBoardLeftDown",
      duration : 1E3,
      size : 10,
      steps : 10,
      run : this.chessBoardLeftDown
    }, {
      id : 6,
      group : "chessBoard",
      name : "chessBoardLeftUp",
      duration : 1E3,
      size : 10,
      steps : 10,
      run : this.chessBoardLeftUp
    }, {
      id : 7,
      group : "chessBoard",
      name : "chessBoardRightDown",
      duration : 1E3,
      size : 10,
      steps : 10,
      run : this.chessBoardRightDown
    }, {
      id : 8,
      group : "chessBoard",
      name : "chessBoardRightUp",
      duration : 1E3,
      size : 10,
      steps : 10,
      run : this.chessBoardRightUp
    }, {
      id : 9,
      group : "chessBoard",
      name : "chessBoardRandom",
      duration : 1E3,
      size : 10,
      steps : 10,
      run : this.chessBoardRandom
    }, {
      id : 10,
      group : "jalousie",
      name : "jalousieLeft",
      duration : 1E3,
      size : 10,
      steps : 10,
      run : this.jalousieLeft
    }, {
      id : 11,
      group : "jalousie",
      name : "jalousieUp",
      duration : 1E3,
      size : 10,
      steps : 10,
      run : this.jalousieUp
    }, {
      id : 12,
      group : "jalousie",
      name : "jalousieRight",
      duration : 1E3,
      size : 10,
      steps : 10,
      run : this.jalousieRight
    }, {
      id : 13,
      group : "jalousie",
      name : "jalousieDown",
      duration : 1E3,
      size : 10,
      steps : 10,
      run : this.jalousieDown
    }, {
      id : 14,
      group : "jalousie",
      name : "jalousieRandomHorizontal",
      duration : 1E3,
      size : 10,
      steps : 10,
      run : this.jalousieRandomHorizontal
    }, {
      id : 15,
      group : "jalousie",
      name : "jalousieRandomVertical",
      duration : 1E3,
      size : 10,
      steps : 10,
      run : this.jalousieRandomVertical
    }, {
      id : 16,
      group : "pancake",
      name : "pancakeIn",
      duration : 1E3,
      size : 10,
      steps : 10,
      run : this.pancakeIn
    }, {
      id : 17,
      group : "pancake",
      name : "pancakeOut",
      duration : 1E3,
      size : 10,
      steps : 10,
      run : this.pancakeOut
    }, {
      id : 18,
      group : "pancake",
      name : "pancakeRandom",
      duration : 1E3,
      size : 10,
      steps : 10,
      run : this.pancakeRandom
    }, {
      id : 19,
      group : "spiral",
      name : "spiralIn",
      duration : 1E3,
      size : 10,
      steps : 10,
      run : this.spiralIn
    }, {
      id : 20,
      group : "spiral",
      name : "spiralOut",
      duration : 1E3,
      size : 10,
      steps : 10,
      run : this.spiralOut
    }, {
      id : 21,
      group : "prison",
      name : "prisonVertical",
      duration : 1E3,
      size : 10,
      steps : null,
      run : this.prisonVertical
    }, {
      id : 22,
      group : "prison",
      name : "prisonHorizontal",
      duration : 1E3,
      size : 10,
      steps : null,
      run : this.prisonHorizontal
    }, {
      id : 23,
      group : "zoom",
      name : "zoomLeftTop",
      duration : 1E3,
      size : 10,
      steps : null,
      run : this.zoomLeftTop
    }, {
      id : 24,
      group : "zoom",
      name : "zoomLeftBottom",
      duration : 1E3,
      size : 10,
      steps : null,
      run : this.zoomLeftBottom
    }, {
      id : 25,
      group : "zoom",
      name : "zoomRightTop",
      duration : 1E3,
      size : 10,
      steps : null,
      run : this.zoomRightTop
    }, {
      id : 26,
      group : "zoom",
      name : "zoomRightBottom",
      duration : 1E3,
      size : 10,
      steps : null,
      run : this.zoomRightBottom
    }, {
      id : 27,
      group : "zoom",
      name : "zoomCenter",
      duration : 1E3,
      size : 10,
      steps : null,
      run : this.zoomCenter
    }, {
      id : 28,
      group : "zoom",
      name : "zoomRandom",
      duration : 1E3,
      size : 10,
      steps : null,
      run : this.zoomRandom
    }, {
      id : 29,
      group : "nails",
      name : "nailsUp",
      duration : 1E3,
      size : 10,
      steps : 10,
      run : this.nailsUp
    }, {
      id : 30,
      group : "nails",
      name : "nailsDown",
      duration : 1E3,
      size : 10,
      steps : 10,
      run : this.nailsDown
    }, {
      id : 31,
      group : "nails",
      name : "nailsLeft",
      duration : 1E3,
      size : 10,
      steps : 10,
      run : this.nailsLeft
    }, {
      id : 32,
      group : "nails",
      name : "nailsRight",
      duration : 1E3,
      size : 10,
      steps : 10,
      run : this.nailsRight
    }, {
      id : 33,
      group : "weed",
      name : "weedDownRight",
      duration : 1E3,
      size : 10,
      steps : null,
      run : this.weedDownRight
    }, {
      id : 34,
      group : "weed",
      name : "weedDownLeft",
      duration : 1E3,
      size : 10,
      steps : null,
      run : this.weedDownLeft
    }, {
      id : 35,
      group : "weed",
      name : "weedUpRight",
      duration : 1E3,
      size : 10,
      steps : null,
      run : this.weedUpRight
    }, {
      id : 36,
      group : "weed",
      name : "weedUpLeft",
      duration : 1E3,
      size : 10,
      steps : null,
      run : this.weedUpLeft
    }, {
      id : 37,
      group : "slideOver",
      name : "slideOverLeft",
      duration : 1E3,
      size : null,
      steps : null,
      run : this.slideOverLeft
    }, {
      id : 38,
      group : "slideOver",
      name : "slideOverRight",
      duration : 1E3,
      size : null,
      steps : null,
      run : this.slideOverRight
    }, {
      id : 39,
      group : "slideOver",
      name : "slideOverUp",
      duration : 1E3,
      size : null,
      steps : null,
      run : this.slideOverUp
    }, {
      id : 40,
      group : "slideOver",
      name : "slideOverDown",
      duration : 1E3,
      size : null,
      steps : null,
      run : this.slideOverDown
    }];
    /** @type {Array} */
    this.userEffects = new Array;
    if (this.settings.animation.effects == "random") {
      /** @type {Array} */
      this.userEffects = this.effects;
    } else {
      var data = typeof this.settings.animation.effects == "string" ? this.settings.animation.effects.split(",") : this.settings.animation.effects;
      /** @type {number} */
      i = 0;
      for (;i < data.length;i++) {
        var evt;
        var duration;
        var size;
        var steps;
        if (typeof data[i] == "string") {
          data[i] = data[i].split(":");
          evt = jQuery.trim(data[i][0]);
          duration = jQuery.trim(data[i][1]);
          size = jQuery.trim(data[i][2]);
          steps = jQuery.trim(data[i][3]);
        } else {
          evt = jQuery.trim(data[i].name);
          duration = jQuery.trim(data[i].duration);
          size = jQuery.trim(data[i].size);
          steps = jQuery.trim(data[i].steps);
        }
        /** @type {number} */
        j = 0;
        for (;j < this.effects.length;j++) {
          if (this.effects[j].group.toLowerCase() == evt.toLowerCase() || this.effects[j].name.toLowerCase() == evt.toLowerCase()) {
            this.userEffects.push({
              id : this.effects[j].id,
              group : this.effects[j].group,
              name : this.effects[j].name,
              duration : duration ? duration : this.effects[j].duration,
              size : size ? size : this.effects[j].size,
              steps : steps ? steps : this.effects[j].steps,
              run : this.effects[j].run
            });
          }
        }
      }
    }
    if (this.settings.type == "carousel" && this.userEffects.length != 2) {
      return this.error("Error: carousel must have two effects! Please, recheck your effect names, probably you use a group name instead of effect name.");
    }
    /** @type {number} */
    i = 0;
    for (;i < this.userEffects.length;i++) {
      var b = this.userEffects[i].id;
      if ((this.settings.type == "carousel" || this.settings.type == "slider") && (b >= 23 && b <= 28)) {
        return this.error("Error: you cannot use zoom effects for this type of slider");
      }
      if (this.settings.type == "zoomer" && (b < 23 || b > 28)) {
        return this.error("Error: you can use only zoom effects for this type of slider");
      }
    }
    /** @type {string} */
    this.currentBackground = "url(" + this.settings.content.images[0] + ")";
  };
  /**
   * @return {undefined}
   */
  this.constructAreaMain = function() {
    if (this.settings.type == "zoomer") {
      this.areaMain = jQuery("<div>").css({
        overflow : "hidden",
        width : this.settings.structure.container.width,
        height : this.settings.structure.container.height
      }).append(jQuery("<img>").attr("src", this.settings.content.images[this.currentImage]).css({
        width : this.settings.structure.container.width,
        height : this.settings.structure.container.height,
        display : "block",
        margin : 0
      }));
    } else {
      this.areaMain = jQuery("<div>").css({
        overflow : "hidden",
        width : this.settings.structure.container.width,
        height : this.settings.structure.container.height,
        background : "url(" + this.settings.content.images[this.currentImage] + ")  no-repeat"
      });
    }
    this.areaEffects = jQuery("<div>").css({
      width : this.settings.structure.container.width,
      height : this.settings.structure.container.height,
      position : "absolute",
      left : 0,
      top : 0,
      overflow : "hidden",
      "z-index" : this.settings.structure.container.zIndexScreen ? this.settings.structure.container.zIndexScreen : 90
    });
    this.areaEffectsTemplate = this.areaEffects.clone();
    this.areaWidgets = jQuery("<div>").css({
      width : this.settings.structure.container.width,
      height : this.settings.structure.container.height,
      position : "absolute",
      left : 0,
      top : 0,
      "z-index" : this.settings.structure.container.zIndexWidgets ? this.settings.structure.container.zIndexWidgets : 100,
      background : "url(about:blank)"
    }).hover(function() {
      if (self.playerFadeNow) {
        return;
      }
      jQuery(this).find("div[show='mouseover']").fadeIn(400);
    }, function() {
      /** @type {boolean} */
      self.playerFadeNow = true;
      jQuery(this).find("div[show='mouseover']").fadeOut(400, function() {
        /** @type {boolean} */
        self.playerFadeNow = false;
      });
    }).click(function(oEvent) {
      if ((jQuery(oEvent.target)[0] === self.areaWidgets[0] || jQuery(oEvent.target)[0] === self.areaWidgets.children()[0]) && (self.settings.events && self.settings.events.imageClick)) {
        self.settings.events.imageClick(self);
      }
    });
    this.container.attr({
      engine : "BeaverSlider",
      reference : "http://beaverslider.com"
    }).css({
      position : "relative"
    }).append(this.areaMain, this.areaWidgets, this.areaEffects);
  };
  /**
   * @return {undefined}
   */
  this.constructAreaStatus = function() {
    if (this.settings.structure.controls) {
      this.areaStatus = jQuery("<div>").append(jQuery("<div>").addClass(this.settings.structure.controls.containerClass));
      /** @type {number} */
      i = 0;
      for (;i < this.settings.content.images.length;i++) {
        var itemHtml = this.settings.structure.controls.previewMode ? jQuery("<img>").attr("src", this.settings.content.images[i]) : null;
        this.areaStatus.children("div").append(jQuery("<div>").addClass(this.settings.structure.controls.elementClass).attr("inarray", i).click(function() {
          self.renderImage(jQuery(this).attr("inarray"));
        }).append(itemHtml));
      }
      this.container.append(this.areaStatus);
      this.updateStatus();
    }
  };
  /**
   * @return {undefined}
   */
  this.constructMessage = function() {
    if (this.settings.structure.messages) {
      /** @type {number} */
      var key = this.settings.animation.showMessages == "random" ? Math.floor(Math.random() * this.settings.content.messages.length) : 0;
      this.areaMessage = jQuery("<div>").css({
        width : this.settings.structure.container.width,
        height : this.settings.structure.container.height,
        overflow : "hidden",
        position : "relative"
      }).append(jQuery("<div>").css({
        position : "absolute",
        left : this.settings.structure.messages.left ? this.settings.structure.messages.left : "auto",
        top : this.settings.structure.messages.top ? this.settings.structure.messages.top : "auto",
        bottom : this.settings.structure.messages.bottom ? this.settings.structure.messages.bottom : "auto",
        right : this.settings.structure.messages.right ? this.settings.structure.messages.right : "auto"
      }).addClass(this.settings.structure.messages.containerClass).html(this.settings.content.messages[key]).click(function() {
        if (self.settings.events && self.settings.events.messageClick) {
          self.settings.events.messageClick(self);
        }
      })).appendTo(this.areaWidgets);
    }
  };
  /**
   * @return {undefined}
   */
  this.constructPlayer = function() {
    if (this.settings.structure.player) {
      var container = jQuery("<div>").css({
        position : "absolute",
        left : this.settings.structure.player.left ? this.settings.structure.player.left : "auto",
        right : this.settings.structure.player.right ? this.settings.structure.player.right : "auto",
        top : this.settings.structure.player.top ? this.settings.structure.player.top : "auto",
        bottom : this.settings.structure.player.bottom ? this.settings.structure.player.bottom : "auto"
      }).attr("show", this.settings.structure.player.show).addClass(this.settings.structure.player.containerClass);
      if (this.settings.structure.player.show == "mouseover") {
        container.hide();
      }
      jQuery("<div>").html(this.settings.structure.player.backText).appendTo(container).addClass(this.settings.structure.player.backClass).click(function() {
        self.playerPrev();
      });
      jQuery("<div>").html(this.settings.structure.player.pauseText).appendTo(container).addClass(this.settings.structure.player.pauseClass).click(function(dataAndEvents) {
        self.playerStop();
      });
      jQuery("<div>").html(this.settings.structure.player.playText).appendTo(container).addClass(this.settings.structure.player.playClass).hide().click(function(dataAndEvents) {
        self.playerPlay();
      });
      jQuery("<div>").html(this.settings.structure.player.forwardText).appendTo(container).addClass(this.settings.structure.player.forwardClass).click(function(dataAndEvents) {
        self.playerNext();
      });
      this.areaWidgets.append(container);
      this.areaPlayer = container;
    }
  };
  /**
   * @param {?} dataAndEvents
   * @return {undefined}
   */
  this.playerPlay = function(dataAndEvents) {
    if (this.animationNow) {
      return;
    }
    if (dataAndEvents && (this.settings.events && this.settings.events.start)) {
      this.settings.events.start(this);
    }
    this.startSliding(false);
  };
  /**
   * @param {?} dataAndEvents
   * @return {undefined}
   */
  this.playerStop = function(dataAndEvents) {
    if (dataAndEvents && (this.settings.events && this.settings.events.stop)) {
      this.settings.events.stop(this);
    }
    this.stopSliding(false);
  };
  /**
   * @param {?} recurring
   * @param {boolean} deepDataAndEvents
   * @return {undefined}
   */
  this.playerNext = function(recurring, deepDataAndEvents) {
    if (this.animationNow) {
      return;
    }
    if (recurring && (this.settings.events && this.settings.events.next)) {
      this.settings.events.next(this);
    }
    this.stopSliding(++this.currentImage == this.settings.content.images.length ? 0 : this.currentImage, deepDataAndEvents);
  };
  /**
   * @param {?} dataAndEvents
   * @return {undefined}
   */
  this.playerPrev = function(dataAndEvents) {
    if (this.animationNow) {
      return;
    }
    if (dataAndEvents && (this.settings.events && this.settings.events.prev)) {
      this.settings.events.prev(this);
    }
    if (this.settings.type == "carousel") {
      this.setNextEffect(this.userEffects[1]);
    }
    this.stopSliding(--this.currentImage < 0 ? this.settings.content.images.length - 1 : this.currentImage);
  };
  /**
   * @param {?} m1
   * @return {undefined}
   */
  this.renderImage = function(m1) {
    this.stopSliding(parseInt(m1));
  };
  /**
   * @return {undefined}
   */
  this.destroy = function() {
    this.playerStop();
    this.container.html("");
  };
  /**
   * @param {string} dataAndEvents
   * @return {undefined}
   */
  this.setNextEffect = function(dataAndEvents) {
    /** @type {string} */
    this.nextEffect = dataAndEvents;
  };
  /**
   * @param {boolean} recurring
   * @return {undefined}
   */
  this.startSliding = function(recurring) {
    /** @type {boolean} */
    this.stopped = false;
    /** @type {boolean} */
    this.ignoreByBeaverHouse = false;
    if (this.areaPlayer && this.areaPlayer.size()) {
      this.areaPlayer.children("div:eq(1)").show();
      this.areaPlayer.children("div:eq(2)").hide();
    }
    if (this.insideOfBeaverHouse) {
      this.playerNext(false, true);
    } else {
      if (recurring) {
        setTimeout(function() {
          if (self.settings.animation.waitAllImages) {
            if (self.imagesLoaded == self.settings.content.images.length) {
              self.animateAutomatically(true);
            } else {
              self.startSliding(true);
            }
          } else {
            self.animateAutomatically(true);
          }
        }, this.settings.animation.initialInterval ? this.settings.animation.initialInterval : this.settings.animation.interval);
      } else {
        this.animateAutomatically();
      }
    }
  };
  /**
   * @param {number} index
   * @param {boolean} deepDataAndEvents
   * @return {undefined}
   */
  this.stopSliding = function(index, deepDataAndEvents) {
    /** @type {boolean} */
    this.stopped = true;
    if (!deepDataAndEvents) {
      /** @type {boolean} */
      this.ignoreByBeaverHouse = true;
    }
    if (this.areaPlayer) {
      this.areaPlayer.children("div:eq(1)").hide();
      this.areaPlayer.children("div:eq(2)").show();
    }
    if (this.animationNow) {
      return;
    }
    if (index || index === 0) {
      /** @type {number} */
      this.currentImage = index;
      this.updateStatus();
      this.animateCurrent(function() {
      });
    }
  };
  /**
   * @param {number} dataAndEvents
   * @param {number} deepDataAndEvents
   * @return {undefined}
   */
  this.drawCells = function(dataAndEvents, deepDataAndEvents) {
    /** @type {Array} */
    this.cells = new Array;
    /** @type {number} */
    var t = Math.floor(this.settings.structure.container.width / dataAndEvents);
    /** @type {number} */
    var arg = Math.floor(this.settings.structure.container.height / deepDataAndEvents);
    /** @type {number} */
    var jlen = this.settings.structure.container.width % dataAndEvents;
    /** @type {number} */
    var l = this.settings.structure.container.height % deepDataAndEvents;
    /** @type {number} */
    var a = 0;
    /** @type {number} */
    var c = 0;
    /** @type {number} */
    i = 0;
    for (;i < deepDataAndEvents;i++) {
      /** @type {number} */
      j = 0;
      for (;j < dataAndEvents;j++) {
        /** @type {number} */
        var b = t + (jlen > j ? 1 : 0);
        /** @type {number} */
        var s = arg + (l > i ? 1 : 0);
        /** @type {string} */
        var tabPageHeight = a + "px " + c + "px";
        this.areaEffects.append(jQuery("<div>").css({
          width : b + "px",
          height : s + "px",
          "float" : "left",
          margin : 0,
          overflow : "hidden",
          visibility : "hidden",
          position : "relative"
        }).attr({
          chessboardx : j,
          chessboardy : i
        }).append(jQuery("<div>").css({
          width : b + "px",
          height : s + "px",
          overflow : "hidden",
          visibility : "hidden",
          position : "absolute",
          background : "url(" + this.settings.content.images[this.currentImage] + ") " + tabPageHeight + " no-repeat"
        })));
        /** @type {number} */
        a = j == dataAndEvents - 1 ? 0 : a - b;
      }
      c -= s;
    }
  };
  /**
   * @return {undefined}
   */
  this.clearAreaEffects = function() {
    /** @type {string} */
    this.currentBackground = "url(" + this.settings.content.images[this.currentImage] + ")";
    this.areaMain.css("background-image", "url(" + this.settings.content.images[this.currentImage] + ")");
    var selfObj = this.areaEffects;
    this.areaEffects = this.areaEffectsTemplate.clone().appendTo(this.container);
    setTimeout(function() {
      selfObj.remove();
    }, 50);
  };
  /**
   * @param {boolean} mayParseLabeledStatementInstead
   * @param {Object} listener
   * @return {undefined}
   */
  this.fadeCells = function(mayParseLabeledStatementInstead, listener) {
    var k = mayParseLabeledStatementInstead ? mayParseLabeledStatementInstead : 0;
    /** @type {number} */
    var len = this.currentEffect.steps * 1;
    setTimeout(function() {
      if (k >= self.cells.length) {
        if (k == self.cells.length + len) {
          listener();
          self.clearAreaEffects();
          return;
        }
      } else {
        self.cells[k].css("visibility", "visible").children().css("visibility", "visible").css("opacity", 1 / len);
      }
      k++;
      /** @type {number} */
      i = 1;
      for (;i < len;i++) {
        if (self.cells[k - i]) {
          self.cells[k - i].children().css("opacity", (i + 1) / len);
        }
      }
      self.fadeCells(k, listener);
    }, this.currentEffect.duration / (this.currentEffect.size * 1 + len - 1));
  };
  /**
   * @param {boolean} recurring
   * @param {boolean} opt_isDefault
   * @param {boolean} millis
   * @param {boolean} opt_gotoEnd
   * @param {boolean} mayParseLabeledStatementInstead
   * @param {Object} done
   * @return {undefined}
   */
  this.slideCells = function(recurring, opt_isDefault, millis, opt_gotoEnd, mayParseLabeledStatementInstead, done) {
    var index = mayParseLabeledStatementInstead ? mayParseLabeledStatementInstead : 0;
    /** @type {number} */
    var len = this.currentEffect.steps * 1;
    setTimeout(function() {
      if (index >= self.cells.length) {
        if (index == self.cells.length + len) {
          done();
          self.clearAreaEffects();
          return;
        }
      } else {
        self.cells[index].children().each(function() {
          jQuery(this).css("visibility", "visible").css("opacity", 1 / len);
          if (recurring) {
            jQuery(this).css("top", jQuery(this).innerHeight() + "px");
          }
          if (opt_isDefault) {
            jQuery(this).css("top", -jQuery(this).innerHeight() + "px");
          }
          if (millis) {
            jQuery(this).css("left", jQuery(this).innerHeight() + "px");
          }
          if (opt_gotoEnd) {
            jQuery(this).css("left", jQuery(this).innerHeight() + "px");
          }
        });
      }
      index++;
      /** @type {number} */
      i = 1;
      for (;i <= len;i++) {
        if (self.cells[index - i]) {
          self.cells[index - i].children().each(function() {
            var loadingFrame = jQuery(this).innerHeight();
            var direction = jQuery(this).innerWidth();
            if (recurring) {
              jQuery(this).css("top", loadingFrame * (1 - i / len) + "px");
            }
            if (opt_isDefault) {
              jQuery(this).css("top", -loadingFrame * (1 - i / len) + "px");
            }
            if (millis) {
              jQuery(this).css("left", direction * (1 - i / len) + "px");
            }
            if (opt_gotoEnd) {
              jQuery(this).css("left", -direction * (1 - i / len) + "px");
            }
            jQuery(this).css("opacity", (i + 1) / len);
          });
        }
      }
      self.slideCells(recurring, opt_isDefault, millis, opt_gotoEnd, index, done);
    }, this.currentEffect.duration / (this.currentEffect.size * 1 + len - 1));
  };
  /**
   * @return {undefined}
   */
  this.updateStatus = function() {
    if (!this.areaStatus) {
      return;
    }
    setTimeout(function() {
      self.areaStatus.children("div").children("div").removeClass(self.settings.structure.controls.elementActiveClass).addClass(self.settings.structure.controls.elementClass).eq(self.currentImage).removeClass(self.settings.structure.controls.elementClass).addClass(self.settings.structure.controls.elementActiveClass);
    }, 1);
  };
  /**
   * @return {undefined}
   */
  this.nextImage = function() {
    this.currentImage = this.currentImage == this.settings.content.images.length - 1 ? 0 : this.currentImage + 1;
    this.updateStatus();
  };
  /**
   * @param {number} recurring
   * @param {number} mayParseLabeledStatementInstead
   * @param {Object} afterAmount
   * @return {undefined}
   */
  this.startzoom = function(recurring, mayParseLabeledStatementInstead, afterAmount) {
    this.areaMain.find("img:first").attr("src", self.settings.content.images[self.currentImage]).css({
      width : self.settings.structure.container.width + "px",
      height : self.settings.structure.container.height + "px",
      margin : 0
    }).animate({
      width : Math.round((1 + this.currentEffect.size / 100) * this.settings.structure.container.width) + "px",
      height : Math.round((1 + this.currentEffect.size / 100) * this.settings.structure.container.height) + "px",
      marginLeft : Math.round(-1 * recurring * this.settings.structure.container.width) + "px",
      marginTop : Math.round(-1 * mayParseLabeledStatementInstead * this.settings.structure.container.height) + "px"
    }, parseInt(this.currentEffect.duration), function() {
      afterAmount();
    });
  };
  /**
   * @param {Object} afterAmount
   * @return {undefined}
   */
  this.zoomLeftTop = function(afterAmount) {
    this.startzoom(0, 0, afterAmount);
  };
  /**
   * @param {Object} afterAmount
   * @return {undefined}
   */
  this.zoomRightTop = function(afterAmount) {
    this.startzoom(this.currentEffect.size / 100, 0, afterAmount);
  };
  /**
   * @param {Object} afterAmount
   * @return {undefined}
   */
  this.zoomLeftBottom = function(afterAmount) {
    this.startzoom(0, this.currentEffect.size / 100, afterAmount);
  };
  /**
   * @param {Object} afterAmount
   * @return {undefined}
   */
  this.zoomRightBottom = function(afterAmount) {
    this.startzoom(this.currentEffect.size / 100, this.currentEffect.size / 100, afterAmount);
  };
  /**
   * @param {Object} afterAmount
   * @return {undefined}
   */
  this.zoomCenter = function(afterAmount) {
    this.startzoom(this.currentEffect.size / 100 / 2, this.currentEffect.size / 100 / 2, afterAmount);
  };
  /**
   * @param {Object} afterAmount
   * @return {undefined}
   */
  this.zoomRandom = function(afterAmount) {
    this.startzoom(Math.random() * this.currentEffect.size / 100, Math.random() * this.currentEffect.size / 100, afterAmount);
  };
  /**
   * @param {Object} lab
   * @return {undefined}
   */
  this.slideLeft = function(lab) {
    this.drawCells(1, 1);
    this.areaEffects.find("div").css("visibility", "visible");
    var target = this.areaEffects.children().css("width", this.settings.structure.container.width * 2 + "px");
    var l = target.children().css("left", this.settings.structure.container.width + "px");
    jQuery("<div>").css({
      background : this.currentBackground,
      position : "absolute",
      width : this.settings.structure.container.width + "px",
      height : this.settings.structure.container.height + "px"
    }).appendTo(target);
    target.animate({
      marginLeft : "-" + this.settings.structure.container.width + "px"
    }, parseInt(this.currentEffect.duration), function() {
      self.areaMain.css("visibility", "visible");
      self.clearAreaEffects();
      lab();
    });
    setTimeout(function() {
      self.areaMain.css("visibility", "hidden");
    }, 0);
  };
  /**
   * @param {Object} lab
   * @return {undefined}
   */
  this.slideRight = function(lab) {
    this.drawCells(1, 1);
    this.areaEffects.find("div").css("visibility", "visible");
    var self = this.areaEffects.children().css({
      width : this.settings.structure.container.width * 2 + "px",
      "margin-left" : "-" + this.settings.structure.container.width + "px"
    });
    jQuery("<div>").css({
      background : this.currentBackground,
      position : "absolute",
      width : this.settings.structure.container.width + "px",
      height : this.settings.structure.container.height + "px",
      left : this.settings.structure.container.width + "px"
    }).appendTo(self);
    self.animate({
      marginLeft : 0
    }, parseInt(this.currentEffect.duration), function() {
      self.areaMain.css("visibility", "visible");
      self.clearAreaEffects();
      lab();
    });
    setTimeout(function() {
      self.areaMain.css("visibility", "hidden");
    }, 0);
  };
  /**
   * @param {Object} callback
   * @return {undefined}
   */
  this.slideUp = function(callback) {
    this.drawCells(1, 1);
    this.areaEffects.find("div").css("visibility", "visible");
    var target = this.areaEffects.children().css("height", this.settings.structure.container.height * 2 + "px");
    var top = target.children().css("top", this.settings.structure.container.height + "px");
    jQuery("<div>").css({
      background : this.currentBackground,
      position : "absolute",
      width : this.settings.structure.container.width + "px",
      height : this.settings.structure.container.height + "px"
    }).appendTo(target);
    target.animate({
      marginTop : "-" + this.settings.structure.container.height + "px"
    }, parseInt(this.currentEffect.duration), function() {
      self.areaMain.css("visibility", "visible");
      self.clearAreaEffects();
      callback();
    });
    setTimeout(function() {
      self.areaMain.css("visibility", "hidden");
    }, 0);
  };
  /**
   * @param {Object} callback
   * @return {undefined}
   */
  this.slideDown = function(callback) {
    this.drawCells(1, 1);
    this.areaEffects.find("div").css("visibility", "visible");
    var target = this.areaEffects.children().css({
      height : this.settings.structure.container.height * 2 + "px",
      "margin-top" : "-" + this.settings.structure.container.height + "px"
    });
    jQuery("<div>").css({
      background : this.currentBackground,
      position : "absolute",
      width : this.settings.structure.container.width + "px",
      height : this.settings.structure.container.height + "px",
      top : this.settings.structure.container.height + "px"
    }).appendTo(target);
    target.animate({
      marginTop : 0
    }, parseInt(this.currentEffect.duration), function() {
      self.areaMain.css("visibility", "visible");
      self.clearAreaEffects();
      callback();
    });
    this.areaMain.css("visibility", "hidden");
  };
  /**
   * @param {Object} lab
   * @return {undefined}
   */
  this.slideOverLeft = function(lab) {
    this.drawCells(1, 1);
    this.areaEffects.find("div").css("visibility", "visible");
    var closest = this.areaEffects.children();
    var node = closest.children().css({
      left : this.settings.structure.container.width + "px",
      opacity : 0
    });
    node.animate({
      left : 0,
      opacity : 1
    }, parseInt(this.currentEffect.duration), function() {
      self.clearAreaEffects();
      lab();
    });
  };
  /**
   * @param {Object} lab
   * @return {undefined}
   */
  this.slideOverRight = function(lab) {
    this.drawCells(1, 1);
    this.areaEffects.find("div").css("visibility", "visible");
    var closest = this.areaEffects.children();
    var node = closest.children().css({
      left : -this.settings.structure.container.width + "px",
      opacity : 0
    });
    node.animate({
      left : 0,
      opacity : 1
    }, parseInt(this.currentEffect.duration), function() {
      self.clearAreaEffects();
      lab();
    });
  };
  /**
   * @param {Object} lab
   * @return {undefined}
   */
  this.slideOverUp = function(lab) {
    this.drawCells(1, 1);
    this.areaEffects.find("div").css("visibility", "visible");
    var closest = this.areaEffects.children();
    var modal = closest.children().css({
      top : this.settings.structure.container.width + "px",
      opacity : 0
    });
    modal.animate({
      top : 0,
      opacity : 1
    }, parseInt(this.currentEffect.duration), function() {
      self.clearAreaEffects();
      lab();
    });
  };
  /**
   * @param {Object} lab
   * @return {undefined}
   */
  this.slideOverDown = function(lab) {
    this.drawCells(1, 1);
    this.areaEffects.find("div").css("visibility", "visible");
    var closest = this.areaEffects.children();
    var modal = closest.children().css({
      top : -this.settings.structure.container.width + "px",
      opacity : 0
    });
    modal.animate({
      top : 0,
      opacity : 1
    }, parseInt(this.currentEffect.duration), function() {
      self.clearAreaEffects();
      lab();
    });
  };
  /**
   * @param {Object} callback
   * @return {undefined}
   */
  this.fadeOut = function(callback) {
    this.drawCells(1, 1);
    this.areaEffects.find("div").css("visibility", "visible");
    this.areaEffects.children("div").fadeOut(0).fadeIn(parseInt(this.currentEffect.duration), function() {
      self.clearAreaEffects();
      callback();
    });
  };
  /**
   * @param {Object} completed
   * @return {undefined}
   */
  this.chessBoardRightDown = function(completed) {
    this.drawCells(this.currentEffect.size, this.currentEffect.size);
    var contextElem = this.areaEffects.children();
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size * 2 - 1;i++) {
      /** @type {number} */
      j = 0;
      for (;j < this.currentEffect.size;j++) {
        /** @type {number} */
        k = 0;
        for (;k < this.currentEffect.size;k++) {
          if (j + k == i) {
            var r = contextElem.filter("div[chessboardx='" + j + "'][chessboardy='" + k + "']");
            this.cells[i] = this.cells[i] ? this.cells[i].add(r) : r;
          }
        }
      }
    }
    this.fadeCells(false, completed);
  };
  /**
   * @param {Object} completed
   * @return {undefined}
   */
  this.chessBoardLeftDown = function(completed) {
    this.drawCells(this.currentEffect.size, this.currentEffect.size);
    var contextElem = this.areaEffects.children();
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size * 2 - 1;i++) {
      /** @type {number} */
      j = 0;
      for (;j < this.currentEffect.size;j++) {
        /** @type {number} */
        k = 0;
        for (;k < this.currentEffect.size;k++) {
          if (this.currentEffect.size - j - 1 + k == i) {
            var r = contextElem.filter("div[chessboardx='" + j + "'][chessboardy='" + k + "']");
            this.cells[i] = this.cells[i] ? this.cells[i].add(r) : r;
          }
        }
      }
    }
    this.fadeCells(false, completed);
  };
  /**
   * @param {Object} completed
   * @return {undefined}
   */
  this.chessBoardLeftUp = function(completed) {
    this.drawCells(this.currentEffect.size, this.currentEffect.size);
    var contextElem = this.areaEffects.children();
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size * 2 - 1;i++) {
      /** @type {number} */
      j = 0;
      for (;j < this.currentEffect.size;j++) {
        /** @type {number} */
        k = 0;
        for (;k < this.currentEffect.size;k++) {
          if (this.currentEffect.size * 2 - j - k - 2 == i) {
            var r = contextElem.filter("div[chessboardx='" + j + "'][chessboardy='" + k + "']");
            this.cells[i] = this.cells[i] ? this.cells[i].add(r) : r;
          }
        }
      }
    }
    this.fadeCells(false, completed);
  };
  /**
   * @param {Object} completed
   * @return {undefined}
   */
  this.chessBoardRightUp = function(completed) {
    this.drawCells(this.currentEffect.size, this.currentEffect.size);
    var contextElem = this.areaEffects.children();
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size * 2 - 1;i++) {
      /** @type {number} */
      j = 0;
      for (;j < this.currentEffect.size;j++) {
        /** @type {number} */
        k = 0;
        for (;k < this.currentEffect.size;k++) {
          if (j + (this.currentEffect.size - k - 1) == i) {
            var r = contextElem.filter("div[chessboardx='" + j + "'][chessboardy='" + k + "']");
            this.cells[i] = this.cells[i] ? this.cells[i].add(r) : r;
          }
        }
      }
    }
    this.fadeCells(false, completed);
  };
  /**
   * @param {Object} completed
   * @return {undefined}
   */
  this.chessBoardRandom = function(completed) {
    this.drawCells(this.currentEffect.size, this.currentEffect.size);
    var contextElem = this.areaEffects.children();
    /** @type {Array} */
    var row = new Array;
    /** @type {number} */
    var slidesTotal = this.currentEffect.size * this.currentEffect.size;
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size;i++) {
      /** @type {number} */
      j = 0;
      for (;j < this.currentEffect.size;j++) {
        /** @type {string} */
        row[i * this.currentEffect.size + j] = i + "," + j;
      }
    }
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size;i++) {
      /** @type {number} */
      j = 0;
      for (;j < this.currentEffect.size;j++) {
        /** @type {number} */
        var m = Math.floor(Math.random() * slidesTotal) % row.length;
        /** @type {number} */
        var type = 0;
        var msg;
        for (;m != -1;) {
          if (row[type]) {
            m--;
            /** @type {number} */
            msg = type;
          }
          /** @type {number} */
          type = type == row.length - 1 ? 0 : type + 1;
        }
        var e = row[msg].split(",");
        /** @type {boolean} */
        row[msg] = false;
        type = contextElem.filter("div[chessboardx='" + e[0] + "'][chessboardy='" + e[1] + "']");
        this.cells[i] = this.cells[i] ? this.cells[i].add(type) : type;
      }
    }
    this.fadeCells(false, completed);
  };
  /**
   * @param {Object} completed
   * @return {undefined}
   */
  this.jalousieRight = function(completed) {
    this.drawCells(this.currentEffect.size, 1);
    var contextElem = this.areaEffects.children();
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size;i++) {
      var symbol = contextElem.filter("div[chessboardx='" + i + "']");
      this.cells[i] = symbol;
    }
    this.fadeCells(false, completed);
  };
  /**
   * @param {Object} completed
   * @return {undefined}
   */
  this.jalousieDown = function(completed) {
    this.drawCells(1, this.currentEffect.size);
    var contextElem = this.areaEffects.children();
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size;i++) {
      var symbol = contextElem.filter("div[chessboardy='" + i + "']");
      this.cells[i] = symbol;
    }
    this.fadeCells(false, completed);
  };
  /**
   * @param {Object} completed
   * @return {undefined}
   */
  this.jalousieLeft = function(completed) {
    this.drawCells(this.currentEffect.size, 1);
    var contextElem = this.areaEffects.children();
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size;i++) {
      var symbol = contextElem.filter("div[chessboardx='" + (this.currentEffect.size - i - 1) + "']");
      this.cells[i] = symbol;
    }
    this.fadeCells(false, completed);
  };
  /**
   * @param {Object} completed
   * @return {undefined}
   */
  this.jalousieUp = function(completed) {
    this.drawCells(1, this.currentEffect.size);
    var contextElem = this.areaEffects.children();
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size;i++) {
      var symbol = contextElem.filter("div[chessboardy='" + (this.currentEffect.size - i - 1) + "']");
      this.cells[i] = symbol;
    }
    this.fadeCells(false, completed);
  };
  /**
   * @param {Object} completed
   * @return {undefined}
   */
  this.jalousieRandomHorizontal = function(completed) {
    this.drawCells(this.currentEffect.size, 1);
    var contextElem = this.areaEffects.children();
    /** @type {Array} */
    var lines = new Array;
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size;i++) {
      /** @type {string} */
      lines[i] = i + ",1";
    }
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size;i++) {
      /** @type {number} */
      var h = Math.floor(Math.random() * this.currentEffect.size) % lines.length;
      /** @type {number} */
      var r = 0;
      var j;
      for (;h != -1;) {
        if (lines[r]) {
          h--;
          /** @type {number} */
          j = r;
        }
        /** @type {number} */
        r = r == lines.length - 1 ? 0 : r + 1;
      }
      r = contextElem.filter("div[chessboardx='" + lines[j].split(",")[0] + "']");
      /** @type {boolean} */
      lines[j] = false;
      this.cells[i] = this.cells[i] ? this.cells[i].add(r) : r;
    }
    this.fadeCells(false, completed);
  };
  /**
   * @param {Object} completed
   * @return {undefined}
   */
  this.jalousieRandomVertical = function(completed) {
    this.drawCells(1, this.currentEffect.size);
    var contextElem = this.areaEffects.children();
    /** @type {Array} */
    var lines = new Array;
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size;i++) {
      /** @type {string} */
      lines[i] = i + ",1";
    }
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size;i++) {
      /** @type {number} */
      var h = Math.floor(Math.random() * this.currentEffect.size) % lines.length;
      /** @type {number} */
      var r = 0;
      var j;
      for (;h != -1;) {
        if (lines[r]) {
          h--;
          /** @type {number} */
          j = r;
        }
        /** @type {number} */
        r = r == lines.length - 1 ? 0 : r + 1;
      }
      r = contextElem.filter("div[chessboardy='" + lines[j].split(",")[0] + "']");
      /** @type {boolean} */
      lines[j] = false;
      this.cells[i] = this.cells[i] ? this.cells[i].add(r) : r;
    }
    this.fadeCells(false, completed);
  };
  /**
   * @param {Object} completed
   * @return {undefined}
   */
  this.pancakeIn = function(completed) {
    this.drawCells(this.currentEffect.size, this.currentEffect.size);
    var contextElem = this.areaEffects.children();
    /** @type {number} */
    border = 0;
    for (;border < Math.ceil(this.currentEffect.size / 2);border++) {
      /** @type {number} */
      var len = this.currentEffect.size - 1 - border;
      /** @type {number} */
      i = 0;
      for (;i < this.currentEffect.size;i++) {
        /** @type {number} */
        j = 0;
        for (;j < this.currentEffect.size;j++) {
          if (i >= border && (j >= border && (i <= len && (j <= len && (i == border || (i == len || (j == border || j == len))))))) {
            var dest = contextElem.filter("div[chessboardx='" + i + "'][chessboardy='" + j + "']");
            this.cells[border] = this.cells[border] ? this.cells[border].add(dest) : dest;
          }
        }
      }
    }
    this.fadeCells(false, completed);
  };
  /**
   * @param {Object} completed
   * @return {undefined}
   */
  this.pancakeOut = function(completed) {
    this.drawCells(this.currentEffect.size, this.currentEffect.size);
    var contextElem = this.areaEffects.children();
    /** @type {number} */
    border = Math.ceil(this.currentEffect.size / 2) - 1;
    for (;border >= 0;border--) {
      /** @type {number} */
      var start = Math.ceil(this.currentEffect.size / 2) - 1 - border;
      /** @type {number} */
      var len = this.currentEffect.size - 1 - start;
      /** @type {number} */
      i = 0;
      for (;i < this.currentEffect.size;i++) {
        /** @type {number} */
        j = 0;
        for (;j < this.currentEffect.size;j++) {
          if (i >= start && (j >= start && (i <= len && (j <= len && (i == start || (i == len || (j == start || j == len))))))) {
            var dest = contextElem.filter("div[chessboardx='" + i + "'][chessboardy='" + j + "']");
            this.cells[border] = this.cells[border] ? this.cells[border].add(dest) : dest;
          }
        }
      }
    }
    this.fadeCells(false, completed);
  };
  /**
   * @param {Object} completed
   * @return {undefined}
   */
  this.pancakeRandom = function(completed) {
    this.drawCells(this.currentEffect.size, this.currentEffect.size);
    var contextElem = this.areaEffects.children();
    /** @type {Array} */
    var matches = new Array;
    /** @type {number} */
    i = 0;
    for (;i < Math.ceil(this.currentEffect.size / 2);i++) {
      /** @type {string} */
      matches[i] = i + ",1";
    }
    /** @type {number} */
    border = Math.ceil(this.currentEffect.size / 2) - 1;
    for (;border >= 0;border--) {
      /** @type {number} */
      var m = Math.floor(Math.random() * Math.ceil(this.currentEffect.size / 2)) % matches.length;
      /** @type {number} */
      var sel = 0;
      var p;
      for (;m != -1;) {
        if (matches[sel]) {
          m--;
          /** @type {number} */
          p = sel;
        }
        /** @type {number} */
        sel = sel == matches.length - 1 ? 0 : sel + 1;
      }
      var start = matches[p].split(",")[0];
      /** @type {number} */
      var len = this.currentEffect.size - 1 - start;
      /** @type {number} */
      i = 0;
      for (;i < this.currentEffect.size;i++) {
        /** @type {number} */
        j = 0;
        for (;j < this.currentEffect.size;j++) {
          if (i >= start && (j >= start && (i <= len && (j <= len && (i == start || (i == len || (j == start || j == len))))))) {
            sel = contextElem.filter("div[chessboardx='" + i + "'][chessboardy='" + j + "']");
            this.cells[border] = this.cells[border] ? this.cells[border].add(sel) : sel;
          }
        }
      }
      /** @type {boolean} */
      matches[p] = false;
    }
    this.fadeCells(false, completed);
  };
  /**
   * @param {Object} completed
   * @return {undefined}
   */
  this.spiralIn = function(completed) {
    this.drawCells(this.currentEffect.size, this.currentEffect.size);
    var contextElem = this.areaEffects.children();
    /** @type {number} */
    var k = -1;
    /** @type {number} */
    border = 0;
    for (;border < Math.ceil(this.currentEffect.size / 2);border++) {
      /** @type {number} */
      var end = this.currentEffect.size - border - 1;
      /** @type {number} */
      i = border;
      for (;i <= end;i++) {
        k++;
        var param = contextElem.filter("div[chessboardx='" + i + "'][chessboardy='" + border + "']");
        this.cells[k] = this.cells[k] ? this.cells[k].add(param) : param;
      }
      /** @type {number} */
      i = border + 1;
      for (;i <= end;i++) {
        k++;
        param = contextElem.filter("div[chessboardx='" + end + "'][chessboardy='" + i + "']");
        this.cells[k] = this.cells[k] ? this.cells[k].add(param) : param;
      }
      /** @type {number} */
      i = end - 1;
      for (;i >= border;i--) {
        k++;
        param = contextElem.filter("div[chessboardx='" + i + "'][chessboardy='" + end + "']");
        this.cells[k] = this.cells[k] ? this.cells[k].add(param) : param;
      }
      /** @type {number} */
      i = end - 1;
      for (;i >= border + 1;i--) {
        k++;
        param = contextElem.filter("div[chessboardx='" + border + "'][chessboardy='" + i + "']");
        this.cells[k] = this.cells[k] ? this.cells[k].add(param) : param;
      }
    }
    this.fadeCells(false, completed);
  };
  /**
   * @param {Object} completed
   * @return {undefined}
   */
  this.spiralOut = function(completed) {
    this.drawCells(this.currentEffect.size, this.currentEffect.size);
    var contextElem = this.areaEffects.children();
    /** @type {number} */
    var k = -1;
    /** @type {number} */
    border = Math.ceil(this.currentEffect.size / 2) - 1;
    for (;border >= 0;border--) {
      /** @type {number} */
      var end = this.currentEffect.size - border - 1;
      /** @type {number} */
      i = border + 1;
      for (;i <= end;i++) {
        k++;
        var param = contextElem.filter("div[chessboardx='" + end + "'][chessboardy='" + i + "']");
        this.cells[k] = this.cells[k] ? this.cells[k].add(param) : param;
      }
      /** @type {number} */
      i = end - 1;
      for (;i >= border;i--) {
        k++;
        param = contextElem.filter("div[chessboardx='" + i + "'][chessboardy='" + end + "']");
        this.cells[k] = this.cells[k] ? this.cells[k].add(param) : param;
      }
      /** @type {number} */
      i = end - 1;
      for (;i >= border + 1;i--) {
        k++;
        param = contextElem.filter("div[chessboardx='" + border + "'][chessboardy='" + i + "']");
        this.cells[k] = this.cells[k] ? this.cells[k].add(param) : param;
      }
      /** @type {number} */
      i = border;
      for (;i <= end;i++) {
        k++;
        param = contextElem.filter("div[chessboardx='" + i + "'][chessboardy='" + border + "']");
        this.cells[k] = this.cells[k] ? this.cells[k].add(param) : param;
      }
    }
    this.fadeCells(false, completed);
  };
  /**
   * @param {Object} lab
   * @return {undefined}
   */
  this.prisonVertical = function(lab) {
    this.drawCells(this.currentEffect.size, 1);
    var contextElem = this.areaEffects.children();
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size;i++) {
      var el = contextElem.filter("div[chessboardx='" + i + "']");
      var g;
      /** @type {boolean} */
      var f = true;
      el.css({
        overflow : "hidden",
        visibility : "visible",
        opacity : 1
      }).children().css({
        top : (i % 2 == 0 ? "-" : "") + this.settings.structure.container.width + "px",
        visibility : "visible",
        opacity : 1
      }).animate({
        top : 0
      }, parseInt(this.currentEffect.duration), function() {
        if (f) {
          /** @type {boolean} */
          f = false;
          self.clearAreaEffects();
          lab();
        }
      });
    }
  };
  /**
   * @param {Object} lab
   * @return {undefined}
   */
  this.prisonHorizontal = function(lab) {
    this.drawCells(1, this.currentEffect.size);
    var contextElem = this.areaEffects.children();
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size;i++) {
      var el = contextElem.filter("div[chessboardy='" + i + "']");
      var g;
      /** @type {boolean} */
      var f = true;
      el.css({
        overflow : "hidden",
        visibility : "visible",
        opacity : 1
      }).children().css({
        left : (i % 2 == 0 ? "-" : "") + this.settings.structure.container.width + "px",
        visibility : "visible",
        opacity : 1
      }).animate({
        left : 0
      }, parseInt(this.currentEffect.duration), function() {
        if (f) {
          /** @type {boolean} */
          f = false;
          self.clearAreaEffects();
          lab();
        }
      });
    }
  };
  /**
   * @param {Object} afterAmount
   * @return {undefined}
   */
  this.nailsUp = function(afterAmount) {
    this.drawCells(1, this.currentEffect.size);
    var contextElem = this.areaEffects.children();
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size;i++) {
      var symbol = contextElem.filter("div[chessboardy='" + (this.currentEffect.size - i - 1) + "']");
      this.cells[i] = symbol;
    }
    this.slideCells(true, false, false, false, false, afterAmount);
  };
  /**
   * @param {Object} afterAmount
   * @return {undefined}
   */
  this.nailsDown = function(afterAmount) {
    this.drawCells(1, this.currentEffect.size);
    var contextElem = this.areaEffects.children();
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size;i++) {
      var symbol = contextElem.filter("div[chessboardy='" + (this.currentEffect.size - i - 1) + "']");
      this.cells[i] = symbol;
    }
    this.slideCells(false, true, false, false, false, afterAmount);
  };
  /**
   * @param {Object} afterAmount
   * @return {undefined}
   */
  this.nailsLeft = function(afterAmount) {
    this.drawCells(this.currentEffect.size, 1);
    var contextElem = this.areaEffects.children();
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size;i++) {
      var symbol = contextElem.filter("div[chessboardx='" + (this.currentEffect.size - i - 1) + "']");
      this.cells[i] = symbol;
    }
    this.slideCells(false, false, true, false, false, afterAmount);
  };
  /**
   * @param {Object} afterAmount
   * @return {undefined}
   */
  this.nailsRight = function(afterAmount) {
    this.drawCells(this.currentEffect.size, 1);
    var contextElem = this.areaEffects.children();
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size;i++) {
      var symbol = contextElem.filter("div[chessboardx='" + (this.currentEffect.size - i - 1) + "']");
      this.cells[i] = symbol;
    }
    this.slideCells(false, false, false, true, false, afterAmount);
  };
  /**
   * @param {Object} lab
   * @return {undefined}
   */
  this.weedDownRight = function(lab) {
    this.drawCells(this.currentEffect.size, 1);
    var contextElem = this.areaEffects.children();
    /**
     * @param {number} position
     * @return {undefined}
     */
    var init = function(position) {
      setTimeout(function() {
        contextElem.filter("div[chessboardx='" + position + "']").children().css({
          overflow : "hidden",
          visibility : "visible",
          opacity : 0,
          top : -self.settings.structure.container.height + "px"
        }).animate({
          top : 0,
          opacity : 1
        }, parseInt(self.currentEffect.duration), function() {
          if (position == self.currentEffect.size - 1) {
            self.clearAreaEffects();
            lab();
          }
        });
      }, position * self.currentEffect.duration / self.currentEffect.size);
    };
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size;i++) {
      init(i);
    }
  };
  /**
   * @param {Object} lab
   * @return {undefined}
   */
  this.weedDownLeft = function(lab) {
    this.drawCells(this.currentEffect.size, 1);
    var contextElem = this.areaEffects.children();
    /**
     * @param {number} size
     * @return {undefined}
     */
    var init = function(size) {
      setTimeout(function() {
        contextElem.filter("div[chessboardx='" + size + "']").children().css({
          overflow : "hidden",
          visibility : "visible",
          opacity : 0,
          top : -self.settings.structure.container.height + "px"
        }).animate({
          top : 0,
          opacity : 1
        }, parseInt(self.currentEffect.duration), function() {
          if (size == 0) {
            self.clearAreaEffects();
            lab();
          }
        });
      }, (self.currentEffect.size - size) * self.currentEffect.duration / self.currentEffect.size);
    };
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size;i++) {
      init(i);
    }
  };
  /**
   * @param {Object} lab
   * @return {undefined}
   */
  this.weedUpRight = function(lab) {
    this.drawCells(this.currentEffect.size, 1);
    var contextElem = this.areaEffects.children();
    /**
     * @param {number} position
     * @return {undefined}
     */
    var init = function(position) {
      setTimeout(function() {
        contextElem.filter("div[chessboardx='" + position + "']").children().css({
          overflow : "hidden",
          visibility : "visible",
          opacity : 0,
          top : self.settings.structure.container.height + "px"
        }).animate({
          top : 0,
          opacity : 1
        }, parseInt(self.currentEffect.duration), function() {
          if (position == self.currentEffect.size - 1) {
            self.clearAreaEffects();
            lab();
          }
        });
      }, position * self.currentEffect.duration / self.currentEffect.size);
    };
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size;i++) {
      init(i);
    }
  };
  /**
   * @param {Object} lab
   * @return {undefined}
   */
  this.weedUpLeft = function(lab) {
    this.drawCells(this.currentEffect.size, 1);
    var contextElem = this.areaEffects.children();
    /**
     * @param {number} size
     * @return {undefined}
     */
    var init = function(size) {
      setTimeout(function() {
        contextElem.filter("div[chessboardx='" + size + "']").children().css({
          overflow : "hidden",
          visibility : "visible",
          opacity : 0,
          top : self.settings.structure.container.height + "px"
        }).animate({
          top : 0,
          opacity : 1
        }, parseInt(self.currentEffect.duration), function() {
          if (size == 0) {
            self.clearAreaEffects();
            lab();
          }
        });
      }, (self.currentEffect.size - size) * self.currentEffect.duration / self.currentEffect.size);
    };
    /** @type {number} */
    i = 0;
    for (;i < this.currentEffect.size;i++) {
      init(i);
    }
  };
  /**
   * @param {boolean} dataAndEvents
   * @return {undefined}
   */
  this.animateAutomatically = function(dataAndEvents) {
    if (this.stopped) {
      return;
    }
    if (!dataAndEvents || this.settings.type != "zoomer") {
      this.nextImage();
    }
    this.animateCurrent(function() {
      setTimeout(function() {
        self.animateAutomatically();
      }, self.settings.animation.interval);
    });
  };
  /**
   * @param {?} name
   * @return {undefined}
   */
  this.showMessage = function(name) {
    var ch = this.areaMessage.children().html();
    if (!this.settings.animation.changeSameMessage && name == ch) {
      return;
    }
    if (this.settings.animation.messageAnimationDirection) {
      var node = this.areaMessage.children().html(name);
      node.css({
        left : "-999999999999999px",
        right : "auto",
        opacity : 0
      });
      if (!name) {
        return;
      }
      var b = node.outerWidth();
      var top = node.outerHeight();
      node.css({
        left : "auto",
        right : "auto",
        opacity : 0
      });
      var right = this.settings.structure.messages.right || 0;
      var left = this.settings.structure.messages.left || 0;
      var firstByIndex = this.settings.structure.messages.top || 0;
      var height = this.settings.structure.messages.bottom || 0;
      var css;
      var oldconfig;
      var c;
      var sorts = this.settings.animation.messageAnimationDirection.split(",");
      var direction = sorts[Math.floor(Math.random() * sorts.length)];
      /**
       * @param {number} a
       * @param {number} b
       * @param {number} value
       * @return {?}
       */
      var extend = function(a, b, value) {
        if (a < b) {
          if (b - a > value) {
            return b - value;
          } else {
            return a;
          }
        } else {
          if (a - b > value) {
            return b + value;
          } else {
            return a;
          }
        }
      };
      var u = this.settings.animation.messageAnimationMaxHorLength || this.settings.structure.container.width / 3;
      var udataCur = this.settings.animation.messageAnimationMaxVerLength || this.settings.structure.container.height / 3;
      switch(direction) {
        case "right":
          oldconfig = left ? left : this.settings.structure.container.width - right - b;
          /** @type {number} */
          c = -b;
          css = {
            left : oldconfig,
            opacity : 1
          };
          node.css({
            left : extend(c, oldconfig, udataCur),
            right : "auto",
            opacity : 0
          });
          break;
        case "left":
          oldconfig = left ? left : this.settings.structure.container.width - right - b;
          c = this.settings.structure.container.width + b;
          css = {
            left : oldconfig,
            opacity : 1
          };
          node.css({
            left : extend(c, oldconfig, udataCur),
            right : "auto",
            opacity : 0
          });
          break;
        case "down":
          oldconfig = firstByIndex ? firstByIndex : this.settings.structure.container.height - height - top;
          /** @type {number} */
          c = -top;
          css = {
            top : oldconfig,
            opacity : 1
          };
          node.css({
            top : extend(c, oldconfig, udataCur),
            bottom : "auto",
            left : left ? left : "auto",
            right : right ? right : "auto",
            opacity : 0
          });
          break;
        case "up":
          oldconfig = firstByIndex ? firstByIndex : this.settings.structure.container.height - height - top;
          c = this.settings.structure.container.height + top;
          css = {
            top : oldconfig,
            opacity : 1
          };
          node.css({
            top : extend(c, oldconfig, udataCur),
            bottom : "auto",
            left : left ? left : "auto",
            right : right ? right : "auto",
            opacity : 0
          });
          break;
        default:
        ;
      }
      node.animate(css, parseInt(this.settings.animation.messageAnimationDuration));
    } else {
      this.areaMessage.children().html(name);
    }
  };
  /**
   * @param {Function} $sanitize
   * @return {undefined}
   */
  this.animateCurrent = function($sanitize) {
    if (this.animationNow) {
      return;
    }
    if (self.settings.events && this.settings.events.beforeSlide) {   
      this.settings.events.beforeSlide(self);
    }
    if (this.nextEffect) {
      /** @type {number} */
      i = 0;
      for (;i < this.effects.length;i++) {
        if (this.effects[i].name == this.nextEffect.name) {
          this.currentEffect = {
            id : this.effects[i].id,
            group : this.effects[i].group,
            name : this.effects[i].name,
            duration : this.nextEffect.duration ? this.nextEffect.duration : this.effects[i].duration,
            size : this.nextEffect.size ? this.nextEffect.size : this.effects[i].size,
            steps : this.nextEffect.steps ? this.nextEffect.steps : this.effects[i].steps,
            run : this.effects[i].run
          };
          break;
        }
      }
      /** @type {null} */
      this.nextEffect = null;
    } else {
      if (this.settings.type == "carousel") {
        this.currentEffect = this.userEffects[0];
      } else {
        this.currentEffect = this.userEffects[Math.floor(Math.random() * this.userEffects.length)];
      }
    }
    this.run = this.currentEffect.run;
    /** @type {boolean} */
    this.animationNow = true;
    if (self.settings.events && this.settings.events.afterSlideStart) {
      this.settings.events.afterSlideStart(self);
    }
    this.run(function() {
      /** @type {boolean} */
      self.animationNow = false;
      if (self.settings.events && self.settings.events.beforeSlideEnd) {
        self.settings.events.beforeSlideEnd(self);
      }
      if ($sanitize) {
        $sanitize();
      }
      if (self.settings.events && self.settings.events.afterSlide) {
        self.settings.events.afterSlide(self);
      }
    });
    if (self.settings.events && this.settings.events.beforeMessageChange) {
      this.settings.events.beforeMessageChange(self);
    }
    if (this.settings.content.messages) {
      if (options.animation.showMessages == "random") {
        /** @type {number} */
        this.currentMessage = Math.floor(Math.random() * this.settings.content.messages.length);
        /** @type {number} */
        this.messagesAnimationCounter = 1;
      } else {
        if (options.animation.showMessages == "linked") {
          this.currentMessage = this.currentImage;
          /** @type {number} */
          this.messagesAnimationCounter = 1;
        } else {
          if (!this.messagesAnimationCounter || this.messagesAnimationCounter == 1) {
            this.messagesAnimationCounter = this.settings.animation.changeMessagesAfter;
            this.currentMessage = ++this.currentMessage == this.settings.content.messages.length ? 0 : this.currentMessage;
          } else {
            this.messagesAnimationCounter--;
          }
        }
      }
    }
    if (this.messagesAnimationCounter == 1) {
      this.showMessage(this.settings.content.messages[this.currentMessage]);
    }
    if (self.settings.events && this.settings.events.afterMessageChange) {
      this.settings.events.afterMessageChange(self);
    }
  };
  if (self.settings.events && this.settings.events.beforeInitialize) {
    this.settings.events.beforeInitialize(self);
  }
  this.initialize();
  if (self.settings.events && this.settings.events.afterInitialize) {
    this.settings.events.afterInitialize(self);
  }
}
/**
 * @return {undefined}
 */
function BeaverHouse() {
  var self = this;
  /** @type {null} */
  this.currentInterval = null;
  /** @type {number} */
  this.currentSliderIndex = 0;
  /** @type {Arguments} */
  this.sliders = arguments;
  /** @type {number} */
  i = 0;
  for (;i < this.sliders.length;i++) {
    /** @type {boolean} */
    this.sliders[i].insideOfBeaverHouse = true;
  }
  /**
   * @return {undefined}
   */
  this.searchNextSlider = function() {
    var ignoreByBeaverHouse = this.currentSliderIndex;
    do {
      this.currentSliderIndex++;
      if (this.currentSliderIndex == this.sliders.length) {
        /** @type {number} */
        this.currentSliderIndex = 0;
      }
      if (!this.sliders[this.currentSliderIndex].ignoreByBeaverHouse) {
        break;
      }
    } while (ignoreByBeaverHouse != this.currentSliderIndex);
    if (ignoreByBeaverHouse == this.currentSliderIndex && this.sliders[this.currentSliderIndex].ignoreByBeaverHouse) {
      /** @type {null} */
      this.currentSliderIndex = null;
    }
  };
  /**
   * @return {undefined}
   */
  this.wait = function() {
    setTimeout(function() {
      /** @type {boolean} */
      var b = false;
      /** @type {number} */
      i = 0;
      for (;i < self.sliders.length;i++) {
        if (!self.sliders[i].ignoreByBeaverHouse) {
          /** @type {number} */
          self.currentSliderIndex = i;
          /** @type {boolean} */
          b = true;
          self.animate();
          break;
        }
      }
      if (!b) {
        self.wait();
      }
    }, 50);
  };
  /**
   * @return {undefined}
   */
  this.animate = function() {
    this.sliders[this.currentSliderIndex].playerNext(false, true);
    /** @type {number} */
    this.currentInterval = setInterval(function() {
      if (!self.sliders[self.currentSliderIndex].animationNow) {
        var i = self.currentSliderIndex;
        window.clearInterval(self.currentInterval);
        /** @type {null} */
        self.currentInterval = null;
        self.searchNextSlider();
        if (self.currentSliderIndex != null) {
          setTimeout(function() {
            self.animate();
          }, parseInt(self.sliders[i].settings.animation.interval));
        } else {
          self.wait();
        }
      }
    }, 1);
  };
  /**
   * @return {undefined}
   */
  this.start = function() {
    setTimeout(function() {
      if (self.sliders[self.currentSliderIndex].settings.animation.waitAllImages) {
        if (self.sliders[self.currentSliderIndex].imagesLoaded == self.sliders[self.currentSliderIndex].settings.content.images.length) {
          self.animate();
        } else {
          self.start();
        }
      } else {
        self.animate();
      }
    }, self.sliders[self.currentSliderIndex].settings.animation.initialInterval ? self.sliders[self.currentSliderIndex].settings.animation.initialInterval : self.sliders[self.currentSliderIndex].settings.animation.interval);
  };
  this.start();
}
;
