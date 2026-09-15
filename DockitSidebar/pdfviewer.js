(function () {
  if (typeof pdfjsLib === 'undefined') {
    showError();
    return;
  }

  // Configure worker URL
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs/pdf.worker.min.js';

  const params = new URLSearchParams(window.location.search);
  const pdfUrl = params.get('file');

  const container = document.getElementById('viewer-container');
  const loading = document.getElementById('loading-indicator');
  const errorContainer = document.getElementById('error-container');
  const toolbar = document.getElementById('toolbar');
  const pageNumSpan = document.getElementById('page-num');
  const pageCountSpan = document.getElementById('page-count');
  const zoomValSpan = document.getElementById('zoom-val');
  const openNewTabBtn = document.getElementById('open-new-tab-btn');
  const openTabIcon = document.getElementById('open-tab-icon');

  if (!pdfUrl) {
    showError('No PDF URL specified.');
    return;
  }

  let pdfDoc = null;
  let scale = 1.0;
  let currentPage = 1;
  const pageRendering = {};
  const pageCanvases = [];

  function showError(msg) {
    loading.style.display = 'none';
    toolbar.style.display = 'none';
    container.style.display = 'none';
    errorContainer.style.display = 'block';
    if (msg) {
      const p = errorContainer.querySelector('p');
      if (p) p.textContent = msg;
    }
  }

  function handleOpenNewTab() {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  }

  openNewTabBtn.addEventListener('click', handleOpenNewTab);
  openTabIcon.addEventListener('click', handleOpenNewTab);

  async function renderPage(num) {
    if (!pdfDoc || pageRendering[num]) return;
    pageRendering[num] = true;

    try {
      const page = await pdfDoc.getPage(num);
      const viewport = page.getViewport({ scale: scale });

      const canvas = document.getElementById(`page-canvas-${num}`);
      if (!canvas) return;

      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const wrapper = canvas.parentElement;
      wrapper.style.width = `${viewport.width}px`;
      wrapper.style.height = `${viewport.height}px`;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error(`Error rendering page ${num}:`, err);
    } finally {
      pageRendering[num] = false;
    }
  }

  async function renderAllPages() {
    container.innerHTML = '';
    pageCanvases.length = 0;

    for (let num = 1; num <= pdfDoc.numPages; num++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'page-canvas-wrapper';
      wrapper.id = `page-wrapper-${num}`;

      const canvas = document.createElement('canvas');
      canvas.id = `page-canvas-${num}`;

      wrapper.appendChild(canvas);
      container.appendChild(wrapper);
      pageCanvases.push(canvas);

      await renderPage(num);
    }
  }

  async function loadPDF() {
    try {
      loading.style.display = 'flex';
      errorContainer.style.display = 'none';

      // Load document
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      pdfDoc = await loadingTask.promise;

      loading.style.display = 'none';
      toolbar.style.display = 'flex';
      pageCountSpan.textContent = pdfDoc.numPages;

      // Calculate initial auto-fit scale based on container width
      const firstPage = await pdfDoc.getPage(1);
      const unscaledViewport = firstPage.getViewport({ scale: 1.0 });
      const containerWidth = container.clientWidth - 40; // padding
      if (containerWidth > 0 && unscaledViewport.width > 0) {
        scale = Math.min(Math.max(containerWidth / unscaledViewport.width, 0.5), 2.5);
      }
      zoomValSpan.textContent = `${Math.round(scale * 100)}%`;

      await renderAllPages();

      // Setup scroll handler to update page indicator
      container.addEventListener('scroll', () => {
        const containerTop = container.scrollTop;
        for (let num = 1; num <= pdfDoc.numPages; num++) {
          const wrapper = document.getElementById(`page-wrapper-${num}`);
          if (wrapper) {
            const top = wrapper.offsetTop - container.offsetTop;
            const bottom = top + wrapper.offsetHeight;
            if (top <= containerTop + 100 && bottom >= containerTop) {
              currentPage = num;
              pageNumSpan.textContent = currentPage;
              break;
            }
          }
        }
      });

    } catch (err) {
      console.error('Failed to load PDF via pdfjs:', err);
      showError('Unable to render PDF directly.');
    }
  }

  // Zoom controls
  document.getElementById('zoom-in').addEventListener('click', async () => {
    if (scale < 3.0) {
      scale = Math.min(3.0, scale + 0.25);
      zoomValSpan.textContent = `${Math.round(scale * 100)}%`;
      await renderAllPages();
    }
  });

  document.getElementById('zoom-out').addEventListener('click', async () => {
    if (scale > 0.5) {
      scale = Math.max(0.5, scale - 0.25);
      zoomValSpan.textContent = `${Math.round(scale * 100)}%`;
      await renderAllPages();
    }
  });

  document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      const targetWrapper = document.getElementById(`page-wrapper-${currentPage}`);
      if (targetWrapper) {
        targetWrapper.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

  document.getElementById('next-page').addEventListener('click', () => {
    if (pdfDoc && currentPage < pdfDoc.numPages) {
      currentPage++;
      const targetWrapper = document.getElementById(`page-wrapper-${currentPage}`);
      if (targetWrapper) {
        targetWrapper.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

  loadPDF();
})();
