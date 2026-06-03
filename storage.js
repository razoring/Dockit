// storage.js
// Injected into all cross-origin iframes to attempt to request first-party storage access

if (window.top !== window.self) {
  // We are inside an iframe
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
