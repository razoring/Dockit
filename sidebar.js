// sidebar.js

//global i18n default dictionary
const I18N_STRINGS_DEFAULT = {
  'edit_apps': 'Edit Apps',
  'customization': 'Customization',
  'settings': 'Settings',
  'appearance': 'Appearance',
  'functionality': 'Functionality',
  'blocklists': 'Blocklists',
  'debug': 'Debug',
  'language': 'Language',
  'enable_taper': 'Enable Taper',
  'enable_taper_desc': 'Enable visual sidebar edge tapering.',
  'show_url_bar': 'Show URL Bar',
  'show_url_bar_desc': 'Display URL and navigation controls in side panels.',
  'mobile_default_view': 'Mobile Default View',
  'mobile_default_view_desc': 'Open apps using the mobile site by default.',
  'auto_hide': 'Auto-hide Sidepanel',
  'auto_hide_desc': 'Automatically hide side panels when focus is lost.',
  'disable_sidebar': 'Disable Sidebar',
  'disable_sidebar_desc': 'Pages where the sidebar will be completely disabled.',
  'force_auto_hide': 'Force Auto-hide',
  'force_auto_hide_desc': 'Pages that will always force auto-hide behavior.',
  'cloud_sync': 'Cloud Sync',
  'cloud_sync_desc': 'Force instant synchronization of configuration to the cloud.',
  'clear_cache': 'Clear Cache',
  'clear_cache_desc': 'Purge cached asset resources and system pre-fetches.',
  'clear_data': 'Clear Data',
  'clear_data_desc': 'Clear all extension storage and reset default states.',
  'select_language': 'Select Language',
  'select_language_desc': 'Change the interface language of settings.',
  'search_placeholder': 'Search...',
  'collapse_all': 'Collapse All',
  'expand_all': 'Expand All',
  'add_domain_placeholder': 'Add domain or URL...',
  'add_btn': 'Add',
  'sync_now': 'Sync Now',
  'pinned_apps': 'Pinned Apps',
  'search_title': 'Search',
  'pin_to_sidebar': 'Pin to Sidebar',
  'remove_pinned': 'Remove Pinned Item',
  'no_pinned_apps': 'No pinned apps yet.',
  'pin_hint': 'Use the pin icon above to pin this site!',
  'drag_delete': 'Drag outside to delete',
  'translating': 'Translating...'
};

class DockitSidebar {
  constructor(isSidePanel = false) {
    this.isSidePanel = isSidePanel;
    this.element = document.createElement('div');
    this.element.className = 'dockit-sidebar';
    this.element.dataset.themeColors = 'background,border';
    this._dragState = null;
    this._inMemoryUrls = [];
    this._isInPageOpen = false;
    this._i18n = { ...I18N_STRINGS_DEFAULT };
  }

