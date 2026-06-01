//scroll.js

(function() {
  const _getWrapper = () => document.body;
  const getDesc = (obj, prop) => Object.getOwnPropertyDescriptor(obj, prop);
  
  const elScrollTop = getDesc(Element.prototype, 'scrollTop');
  const elScrollLeft = getDesc(Element.prototype, 'scrollLeft');
  const elScrollHeight = getDesc(Element.prototype, 'scrollHeight');
  const elScrollWidth = getDesc(Element.prototype, 'scrollWidth');

  const safeDefine = (obj, prop, descriptor) => {
    try {
      const desc = getDesc(obj, prop);
      if (desc && !desc.configurable) {
        return;
      }
      Object.defineProperty(obj, prop, descriptor);
    } catch (e) {
      console.warn(`Dockit failed to define ${prop}:`, e);
    }
  };

  //bing targeted patch
  if (window.location.hostname.includes('bing.com')) {
    // stop resize events from triggering bing's dynamic parameter reloads
    window.addEventListener('resize', (e) => {
      e.stopImmediatePropagation();
    }, true);
  }

  //override scrollingelement
  safeDefine(document, 'scrollingElement', {
    get: () => _getWrapper() || document.documentElement,
    configurable: true
  });

  const _getOffset = () => {
    if (document.body && document.body.classList.contains('dockit-full-width')) {
      return 0;
    }
    return 48;
  };

  const _getBingCw = () => {
    if (window.location.hostname.includes('bing.com')) {
      const match = window.location.search.match(/[?&]cw=(\d+)/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    return null;
  };

  const winInnerWidthDesc = getDesc(window, 'innerWidth') || getDesc(Window.prototype, 'innerWidth');
  const elClientWidthDesc = getDesc(Element.prototype, 'clientWidth');

  //override window innerwidth
  if (winInnerWidthDesc) {
    safeDefine(window, 'innerWidth', {
      get: () => {
        const bingCw = _getBingCw();
        if (bingCw !== null) {
          return bingCw;
        }
        const val = winInnerWidthDesc.get.call(window);
        return val - _getOffset();
      },
      configurable: true
    });
  }

  //override documentelement clientwidth
  if (elClientWidthDesc) {
    safeDefine(document.documentElement, 'clientWidth', {
      get: () => {
        const bingCw = _getBingCw();
        if (bingCw !== null) {
          return bingCw;
        }
        const val = elClientWidthDesc.get.call(document.documentElement);
        return val - _getOffset();
      },
      configurable: true
    });
  }

  //override window scroll positions
  safeDefine(window, 'scrollY', {
    get: () => {
      const _w = _getWrapper();
      return _w ? elScrollTop.get.call(_w) : 0;
    },
    configurable: true
  });
  safeDefine(window, 'pageYOffset', {
    get: () => {
      const _w = _getWrapper();
      return _w ? elScrollTop.get.call(_w) : 0;
    },
    configurable: true
  });
  safeDefine(window, 'scrollX', {
    get: () => {
      const _w = _getWrapper();
      return _w ? elScrollLeft.get.call(_w) : 0;
    },
    configurable: true
  });
  safeDefine(window, 'pageXOffset', {
    get: () => {
      const _w = _getWrapper();
      return _w ? elScrollLeft.get.call(_w) : 0;
    },
    configurable: true
  });

  //override documentelement scroll metrics
  safeDefine(document.documentElement, 'scrollTop', {
    get: () => {
      const _w = _getWrapper();
      return _w ? elScrollTop.get.call(_w) : 0;
    },
    set: (val) => {
      const _w = _getWrapper();
      if (_w) elScrollTop.set.call(_w, val);
    },
    configurable: true
  });
  safeDefine(document.documentElement, 'scrollLeft', {
    get: () => {
      const _w = _getWrapper();
      return _w ? elScrollLeft.get.call(_w) : 0;
    },
    set: (val) => {
      const _w = _getWrapper();
      if (_w) elScrollLeft.set.call(_w, val);
    },
    configurable: true
  });
  safeDefine(document.documentElement, 'scrollHeight', {
    get: () => {
      const _w = _getWrapper();
      return _w ? elScrollHeight.get.call(_w) : elScrollHeight.get.call(document.documentElement);
    },
    configurable: true
  });
  safeDefine(document.documentElement, 'scrollWidth', {
    get: () => {
      const _w = _getWrapper();
      return _w ? elScrollWidth.get.call(_w) : elScrollWidth.get.call(document.documentElement);
    },
    configurable: true
  });

  //override body scroll metrics
  safeDefine(HTMLBodyElement.prototype, 'scrollTop', {
    get: () => {
      const _w = _getWrapper();
      return _w ? elScrollTop.get.call(_w) : 0;
    },
    set: (val) => {
      const _w = _getWrapper();
      if (_w) elScrollTop.set.call(_w, val);
    },
    configurable: true
  });
  safeDefine(HTMLBodyElement.prototype, 'scrollLeft', {
    get: () => {
      const _w = _getWrapper();
      return _w ? elScrollLeft.get.call(_w) : 0;
    },
    set: (val) => {
      const _w = _getWrapper();
      if (_w) elScrollLeft.set.call(_w, val);
    },
    configurable: true
  });
  safeDefine(HTMLBodyElement.prototype, 'scrollHeight', {
    get: function() {
      const _w = _getWrapper();
      return _w ? elScrollHeight.get.call(_w) : elScrollHeight.get.call(this);
    },
    configurable: true
  });
  safeDefine(HTMLBodyElement.prototype, 'scrollWidth', {
    get: function() {
      const _w = _getWrapper();
      return _w ? elScrollWidth.get.call(_w) : elScrollWidth.get.call(this);
    },
    configurable: true
  });

  //override window scroll methods
  const _origScrollTo = window.scrollTo;
  window.scrollTo = function(x, y) {
    const _w = _getWrapper();
    if (_w) {
      if (typeof x === 'object') _w.scrollTo(x);
      else _w.scrollTo(x, y);
    } else {
      _origScrollTo.apply(window, arguments);
    }
  };
  const _origScrollBy = window.scrollBy;
  window.scrollBy = function(x, y) {
    const _w = _getWrapper();
    if (_w) {
      if (typeof x === 'object') _w.scrollBy(x);
      else _w.scrollBy(x, y);
    } else {
      _origScrollBy.apply(window, arguments);
    }
  };
  const _origScroll = window.scroll;
  window.scroll = function(x, y) {
    const _w = _getWrapper();
    if (_w) {
      if (typeof x === 'object') _w.scrollTo(x);
      else _w.scrollTo(x, y);
    } else {
      _origScroll.apply(window, arguments);
    }
  };
})();
