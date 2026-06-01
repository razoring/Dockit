//content.js

const SIDEBAR_WIDTH = 48;
let _wrapper = null;
let _hostElement = null;
let _sidebar = null;
let _isSidebarHidden = false;
let _fixedObserver = null;
let _scanTimeout = null;

//inject main world scroll interception
const _injectScript = document.createElement('script');
_injectScript.src = chrome.runtime.getURL('scroll-interceptor.js');
document.documentElement.appendChild(_injectScript);
_injectScript.remove();

async function init() {
  if (document.getElementById('dockit-host-root')) return;

  //capture margins
  const bodyComputed = getComputedStyle(document.body);
  const origMargins = {
    top: bodyComputed.marginTop,
    right: bodyComputed.marginRight,
    bottom: bodyComputed.marginBottom,
    left: bodyComputed.marginLeft
  };

  //create page wrapper
  _wrapper = document.createElement('div');
  _wrapper.id = 'dockit-page-wrapper';

  //move existing body children
  while (document.body.firstChild) {
    _wrapper.appendChild(document.body.firstChild);
  }

  //create host element
  _hostElement = document.createElement('div');
  _hostElement.id = 'dockit-host-root';

  const shadowRoot = _hostElement.attachShadow({ mode: 'open' });

  //inject styles
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

  //inject layout styles
  const layoutStyle = document.createElement('style');
  layoutStyle.id = 'dockit-layout-styles';
  layoutStyle.textContent = `
    html {
      overflow: hidden !important;
      height: 100% !important;
    }
    body {
      overflow: hidden !important;
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      position: relative !important;
    }
    #dockit-page-wrapper {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: calc(100% - ${SIDEBAR_WIDTH}px) !important;
      height: 100% !important;
      overflow-y: auto !important;
      overflow-x: auto !important;
      padding: ${origMargins.top} ${origMargins.right} ${origMargins.bottom} ${origMargins.left};
      box-sizing: border-box !important;
      transition: width 0.2s ease-in-out !important;
    }
    #dockit-page-wrapper.dockit-full-width {
      width: 100% !important;
    }
    #dockit-host-root {
      width: ${SIDEBAR_WIDTH}px;
      height: 100vh;
      position: fixed !important;
      top: 0 !important;
      right: 0 !important;
      z-index: 2147483647;
    }
  `;
  document.head.appendChild(layoutStyle);

  //append elements
  document.body.appendChild(_wrapper);
  document.body.appendChild(_hostElement);

  //forward scroll events
  _wrapper.addEventListener('scroll', () => {
    window.dispatchEvent(new Event('scroll'));
  });

  //intercept dynamic body elements
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
              if (!_isSidebarHidden) _constrainFixedElement(node);
            } else {
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

  //initial scans
  requestAnimationFrame(() => {
    _scanFixedElements();
    _startFixedObserver();
  });

  //check initial sidepanel state
  let currentWindowId = null;
  chrome.runtime.sendMessage({ type: 'GET_WINDOW_ID' }, (winId) => {
    currentWindowId = winId;
    if (winId) {
      chrome.storage.local.get(`sidePanelOpen_${winId}`, (data) => {
        if (data[`sidePanelOpen_${winId}`]) {
          _isSidebarHidden = true;
          _hostElement.style.display = 'none';
          _wrapper.classList.add('dockit-full-width');
          _removeFixedConstraints();
        }
      });
    }
  });

  //react to sidepanel open/close
  chrome.storage.onChanged.addListener((changes) => {
    if (currentWindowId && changes[`sidePanelOpen_${currentWindowId}`]) {
      if (changes[`sidePanelOpen_${currentWindowId}`].newValue) {
        _isSidebarHidden = true;
        _hostElement.style.display = 'none';
        _wrapper.classList.add('dockit-full-width');
        _removeFixedConstraints();
      } else {
        _isSidebarHidden = false;
        _hostElement.style.display = '';
        _wrapper.classList.remove('dockit-full-width');
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

//constrain fixed elements
function _constrainFixedElement(el) {
  if (el.dataset.dockitFixed) return;
  //skip extension elements
  if (_hostElement && (_hostElement === el || _hostElement.contains(el))) return;
  if (el.id === 'dockit-page-wrapper' || el.id === 'dockit-host-root') return;

  el.dataset.dockitFixed = '1';

  const computed = getComputedStyle(el);
  const rect = el.getBoundingClientRect();

  const isNearRightEdge = rect.right >= window.innerWidth - 60;
  const isFullWidth = rect.width >= window.innerWidth - 20;

  if (!isNearRightEdge && !isFullWidth) return;

  //offset right anchored elements
  const computedRight = parseFloat(computed.right);
  if (!isNaN(computedRight) && computedRight < SIDEBAR_WIDTH) {
    el.style.setProperty('right', (computedRight + SIDEBAR_WIDTH) + 'px', 'important');
  } else if (computed.right === 'auto' || isNaN(computedRight)) {
    const curRight = window.innerWidth - rect.right;
    el.style.setProperty('right', (curRight + SIDEBAR_WIDTH) + 'px', 'important');
  }

  //constrain full width elements
  if (isFullWidth) {
    el.style.setProperty('max-width', `calc(100vw - ${SIDEBAR_WIDTH}px)`, 'important');
    const computedLeft = parseFloat(computed.left);
    if (!isNaN(computedLeft) && computedLeft === 0) {
      el.style.setProperty('right', `${SIDEBAR_WIDTH}px`, 'important');
    }
  }
}

//scan body and wrapper
function _scanFixedElements() {
  for (const el of document.body.children) {
    if (el === _wrapper || el === _hostElement) continue;
    if (el.nodeType !== Node.ELEMENT_NODE) continue;
    const computed = getComputedStyle(el);
    if (computed.position === 'fixed') {
      _constrainFixedElement(el);
    }
  }
  const fixedEls = _wrapper.querySelectorAll('*');
  for (const el of fixedEls) {
    const computed = getComputedStyle(el);
    if (computed.position === 'fixed') {
      _constrainFixedElement(el);
    }
  }
}

function _checkAndConstrain(el) {
  if (el.nodeType !== Node.ELEMENT_NODE) return;
  const computed = getComputedStyle(el);
  if (computed.position === 'fixed') {
    _constrainFixedElement(el);
  }
  const children = el.querySelectorAll('*');
  for (const child of children) {
    const childComputed = getComputedStyle(child);
    if (childComputed.position === 'fixed') {
      _constrainFixedElement(child);
    }
  }
}

//start mutation observer
function _startFixedObserver() {
  if (_fixedObserver) return;
  _fixedObserver = new MutationObserver((mutations) => {
    if (_isSidebarHidden) return;
    for (const m of mutations) {
      if (m.type === 'childList') {
        for (const node of m.addedNodes) {
          _checkAndConstrain(node);
        }
      } else if (m.type === 'attributes') {
        _checkAndConstrain(m.target);
      }
    }
  });
  _fixedObserver.observe(_wrapper, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  });
}

//remove constraints
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
