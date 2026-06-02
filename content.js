//content.js

const SIDEBAR_WIDTH = 48;
const _shouldScanAbsolute = window.location.hostname.includes('mail.google.com') || window.location.hostname.includes('stitch.withgoogle.com');
let _hostElement = null;
let _sidebar = null;
let _isSidebarHidden = false;
let _fixedObserver = null;
const _fixedElementsSet = new Set();
const _SKIPPED_TAGS = new Set([
  'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'li', 'ul', 'ol', 'img', 'svg', 'path', 'g', 'code',
  'pre', 'strong', 'em', 'i', 'b', 'u', 'br', 'hr',
  'script', 'style', 'link', 'meta', 'noscript', 'canvas',
  'rect', 'circle', 'polygon', 'line', 'polyline', 'ellipse', 'use', 'defs', 'symbol',
  'option', 'thead', 'tbody', 'tr', 'td', 'th', 'col', 'colgroup'
]);
const _pendingNodes = new Set();
let _pendingTimeout = null;



async function init() {
  if (window !== window.top) return;

  const storageBlocklist = await chrome.storage.local.get(['dockitDisableSidebarList']);
  const disableSidebarList = storageBlocklist.dockitDisableSidebarList || ['chrome://extensions', 'play.google.com'];
  const currentHost = window.location.hostname.toLowerCase();
  const currentUrl = window.location.href.toLowerCase();

  const isBlocked = disableSidebarList.some((item) => {
    const cleanItem = item.toLowerCase().trim();
    if (!cleanItem) return false;
    return currentHost.includes(cleanItem) || currentUrl.includes(cleanItem);
  });

  if (isBlocked) {
    return;
  }

  if (document.getElementById('dockit-host-root')) return;

  //create host element
  _hostElement = document.createElement('div');
  _hostElement.id = 'dockit-host-root';

  const shadowRoot = _hostElement.attachShadow({ mode: 'open' });

  //inject stylesheet via style tag by fetching content to bypass shadow DOM onload bugs
  try {
    const cssRes = await fetch(chrome.runtime.getURL('styles.css'));
    const cssText = await cssRes.text();
    const styleEl = document.createElement('style');
    styleEl.textContent = cssText;
    shadowRoot.appendChild(styleEl);
  } catch (err) {
    console.error('Failed to inject Dockit stylesheet:', err);
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
      width: calc(100% - ${SIDEBAR_WIDTH}px) !important;
      height: 100% !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      position: relative !important;
      margin: 0 !important;
      box-sizing: border-box !important;
    }
    body.dockit-full-width {
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

  //gmail targeted patch
  if (window.location.hostname.includes('mail.google.com')) {
    const gmailStyle = document.createElement('style');
    gmailStyle.id = 'dockit-gmail-patch';
    gmailStyle.textContent = `
      body:not(.dockit-full-width) #gb {
        width: calc(100% - 24px) !important;
        right: 24px !important;
      }
      body:not(.dockit-full-width) #gb + div,
      body:not(.dockit-full-width) #gb + .nH {
        width: calc(100% - ${SIDEBAR_WIDTH}px) !important;
        margin-right: ${SIDEBAR_WIDTH}px !important;
      }
      body:not(.dockit-full-width) .nH {
        max-width: 100% !important;
      }
    `;
    document.head.appendChild(gmailStyle);
  }

  //full viewport app targeted patches
  if (window.location.hostname.includes('stitch.withgoogle.com') || window.location.hostname.includes('chatgpt.com')) {
    const appStyle = document.createElement('style');
    appStyle.id = 'dockit-app-patch';
    appStyle.textContent = `
      body:not(.dockit-full-width) {
        overflow: hidden !important;
      }
      body:not(.dockit-full-width) > div {
        max-width: 100% !important;
        width: 100% !important;
      }
      body:not(.dockit-full-width) appcompanion-layout,
      body:not(.dockit-full-width) [class*="appcompanion-layout"],
      body:not(.dockit-full-width) [id*="appcompanion-layout"] {
        max-width: 100% !important;
        width: 100% !important;
      }
    `;
    document.head.appendChild(appStyle);
  }

  //reddit targeted patch
  if (window.location.hostname.includes('reddit.com')) {
    const redditStyle = document.createElement('style');
    redditStyle.id = 'dockit-reddit-patch';
    redditStyle.textContent = `
      body:not(.dockit-full-width) reddit-header-large *,
      body:not(.dockit-full-width) [class*="reddit-header"] * {
        max-width: 100% !important;
      }
      body:not(.dockit-full-width) #reddit-logo,
      body:not(.dockit-full-width) [id="reddit-logo"] {
        margin-left: 48px !important;
      }
      body:not(.dockit-full-width) #user-drawer-content,
      body:not(.dockit-full-width) [id="user-drawer-content"] {
        right: 64px !important;
        margin-left: -180px !important;
      }
    `;
    document.head.appendChild(redditStyle);
  }

  //linkedin targeted patch
  if (window.location.hostname.includes('linkedin.com')) {
    const linkedinStyle = document.createElement('style');
    linkedinStyle.id = 'dockit-linkedin-patch';
    linkedinStyle.textContent = `
      body:not(.dockit-full-width) .application-outlet__overlay-container,
      html:not(.dockit-full-width) .application-outlet__overlay-container {
        width: calc(100% - ${SIDEBAR_WIDTH}px) !important;
        max-width: calc(100% - ${SIDEBAR_WIDTH}px) !important;
        min-width: 0 !important;
      }
    `;
    document.head.appendChild(linkedinStyle);
  }

  //youtube targeted patch
  if (window.location.hostname.includes('youtube.com')) {
    const youtubeStyle = document.createElement('style');
    youtubeStyle.id = 'dockit-youtube-patch';
    youtubeStyle.textContent = `
      body:has(ytd-guide[opened]),
      body:has(tp-yt-app-drawer[opened]),
      body:has(tp-yt-iron-overlay-backdrop) {
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(youtubeStyle);
  }

  //append sidebar host to html element
  document.documentElement.appendChild(_hostElement);

  //ensure sidebar host is permanent
  const _recoveryObserver = new MutationObserver(() => {
    if (_hostElement && !_hostElement.parentNode && document.documentElement) {
      document.documentElement.appendChild(_hostElement);
    }
  });
  _recoveryObserver.observe(document.documentElement, { childList: true });

  //forward scroll events from body to window
  document.body.addEventListener('scroll', () => {
    window.dispatchEvent(new Event('scroll'));
    document.dispatchEvent(new Event('scroll'));
  });

  //initial scan for fixed elements
  requestAnimationFrame(() => {
    _scanFixedElements();
    _startFixedObserver();
    //delayed re-scans for elements loaded after initial paint
    setTimeout(() => { if (!_isSidebarHidden) _scanFixedElements(); }, 2000);
    setTimeout(() => { if (!_isSidebarHidden) _scanFixedElements(); }, 5000);
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
          document.documentElement.classList.add('dockit-full-width');
          document.body.classList.add('dockit-full-width');
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
        document.documentElement.classList.add('dockit-full-width');
        document.body.classList.add('dockit-full-width');
        _removeFixedConstraints();
      } else {
        _isSidebarHidden = false;
        _hostElement.style.display = '';
        document.documentElement.classList.remove('dockit-full-width');
        document.body.classList.remove('dockit-full-width');
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

function _safeSetStyle(el, prop, val, priority = 'important') {
  if (el.style.getPropertyValue(prop) !== val) {
    el.style.setProperty(prop, val, priority);
  }
}

//constrain fixed/absolute elements
function _constrainFixedElement(el) {
  //skip extension elements
  if (_hostElement && (_hostElement === el || _hostElement.contains(el))) return;
  if (el.id === 'dockit-host-root') return;
  if (el.closest('#gb')) return;

  //skip youtube drawer and popup elements
  if (window.location.hostname.includes('youtube.com')) {
    if (el.closest('ytd-guide') || el.closest('tp-yt-app-drawer') || el.closest('ytd-popup-container') || el.closest('tp-yt-iron-overlay-backdrop') || el.tagName.toLowerCase().includes('iron-') || el.tagName.toLowerCase().includes('paper-')) return;
  }

  const hasScrollbar = document.body.scrollHeight > window.innerHeight;
  const scrollbarGap = hasScrollbar ? 16 : 0;
  const totalOffset = SIDEBAR_WIDTH + scrollbarGap;
  const targetWidth = `calc(100vw - ${totalOffset}px)`;

  //re-check already-constrained elements for site js overrides
  if (el.dataset.dockitFixed) {
    //right-only constraints don't need re-checking
    if (!el.dataset.dockitWidth) return;
    //if our width constraint is still intact, skip
    if (el.style.getPropertyValue('width') === targetWidth) return;
    //site js overwrote our width, flow down to re-apply directly
  }

  const rect = el.getBoundingClientRect();
  const isOverlappingRight = rect.right > window.innerWidth - SIDEBAR_WIDTH;
  const isFullWidth = rect.width >= window.innerWidth - 1;
  const computed = getComputedStyle(el);
  const usesVw = computed.width.includes('vw') || computed.minWidth.includes('vw');

  if (!isOverlappingRight && !isFullWidth && !usesVw) return;

  if (el.dataset.dockitFixed !== '1') {
    el.dataset.dockitFixed = '1';
  }

  //clip children horizontally so vw-based descendants can't overflow
  _safeSetStyle(el, 'overflow-x', 'clip');

  //constrain vw-based widths to account for sidebar
  if (usesVw) {
    _safeSetStyle(el, 'width', targetWidth);
    _safeSetStyle(el, 'max-width', targetWidth);
    _safeSetStyle(el, 'min-width', '0');
    if (el.dataset.dockitWidth !== '1') {
      el.dataset.dockitWidth = '1';
    }
  }

  //offset right anchored elements
  const computedRight = parseFloat(computed.right);
  if (!isNaN(computedRight) && computedRight < totalOffset) {
    _safeSetStyle(el, 'right', (computedRight + totalOffset) + 'px');
  } else if (computed.right === 'auto' || isNaN(computedRight)) {
    const curRight = window.innerWidth - rect.right;
    _safeSetStyle(el, 'right', (curRight + totalOffset) + 'px');
  }

  //constrain full width elements
  if (isFullWidth) {
    _safeSetStyle(el, 'width', targetWidth);
    _safeSetStyle(el, 'max-width', targetWidth);
    _safeSetStyle(el, 'min-width', '0');
    if (el.dataset.dockitWidth !== '1') {
      el.dataset.dockitWidth = '1';
    }
    const computedLeft = parseFloat(computed.left);
    if (!isNaN(computedLeft) && computedLeft === 0) {
      _safeSetStyle(el, 'right', `${totalOffset}px`);
    }
  }
}

//scan html for fixed elements
function _scanFixedElements() {
  const allElements = document.documentElement.querySelectorAll('*');
  for (const el of allElements) {
    if (_SKIPPED_TAGS.has(el.tagName.toLowerCase())) continue;
    const computed = getComputedStyle(el);
    if (computed.position === 'fixed' || computed.position === 'sticky' || (_shouldScanAbsolute && computed.position === 'absolute')) {
      _fixedElementsSet.add(el);
      _constrainFixedElement(el);
    }
  }
}

function _checkAndConstrain(el) {
  if (el.nodeType !== Node.ELEMENT_NODE) return;
  const tagName = el.tagName.toLowerCase();
  if (_SKIPPED_TAGS.has(tagName)) return;

  const computed = getComputedStyle(el);
  if (computed.position === 'fixed' || computed.position === 'sticky' || (_shouldScanAbsolute && computed.position === 'absolute')) {
    _fixedElementsSet.add(el);
    _constrainFixedElement(el);
  } else {
    if (_fixedElementsSet.has(el)) {
      _fixedElementsSet.delete(el);
      _removeConstraint(el);
    }
  }
  const children = el.querySelectorAll('*');
  for (const child of children) {
    if (_SKIPPED_TAGS.has(child.tagName.toLowerCase())) continue;
    const childComputed = getComputedStyle(child);
    if (childComputed.position === 'fixed' || childComputed.position === 'sticky' || (_shouldScanAbsolute && childComputed.position === 'absolute')) {
      _fixedElementsSet.add(child);
      _constrainFixedElement(child);
    } else {
      if (_fixedElementsSet.has(child)) {
        _fixedElementsSet.delete(child);
        _removeConstraint(child);
      }
    }
  }
}

function _queueCheckAndConstrain(node) {
  _pendingNodes.add(node);
  if (!_pendingTimeout) {
    _pendingTimeout = setTimeout(() => {
      for (const el of _pendingNodes) {
        if (document.documentElement.contains(el)) {
          _checkAndConstrain(el);
        }
      }
      _pendingNodes.clear();
      _pendingTimeout = null;
    }, 0);
  }
}

function _startFixedObserver() {
  if (_fixedObserver) return;
  _fixedObserver = new MutationObserver((mutations) => {
    if (_isSidebarHidden) return;
    for (const m of mutations) {
      if (m.type === 'childList') {
        for (const node of m.addedNodes) {
          _queueCheckAndConstrain(node);
        }
      } else if (m.type === 'attributes') {
        _queueCheckAndConstrain(m.target);
      }
    }
  });
  _fixedObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  });
}

function _removeConstraint(el) {
  if (el.style.getPropertyValue('right')) el.style.removeProperty('right');
  if (el.style.getPropertyValue('max-width')) el.style.removeProperty('max-width');
  if (el.style.getPropertyValue('min-width')) el.style.removeProperty('min-width');
  if (el.style.getPropertyValue('width')) el.style.removeProperty('width');
  if (el.style.getPropertyValue('overflow-x')) el.style.removeProperty('overflow-x');
  if (el.dataset.dockitFixed) delete el.dataset.dockitFixed;
  if (el.dataset.dockitWidth) delete el.dataset.dockitWidth;
}

//remove constraints
function _removeFixedConstraints() {
  for (const el of _fixedElementsSet) {
    _removeConstraint(el);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
