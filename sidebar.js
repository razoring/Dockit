// sidebar.js

class DockitSidebar {
  constructor(isSidePanel = false) {
    this.isSidePanel = isSidePanel;
    this.element = document.createElement('div');
    this.element.className = 'dockit-sidebar';
    this.element.dataset.themeColors = 'background,border';
    this._dragState = null;
  }
  
  async render() {
    this.element.innerHTML = `
      <div class="dockit-section" id="pinned-section"></div>
      <div class="dockit-divider" data-theme-colors="border"></div>
      <div class="dockit-section" id="temp-section"></div>
      <div class="dockit-divider" id="temp-divider" data-theme-colors="border" style="display:none"></div>
      
      <button class="dockit-action-btn" id="add-btn" style="margin-top: 4px;" data-theme-colors="foreground,secondary,accent">
         <span class="icon-plus"></span>
      </button>

      <div class="dockit-bottom-controls">
         <button class="dockit-action-btn" id="ext-btn" data-theme-colors="foreground,secondary">
            <span class="icon-puzzle"></span>
         </button>
         <button class="dockit-action-btn" id="set-btn" data-theme-colors="foreground,secondary">
            <span class="icon-settings"></span>
         </button>
      </div>
    `;
    
    await this.injectIcons();
    await this.loadData();
    this._setupMouseDrag();
    return this.element;
  }

  async injectIcons() {
    const data = await chrome.storage.local.get(['lucideIcons']);
    if (data.lucideIcons) {
      const plusIcon = this.element.querySelector('.icon-plus');
      if (plusIcon) plusIcon.outerHTML = data.lucideIcons['plus'];
      
      const extIcon = this.element.querySelector('.icon-puzzle');
      if (extIcon) extIcon.outerHTML = data.lucideIcons['puzzle'];
      
      const setIcon = this.element.querySelector('.icon-settings');
      if (setIcon) setIcon.outerHTML = data.lucideIcons['settings'];

      this._trashIconSvg = data.lucideIcons['trash-2'];
      this._plusIconSvg = data.lucideIcons['plus'];
    }
  }

  async loadData() {
    const data = await chrome.storage.local.get(['pinnedApps', 'temporaryApps']);
    this._renderApps(this.element.querySelector('#pinned-section'), data.pinnedApps || [], 'pinned');
    this._renderApps(this.element.querySelector('#temp-section'), data.temporaryApps || [], 'temp');
    
    const tempDivider = this.element.querySelector('#temp-divider');
    if (data.temporaryApps && data.temporaryApps.length > 0) {
      tempDivider.style.display = 'block';
    } else {
      tempDivider.style.display = 'none';
    }
  }