  async render() {
    this.element.innerHTML = `
      <div class="dockit-taper-top"></div>
      <div class="dockit-taper-bottom"></div>
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
        if (!chrome.runtime?.id) return;
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
    if (!contentEl || !titleEl || titleEl.dataset.appName !== 'Edit Apps') return;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && !tab.url.startsWith('chrome://')) {
        const urlObj = new URL(tab.url);
        let displayUrl = urlObj.hostname + urlObj.pathname;
        if (displayUrl.endsWith('/')) {
          displayUrl = displayUrl.slice(0, -1);
        }
        const _getCleanTitleFromUrl = (urlStr) => {
          try {
            const u = new URL(urlStr);
            const host = u.hostname.replace('www.', '');
            const mappings = {
              'youtube.com': 'YouTube',
              'google.com': 'Google',
              'github.com': 'GitHub',
              'wikipedia.org': 'Wikipedia',
              'reddit.com': 'Reddit',
              'amazon.com': 'Amazon',
              'twitter.com': 'Twitter',
              'netflix.com': 'Netflix',
              'chatgpt.com': 'ChatGPT',
              'stackoverflow.com': 'Stack Overflow',
              'linkedin.com': 'LinkedIn',
              'microsoft.com': 'Microsoft',
              'gmail.com': 'Gmail'
            };
            if (mappings[host.toLowerCase()]) {
              return mappings[host.toLowerCase()];
            }
            const parts = host.split('.');
            if (parts.length > 0) {
              const main = parts[0];
              return main.charAt(0).toUpperCase() + main.slice(1);
            }
            return host;
          } catch (e) {
            return 'Webpage';
          }
        };
        const title = _getCleanTitleFromUrl(tab.url);
        const favIconUrl = tab.favIconUrl || `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
        const storageData = await chrome.storage.local.get(['lucideIcons', 'pinnedApps']);

        //i18n helper for edit-apps panel
        const _t = (key) => (this._i18n && this._i18n[key]) || key;
        const pinIconSvg = (storageData.lucideIcons && storageData.lucideIcons['pin']) || 'Pin';
        const searchIconSvg = (storageData.lucideIcons && storageData.lucideIcons['search']) || `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
        const plusIconSvg = (storageData.lucideIcons && storageData.lucideIcons['plus']) || `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
        const trashIconSvg = (storageData.lucideIcons && storageData.lucideIcons['trash-2']) || `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
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
          
          <div class="dockit-grid-card" style="position: relative; z-index: 10001; border: 1px solid var(--color-border); border-radius: 12px; background-color: var(--color-secondary); padding: 12px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 12px;">
            <div class="dockit-grid-title" style="font-weight: 600; font-size: 14px; color: var(--color-foreground);">${_t('pinned_apps')}</div>
            <div class="dockit-apps-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(56px, 1fr)); gap: 12px;">
              <!-- Pinned apps will be rendered here dynamically -->
            </div>
          </div>

          <div class="dockit-search-card" style="border: 1px solid var(--color-border); border-radius: 12px; background-color: var(--color-background); padding: 12px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 12px; position: relative;">
            <div class="dockit-search-title" style="font-weight: 600; font-size: 14px; color: var(--color-foreground);">${_t('search_title')}</div>
            <div class="dockit-settings-search-wrapper dockit-search-bar-container">
              ${searchIconSvg}
              <input class="dockit-settings-search-input dockit-search-input" type="text" placeholder="${_t('search_placeholder')}" />
            </div>
            <div class="dockit-suggestions-dropdown" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; background-color: var(--color-secondary); border: 1px solid var(--color-border); border-radius: 8px; z-index: 1000; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); max-height: 250px; overflow-y: auto; padding: 6px 0;"></div>
          </div>

          <!-- drag-to-delete trash overlay -->
          <div class="dockit-trash-overlay" id="dockit-grid-trash-overlay">
            <div class="dockit-trash-overlay-icon">
              ${trashIconSvg}
            </div>
            <div class="dockit-trash-overlay-text">${_t('drag_delete')}</div>
          </div>
        `;

        const gridContainer = contentEl.querySelector('.dockit-apps-grid');
        if (gridContainer) {
          if (pinnedAppsInitial.length === 0) {
            gridContainer.style.display = 'block';
            gridContainer.innerHTML = `
              <div style="font-size: 13px; opacity: 0.5; text-align: center; padding: 20px 10px; line-height: 1.4; border: 1.5px dashed var(--color-border); border-radius: 8px;">
                ${_t('no_pinned_apps')}<br/>${_t('pin_hint')}
              </div>
            `;
          } else {
            gridContainer.style.display = 'grid';
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
        }

        const pinBtn = contentEl.querySelector('.dockit-pin-btn');
        if (pinBtn) {
          const updatePinState = (pinned) => {
            const svgEl = pinBtn.querySelector('svg');
            pinBtn.style.color = 'var(--color-primary)';
            if (pinned) {
              pinBtn.title = _t('remove_pinned');
              pinBtn.style.opacity = '0.7';
              if (svgEl) svgEl.style.fill = 'currentColor';
            } else {
              pinBtn.title = _t('pin_to_sidebar');
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

        const searchInput = contentEl.querySelector('.dockit-search-input');
        const dropdown = contentEl.querySelector('.dockit-suggestions-dropdown');

        if (searchInput && dropdown) {
          //helper to format URL cleanly
          const _formatUrl = (urlStr) => {
            try {
              const u = new URL(urlStr);
              return u.hostname + u.pathname + u.search;
            } catch (e) {
              return urlStr;
            }
          };

          //helper to pin a URL and update UI
          const _pinApp = async (title, url, iconUrl) => {
            const data = await chrome.storage.local.get(['pinnedApps']);
            let pinnedList = data.pinnedApps || [];
            if (!pinnedList.some(app => app.url === url)) {
              pinnedList.push({
                id: 'app_' + Date.now(),
                url: url,
                title: title,
                iconUrl: iconUrl
              });
              await chrome.storage.local.set({ pinnedApps: pinnedList });
            }
            searchInput.value = '';
            dropdown.style.display = 'none';
          };

          //helper to get most visited sites
          const _getTopSites = () => {
            return new Promise((resolve) => {
              if (chrome.topSites && chrome.topSites.get) {
                chrome.topSites.get((sites) => {
                  resolve(sites || []);
                });
              } else {
                resolve([]);
              }
            });
          };

          //render suggestions array
          const _renderSuggestions = (items) => {
            if (items.length === 0) {
              dropdown.style.display = 'none';
              return;
            }
            dropdown.innerHTML = '';
            items.forEach(item => {
              const row = document.createElement('div');
              row.className = 'dockit-suggestion-row';
              row.style.cssText = 'display: flex; align-items: center; padding: 8px 12px; gap: 10px; cursor: pointer; transition: background-color 0.15s; min-height: 48px;';

              row.innerHTML = `
                <img src="${item.iconUrl}" style="width: 24px; height: 24px; border-radius: 4px; flex-shrink: 0;" onerror="this.src='https://www.google.com/s2/favicons?domain=google.com&sz=32'" />
                <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 2px;">
                  <div style="font-weight: 500; font-size: 13px; color: var(--color-foreground); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.2;">${item.title}</div>
                  <div style="font-size: 11px; color: var(--color-foreground); opacity: 0.5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.2;">${_formatUrl(item.url)}</div>
                </div>
                <div class="dockit-suggestion-plus" style="width: 20px; height: 20px; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--color-primary); flex-shrink: 0;">
                  ${plusIconSvg}
                </div>
              `;

              row.addEventListener('mouseenter', () => {
                row.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              });
              row.addEventListener('mouseleave', () => {
                row.style.backgroundColor = 'transparent';
              });

              row.addEventListener('click', () => {
                _pinApp(item.title, item.url, item.iconUrl);
              });

              dropdown.appendChild(row);
            });
            dropdown.style.display = 'block';
          };

          //update suggestions based on input
          const _updateSuggestions = async () => {
            const query = searchInput.value.trim();
            const suggestions = [];

            //1. add current site suggestion
            const currentTabUrl = tab.url;
            const currentTabTitle = tab.title || new URL(currentTabUrl).hostname;
            const currentTabIcon = tab.favIconUrl || `https://www.google.com/s2/favicons?domain=${new URL(currentTabUrl).hostname}&sz=32`;

            if (!query) {
              //add current site as the first option without label
              suggestions.push({
                title: currentTabTitle,
                url: currentTabUrl,
                iconUrl: currentTabIcon
              });

              //add top sites
              const topSitesList = await _getTopSites();
              topSitesList.slice(0, 5).forEach(site => {
                suggestions.push({
                  title: site.title || new URL(site.url).hostname,
                  url: site.url,
                  iconUrl: `https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=32`
                });
              });

              _renderSuggestions(suggestions);
            } else {
              //if query is a valid URL or looks like one
              const isUrl = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?(\?.*)?$/.test(query);
              if (isUrl) {
                let cleanUrl = query;
                if (!/^https?:\/\//i.test(query)) {
                  cleanUrl = 'https://' + query;
                }
                try {
                  const urlHost = new URL(cleanUrl).hostname;
                  suggestions.push({
                    title: urlHost,
                    url: cleanUrl,
                    iconUrl: `https://www.google.com/s2/favicons?domain=${urlHost}&sz=32`
                  });
                } catch (e) { }
              }

              //generate direct website suggestion from the query itself
              const lowerQuery = query.toLowerCase();
              if (!isUrl && !lowerQuery.includes(' ')) {
                const directTitle = query.charAt(0).toUpperCase() + query.slice(1);
                const directUrl = `https://www.${lowerQuery}.com`;
                suggestions.push({
                  title: directTitle,
                  url: directUrl,
                  iconUrl: `https://www.google.com/s2/favicons?domain=${lowerQuery}.com&sz=32`
                });
              }

              //match topSites against query
              const topSitesList = await _getTopSites();
              topSitesList.forEach(site => {
                const siteTitle = site.title || '';
                const siteUrl = site.url || '';
                if (siteTitle.toLowerCase().includes(lowerQuery) || siteUrl.toLowerCase().includes(lowerQuery)) {
                  if (!suggestions.some(s => s.url === site.url)) {
                    suggestions.push({
                      title: site.title || new URL(site.url).hostname,
                      url: site.url,
                      iconUrl: `https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=32`
                    });
                  }
                }
              });

              //match popular sites list
              const POPULAR_SITES = [
                { title: 'Google', url: 'https://www.google.com' },
                { title: 'YouTube', url: 'https://www.youtube.com' },
                { title: 'Facebook', url: 'https://www.facebook.com' },
                { title: 'Wikipedia', url: 'https://www.wikipedia.org' },
                { title: 'GitHub', url: 'https://github.com' },
                { title: 'Reddit', url: 'https://www.reddit.com' },
                { title: 'Amazon', url: 'https://www.amazon.com' },
                { title: 'Twitter', url: 'https://twitter.com' },
                { title: 'Netflix', url: 'https://www.netflix.com' },
                { title: 'ChatGPT', url: 'https://chatgpt.com' },
                { title: 'Stack Overflow', url: 'https://stackoverflow.com' },
                { title: 'LinkedIn', url: 'https://www.linkedin.com' },
                { title: 'Microsoft', url: 'https://www.microsoft.com' },
                { title: 'Google Drive', url: 'https://drive.google.com' },
                { title: 'Gmail', url: 'https://mail.google.com' }
              ];

              POPULAR_SITES.forEach(site => {
                if (site.title.toLowerCase().includes(lowerQuery) || site.url.toLowerCase().includes(lowerQuery)) {
                  if (!suggestions.some(s => s.url === site.url)) {
                    suggestions.push({
                      title: site.title,
                      url: site.url,
                      iconUrl: `https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=32`
                    });
                  }
                }
              });

              _renderSuggestions(suggestions.slice(0, 8));
            }
          };

          searchInput.addEventListener('focus', _updateSuggestions);
          searchInput.addEventListener('input', _updateSuggestions);

          //handle Enter key directly in input
          searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              const val = searchInput.value.trim();
              if (val) {
                let targetUrl = val;
                if (!/^https?:\/\//i.test(val)) {
                  targetUrl = 'https://' + val;
                }
                try {
                  const urlObj = new URL(targetUrl);
                  _pinApp(urlObj.hostname, targetUrl, `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`);
                } catch (err) {
                  //fallback if not a valid url, pin as google search query
                  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(val)}`;
                  _pinApp(val, searchUrl, 'https://www.google.com/s2/favicons?domain=google.com&sz=32');
                }
              }
            }
          });

          //close dropdown when clicking outside
          document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
              dropdown.style.display = 'none';
            }
          });
        }
      } else {
        contentEl.innerHTML = `<div style="font-size: 14px; opacity: 0.8;">Internal websites cannot be pinned.</div>`;
      }
    } catch (err) {
      contentEl.innerHTML = `<div style="font-size: 14px; opacity: 0.8;">Welcome to Edit Apps. Open a site to pin it!</div>`;
    }
  }

  _getTranslatedAppName(name) {
    const defaultStrings = {
      'edit_apps': 'Edit Apps',
      'customization': 'Customization',
      'settings': 'Settings'
    };
    const t = (key) => (this._i18n && this._i18n[key]) || defaultStrings[key] || key;
    if (name === 'Edit Apps') return t('edit_apps');
    if (name === 'Customization') return t('customization');
    if (name === 'Settings') return t('settings');
    return name;
  }

  async openSystemApp(name) {
    const inPage = this.element.querySelector('.dockit-in-page');
    if (!inPage) return;
    const titleEl = this.element.querySelector('#dockit-in-page-title');
    const contentEl = this.element.querySelector('#dockit-in-page-content');
    if (titleEl) {
      titleEl.dataset.appName = name;
      titleEl.textContent = this._getTranslatedAppName(name);
    }
    if (contentEl) {
      if (name === 'Edit Apps') {
        contentEl.innerHTML = `<div style="font-size: 14px; opacity: 0.8;">Loading current site...</div>`;
        await this.refreshActiveSite();
      } else if (name === 'Settings') {
        contentEl.innerHTML = `<div style="font-size: 14px; opacity: 0.8;">Loading settings...</div>`;
        await this._renderSettings();
      } else {
        contentEl.innerHTML = `<div style="font-size: 14px; opacity: 0.8;">Welcome to ${name}</div>`;
      }
    }
    inPage.classList.remove('dockit-hidden');
    this._updateSidebarVisibility();
  }

  closeSystemApp() {
    const inPage = this.element.querySelector('.dockit-in-page');
    if (inPage) {
      inPage.classList.add('dockit-hidden');
      this._updateSidebarVisibility();
    }
    if (this.isSidePanel && this._updatePlaceholders) {
      chrome.tabs.onActivated.removeListener(this._updatePlaceholders);
      chrome.tabs.onUpdated.removeListener(this._updatePlaceholders);
    }
  }

  _updatePlaceholders = async () => {
    let newPlaceholder = 'Add domain or URL...';
    try {
      if (this.isSidePanel) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
          const u = new URL(tab.url);
          if (u.protocol === 'chrome:' || u.protocol === 'edge:' || u.protocol === 'about:') {
            newPlaceholder = u.protocol + '//' + u.host + (u.pathname === '/' ? '' : u.pathname);
          } else {
            newPlaceholder = u.host.replace(/^www\./, '') + (u.pathname === '/' ? '' : u.pathname);
          }
        }
      } else {
        newPlaceholder = window.location.host.replace(/^www\./, '') + (window.location.pathname === '/' ? '' : window.location.pathname);
      }
    } catch (e) { }

    if (this.element) {
      const inputs = this.element.querySelectorAll('.dockit-settings-list-input');
      inputs.forEach(input => {
        if (!input.value) input.placeholder = newPlaceholder;
      });
    }
  };

  _updateSidebarVisibility() {
    const inPage = this.element.querySelector('.dockit-in-page');
    // Account for false-positives: rely on the actual DOM state rather than any memory state variables
    const isActuallyOpen = inPage && !inPage.classList.contains('dockit-hidden');

    if (isActuallyOpen) {
      this.element.classList.add('dockit-sidebar-hidden');
    } else {
      this.element.classList.remove('dockit-sidebar-hidden');
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
    const data = await chrome.storage.local.get(['pinnedApps', 'temporaryApps', 'dockitEnableTaper']);
    const pinnedApps = data.pinnedApps || [];
    const tempApps = data.temporaryApps || [];

    if (data.dockitEnableTaper) {
      this.element.classList.add('dockit-tapered');
    } else {
      this.element.classList.remove('dockit-tapered');
    }

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
      el.dataset.url = app.url;
      el.title = app.title;
      el.innerHTML = `<img src="${app.iconUrl}" alt="${app.title}" draggable="false" />`;

      //apply reactive loaded vs unloaded opacities based on in-page memory indicators
      if (this._isInPageOpen) {
        if (this._inMemoryUrls && this._inMemoryUrls.includes(app.url)) {
          el.style.opacity = '1';
        } else {
          el.style.opacity = '0.7';
        }
      } else {
        el.style.opacity = '1';
      }

      //click to navigate
      el.addEventListener('click', (e) => {
        if (this._dragState && this._dragState.didMove) return;
        if (this.isSidePanel) {
          document.dispatchEvent(new CustomEvent('dockit-navigate', { detail: app.url }));
        } else {
          if (!chrome.runtime?.id) return;
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

  setInMemoryUrls(urls, isInPageOpen) {
    this._inMemoryUrls = urls || [];
    this._isInPageOpen = isInPageOpen || false;
    this._updateSidebarVisibility();

    const apps = this.element.querySelectorAll('.dockit-app');
    apps.forEach(el => {
      const url = el.dataset.url;
      if (this._isInPageOpen) {
        if (this._inMemoryUrls.includes(url)) {
          el.style.opacity = '1';
        } else {
          el.style.opacity = '0.7';
        }
      } else {
        el.style.opacity = '1';
      }
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

        //require 5px movement to begin drag
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

        //check boundary and toggle overlay
        const gridCard = this.element.querySelector('.dockit-grid-card');
        let isOutside = false;
        if (gridCard) {
          const rect = gridCard.getBoundingClientRect();
          isOutside = (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          );
        }

        const trashOverlay = this.element.querySelector('#dockit-grid-trash-overlay');
        if (trashOverlay) {
          if (isOutside) {
            trashOverlay.classList.add('is-active');
          } else {
            trashOverlay.classList.remove('is-active');
          }
        }

        //highlight drop targets only when inside
        this._clearGridHighlights();
        if (!isOutside) {
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
      }
    });

    root.addEventListener('mouseup', async (e) => {
      if (this._dragState) {
        const ds = this._dragState;

        if (!ds.didMove) {
          this._dragState = null;
          return;
        }

        //determine drop target before cleaning up visuals
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

        const trashOverlay = this.element.querySelector('#dockit-grid-trash-overlay');
        if (trashOverlay) {
          trashOverlay.classList.remove('is-active');
        }

        //check boundary for deleting pinned app
        const gridCard = this.element.querySelector('.dockit-grid-card');
        let isOutside = false;
        if (gridCard) {
          const rect = gridCard.getBoundingClientRect();
          isOutside = (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          );
        }

        if (isOutside && ds.didMove) {
          await this._deleteGridApp(ds.app);
        } else {
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
        }

        this._gridDragState = null;
      }
    });

    //cancel drag if mouse leaves sidebar
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
        const trashOverlay = this.element.querySelector('#dockit-grid-trash-overlay');
        if (trashOverlay) {
          trashOverlay.classList.remove('is-active');
        }
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

  async _deleteGridApp(app) {
    const data = await chrome.storage.local.get(['pinnedApps']);
    let pinnedApps = data.pinnedApps || [];
    pinnedApps = pinnedApps.filter(a => a.id !== app.id);
    await chrome.storage.local.set({ pinnedApps });
    await this.refreshActiveSite();
    await this.loadData();
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
    await this.loadData();
  }

  async _renderSettings() {
    const contentEl = this.element.querySelector('#dockit-in-page-content');
    if (!contentEl) return;

    //retrieve icons
    const storageData = await chrome.storage.local.get(['lucideIcons']);
    const searchIconSvg = (storageData.lucideIcons && storageData.lucideIcons['search']) || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
    const chevronDownSvg = (storageData.lucideIcons && storageData.lucideIcons['chevron-down']) || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
    const chevronUpSvg = (storageData.lucideIcons && storageData.lucideIcons['chevron-up']) || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
    const xIconSvg = (storageData.lucideIcons && storageData.lucideIcons['x']) || `<svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    //default seed lists
    const storageLists = await chrome.storage.local.get([
      'dockitDisableSidebarList',
      'dockitForceAutohideList',
      'dockitForceViewList',
      'dockitMobileDefault'
    ]);
    const disableSidebarList = storageLists.dockitDisableSidebarList || DOCKIT_DEFAULTS.disableSidebarList;
    const forceAutohideList = storageLists.dockitForceAutohideList || DOCKIT_DEFAULTS.forceAutohideList;
    const forceViewList = storageLists.dockitForceViewList || DOCKIT_DEFAULTS.forceViewList;
    const isMobileDefault = storageLists.dockitMobileDefault !== undefined ? storageLists.dockitMobileDefault : DOCKIT_DEFAULTS.mobileDefault;
    const forceViewTitle = isMobileDefault ? 'Force Desktop View' : 'Force Mobile View';
    const forceViewDesc = isMobileDefault ? 'Pages that will always force desktop view.' : 'Pages that will always force mobile view.';

    let currentSitePlaceholder = 'Add domain or URL...';
    try {
      if (this.isSidePanel) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
          const u = new URL(tab.url);
          if (u.protocol === 'chrome:' || u.protocol === 'edge:' || u.protocol === 'about:') {
            currentSitePlaceholder = u.protocol + '//' + u.host + (u.pathname === '/' ? '' : u.pathname);
          } else {
            currentSitePlaceholder = u.host.replace(/^www\./, '') + (u.pathname === '/' ? '' : u.pathname);
          }
        }
      } else {
        currentSitePlaceholder = window.location.host.replace(/^www\./, '') + (window.location.pathname === '/' ? '' : window.location.pathname);
      }
    } catch (e) { }

    if (this.isSidePanel) {
      chrome.tabs.onActivated.addListener(this._updatePlaceholders);
      chrome.tabs.onUpdated.addListener(this._updatePlaceholders);
    }

    //render layout
    contentEl.innerHTML = `
      <div class="dockit-settings-container">
        <div class="dockit-settings-toolbar">
          <div class="dockit-settings-search-wrapper">
            ${searchIconSvg}
            <input class="dockit-settings-search-input" id="dockit-settings-search" type="text" placeholder="Search..." />
          </div>
          <label class="dockit-settings-expand-all-wrapper" id="dockit-settings-toggle-all-label">
            <input class="dockit-settings-expand-all-input" id="dockit-settings-toggle-all" type="checkbox" checked />
            <span class="dockit-settings-expand-all-label" id="dockit-settings-toggle-all-text">Collapse All</span>
          </label>
        </div>

        <div class="dockit-settings-list">
          <!-- Language Category -->
          <div class="dockit-settings-category" data-category="language">
            <div class="dockit-settings-category-header">
              <span class="dockit-settings-category-title">Language</span>
              <span class="dockit-settings-category-chevron">${chevronUpSvg}</span>
            </div>
            <div class="dockit-settings-category-content">
              <div class="dockit-settings-item" data-title="select language" data-desc="change the interface language of settings">
                <div class="dockit-settings-item-info">
                  <span class="dockit-settings-item-title">Select Language</span>
                  <span class="dockit-settings-item-desc">Change the interface language of settings.</span>
                </div>
                <div class="dockit-settings-item-control" style="width: 140px; position: relative;">
                  <div class="dockit-settings-language-picker" id="dockit-lang-picker">
                    <div class="dockit-language-selected">
                      <img class="dockit-flag-icon" src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f1fa-1f1f8.svg" />
                      <span>English</span>
                    </div>
                    <div class="dockit-language-dropdown">
                      <div class="dockit-language-option is-selected" data-lang="en">
                        <img class="dockit-flag-icon" src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f1fa-1f1f8.svg" />
                        <span>English</span>
                      </div>
                      <div class="dockit-language-option" data-lang="es">
                        <img class="dockit-flag-icon" src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f1ea-1f1f8.svg" />
                        <span>Español</span>
                      </div>
                      <div class="dockit-language-option" data-lang="fr">
                        <img class="dockit-flag-icon" src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f1eb-1f1f7.svg" />
                        <span>Français</span>
                      </div>
                      <div class="dockit-language-option" data-lang="de">
                        <img class="dockit-flag-icon" src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f1e9-1f1ea.svg" />
                        <span>Deutsch</span>
                      </div>
                      <div class="dockit-language-option" data-lang="ja">
                        <img class="dockit-flag-icon" src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f1ef-1f1f5.svg" />
                        <span>日本語</span>
                      </div>
                      <div class="dockit-language-option" data-lang="zh">
                        <img class="dockit-flag-icon" src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f1e8-1f1f3.svg" />
                        <span>中文</span>
                      </div>
                    </div>
                  </div>
                  <div class="dockit-translation-loading" id="dockit-translation-status">Translating...</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Appearance Category -->
          <div class="dockit-settings-category" data-category="appearance">
            <div class="dockit-settings-category-header">
              <span class="dockit-settings-category-title">Appearance</span>
              <span class="dockit-settings-category-chevron">${chevronUpSvg}</span>
            </div>
            <div class="dockit-settings-category-content">
              <div class="dockit-settings-item" data-title="enable taper" data-desc="enable rounded edges along the sidebar">
                <div class="dockit-settings-item-info">
                  <span class="dockit-settings-item-title">Enable Taper</span>
                  <span class="dockit-settings-item-desc">Enable rounded edges along the sidebar.</span>
                </div>
                <div class="dockit-settings-item-control">
                  <label class="dockit-ios-switch">
                    <input type="checkbox" id="setting-appearance-taper" />
                    <span class="dockit-ios-slider"></span>
                  </label>
                </div>
              </div>
              <div class="dockit-settings-item" data-title="show url bar" data-desc="display url and navigation controls in side panels">
                <div class="dockit-settings-item-info">
                  <span class="dockit-settings-item-title">Show URL Bar</span>
                  <span class="dockit-settings-item-desc">Display URL and navigation controls in side panels.</span>
                </div>
                <div class="dockit-settings-item-control">
                  <label class="dockit-ios-switch">
                    <input type="checkbox" id="setting-appearance-urlbar" checked />
                    <span class="dockit-ios-slider"></span>
                  </label>
                </div>
              </div>
              <div class="dockit-settings-item" data-title="mobile default view" data-desc="open apps using the mobile site by default">
                <div class="dockit-settings-item-info">
                  <span class="dockit-settings-item-title">Mobile Default View</span>
                  <span class="dockit-settings-item-desc">Open apps using the mobile site by default.</span>
                </div>
                <div class="dockit-settings-item-control">
                  <label class="dockit-ios-switch">
                    <input type="checkbox" id="dockit-settings-mobiledefault" checked />
                    <span class="dockit-ios-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Functionality Category -->
          <div class="dockit-settings-category" data-category="functionality">
            <div class="dockit-settings-category-header">
              <span class="dockit-settings-category-title">Functionality</span>
              <span class="dockit-settings-category-chevron">${chevronUpSvg}</span>
            </div>
            <div class="dockit-settings-category-content">
              <div class="dockit-settings-item" data-title="auto-hide sidepanel" data-desc="automatically hide side panels when focus is lost">
                <div class="dockit-settings-item-info">
                  <span class="dockit-settings-item-title">Auto-hide Sidebar</span>
                  <span class="dockit-settings-item-desc">Automatically hide side panels when focus is lost.</span>
                </div>
                <div class="dockit-settings-item-control">
                  <label class="dockit-ios-switch">
                    <input type="checkbox" id="setting-functionality-autohide" />
                    <span class="dockit-ios-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Blocklists Category -->
          <div class="dockit-settings-category" data-category="blocklists">
            <div class="dockit-settings-category-header">
              <span class="dockit-settings-category-title">Blocklists</span>
              <span class="dockit-settings-category-chevron">${chevronUpSvg}</span>
            </div>
            <div class="dockit-settings-category-content">
              <!-- Disable Sidebar -->
              <div class="dockit-settings-item" data-title="disable sidebar" data-desc="pages where the sidebar will be completely disabled">
                <div class="dockit-settings-list-wrapper">
                  <div class="dockit-settings-item-info">
                    <span class="dockit-settings-item-title">Disable Sidebar</span>
                    <span class="dockit-settings-item-desc">Pages where the sidebar will be completely disabled.</span>
                  </div>
                  <div class="dockit-settings-list-input-container">
                    <input class="dockit-settings-list-input" type="text" placeholder="${currentSitePlaceholder}" id="input-blocklist-disable" />
                    <button class="dockit-settings-list-add-btn" data-target="blocklist-disable">Add</button>
                  </div>
                  <div class="dockit-settings-tags" id="tags-blocklist-disable"></div>
                </div>
              </div>
              <!-- Force Auto-hide -->
              <div class="dockit-settings-item" data-title="force auto-hide" data-desc="pages that will always force auto-hide behavior">
                <div class="dockit-settings-list-wrapper">
                  <div class="dockit-settings-item-info">
                    <span class="dockit-settings-item-title">Force Auto-hide</span>
                    <span class="dockit-settings-item-desc">Pages that will always force auto-hide behavior.</span>
                  </div>
                  <div class="dockit-settings-list-input-container">
                    <input class="dockit-settings-list-input" type="text" placeholder="${currentSitePlaceholder}" id="input-blocklist-autohide" />
                    <button class="dockit-settings-list-add-btn" data-target="blocklist-autohide">Add</button>
                  </div>
                  <div class="dockit-settings-tags" id="tags-blocklist-autohide"></div>
                </div>
              </div>
              <!-- Force View -->
              <div class="dockit-settings-item" data-title="force opposite view" data-desc="pages that will force the opposite of the default view">
                <div class="dockit-settings-list-wrapper">
                  <div class="dockit-settings-item-info">
                    <span class="dockit-settings-item-title" id="title-blocklist-forceview">${forceViewTitle}</span>
                    <span class="dockit-settings-item-desc" id="desc-blocklist-forceview">${forceViewDesc}</span>
                  </div>
                  <div class="dockit-settings-list-input-container">
                    <input class="dockit-settings-list-input" type="text" placeholder="${currentSitePlaceholder}" id="input-blocklist-forceview" />
                    <button class="dockit-settings-list-add-btn" data-target="blocklist-forceview">Add</button>
                  </div>
                  <div class="dockit-settings-tags" id="tags-blocklist-forceview"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Debug Category -->
          <div class="dockit-settings-category" data-category="debug">
            <div class="dockit-settings-category-header">
              <span class="dockit-settings-category-title">Debug</span>
              <span class="dockit-settings-category-chevron">${chevronUpSvg}</span>
            </div>
            <div class="dockit-settings-category-content">
              <div class="dockit-settings-item" data-title="cloud sync" data-desc="force instant synchronization of configuration to the cloud">
                <div class="dockit-settings-item-info">
                  <span class="dockit-settings-item-title">Cloud Sync</span>
                  <span class="dockit-settings-item-desc">Force instant synchronization of configuration to the cloud.</span>
                </div>
                <div class="dockit-settings-item-control" style="width: 100px;">
                  <button class="dockit-settings-btn" id="btn-debug-sync">Sync Now</button>
                </div>
              </div>
              <div class="dockit-settings-item" data-title="clear cache" data-desc="purge cached asset resources and system pre-fetches">
                <div class="dockit-settings-item-info">
                  <span class="dockit-settings-item-title">Clear Cache</span>
                  <span class="dockit-settings-item-desc">Purge cached asset resources and system pre-fetches.</span>
                </div>
                <div class="dockit-settings-item-control" style="width: 100px;">
                  <button class="dockit-settings-btn" id="btn-debug-cache">Clear Cache</button>
                </div>
              </div>
              <div class="dockit-settings-item" data-title="clear data" data-desc="clear all extension storage and reset default states">
                <div class="dockit-settings-item-info">
                  <span class="dockit-settings-item-title">Clear Data</span>
                  <span class="dockit-settings-item-desc">Clear all extension storage and reset default states.</span>
                </div>
                <div class="dockit-settings-item-control" style="width: 100px;">
                  <button class="dockit-settings-btn accent" id="btn-debug-clear">Clear Data</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    //helper to render tags list
    const _renderTags = (containerId, tagsArray) => {
      const container = contentEl.querySelector(`#${containerId}`);
      if (!container) return;
      container.innerHTML = '';
      tagsArray.forEach((tag, idx) => {
        const tagEl = document.createElement('div');
        tagEl.className = 'dockit-settings-tag';
        tagEl.innerHTML = `
          <span>${tag}</span>
          <span class="dockit-settings-tag-remove" data-index="${idx}">${xIconSvg}</span>
        `;
        tagEl.querySelector('.dockit-settings-tag-remove').addEventListener('click', async () => {
          let tagsArray = [];
          if (containerId === 'tags-blocklist-disable') {
            disableSidebarList.splice(idx, 1);
            tagsArray = disableSidebarList;
            await chrome.storage.local.set({ dockitDisableSidebarList: tagsArray });
          } else if (containerId === 'tags-blocklist-autohide') {
            forceAutohideList.splice(idx, 1);
            tagsArray = forceAutohideList;
            await chrome.storage.local.set({ dockitForceAutohideList: tagsArray });
          } else if (containerId === 'tags-blocklist-forceview') {
            forceViewList.splice(idx, 1);
            tagsArray = forceViewList;
            await chrome.storage.local.set({ dockitForceViewList: tagsArray });
          }
          _renderTags(containerId, tagsArray);
        });
        container.appendChild(tagEl);
      });
    };

    //initial lists render
    _renderTags('tags-blocklist-disable', disableSidebarList);
    _renderTags('tags-blocklist-autohide', forceAutohideList);
    _renderTags('tags-blocklist-forceview', forceViewList);

    //bind list action clicks
    const listAddButtons = contentEl.querySelectorAll('.dockit-settings-list-add-btn');
    listAddButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const targetId = btn.dataset.target;
        const input = contentEl.querySelector(`#input-${targetId}`);
        if (!input) return;
        const value = input.value.trim() || input.placeholder;
        if (value && value !== 'Add domain or URL...') {
          if (targetId === 'blocklist-disable') {
            if (!disableSidebarList.includes(value)) {
              disableSidebarList.push(value);
              _renderTags(`tags-${targetId}`, disableSidebarList);
              await chrome.storage.local.set({ dockitDisableSidebarList: disableSidebarList });
            }
          } else if (targetId === 'blocklist-autohide') {
            if (!forceAutohideList.includes(value)) {
              forceAutohideList.push(value);
              _renderTags(`tags-${targetId}`, forceAutohideList);
              await chrome.storage.local.set({ dockitForceAutohideList: forceAutohideList });
            }
          } else if (targetId === 'blocklist-forceview') {
            if (!forceViewList.includes(value)) {
              forceViewList.push(value);
              _renderTags(`tags-${targetId}`, forceViewList);
              await chrome.storage.local.set({ dockitForceViewList: forceViewList });
            }
          }
          input.value = '';
        }
      });
    });

