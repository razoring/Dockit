//scroll-interceptor.js

(function() {
  const _getWrapper = () => document.body;

  const getDesc = (obj, prop) => Object.getOwnPropertyDescriptor(obj, prop);
  
  const elScrollTop = getDesc(Element.prototype, 'scrollTop');
  const elScrollLeft = getDesc(Element.prototype, 'scrollLeft');
  const elScrollHeight = getDesc(Element.prototype, 'scrollHeight');
  const elScrollWidth = getDesc(Element.prototype, 'scrollWidth');

  //override scrollingelement
  Object.defineProperty(document, 'scrollingElement', {
    get: () => _getWrapper() || document.documentElement,
    configurable: true
  });

  const _getOffset = () => {
    if (document.body && document.body.classList.contains('dockit-full-width')) {
      return 0;
    }
    return 48;
  };

  const winInnerWidthDesc = getDesc(window, 'innerWidth') || getDesc(Window.prototype, 'innerWidth');
  const elClientWidthDesc = getDesc(Element.prototype, 'clientWidth');

  //override window innerwidth
  if (winInnerWidthDesc) {
    Object.defineProperty(window, 'innerWidth', {
      get: () => {
        const val = winInnerWidthDesc.get.call(window);
        return val - _getOffset();
      },
      configurable: true
    });
  }

  //override documentelement clientwidth
  if (elClientWidthDesc) {
    Object.defineProperty(document.documentElement, 'clientWidth', {
      get: () => {
        const val = elClientWidthDesc.get.call(document.documentElement);
        return val - _getOffset();
      },
      configurable: true
    });
  }

  //override window scroll positions
  Object.defineProperty(window, 'scrollY', {
    get: () => {
      const _w = _getWrapper();
      return _w ? elScrollTop.get.call(_w) : 0;
    },
    configurable: true
  });
  Object.defineProperty(window, 'pageYOffset', {
    get: () => {
      const _w = _getWrapper();
      return _w ? elScrollTop.get.call(_w) : 0;
    },
    configurable: true
  });
  Object.defineProperty(window, 'scrollX', {
    get: () => {
      const _w = _getWrapper();
      return _w ? elScrollLeft.get.call(_w) : 0;
    },
    configurable: true
  });
  Object.defineProperty(window, 'pageXOffset', {
    get: () => {
      const _w = _getWrapper();
      return _w ? elScrollLeft.get.call(_w) : 0;
    },
    configurable: true
  });

  //override documentelement scroll metrics
  Object.defineProperty(document.documentElement, 'scrollTop', {
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
  Object.defineProperty(document.documentElement, 'scrollLeft', {
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
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    get: () => {
      const _w = _getWrapper();
      return _w ? elScrollHeight.get.call(_w) : elScrollHeight.get.call(document.documentElement);
    },
    configurable: true
  });
  Object.defineProperty(document.documentElement, 'scrollWidth', {
    get: () => {
      const _w = _getWrapper();
      return _w ? elScrollWidth.get.call(_w) : elScrollWidth.get.call(document.documentElement);
    },
    configurable: true
  });

  //override body scroll metrics
  Object.defineProperty(document.body, 'scrollTop', {
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
  Object.defineProperty(document.body, 'scrollLeft', {
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
  Object.defineProperty(document.body, 'scrollHeight', {
    get: () => {
      const _w = _getWrapper();
      return _w ? elScrollHeight.get.call(_w) : elScrollHeight.get.call(document.body);
    },
    configurable: true
  });
  Object.defineProperty(document.body, 'scrollWidth', {
    get: () => {
      const _w = _getWrapper();
      return _w ? elScrollWidth.get.call(_w) : elScrollWidth.get.call(document.body);
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
