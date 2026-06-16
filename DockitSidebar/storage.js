// storage.js
// Injected into all cross-origin iframes to attempt to request first-party storage access

if (window.top !== window.self) {
  // We are inside an iframe

  // 1. Notify parent of URL changes
  const notifyParent = () => {
    window.parent.postMessage({ type: 'DOCKIT_IFRAME_URL', url: window.location.href }, '*');
  };

  notifyParent();
  
  // Listen for SPA navigations
  window.addEventListener('popstate', notifyParent);
  window.addEventListener('hashchange', notifyParent);
  
  const originalPushState = history.pushState;
  history.pushState = function() {
    originalPushState.apply(this, arguments);
    notifyParent();
  };
  
  const originalReplaceState = history.replaceState;
  history.replaceState = function() {
    originalReplaceState.apply(this, arguments);
    notifyParent();
  };

  // 2. Request Storage Access if needed
  if (document.hasStorageAccess && document.requestStorageAccess) {
    document.hasStorageAccess().then((hasAccess) => {
      if (!hasAccess) {
        // requestStorageAccess requires a user gesture.
        // We bind to the first click on the document to request access.
        const requestAccess = () => {
          document.requestStorageAccess().catch(err => {
            console.warn('Dockit: Storage access denied or failed:', err);
          });
          document.removeEventListener('click', requestAccess);
        };
        document.addEventListener('click', requestAccess);
      }
    });
  }
}