    //bind inputs keydown listeners
    const listInputs = contentEl.querySelectorAll('.dockit-settings-list-input');
    listInputs.forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const btn = input.nextElementSibling;
          if (btn && btn.classList.contains('dockit-settings-list-add-btn')) {
            btn.click();
          }
        }
      });
    });

    //bind collapsing handlers
    const categories = contentEl.querySelectorAll('.dockit-settings-category');
    const toggleAllCheckbox = contentEl.querySelector('#dockit-settings-toggle-all');
    const toggleAllText = contentEl.querySelector('#dockit-settings-toggle-all-text');

    const _updateToggleAllState = () => {
      if (!toggleAllCheckbox || !toggleAllText) return;
      const total = categories.length;
      const collapsedCount = contentEl.querySelectorAll('.dockit-settings-category.is-collapsed').length;

      if (collapsedCount === total) {
        toggleAllCheckbox.checked = false;
        toggleAllText.textContent = t('expand_all');
      } else if (collapsedCount === 0) {
        toggleAllCheckbox.checked = true;
        toggleAllText.textContent = t('collapse_all');
      }
    };

    categories.forEach(cat => {
      const header = cat.querySelector('.dockit-settings-category-header');
      const chevron = cat.querySelector('.dockit-settings-category-chevron');
      if (header && chevron) {
        header.addEventListener('click', () => {
          const isCollapsed = cat.classList.toggle('is-collapsed');
          chevron.innerHTML = isCollapsed ? chevronDownSvg : chevronUpSvg;
          _updateToggleAllState();
        });
      }
    });

    //bind toggle all states
    if (toggleAllCheckbox) {
      toggleAllCheckbox.addEventListener('change', () => {
        const shouldExpand = toggleAllCheckbox.checked;
        toggleAllText.textContent = shouldExpand ? t('collapse_all') : t('expand_all');

        categories.forEach(cat => {
          const chevron = cat.querySelector('.dockit-settings-category-chevron');
          if (shouldExpand) {
            cat.classList.remove('is-collapsed');
            if (chevron) chevron.innerHTML = chevronUpSvg;
          } else {
            cat.classList.add('is-collapsed');
            if (chevron) chevron.innerHTML = chevronDownSvg;
          }
        });
      });
    }

    //store original text for highlighting
    const allItems = contentEl.querySelectorAll('.dockit-settings-item');
    allItems.forEach(item => {
      const titleEl = item.querySelector('.dockit-settings-item-title');
      const descEl = item.querySelector('.dockit-settings-item-desc');
      if (titleEl) item.dataset.origTitle = titleEl.textContent;
      if (descEl) item.dataset.origDesc = descEl.textContent;
    });

    //global i18n dictionary
    const I18N_STRINGS = I18N_STRINGS_DEFAULT;

    //store current translations (defaults to english)
    if (!this._i18n) this._i18n = { ...I18N_STRINGS };
    const t = (key) => this._i18n[key] || I18N_STRINGS[key] || key;

    //batched translation via MyMemory API (500 char limit per request)
    const _batchTranslate = async (lang) => {
      const cacheKey = `dockitTranslations_v2_${lang}`;
      const cached = await chrome.storage.local.get([cacheKey]);
      if (cached[cacheKey]) return cached[cacheKey];

      const keys = Object.keys(I18N_STRINGS);
      const values = Object.values(I18N_STRINGS);
      const result = {};

      //split into batches that fit under 500 chars
      let batch = [];
      let batchKeys = [];
      let currentLen = 0;

      const _flushBatch = async () => {
        if (batch.length === 0) return;
        const joined = batch.join(' ||| ');
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(joined)}&langpair=en|${lang}`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data.responseData && data.responseData.translatedText) {
            let parts = data.responseData.translatedText.split('|||').map(s => s.trim());
            if (parts.length !== batch.length) {
              parts = data.responseData.translatedText.split(' ||| ').map(s => s.trim());
            }
            if (parts.length === batch.length) {
              batchKeys.forEach((key, i) => { result[key] = parts[i]; });
            }
          }
        } catch (e) {
          console.error('Translation batch error', e);
        }
        batch = [];
        batchKeys = [];
        currentLen = 0;
      };

      for (let i = 0; i < values.length; i++) {
        const text = values[i];
        const separator = batch.length > 0 ? ' ||| ' : '';
        const addLen = separator.length + text.length;

        if (currentLen + addLen > 450) {
          await _flushBatch();
        }

        if (batch.length > 0) currentLen += 5; //separator length
        batch.push(text);
        batchKeys.push(keys[i]);
        currentLen += text.length;
      }
      await _flushBatch();

      if (Object.keys(result).length > 0) {
        await chrome.storage.local.set({ [cacheKey]: result });
      }
      return result;
    };

    //apply translations to all visible elements
    const _applyTranslations = () => {
      //header title
      const headerTitleEl = this.element.querySelector('#dockit-in-page-title');
      if (headerTitleEl && headerTitleEl.dataset.appName) {
        headerTitleEl.textContent = this._getTranslatedAppName(headerTitleEl.dataset.appName);
      }

      //category titles
      const catMap = { appearance: 'appearance', functionality: 'functionality', blocklists: 'blocklists', debug: 'debug', language: 'language' };
      Object.entries(catMap).forEach(([cat, key]) => {
        const el = contentEl.querySelector(`.dockit-settings-category[data-category="${cat}"] .dockit-settings-category-title`);
        if (el) el.textContent = t(key);
      });

      //settings item titles and descriptions
      const itemMap = {
        'enable taper': ['enable_taper', 'enable_taper_desc'],
        'show url bar': ['show_url_bar', 'show_url_bar_desc'],
        'mobile default view': ['mobile_default_view', 'mobile_default_view_desc'],
        'auto-hide sidepanel': ['auto_hide', 'auto_hide_desc'],
        'disable sidebar': ['disable_sidebar', 'disable_sidebar_desc'],
        'force auto-hide': ['force_auto_hide', 'force_auto_hide_desc'],
        'cloud sync': ['cloud_sync', 'cloud_sync_desc'],
        'clear cache': ['clear_cache', 'clear_cache_desc'],
        'clear data': ['clear_data', 'clear_data_desc'],
        'select language': ['select_language', 'select_language_desc']
      };

      Object.entries(itemMap).forEach(([dataTitle, [titleKey, descKey]]) => {
        const item = contentEl.querySelector(`.dockit-settings-item[data-title="${dataTitle}"]`);
        if (!item) return;
        const titleEl = item.querySelector('.dockit-settings-item-title');
        const descEl = item.querySelector('.dockit-settings-item-desc');
        if (titleEl) titleEl.textContent = t(titleKey);
        if (descEl) descEl.textContent = t(descKey);
        //update search data attributes
        item.dataset.translatedTitle = t(titleKey);
        item.dataset.translatedDesc = t(descKey);
      });

      //placeholders
      const searchInput = contentEl.querySelector('#dockit-settings-search');
      if (searchInput) searchInput.placeholder = t('search_placeholder');

      contentEl.querySelectorAll('.dockit-settings-list-input').forEach(input => {
        if (!input.id.startsWith('input-blocklist-')) {
          input.placeholder = t('add_domain_placeholder');
        }
      });

      //buttons
      contentEl.querySelectorAll('.dockit-settings-list-add-btn').forEach(btn => {
        btn.textContent = t('add_btn');
      });

      const syncBtn = contentEl.querySelector('#btn-debug-sync');
      if (syncBtn && !syncBtn.dataset.busy) syncBtn.textContent = t('sync_now');
      const cacheBtn = contentEl.querySelector('#btn-debug-cache');
      if (cacheBtn && !cacheBtn.dataset.busy) cacheBtn.textContent = t('clear_cache');
      const clearBtn = contentEl.querySelector('#btn-debug-clear');
      if (clearBtn && !clearBtn.dataset.busy) clearBtn.textContent = t('clear_data');

      //toggle all text
      if (toggleAllText) {
        const collapsedCount = contentEl.querySelectorAll('.dockit-settings-category.is-collapsed').length;
        toggleAllText.textContent = collapsedCount === categories.length ? t('expand_all') : t('collapse_all');
      }

      //loading label
      const loadingEl = contentEl.querySelector('#dockit-translation-status');
      if (loadingEl) loadingEl.textContent = t('translating');
    };

    const translatePage = async (lang) => {
      const loadingEl = contentEl.querySelector('#dockit-translation-status');
      if (loadingEl) loadingEl.style.display = 'block';

      if (lang === 'en') {
        this._i18n = { ...I18N_STRINGS };
        _applyTranslations();
        if (loadingEl) loadingEl.style.display = 'none';
        return;
      }

      const translated = await _batchTranslate(lang);
      if (translated && Object.keys(translated).length > 0) {
        this._i18n = { ...I18N_STRINGS, ...translated };
      }
      _applyTranslations();
      if (loadingEl) loadingEl.style.display = 'none';
    };

    //bind search input filter handler
    const searchInput = contentEl.querySelector('#dockit-settings-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();

        categories.forEach(cat => {
          const catTitleEl = cat.querySelector('.dockit-settings-category-title');
          const catTitle = catTitleEl ? catTitleEl.textContent.toLowerCase() : '';
          const items = cat.querySelectorAll('.dockit-settings-item');
          let catHasMatches = catTitle.includes(query);

          items.forEach(item => {
            const origTitle = item.dataset.origTitle || '';
            const origDesc = item.dataset.origDesc || '';
            const titleToSearch = item.dataset.translatedTitle || origTitle;
            const descToSearch = item.dataset.translatedDesc || origDesc;
            const matches = titleToSearch.toLowerCase().includes(query) || descToSearch.toLowerCase().includes(query);

            const titleEl = item.querySelector('.dockit-settings-item-title');
            const descEl = item.querySelector('.dockit-settings-item-desc');

            if (matches && query !== '') {
              item.classList.remove('is-filtered-out');
              catHasMatches = true;

              const highlight = (text, q) => {
                const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')})`, 'gi');
                return text.replace(regex, '<mark>$1</mark>');
              };

              if (titleEl) titleEl.innerHTML = highlight(titleToSearch, query);
              if (descEl) descEl.innerHTML = highlight(descToSearch, query);
            } else {
              item.classList.add('is-filtered-out');
              if (titleEl) titleEl.textContent = titleToSearch;
              if (descEl) descEl.textContent = descToSearch;
            }
          });

          const chevron = cat.querySelector('.dockit-settings-category-chevron');
          if (query === '') {
            cat.style.display = 'flex';
            items.forEach(item => {
              item.classList.remove('is-filtered-out');
              const titleEl = item.querySelector('.dockit-settings-item-title');
              const descEl = item.querySelector('.dockit-settings-item-desc');
              const titleToSearch = item.dataset.translatedTitle || item.dataset.origTitle || '';
              const descToSearch = item.dataset.translatedDesc || item.dataset.origDesc || '';
              if (titleEl) titleEl.textContent = titleToSearch;
              if (descEl) descEl.textContent = descToSearch;
            });
            _updateToggleAllState();
          } else if (catHasMatches) {
            cat.style.display = 'flex';
            cat.classList.remove('is-collapsed');
            if (chevron) chevron.innerHTML = chevronUpSvg;

            // Highlight category title if it matches
            if (catTitleEl) {
              const currentCatTitle = catTitleEl.textContent;
              if (currentCatTitle.toLowerCase().includes(query)) {
                const escapedQuery = query.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
                const regex = new RegExp(`(${escapedQuery})`, 'gi');
                catTitleEl.innerHTML = currentCatTitle.replace(regex, '<mark>$1</mark>');
              } else {
                catTitleEl.innerHTML = currentCatTitle;
              }
            }
          } else {
            cat.style.display = 'none';
          }

          // Reset category title highlight if query is empty
          if (query === '' && catTitleEl) {
            catTitleEl.innerHTML = catTitleEl.textContent;
          }
        });
      });
    }

    //bind custom language picker
    const picker = contentEl.querySelector('#dockit-lang-picker');
    const selectedEl = picker.querySelector('.dockit-language-selected');
    const dropdown = picker.querySelector('.dockit-language-dropdown');
    const options = picker.querySelectorAll('.dockit-language-option');

    selectedEl.addEventListener('click', (e) => {
      e.stopPropagation();
      picker.classList.toggle('is-open');
    });

    document.addEventListener('click', () => {
      picker.classList.remove('is-open');
    });

    options.forEach(opt => {
      opt.addEventListener('click', async (e) => {
        e.stopPropagation();
        const selectedLang = opt.dataset.lang;

        options.forEach(o => o.classList.remove('is-selected'));
        opt.classList.add('is-selected');

        selectedEl.querySelector('img').src = opt.querySelector('img').src;
        selectedEl.querySelector('span').textContent = opt.querySelector('span').textContent;

        picker.classList.remove('is-open');

        await chrome.storage.local.set({ dockitLanguage: selectedLang });
        await translatePage(selectedLang);
      });
    });

    // initialize language select state on load
    const loadSavedLang = async () => {
      const storage = await chrome.storage.local.get(['dockitLanguage']);
      const savedLang = storage.dockitLanguage || 'en';

      const opt = Array.from(options).find(o => o.dataset.lang === savedLang);
      if (opt) {
        options.forEach(o => o.classList.remove('is-selected'));
        opt.classList.add('is-selected');
        selectedEl.querySelector('img').src = opt.querySelector('img').src;
        selectedEl.querySelector('span').textContent = opt.querySelector('span').textContent;

        if (savedLang !== 'en') {
          await translatePage(savedLang);
        }
      }
    };
    await loadSavedLang();

    // initialize settings checkboxes on load
    const loadSettingsState = async () => {
      const storage = await chrome.storage.local.get(['dockitEnableTaper', 'dockitShowUrlBar', 'dockitAutoHide', 'dockitMobileDefault']);

      const taperCheckbox = contentEl.querySelector('#setting-appearance-taper');
      if (taperCheckbox) {
        taperCheckbox.checked = !!storage.dockitEnableTaper;
        taperCheckbox.addEventListener('change', async () => {
          await chrome.storage.local.set({ dockitEnableTaper: taperCheckbox.checked });
        });
      }

      const urlbarCheckbox = contentEl.querySelector('#setting-appearance-urlbar');
      if (urlbarCheckbox) {
        urlbarCheckbox.checked = storage.dockitShowUrlBar !== false;
        urlbarCheckbox.addEventListener('change', async () => {
          await chrome.storage.local.set({ dockitShowUrlBar: urlbarCheckbox.checked });
        });
      }

      const mobiledefaultCheckbox = contentEl.querySelector('#dockit-settings-mobiledefault');
      if (mobiledefaultCheckbox) {
        mobiledefaultCheckbox.checked = storage.dockitMobileDefault !== false;
        mobiledefaultCheckbox.addEventListener('change', async () => {
          await chrome.storage.local.set({ dockitMobileDefault: mobiledefaultCheckbox.checked });

          // Update the Force View blocklist title and description dynamically
          const forceViewTitleEl = contentEl.querySelector('#title-blocklist-forceview');
          const forceViewDescEl = contentEl.querySelector('#desc-blocklist-forceview');
          if (forceViewTitleEl) forceViewTitleEl.textContent = mobiledefaultCheckbox.checked ? 'Force Desktop View' : 'Force Mobile View';
          if (forceViewDescEl) forceViewDescEl.textContent = mobiledefaultCheckbox.checked ? 'Pages that will always force desktop view.' : 'Pages that will always force mobile view.';
        });
      }

      const autohideCheckbox = contentEl.querySelector('#setting-functionality-autohide');
      if (autohideCheckbox) {
        autohideCheckbox.checked = !!storage.dockitAutoHide;
        autohideCheckbox.addEventListener('change', async () => {
          await chrome.storage.local.set({ dockitAutoHide: autohideCheckbox.checked });
        });
      }
    };
    await loadSettingsState();

    //bind debug actions
    const syncBtn = contentEl.querySelector('#btn-debug-sync');
    if (syncBtn) {
      syncBtn.addEventListener('click', () => {
        syncBtn.dataset.busy = '1';
        syncBtn.textContent = 'Syncing...';
        setTimeout(() => {
          syncBtn.textContent = 'Synced!';
          setTimeout(() => { delete syncBtn.dataset.busy; syncBtn.textContent = t('sync_now'); }, 1500);
        }, 800);
      });
    }

    const cacheBtn = contentEl.querySelector('#btn-debug-cache');
    if (cacheBtn) {
      cacheBtn.addEventListener('click', async () => {
        cacheBtn.dataset.busy = '1';
        cacheBtn.textContent = 'Purging...';

        const storage = await chrome.storage.local.get(null);
        const keysToRemove = ['temporaryApps', 'lucideIcons', 'fontCss'];
        const currentLang = storage.dockitLanguage || 'en';
        for (const key of Object.keys(storage)) {
          if (key.startsWith('dockitTranslations_v2_') && key !== `dockitTranslations_v2_${currentLang}`) {
            keysToRemove.push(key);
          }
        }
        await chrome.storage.local.remove(keysToRemove);
        if (chrome.runtime?.id) {
          chrome.runtime.sendMessage({ type: 'REFETCH_ASSETS' });
        }

        setTimeout(() => {
          cacheBtn.textContent = 'Purged!';
          setTimeout(() => { delete cacheBtn.dataset.busy; cacheBtn.textContent = t('clear_cache'); }, 1500);
        }, 800);
      });
    }

    const clearBtn = contentEl.querySelector('#btn-debug-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', async () => {
        clearBtn.dataset.busy = '1';
        clearBtn.textContent = 'Resetting...';

        //clear all except sidepanel state
        const storage = await chrome.storage.local.get(null);
        const keysToRemove = Object.keys(storage).filter(key => !key.startsWith('sidePanelOpen_'));
        await chrome.storage.local.remove(keysToRemove);

        setTimeout(() => {
          clearBtn.textContent = 'Reset!';
          setTimeout(() => { window.location.reload(); }, 500);
        }, 800);
      });
    }
  }
}