  _renderApps(container, apps, listType) {
    if (!container) return;
    container.innerHTML = '';
    apps.forEach((app, index) => {
      const el = document.createElement('div');
      el.className = 'dockit-app';
      el.dataset.themeColors = 'secondary,foreground,primary';
      el.dataset.id = app.id;
      el.dataset.list = listType;
      el.dataset.index = index;
      el.title = app.title;
      el.innerHTML = `<img src="${app.iconUrl}" alt="${app.title}" draggable="false" />`;
      
      //click to navigate
      el.addEventListener('click', (e) => {
        if (this._dragState && this._dragState.didMove) return;
        if (this.isSidePanel) {
          document.dispatchEvent(new CustomEvent('dockit-navigate', { detail: app.url }));
        } else {
          chrome.runtime.sendMessage({ type: 'OPEN_SIDEPANEL', app: app });
        }
      });

      //mousedown to begin drag tracking
      el.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        this._dragState = {
          app,
          listType,
          el,
          startY: e.clientY,
          didMove: false,
          ghost: null
        };
      });

      container.appendChild(el);
    });
  }

  _setupMouseDrag() {
    const root = this.isSidePanel ? document : this.element;

    root.addEventListener('mousemove', (e) => {
      if (!this._dragState) return;
      const ds = this._dragState;

      //require 5px movement to begin the visual drag
      if (!ds.didMove && Math.abs(e.clientY - ds.startY) < 5) return;

      if (!ds.didMove) {
        ds.didMove = true;
        ds.el.classList.add('dockit-drag-ghost');
        this.element.classList.add('is-dragging');

        //morph add button to trash
        const addBtn = this.element.querySelector('#add-btn');
        if (addBtn) {
          addBtn.classList.add('trash-mode');
          addBtn.innerHTML = this._trashIconSvg || 'Trash';
        }

        //create floating ghost clone
        const ghost = ds.el.cloneNode(true);
        ghost.className = 'dockit-app dockit-floating-ghost';
        ghost.style.cssText = `
          position: fixed;
          pointer-events: none;
          z-index: 9999999;
          opacity: 0.85;
          width: 32px;
          height: 32px;
        `;
        (this.isSidePanel ? document.body : this.element).appendChild(ghost);
        ds.ghost = ghost;
      }

      //position ghost at cursor
      if (ds.ghost) {
        ds.ghost.style.left = (e.clientX - 16) + 'px';
        ds.ghost.style.top = (e.clientY - 16) + 'px';
      }

      //highlight drop targets
      this._clearHighlights();
      const target = this._getDropTarget(e.clientY);
      if (target) {
        if (target.type === 'app') {
          const half = target.rect.top + target.rect.height / 2;
          if (e.clientY < half) {
            target.el.style.boxShadow = '0 -3px 0 0 var(--color-primary)';
          } else {
            target.el.style.boxShadow = '0 3px 0 0 var(--color-primary)';
          }
        } else if (target.type === 'trash') {
          target.el.style.opacity = '1';
        }
      }
    });

    root.addEventListener('mouseup', async (e) => {
      if (!this._dragState) return;
      const ds = this._dragState;
      
      if (!ds.didMove) {
        this._dragState = null;
        return;
      }

      //determine drop target BEFORE cleaning up visuals (otherwise empty sections collapse to 0 height)
      const target = this._getDropTarget(e.clientY);

      //cleanup visuals
      ds.el.classList.remove('dockit-drag-ghost');
      this.element.classList.remove('is-dragging');
      if (ds.ghost) ds.ghost.remove();
      this._clearHighlights();

      const addBtn = this.element.querySelector('#add-btn');
      if (addBtn) {
        addBtn.classList.remove('trash-mode');
        addBtn.innerHTML = this._plusIconSvg || '+';
      }

      if (target) {
        if (target.type === 'trash') {
          await this._deleteApp(ds.app, ds.listType);
        } else if (target.type === 'app') {
          const half = target.rect.top + target.rect.height / 2;
          let idx = parseInt(target.el.dataset.index);
          if (e.clientY > half) idx++;
          await this._moveApp(ds.app, ds.listType, target.el.dataset.list, idx);
        } else if (target.type === 'section') {
          await this._moveApp(ds.app, ds.listType, target.list, -1);
        }
      }

      this._dragState = null;
    });

    //cancel drag if mouse leaves the sidebar area
    root.addEventListener('mouseleave', (e) => {
      if (!this._dragState || !this._dragState.didMove) return;
      const ds = this._dragState;
      ds.el.classList.remove('dockit-drag-ghost');
      this.element.classList.remove('is-dragging');
      if (ds.ghost) ds.ghost.remove();
      this._clearHighlights();
      const addBtn = this.element.querySelector('#add-btn');
      if (addBtn) {
        addBtn.classList.remove('trash-mode');
        addBtn.innerHTML = this._plusIconSvg || '+';
      }
      this._dragState = null;
    });
  }

  _getDropTarget(clientY) {
    let bestTarget = null;
    let minDistance = Infinity;

    const check = (type, el, extra) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.height === 0) return;
      
      const center = r.top + r.height / 2;
      const distance = Math.abs(clientY - center);
      
      if (distance < minDistance) {
        minDistance = distance;
        bestTarget = { type, el, rect: r, ...extra };
      }
    };

    // check trash
    check('trash', this.element.querySelector('#add-btn'));
    
    // check apps
    const apps = this.element.querySelectorAll('.dockit-app:not(.dockit-floating-ghost)');
    for (const appEl of apps) {
      check(appEl === this._dragState.el ? 'self' : 'app', appEl);
    }

    // check empty sections
    for (const [id, list] of [['pinned-section', 'pinned'], ['temp-section', 'temp']]) {
      const sec = this.element.querySelector('#' + id);
      // It is effectively empty if it has 0 children, or if its only child is the one being dragged
      let isEmpty = sec && sec.children.length === 0;
      if (sec && sec.children.length === 1 && this._dragState && sec.children[0] === this._dragState.el) {
        isEmpty = true;
      }
      if (isEmpty) {
        check('section', sec, { list });
      }
    }

    if (minDistance < 60) {
      return bestTarget;
    }
    
    return null;
  }

  _clearHighlights() {
    this.element.querySelectorAll('.dockit-app').forEach(el => {
      el.style.boxShadow = '';
    });
  }

  async _moveApp(app, fromList, toList, targetIndex = -1) {
    const data = await chrome.storage.local.get(['pinnedApps', 'temporaryApps']);
    let fromArr = fromList === 'pinned' ? (data.pinnedApps || []) : (data.temporaryApps || []);
    let toArr = toList === 'pinned' ? (data.pinnedApps || []) : (data.temporaryApps || []);
    
    const origIndex = fromArr.findIndex(a => a.id === app.id);
    if (origIndex === -1) return;

    fromArr.splice(origIndex, 1);
    
    if (fromList === toList && targetIndex > origIndex) {
       targetIndex--;
    }

    if (targetIndex === -1) {
       toArr.push(app);
    } else {
       toArr.splice(targetIndex, 0, app);
    }
    
    if (fromList === 'pinned') data.pinnedApps = fromArr; else data.temporaryApps = fromArr;
    if (toList === 'pinned') data.pinnedApps = toArr; else data.temporaryApps = toArr;
    
    await chrome.storage.local.set({ pinnedApps: data.pinnedApps, temporaryApps: data.temporaryApps });
    await this.loadData();
  }

  async _deleteApp(app, listType) {
    const data = await chrome.storage.local.get(['pinnedApps', 'temporaryApps']);
    let arr = listType === 'pinned' ? (data.pinnedApps || []) : (data.temporaryApps || []);
    arr = arr.filter(a => a.id !== app.id);
    
    if (listType === 'pinned') {
      await chrome.storage.local.set({ pinnedApps: arr });
    } else {
      await chrome.storage.local.set({ temporaryApps: arr });
    }
    await this.loadData();
  }
}
