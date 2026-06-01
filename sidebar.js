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
      
      <button class="dockit-action-btn" id="add-btn" style="margin-top: 0px;" data-theme-colors="foreground,secondary,accent">
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

    const inPageEl = document.createElement('div');
    inPageEl.className = 'dockit-in-page dockit-hidden';
    inPageEl.innerHTML = `
      <div class="dockit-in-page-header">
        <button class="dockit-action-btn" id="dockit-in-page-close" style="padding: 0; opacity: 1; margin: 0; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; color: var(--color-foreground);">
          <span class="icon-close"></span>
        </button>
        <span class="dockit-in-page-title" id="dockit-in-page-title"></span>
      </div>
      <div class="dockit-in-page-content" id="dockit-in-page-content"></div>
    `;
    this.element.appendChild(inPageEl);

    const closeBtn = inPageEl.querySelector('#dockit-in-page-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeSystemApp());
    }

    const addBtn = this.element.querySelector('#add-btn');
    const extBtn = this.element.querySelector('#ext-btn');
    const setBtn = this.element.querySelector('#set-btn');

    const handleSystemClick = (name) => {
      if (this.isSidePanel) {
        this.openSystemApp(name);
      } else {
        chrome.runtime.sendMessage({ type: 'OPEN_SIDEPANEL', systemApp: name });
      }
    };

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        if (addBtn.classList.contains('trash-mode')) return;
        handleSystemClick('Edit Apps');
      });
    }
    if (extBtn) {
      extBtn.addEventListener('click', () => handleSystemClick('Customization'));
    }
    if (setBtn) {
      setBtn.addEventListener('click', () => handleSystemClick('Settings'));
    }

    if (this.isSidePanel) {
      chrome.tabs.onActivated.addListener(() => this.refreshActiveSite());
      chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
        if (changeInfo.status === 'complete' || changeInfo.url) {
          this.refreshActiveSite();
        }
      });
    }

    await this.injectIcons();
    await this.loadData();
    this._setupMouseDrag();
    return this.element;
  }

  async refreshActiveSite() {
    const contentEl = this.element.querySelector('#dockit-in-page-content');
    const titleEl = this.element.querySelector('#dockit-in-page-title');
    if (!contentEl || !titleEl || titleEl.textContent !== 'Edit Apps') return;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && !tab.url.startsWith('chrome://')) {
        const urlObj = new URL(tab.url);
        let displayUrl = urlObj.hostname + urlObj.pathname;
        if (displayUrl.endsWith('/')) {
          displayUrl = displayUrl.slice(0, -1);
        }
        const title = tab.title || urlObj.hostname;
        const favIconUrl = tab.favIconUrl || `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
        const storageData = await chrome.storage.local.get(['lucideIcons', 'pinnedApps']);
        const pinIconSvg = (storageData.lucideIcons && storageData.lucideIcons['pin']) || 'Pin';
        const cleanPinIcon = `<div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; transform: rotate(45deg); pointer-events: none; color: currentColor;">${pinIconSvg}</div>`;
        const pinnedAppsInitial = storageData.pinnedApps || [];
        const isCurrentlyPinned = pinnedAppsInitial.some(app => app.url === tab.url);

        contentEl.innerHTML = `
          <div class="dockit-active-site-container" style="display: flex; align-items: center; background-color: var(--color-secondary); border-radius: 12px; padding: 12px; gap: 12px; margin-bottom: 20px; border: 1px solid var(--color-border);">
            <img class="dockit-active-site-favicon" src="${favIconUrl}" style="width: 32px; height: 32px; border-radius: 6px; flex-shrink: 0;" />
            <div class="dockit-active-site-info" style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center;">
              <div class="dockit-active-site-title" style="font-weight: 600; font-size: 14px; line-height: 1.15; word-break: break-word;">${title}</div>
              <div class="dockit-active-site-url" style="font-size: 12px; opacity: 0.6; line-height: 1.15; word-break: break-all; margin-top: 1px;">${displayUrl}</div>
            </div>
            <button class="dockit-pin-btn" style="background: transparent; border: none; width: 24px; height: 24px; cursor: pointer; flex-shrink: 0; transition: color 0.2s, opacity 0.2s; display: flex; align-items: center; justify-content: center; padding: 0;" title="Pin to Sidebar">
              ${cleanPinIcon}
            </button>
          </div>
          
          <div class="dockit-grid-title" style="font-weight: 600; font-size: 14px; margin-bottom: 12px; color: var(--color-foreground);">Pinned Apps</div>
          <div class="dockit-apps-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(56px, 1fr)); gap: 12px; margin-bottom: 24px; padding: 4px;">
            <!-- Pinned apps will be rendered here dynamically -->
          </div>
        `;
        
        const gridContainer = contentEl.querySelector('.dockit-apps-grid');
        if (gridContainer) {
          pinnedAppsInitial.forEach((app, index) => {
            const appEl = document.createElement('div');
            appEl.className = 'dockit-grid-app';
            appEl.dataset.id = app.id;
            appEl.dataset.index = index;
            appEl.title = app.title;
            appEl.style.cssText = 'width: 56px; height: 56px; background-color: transparent; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: grab; position: relative; transition: background-color 0.2s, box-shadow 0.2s; user-select: none;';
            appEl.innerHTML = `<img src="${app.iconUrl}" alt="${app.title}" style="width: 32px; height: 32px; pointer-events: none;" draggable="false" />`;

            appEl.addEventListener('mouseenter', () => {
              appEl.style.backgroundColor = 'var(--color-primary)';
            });
            appEl.addEventListener('mouseleave', () => {
              appEl.style.backgroundColor = 'transparent';
            });

            appEl.addEventListener('mousedown', (e) => {
              if (e.button !== 0) return;
              e.preventDefault();
              this._gridDragState = {
                app,
                el: appEl,
                startY: e.clientY,
                startX: e.clientX,
                didMove: false,
                ghost: null
              };
            });

            gridContainer.appendChild(appEl);
          });
        }
        
        const pinBtn = contentEl.querySelector('.dockit-pin-btn');
        if (pinBtn) {
          const updatePinState = (pinned) => {
            const svgEl = pinBtn.querySelector('svg');
            pinBtn.style.color = 'var(--color-primary)';
            if (pinned) {
              pinBtn.title = 'Remove Pinned Item';
              pinBtn.style.opacity = '0.7';
              if (svgEl) svgEl.style.fill = 'currentColor';
            } else {
              pinBtn.title = 'Pin to Sidebar';
              pinBtn.style.opacity = '1';
              if (svgEl) svgEl.style.fill = 'none';
            }
          };

          let activePinned = isCurrentlyPinned;
          updatePinState(activePinned);

          pinBtn.addEventListener('click', async () => {
            const data = await chrome.storage.local.get(['pinnedApps']);
            let pinnedList = data.pinnedApps || [];
            if (activePinned) {
              pinnedList = pinnedList.filter(app => app.url !== tab.url);
              await chrome.storage.local.set({ pinnedApps: pinnedList });
              activePinned = false;
            } else {
              if (!pinnedList.some(app => app.url === tab.url)) {
                pinnedList.push({
                  id: 'app_' + Date.now(),
                  url: tab.url,
                  title: title,
                  iconUrl: favIconUrl
                });
                await chrome.storage.local.set({ pinnedApps: pinnedList });
                activePinned = true;
              }
            }
            updatePinState(activePinned);
          });
        }
      } else {
        contentEl.innerHTML = `<div style="font-size: 14px; opacity: 0.8;">Internal websites cannot be pinned.</div>`;
      }
    } catch (err) {
      contentEl.innerHTML = `<div style="font-size: 14px; opacity: 0.8;">Welcome to Edit Apps. Open a site to pin it!</div>`;
    }
  }

  async openSystemApp(name) {
    const inPage = this.element.querySelector('.dockit-in-page');
    if (!inPage) return;
    const titleEl = this.element.querySelector('#dockit-in-page-title');
    const contentEl = this.element.querySelector('#dockit-in-page-content');
    if (titleEl) titleEl.textContent = name;
    if (contentEl) {
      if (name === 'Edit Apps') {
        contentEl.innerHTML = `<div style="font-size: 14px; opacity: 0.8;">Loading current site...</div>`;
        await this.refreshActiveSite();
      } else {
        contentEl.innerHTML = `<div style="font-size: 14px; opacity: 0.8;">Welcome to ${name}</div>`;
      }
    }
    inPage.classList.remove('dockit-hidden');
  }

  closeSystemApp() {
    const inPage = this.element.querySelector('.dockit-in-page');
    if (inPage) {
      inPage.classList.add('dockit-hidden');
    }
  }

  async injectIcons() {
    const data = await chrome.storage.local.get(['lucideIcons']);
    if (data.lucideIcons) {
      const plusIcon = this.element.querySelector('.icon-plus');
      if (plusIcon) plusIcon.outerHTML = data.lucideIcons['plus'];

      const extIcon = this.element.querySelector('.icon-puzzle');
      if (extIcon) extIcon.outerHTML = data.lucideIcons['shapes'];

      const setIcon = this.element.querySelector('.icon-settings');
      if (setIcon) setIcon.outerHTML = data.lucideIcons['settings'];

      const closeIcon = this.element.querySelector('.icon-close');
      if (closeIcon && data.lucideIcons['x']) closeIcon.outerHTML = data.lucideIcons['x'];

      this._trashIconSvg = data.lucideIcons['trash-2'];
      this._plusIconSvg = data.lucideIcons['plus'];
    }
  }

  async loadData() {
    const data = await chrome.storage.local.get(['pinnedApps', 'temporaryApps']);
    const pinnedApps = data.pinnedApps || [];
    const tempApps = data.temporaryApps || [];

    const pinnedSection = this.element.querySelector('#pinned-section');
    const tempSection = this.element.querySelector('#temp-section');
    const tempDivider = this.element.querySelector('#temp-divider');
    const pinnedDivider = this.element.querySelectorAll('.dockit-divider')[0];

    this._renderApps(pinnedSection, pinnedApps, 'pinned');
    this._renderApps(tempSection, tempApps, 'temp');

    if (pinnedDivider) {
      pinnedDivider.style.display = pinnedApps.length > 0 ? 'block' : 'none';
    }

    if (tempDivider) {
      tempDivider.style.display = tempApps.length > 0 ? 'block' : 'none';
    }
  }

  _renderApps(container, apps, listType) {
    if (!container) return;
    container.innerHTML = '';

    if (apps.length === 0) {
      const placeholder = document.createElement('div');
      placeholder.className = 'dockit-empty-placeholder';
      chrome.storage.local.get(['lucideIcons'], (data) => {
        if (data.lucideIcons) {
          const iconName = listType === 'pinned' ? 'pin' : 'clock-fading';
          const svgHtml = data.lucideIcons[iconName] || '';
          if (svgHtml) {
            placeholder.innerHTML = svgHtml;
            const svg = placeholder.querySelector('svg');
            if (svg) {
              svg.style.width = '16px';
              svg.style.height = '16px';
              svg.style.display = 'block';
            }
          }
        }
      });
      container.appendChild(placeholder);
      return;
    }
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
      if (this._dragState) {
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
      } else if (this._gridDragState) {
        const ds = this._gridDragState;

        //require 5px movement to begin the visual drag
        if (!ds.didMove && Math.abs(e.clientY - ds.startY) < 5 && Math.abs(e.clientX - ds.startX) < 5) return;

        if (!ds.didMove) {
          ds.didMove = true;
          ds.el.style.opacity = '0.5';

          //create floating ghost clone
          const ghost = ds.el.cloneNode(true);
          ghost.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 9999999;
            opacity: 0.85;
            width: 56px;
            height: 56px;
          `;
          document.body.appendChild(ghost);
          ds.ghost = ghost;
        }

        //position ghost at cursor
        if (ds.ghost) {
          ds.ghost.style.left = (e.clientX - 28) + 'px';
          ds.ghost.style.top = (e.clientY - 28) + 'px';
        }

        //highlight drop targets
        this._clearGridHighlights();
        const target = this._getGridDropTarget(e.clientX, e.clientY);
        if (target) {
          const half = target.rect.left + target.rect.width / 2;
          if (e.clientX < half) {
            target.el.style.boxShadow = '-3px 0 0 0 var(--color-primary)';
          } else {
            target.el.style.boxShadow = '3px 0 0 0 var(--color-primary)';
          }
        }
      }
    });

    root.addEventListener('mouseup', async (e) => {
      if (this._dragState) {
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
      } else if (this._gridDragState) {
        const ds = this._gridDragState;
        ds.el.style.opacity = '1';
        if (ds.ghost) ds.ghost.remove();
        
        const target = this._getGridDropTarget(e.clientX, e.clientY);
        this._clearGridHighlights();

        if (target && ds.didMove) {
          const half = target.rect.left + target.rect.width / 2;
          let targetIndex = parseInt(target.el.dataset.index, 10);
          if (e.clientX > half) {
            targetIndex++;
          }
          await this._moveGridApp(ds.app, targetIndex);
        }

        this._gridDragState = null;
      }
    });

    //cancel drag if mouse leaves the sidebar area
    root.addEventListener('mouseleave', (e) => {
      if (this._dragState && this._dragState.didMove) {
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
      } else if (this._gridDragState && this._gridDragState.didMove) {
        const ds = this._gridDragState;
        ds.el.style.opacity = '1';
        if (ds.ghost) ds.ghost.remove();
        this._clearGridHighlights();
        this._gridDragState = null;
      }
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
      let hasOtherApps = false;
      if (sec) {
        for (const child of sec.children) {
          if (child !== this._dragState.el && !child.classList.contains('dockit-empty-placeholder')) {
            hasOtherApps = true;
            break;
          }
        }
      }
      const isEmpty = !hasOtherApps;
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

  _getGridDropTarget(clientX, clientY) {
    let bestTarget = null;
    let minDistance = Infinity;
    const apps = this.element.querySelectorAll('.dockit-grid-app');
    for (const appEl of apps) {
      if (this._gridDragState && appEl === this._gridDragState.el) continue;
      const r = appEl.getBoundingClientRect();
      const centerX = r.left + r.width / 2;
      const centerY = r.top + r.height / 2;
      const distance = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));
      if (distance < minDistance) {
        minDistance = distance;
        bestTarget = { el: appEl, rect: r };
      }
    }
    if (minDistance < 60) {
      return bestTarget;
    }
    return null;
  }

  _clearGridHighlights() {
    const apps = this.element.querySelectorAll('.dockit-grid-app');
    apps.forEach(el => {
      el.style.boxShadow = '';
    });
  }

  async _moveGridApp(app, targetIndex) {
    const data = await chrome.storage.local.get(['pinnedApps']);
    let pinnedApps = data.pinnedApps || [];
    const origIndex = pinnedApps.findIndex(a => a.id === app.id);
    if (origIndex === -1) return;
    pinnedApps.splice(origIndex, 1);
    if (targetIndex > origIndex) {
      targetIndex--;
    }
    pinnedApps.splice(targetIndex, 0, app);
    await chrome.storage.local.set({ pinnedApps });
    await this.refreshActiveSite();
  }
}
