// content.js

const SIDEBAR_WIDTH = 48;
let _wrapper = null;
let _hostElement = null;
let _sidebar = null;
let _isSidebarHidden = false;
let _fixedObserver = null;
let _scanTimeout = null;

async function init() {
  if (document.getElementById('dockit-host-root')) return;

  //capture original body margins before modifying
  const bodyComputed = getComputedStyle(document.body);
  const origMargins = {
    top: bodyComputed.marginTop,
    right: bodyComputed.marginRight,
    bottom: bodyComputed.marginBottom,
    left: bodyComputed.marginLeft
  };

  //create page wrapper (becomes sibling of sidebar)
  _wrapper = document.createElement('div');
  _wrapper.id = 'dockit-page-wrapper';

  //move all existing body children into wrapper
  while (document.body.firstChild) {
    _wrapper.appendChild(document.body.firstChild);
  }

  //create sidebar host with shadow DOM
  _hostElement = document.createElement('div');
  _hostElement.id = 'dockit-host-root';

  const shadowRoot = _hostElement.attachShadow({ mode: 'open' });

  //inject CSS into shadow DOM
  try {
    const cssUrl = chrome.runtime.getURL('styles.css');
    const res = await fetch(cssUrl);
    const cssText = await res.text();
    const styleEl = document.createElement('style');
    styleEl.textContent = cssText;
    shadowRoot.appendChild(styleEl);
  } catch (e) {
    console.error('Dockit: Failed to load styles', e);
  }

  //inject cached fonts
  const storage = await chrome.storage.local.get(['fontCss']);
  if (storage.fontCss) {
    const fontStyle = document.createElement('style');
    fontStyle.textContent = storage.fontCss;
    shadowRoot.appendChild(fontStyle);
  }

  //render sidebar
  _sidebar = new DockitSidebar(false);
  const sidebarEl = await _sidebar.render();
  shadowRoot.appendChild(sidebarEl);

  //inject layout styles: body becomes flex container, wrapper and sidebar are siblings
  const layoutStyle = document.createElement('style');
  layoutStyle.id = 'dockit-layout-styles';
  layoutStyle.textContent = `
    html {
      overflow: hidden !important;
      height: 100% !important;
    }
    body {
      display: flex !important;
      flex-direction: row !important;
      overflow: hidden !important;
      height: 100vh !important;
      margin: 0 !important;
    }
    #dockit-page-wrapper {
      flex: 1 1 auto;
      overflow-y: auto;
      overflow-x: auto;
      height: 100vh;
      min-width: 0;
      position: relative;
      padding: ${origMargins.top} ${origMargins.right} ${origMargins.bottom} ${origMargins.left};
    }
    #dockit-host-root {
      width: ${SIDEBAR_WIDTH}px;
      height: 100vh;
      flex-shrink: 0;
      position: relative;
      z-index: 2147483647;
    }
  `;
  document.head.appendChild(layoutStyle);

  //append wrapper and sidebar host as siblings inside body
  document.body.appendChild(_wrapper);
  document.body.appendChild(_hostElement);

  //forward scroll events so sites that listen on window still work
  _wrapper.addEventListener('scroll', () => {
    window.dispatchEvent(new Event('scroll'));
  });

  //intercept elements added directly to body by page scripts
  const bodyObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node === _wrapper || node === _hostElement) continue;
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.id === 'dockit-page-wrapper' || node.id === 'dockit-host-root' || node.id === 'dockit-layout-styles') continue;
          requestAnimationFrame(() => {
            if (!document.body.contains(node)) return;
            const pos = getComputedStyle(node).position;
            if (pos === 'fixed') {
              //leave fixed elements on body but constrain them
              if (!_isSidebarHidden) _constrainFixedElement(node);
            } else {
              //move normal content into the wrapper
              _wrapper.appendChild(node);
            }
          });
        } else if (node.nodeType === Node.TEXT_NODE) {
          _wrapper.appendChild(node);
        }
      }
    }
  });
  bodyObserver.observe(document.body, { childList: true });

  //scan for fixed/sticky elements that need constraining
  requestAnimationFrame(() => {
    _scanFixedElements();
    _startFixedObserver();
  });

  //check initial side panel state
  let currentWindowId = null;
  chrome.runtime.sendMessage({ type: 'GET_WINDOW_ID' }, (winId) => {
    currentWindowId = winId;
    if (winId) {
      chrome.storage.local.get(`sidePanelOpen_${winId}`, (data) => {
        if (data[`sidePanelOpen_${winId}`]) {
          _isSidebarHidden = true;
          _hostElement.style.display = 'none';
          _removeFixedConstraints();
        }
      });
    }
  });

  //react to side panel open/close
  chrome.storage.onChanged.addListener((changes) => {
    if (currentWindowId && changes[`sidePanelOpen_${currentWindowId}`]) {
      if (changes[`sidePanelOpen_${currentWindowId}`].newValue) {
        _isSidebarHidden = true;
        _hostElement.style.display = 'none';
        _removeFixedConstraints();
      } else {
        _isSidebarHidden = false;
        _hostElement.style.display = '';
        requestAnimationFrame(() => _scanFixedElements());
        _sidebar.loadData();
      }
    }

    if (!_isSidebarHidden && (changes.pinnedApps || changes.temporaryApps || changes.lucideIcons)) {
      if (changes.lucideIcons) _sidebar.injectIcons();
      _sidebar.loadData();
    }
  });
}

function _constrainFixedElement(el) {
  if (el.dataset.dockitFixed) return;
  el.dataset.dockitFixed = '1';

  const computed = getComputedStyle(el);
  const rect = el.getBoundingClientRect();

  //only constrain elements near the viewport's right edge
  if (rect.right < window.innerWidth - 60) return;

  //offset right-anchored elements
  const computedRight = parseFloat(computed.right);
  if (!isNaN(computedRight) && computedRight < SIDEBAR_WIDTH) {
    el.style.setProperty('right', (computedRight + SIDEBAR_WIDTH) + 'px', 'important');
  }

  //constrain full-width elements
  if (rect.width >= window.innerWidth - 20) {
    el.style.setProperty('max-width', `calc(100vw - ${SIDEBAR_WIDTH}px)`, 'important');
  }
}

function _scanFixedElements() {
  //check inside wrapper
  const wrapperEls = _wrapper.querySelectorAll('*');
  for (const el of wrapperEls) {
    if (el.dataset.dockitFixed) continue;
    const computed = getComputedStyle(el);
    if (computed.position === 'fixed' || computed.position === 'sticky') {
      _constrainFixedElement(el);
    }
  }
  //check direct body children (fixed elements that stayed outside wrapper)
  for (const el of document.body.children) {
    if (el === _wrapper || el === _hostElement) continue;
    if (el.nodeType !== Node.ELEMENT_NODE) continue;
    if (el.dataset.dockitFixed) continue;
    const computed = getComputedStyle(el);
    if (computed.position === 'fixed' || computed.position === 'sticky') {
      _constrainFixedElement(el);
    }
  }
}

function _startFixedObserver() {
  if (_fixedObserver) return;
  _fixedObserver = new MutationObserver(() => {
    if (_isSidebarHidden) return;
    if (_scanTimeout) clearTimeout(_scanTimeout);
    _scanTimeout = setTimeout(_scanFixedElements, 300);
  });
  _fixedObserver.observe(_wrapper, { childList: true, subtree: true });
}

function _removeFixedConstraints() {
  document.querySelectorAll('[data-dockit-fixed]').forEach(el => {
    el.style.removeProperty('right');
    el.style.removeProperty('max-width');
    delete el.dataset.dockitFixed;
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
