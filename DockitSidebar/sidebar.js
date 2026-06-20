// sidebar.js

//global i18n default dictionary
var I18N_STRINGS_DEFAULT = {
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
  'clear_data': 'Clear Local Data',
  'clear_data_desc': 'Clear all extension storage and reset default states.',
  'clear_cloud_data': 'Clear Cloud Data',
  'clear_cloud_data_desc': 'Clear all synced settings and data stored in the cloud.',
  'clear_cloud': 'Clear Cloud',
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
  'translating': 'Translating...',
  'enter_theme_editor': 'Enter Theme Editor',
  'clear_theme': 'Clear Theme',
  'reset_theme': 'Reset Theme',
  'apply': 'Apply',
  'publish': 'Publish',
  'discard': 'Discard'
};

var DockitSidebar = class DockitSidebar {
  static createThemeCardDOM(theme) {
    const wrapper = document.createElement('div');
    wrapper.className = 'dockit-theme-card-wrapper';

    const inner = document.createElement('div');
    inner.className = 'dockit-theme-card-inner';

    const card = document.createElement('div');
    card.className = 'dockit-theme-card-front dockit-theme-card-mockup';
    card.setAttribute('data-theme-colors', '--color-background, --color-foreground, --color-border');

    const back = document.createElement('div');
    back.className = 'dockit-theme-card-back';
    back.setAttribute('data-theme-colors', '--color-background, --color-foreground, --color-border');

    wrapper.style.cssText = `
      position: relative;
      width: 100%;
      aspect-ratio: 1.75;
      container-type: size;
    `;

    card.style.cssText = `
      background-color: var(--color-background);
      border-radius: 4.28cqw;
      overflow: hidden;
      padding: 5.71cqw;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 1px solid color-mix(in srgb, var(--color-border) calc(var(--opacity-value, 1) * 100%), transparent);
      box-sizing: border-box;
      pointer-events: none;
    `;

    back.style.cssText = `
      background-color: var(--color-background);
      border-radius: 4.28cqw;
      overflow: hidden;
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 12px;
      border: 1px solid color-mix(in srgb, var(--color-border) calc(var(--opacity-value, 1) * 100%), transparent);
      box-sizing: border-box;
      pointer-events: auto;
    `;

    if (theme && theme.colors) {
      for (const [key, val] of Object.entries(theme.colors)) {
        wrapper.style.setProperty(key, val);
        card.style.setProperty(key, val);
      }
    }
    if (theme && theme.options) {
      for (const [key, val] of Object.entries(theme.options)) {
        wrapper.style.setProperty(key, val);
        card.style.setProperty(key, val);
      }
    }

    const topSection = document.createElement('div');
    topSection.style.cssText = 'display: flex; justify-content: space-between; width: 100%; position: relative; z-index: 2;';

    const palette = document.createElement('div');
    palette.style.cssText = 'display: flex; flex-direction: column; height: 50cqh; width: 30cqw; justify-content: space-between;';

    const colors = [
      { name: '--color-primary', width: '100%' },
      { name: '--color-accent', width: '90%' },
      { name: '--color-foreground', width: '81%' },
      { name: '--color-border', width: '73%' },
      { name: '--color-secondary', width: '66%' }
    ];

    colors.forEach(c => {
      const bar = document.createElement('div');
      bar.setAttribute('data-theme-colors', c.name);
      bar.style.cssText = `
        height: 15%;
        width: ${c.width};
        border-radius: 1000px;
        background-color: var(${c.name});
      `;
      palette.appendChild(bar);
    });

    const dashRect = document.createElement('div');
    dashRect.setAttribute('data-theme-colors', '--color-border');
    dashRect.style.cssText = `
      height: 60cqh;
      aspect-ratio: 1;
      border: calc(max(1px, 0.7cqw)) dashed var(--color-border);
      border-radius: 0px;
      background-color: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
    `;

    const dashChild = document.createElement('div');
    dashChild.setAttribute('data-theme-colors', '--color-border');
    dashChild.style.cssText = `
      width: calc(100% - (var(--padding-value, 0px) * 2));
      height: calc(100% - (var(--padding-value, 0px) * 2));
      border-radius: var(--corner-radius-value, 0px);
      border: 1px solid var(--color-border);
      background-color: color-mix(in srgb, var(--color-border) 50%, transparent);
      box-sizing: border-box;
    `;
    dashRect.appendChild(dashChild);

    topSection.appendChild(palette);
    topSection.appendChild(dashRect);

    const bottomSection = document.createElement('div');
    bottomSection.style.cssText = 'display: flex; justify-content: space-between; width: 100%; align-items: flex-end; position: relative; z-index: 2; pointer-events: none;';

    const textContainer = document.createElement('div');
    textContainer.style.cssText = 'display: flex; flex-direction: column; gap: 1.42cqw;';

    const title = document.createElement('div');
    title.className = 'dockit-theme-card-title';
    title.setAttribute('data-theme-colors', '--color-foreground');
    title.style.cssText = 'font-size: 5cqw; font-weight: 600; color: var(--color-foreground); line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 50cqw;';
    title.innerText = theme && theme.name ? theme.name : 'Theme Name';

    const subtitle = document.createElement('div');
    subtitle.setAttribute('data-theme-colors', '--color-foreground-rgba');
    subtitle.style.cssText = 'font-size: 3.92cqw; color: color-mix(in srgb, var(--color-foreground) 50%, transparent);';
    let pubName = theme && theme.publisherName ? theme.publisherName : null;
    if (pubName && pubName.startsWith('user_')) pubName = null;
    subtitle.innerText = pubName ? pubName : (theme && theme.publisherId ? `@${theme.publisherId.substring(0, 8)}` : '@publisher');

    textContainer.appendChild(title);
    textContainer.appendChild(subtitle);

    const imagesContainer = document.createElement('div');
    imagesContainer.className = 'dockit-theme-card-images';
    imagesContainer.style.cssText = 'position: absolute; bottom: -1px; right: -1px; height: 60%; aspect-ratio: 1; overflow: hidden; border-bottom-right-radius: 4.28cqw; z-index: 1; pointer-events: none;';

    bottomSection.appendChild(textContainer);

    card.appendChild(topSection);
    card.appendChild(bottomSection);
    card.appendChild(imagesContainer);

    if (theme && theme.images && theme.images.length > 0) {
      const patternImg = theme.images.find(img => img.isPattern);
      if (patternImg) {
        const patternLayer = document.createElement('div');
        patternLayer.className = 'dockit-theme-card-pattern';
        patternLayer.style.cssText = `
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background-image: url(${patternImg.src});
          background-repeat: repeat;
          background-size: ${patternImg.width}px ${patternImg.height}px;
          background-position: calc(50% + ${patternImg.offsetX}% + ${patternImg.offsetX * patternImg.width / 100}px) calc(50% + ${patternImg.offsetY}% + ${patternImg.offsetY * patternImg.height / 100}px);
          z-index: 0;
          pointer-events: none;
        `;
        card.insertBefore(patternLayer, card.firstChild);
      }

      const objectImgs = theme.images.filter(img => !img.isPattern);
      objectImgs.forEach((imgData, index) => {
        const img = document.createElement('img');
        img.src = imgData.src;
        img.style.cssText = `
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: ${imgData.fit || 'contain'};
          -webkit-mask-image: linear-gradient(to bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.2) 100%);
          mask-image: linear-gradient(to bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.2) 100%);
          pointer-events: none;
          opacity: ${index === 0 ? '1' : '0'};
          transition: opacity 1s ease-in-out;
        `;
        imagesContainer.appendChild(img);
      });

      if (objectImgs.length > 1) {
        let currentIdx = 0;
        const fader = () => {
          if (!imagesContainer.isConnected) return;
          const imgs = imagesContainer.querySelectorAll('img');
          if (imgs.length === 0) return;

          currentIdx = (currentIdx + 1) % imgs.length;
          imgs.forEach((img, i) => {
            img.style.opacity = (i === currentIdx) ? '1' : '0';
          });

          setTimeout(fader, 3000);
        };
        setTimeout(fader, 3000);
      }
    }

    // Top layout (profile on left, stats on right)
    const topRow = document.createElement('div');
    topRow.style.cssText = 'display: flex; justify-content: space-between; align-items: flex-start; width: 100%; margin-bottom: auto;';

    // Profile Info
    const profileInfo = document.createElement('div');
    profileInfo.style.cssText = 'display: flex; align-items: center; gap: 8px;';

    const profileImg = document.createElement('img');
    profileImg.className = 'dockit-theme-card-avatar';
    profileImg.style.cssText = 'width: 32px; height: 32px; border-radius: 50%; object-fit: cover; background: color-mix(in srgb, var(--color-foreground) 20%, transparent); flex-shrink: 0;';
    if (theme && theme.publisherAvatar) {
      if (theme.publisherAvatar.startsWith('http') || theme.publisherAvatar.startsWith('data:')) {
        profileImg.src = theme.publisherAvatar;
      } else {
        const projectId = '6a0a1cc000178886bfaf';
        profileImg.src = `https://nyc.cloud.appwrite.io/v1/storage/buckets/Cloud-Drive/files/${theme.publisherAvatar}/view?project=${projectId}`;
      }
    } else {
      const projectId = '6a0a1cc000178886bfaf';
      const safeName = encodeURIComponent(theme && theme.publisherName ? theme.publisherName : 'User');
      profileImg.src = `https://nyc.cloud.appwrite.io/v1/avatars/initials?name=${safeName}&width=80&height=80&project=${projectId}`;
    }

    const profileTextCol = document.createElement('div');
    profileTextCol.style.cssText = 'display: flex; flex-direction: column; text-align: left;';

    const profileNameStr = (theme && theme.publisherName) ? theme.publisherName : (theme && theme.publisherId ? `@${theme.publisherId}` : 'User');
    const profileName = document.createElement('span');
    profileName.style.cssText = 'font-size: 13px; font-weight: 600; color: var(--color-foreground); max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
    profileName.innerText = profileNameStr;

    const publishDate = document.createElement('span');
    publishDate.style.cssText = 'font-size: 11px; opacity: 0.6; color: var(--color-foreground);';
    if (theme && theme.createdAt) {
      publishDate.innerText = new Date(theme.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } else {
      publishDate.innerText = 'Unknown date';
    }

    profileTextCol.appendChild(profileName);
    profileTextCol.appendChild(publishDate);
    profileInfo.appendChild(profileImg);
    profileInfo.appendChild(profileTextCol);

    // Stats
    const statsCol = document.createElement('div');
    statsCol.style.cssText = 'display: flex; flex-direction: column; align-items: flex-end; gap: 4px; pointer-events: auto;';

    const makeStat = (iconId, countText, type) => {
      const el = document.createElement('div');
      el.className = `dockit-theme-card-${type}`;
      el.style.cssText = 'display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--color-foreground); cursor: pointer; opacity: 0.8; transition: opacity 0.2s;';
      el.innerHTML = iconId === 'download' ? `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> <span class="stat-val">${countText}</span>` : `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> <span class="stat-val">${countText}</span>`;
      el.addEventListener('mouseenter', () => el.style.opacity = '1');
      el.addEventListener('mouseleave', () => el.style.opacity = '0.8');
      return el;
    };

    const downloadsStat = makeStat('download', theme && theme.downloads !== undefined ? theme.downloads : 0, 'downloads');
    const likesStat = makeStat('heart', theme && theme.likes !== undefined ? theme.likes : 0, 'likes');

    // Top icon is now display-only per user request
    likesStat.style.cursor = 'default';

    if (theme && theme.hasLiked) {
      likesStat.style.color = 'var(--color-primary)';
      likesStat.querySelector('i')?.setAttribute('fill', 'currentColor');
    }

    statsCol.appendChild(downloadsStat);
    statsCol.appendChild(likesStat);

    topRow.appendChild(profileInfo);
    topRow.appendChild(statsCol);

    // Bottom Actions
    const actionsCol = document.createElement('div');
    actionsCol.style.cssText = 'display: flex; flex-direction: column; gap: 8px; width: 100%;';

    const installBtn = document.createElement('button');
    installBtn.className = 'dockit-btn dockit-theme-btn-install';
    installBtn.style.cssText = 'box-sizing: border-box; background: var(--color-primary); color: var(--color-foreground); border: none; padding: 0 16px; height: 36px; border-radius: 100px; font-size: 13px; font-weight: 600; cursor: pointer; width: 100%; pointer-events: auto; z-index: 10; display: flex; align-items: center; justify-content: center; gap: 6px; transition: opacity 0.2s, transform 0.2s, background 0.2s;';
    installBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Install`;
    installBtn.addEventListener('mouseenter', () => {
      installBtn.style.opacity = '0.85';
      installBtn.style.transform = 'scale(1.02)';
    });
    installBtn.addEventListener('mouseleave', () => {
      installBtn.style.opacity = '1';
      installBtn.style.transform = 'scale(1)';
    });
    installBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (theme && theme.onInstall) {
        theme.onInstall();
      }

      const origHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Install`;
      const origBg = 'var(--color-primary)';
      const origColor = 'var(--color-foreground)';

      installBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Installed`;
      installBtn.style.background = 'color-mix(in srgb, var(--color-foreground) 10%, transparent)';
      installBtn.style.color = 'var(--color-foreground)';

      setTimeout(() => {
        installBtn.innerHTML = origHTML;
        installBtn.style.background = origBg;
        installBtn.style.color = origColor;
      }, 1500);
    });

    actionsCol.appendChild(installBtn);

    const editRow = document.createElement('div');
    editRow.style.cssText = 'display: flex; gap: 8px; width: 100%;';

    const editBtn = document.createElement('button');
    editBtn.className = 'dockit-btn dockit-theme-btn-edit';
    editBtn.style.cssText = 'box-sizing: border-box; background: color-mix(in srgb, var(--color-foreground) 10%, transparent); color: var(--color-foreground); border: none; padding: 0 16px; height: 36px; border-radius: 100px; font-size: 13px; font-weight: 600; cursor: pointer; flex: 1; pointer-events: auto; z-index: 10; display: flex; align-items: center; justify-content: center; gap: 6px; transition: background 0.2s;';
    editBtn.innerHTML = `<svg style="pointer-events: none;" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> Edit`;
    editBtn.addEventListener('mouseenter', () => editBtn.style.background = 'color-mix(in srgb, var(--color-foreground) 15%, transparent)');
    editBtn.addEventListener('mouseleave', () => editBtn.style.background = 'color-mix(in srgb, var(--color-foreground) 10%, transparent)');
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (theme && theme.onEdit) theme.onEdit();
    });
    editRow.appendChild(editBtn);

    if (theme && theme.onDelete) {
      const delBtn = document.createElement('button');
      delBtn.className = 'dockit-btn dockit-theme-btn-delete';
      delBtn.style.cssText = 'box-sizing: border-box; background: transparent; color: var(--color-foreground); border: 1px solid color-mix(in srgb, var(--color-foreground) 20%, transparent); padding: 0; width: 36px; height: 36px; border-radius: 100px; cursor: pointer; pointer-events: auto; z-index: 10; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s;';
      delBtn.innerHTML = `<svg style="pointer-events: none;" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
      delBtn.addEventListener('mouseenter', () => {
        delBtn.style.background = 'color-mix(in srgb, var(--color-foreground) 10%, transparent)';
        delBtn.style.borderColor = 'color-mix(in srgb, var(--color-foreground) 30%, transparent)';
      });
      delBtn.addEventListener('mouseleave', () => {
        delBtn.style.background = 'transparent';
        delBtn.style.borderColor = 'color-mix(in srgb, var(--color-foreground) 20%, transparent)';
      });
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        theme.onDelete();
      });
      editRow.appendChild(delBtn);
    } else {
      const likeBtn = document.createElement('button');
      likeBtn.className = 'dockit-btn dockit-theme-btn-like';
      likeBtn.style.cssText = 'box-sizing: border-box; background: transparent; color: var(--color-foreground); border: 1px solid color-mix(in srgb, var(--color-foreground) 20%, transparent); padding: 0; width: 36px; height: 36px; border-radius: 100px; cursor: pointer; pointer-events: auto; z-index: 10; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s;';

      likeBtn.dataset.liked = (theme && theme.hasLiked) ? 'true' : 'false';

      if (theme && theme.hasLiked) {
        likeBtn.style.color = 'var(--color-primary)';
        likeBtn.style.borderColor = 'color-mix(in srgb, var(--color-primary) 30%, transparent)';
        likeBtn.style.background = 'color-mix(in srgb, var(--color-primary) 10%, transparent)';
        likeBtn.innerHTML = `<svg style="pointer-events: none;" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
      } else {
        likeBtn.innerHTML = `<svg style="pointer-events: none;" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
      }

      const updateLikeBtnUI = (isLiked) => {
        likeBtn.dataset.liked = isLiked ? 'true' : 'false';
        if (isLiked) {
          likeBtn.style.color = 'var(--color-primary)';
          likeBtn.style.borderColor = 'color-mix(in srgb, var(--color-primary) 30%, transparent)';
          likeBtn.style.background = 'color-mix(in srgb, var(--color-primary) 10%, transparent)';
          likeBtn.innerHTML = `<svg style="pointer-events: none;" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
          likesStat.style.color = 'var(--color-primary)';
          const svg = likesStat.querySelector('svg');
          if (svg) svg.setAttribute('fill', 'currentColor');
        } else {
          likeBtn.style.color = 'var(--color-foreground)';
          likeBtn.style.borderColor = 'color-mix(in srgb, var(--color-foreground) 20%, transparent)';
          likeBtn.style.background = 'transparent';
          likeBtn.innerHTML = `<svg style="pointer-events: none;" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
          likesStat.style.color = '';
          const svg = likesStat.querySelector('svg');
          if (svg) svg.setAttribute('fill', 'none');
        }
      };

      likeBtn.addEventListener('mouseenter', () => likeBtn.style.background = (likeBtn.dataset.liked === 'true') ? 'color-mix(in srgb, var(--color-primary) 20%, transparent)' : 'color-mix(in srgb, var(--color-foreground) 5%, transparent)');
      likeBtn.addEventListener('mouseleave', () => likeBtn.style.background = (likeBtn.dataset.liked === 'true') ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)' : 'transparent');

      likeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const isLiked = likeBtn.dataset.liked === 'true';
        let success = true;
        let currentLikes = parseInt(likesStat.querySelector('.stat-val').innerText) || 0;

        if (isLiked) {
          if (theme && theme.onUnlike) success = await theme.onUnlike();
          if (success) {
            updateLikeBtnUI(false);
            likesStat.querySelector('.stat-val').innerText = Math.max(0, currentLikes - 1);
          }
        } else {
          if (theme && theme.onLike) success = await theme.onLike();
          if (success) {
            updateLikeBtnUI(true);
            likesStat.querySelector('.stat-val').innerText = currentLikes + 1;
          }
        }
      });
      editRow.appendChild(likeBtn);
    }

    actionsCol.appendChild(editRow);

    back.appendChild(topRow);
    back.appendChild(actionsCol);

    inner.appendChild(card); // card is front
    inner.appendChild(back);
    wrapper.appendChild(inner);

    if (window.lucide) window.lucide.createIcons({ root: back });

    return wrapper;
  }

  constructor(isSidePanel = false) {
    this.isSidePanel = isSidePanel;
    this.element = document.createElement('div');
    this.element.className = 'dockit-sidebar';
    this.element.setAttribute('data-theme-colors', '--color-border, --color-background');
    this._dragState = null;
    this._inMemoryUrls = [];
    this._isInPageOpen = false;
    this._i18n = { ...I18N_STRINGS_DEFAULT };
    this._themeEditor = null;
    this._interactionQueue = [];
  }

  async _executeInteraction(themeId, type, state) {
    //validate inputs before any network calls
    const _VALID_ID = /^[a-zA-Z0-9._-]+$/;
    const _VALID_TYPES = ['like', 'download'];
    if (!themeId || typeof themeId !== 'string' || !_VALID_ID.test(themeId)) return;
    if (!_VALID_TYPES.includes(type)) return;

    const sessionData = await chrome.storage.local.get(['appwriteSession']);
    if (!sessionData.appwriteSession) return;

    const projectId = '6a0a1cc000178886bfaf';
    const headers = {
      'X-Appwrite-Project': projectId,
      'X-Fallback-Cookies': `a_session_${projectId}=${sessionData.appwriteSession.secret}`,
      'Content-Type': 'application/json'
    };

    const action = { themeId, type, state };
    if (action.state) { // add
      try {
        const queries = [
          JSON.stringify({ method: 'equal', attribute: 'themeId', values: [action.themeId] }),
          JSON.stringify({ method: 'equal', attribute: 'userId', values: [sessionData.appwriteSession.userId] }),
          JSON.stringify({ method: 'equal', attribute: 'type', values: [action.type] })
        ];
        let qUrl = `https://nyc.cloud.appwrite.io/v1/databases/dockit_cloud/collections/theme_interactions/documents?`;
        queries.forEach(q => qUrl += `queries[]=${encodeURIComponent(q)}&`);
        const getRes = await fetch(qUrl, { headers });
        if (getRes.ok) {
          const data = await getRes.json();
          if (data.documents.length === 0) {
            const payload = {
              documentId: 'unique()',
              data: {
                themeId: action.themeId,
                userId: sessionData.appwriteSession.userId,
                type: action.type,
                timestamp: new Date().toISOString()
              }
            };
            await fetch(`https://nyc.cloud.appwrite.io/v1/databases/dockit_cloud/collections/theme_interactions/documents`, {
              method: 'POST',
              headers,
              body: JSON.stringify(payload)
            });
          }
        }
      } catch (e) { }
    } else { // remove
      try {
        const queries = [
          JSON.stringify({ method: 'equal', attribute: 'themeId', values: [action.themeId] }),
          JSON.stringify({ method: 'equal', attribute: 'userId', values: [sessionData.appwriteSession.userId] }),
          JSON.stringify({ method: 'equal', attribute: 'type', values: [action.type] })
        ];
        let qUrl = `https://nyc.cloud.appwrite.io/v1/databases/dockit_cloud/collections/theme_interactions/documents?`;
        queries.forEach(q => qUrl += `queries[]=${encodeURIComponent(q)}&`);

        const getRes = await fetch(qUrl, { headers });
        if (getRes.ok) {
          const data = await getRes.json();
          for (const doc of data.documents) {
            await fetch(`https://nyc.cloud.appwrite.io/v1/databases/dockit_cloud/collections/theme_interactions/documents/${doc.$id}`, {
              method: 'DELETE',
              headers
            });
          }
        }
      } catch (e) { }
    }
  }

  async _installTheme(themeData) {
    try {
      //build a clean theme object with only the data applyTheme() needs
      const cleanTheme = {};
      if (themeData.name) cleanTheme.name = themeData.name;
      if (themeData.colors) cleanTheme.colors = { ...themeData.colors };
      if (themeData.options) cleanTheme.options = { ...themeData.options };
      if (themeData.images) cleanTheme.images = [...themeData.images];
      if (themeData.publisherId) cleanTheme.publisherId = themeData.publisherId;
      if (themeData.publisherName) cleanTheme.publisherName = themeData.publisherName;

      await chrome.storage.local.set({ dockitTheme: cleanTheme });

      if (!this.isSidePanel) {
        this.closeInPage();
      }
    } catch (e) {
      console.error('Dockit: _installTheme error', e);
    }
  }

  _openThemeEditor(themeData) {
    this.enterThemeEditor(themeData);
  }

  _deleteTheme(themeId) {
    this.showDialog({
      title: 'Delete Theme',
      message: 'Are you sure you want to delete this theme? This cannot be undone.',
      type: 'confirm',
      confirmText: 'Delete',
      onConfirm: async () => {
        const storageData = await chrome.storage.local.get(['appwriteSession']);
        if (!storageData.appwriteSession) return;

        const projectId = '6a0a1cc000178886bfaf';
        const headers = {
          'X-Appwrite-Project': projectId,
          'X-Fallback-Cookies': `a_session_${projectId}=${storageData.appwriteSession.secret}`
        };

        try {
          const res = await fetch(`https://nyc.cloud.appwrite.io/v1/databases/dockit_cloud/collections/themes/documents/${themeId}`, {
            method: 'DELETE',
            headers
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || 'Delete failed with status ' + res.status);
          }
          // Try to re-render the customization gallery
          if (this._states && this._states.recent) {
            this._states.recent.data = this._states.recent.data.filter(d => d.$id !== themeId);
          }
          this._renderCustomization();
        } catch (e) {
          console.error('Delete theme error:', e);
          this.showDialog({ message: 'Failed to delete theme: ' + e.message });
        }
      }
    });
  }

  showDialog({ title, message, type = 'alert', confirmText = 'OK', cancelText = 'Cancel', onConfirm = null, onCancel = null }) {
    const overlay = document.createElement('div');
    overlay.className = 'dockit-dialog-overlay';
    overlay.innerHTML = `
      <div class="dockit-dialog-box" data-theme-colors="--color-background, --color-border, --color-foreground">
        ${title ? `<div class="dockit-dialog-title">${title}</div>` : ''}
        <div class="dockit-dialog-message">${message}</div>
        <div class="dockit-dialog-actions">
          ${type === 'confirm' ? `<button class="dockit-dialog-btn cancel-btn" data-theme-colors="--color-border, --color-foreground">${cancelText}</button>` : ''}
          <button class="dockit-dialog-btn confirm-btn" data-theme-colors="--color-primary, --color-foreground">${confirmText}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Apply colors for the newly injected HTML
    if (typeof applyThemeColorsToElement === 'function') {
      applyThemeColorsToElement(overlay);
    }

    const closeDialog = () => {
      overlay.remove();
    };

    if (type === 'confirm') {
      overlay.querySelector('.cancel-btn').addEventListener('click', () => {
        closeDialog();
        if (onCancel) onCancel();
      });
    }

    overlay.querySelector('.confirm-btn').addEventListener('click', () => {
      closeDialog();
      if (onConfirm) onConfirm();
    });
  }

  async render() {
    this.element.innerHTML = `
      <div class="dockit-taper-top"></div>
      <div class="dockit-taper-bottom"></div>
      <div class="dockit-section" id="pinned-section"></div>
      <div class="dockit-divider" data-theme-colors="--color-border"></div>
      <div class="dockit-section" id="temp-section"></div>
      <div class="dockit-divider" id="temp-divider" data-theme-colors="--color-border" style="display:none"></div>
      
      <button class="dockit-action-btn" id="add-btn" style="margin-top: 0px;" data-theme-colors="--color-secondary, --color-foreground">
         <span class="icon-plus"></span>
      </button>

      <div class="dockit-bottom-controls">
         <button class="dockit-action-btn" id="ext-btn" data-theme-colors="--color-secondary, --color-foreground">
            <span class="icon-puzzle"></span>
         </button>
         <button class="dockit-action-btn" id="set-btn" data-theme-colors="--color-secondary, --color-foreground">
            <span class="icon-settings"></span>
         </button>
      </div>
    `;

    const inPageEl = document.createElement('div');
    inPageEl.className = 'dockit-in-page dockit-hidden';
    inPageEl.setAttribute('data-theme-colors', '--color-background');
    inPageEl.innerHTML = `
      <div class="dockit-in-page-header">
        <button class="dockit-action-btn" id="dockit-in-page-close" style="padding: 0; opacity: 1; margin: 0; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; color: var(--color-foreground);" data-theme-colors="--color-foreground">
          <span class="icon-close"></span>
        </button>
        <span class="dockit-in-page-title" id="dockit-in-page-title" data-theme-colors="--color-foreground"></span>
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
          <div class="dockit-active-site-container" style="display: flex; align-items: center; background-color: color-mix(in srgb, var(--color-secondary) calc(var(--menu-opacity-value, 1) * 100%), transparent); border-radius: 12px; padding: 12px; gap: 12px; margin-bottom: 20px; border: 1px solid color-mix(in srgb, var(--color-border) calc(var(--menu-opacity-value, 1) * 100%), transparent);" data-theme-colors="--color-border, --color-secondary">
            <img class="dockit-active-site-favicon" src="${favIconUrl}" style="width: 32px; height: 32px; border-radius: 6px; flex-shrink: 0;" />
            <div class="dockit-active-site-info" style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center;">
              <div class="dockit-active-site-title" style="font-weight: 600; font-size: 14px; line-height: 1.15; word-break: break-word;" data-theme-colors="--color-foreground">${title}</div>
              <div class="dockit-active-site-url" style="font-size: 12px; opacity: 0.6; line-height: 1.15; word-break: break-all; margin-top: 1px;" data-theme-colors="--color-foreground-rgba">${displayUrl}</div>
            </div>
            <button class="dockit-pin-btn" style="background: transparent; border: none; width: 24px; height: 24px; cursor: pointer; flex-shrink: 0; transition: color 0.2s, opacity 0.2s; display: flex; align-items: center; justify-content: center; padding: 0;" title="Pin to Sidebar" data-theme-colors="--color-primary">
              ${cleanPinIcon}
            </button>
          </div>
          
          <div class="dockit-grid-card" style="position: relative; z-index: 10001; border: 1px solid color-mix(in srgb, var(--color-border) calc(var(--menu-opacity-value, 1) * 100%), transparent); border-radius: 12px; background-color: color-mix(in srgb, var(--color-secondary) calc(var(--menu-opacity-value, 1) * 100%), transparent); padding: 12px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 12px;" data-theme-colors="--color-border, --color-secondary">
            <div class="dockit-grid-title" style="font-weight: 600; font-size: 14px; color: var(--color-foreground);" data-theme-colors="--color-foreground">${_t('pinned_apps')}</div>
            <div class="dockit-apps-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(56px, 1fr)); gap: 12px;">
              <!-- Pinned apps will be rendered here dynamically -->
            </div>
          </div>

          <div class="dockit-search-card" style="border: 1px solid color-mix(in srgb, var(--color-border) calc(var(--menu-opacity-value, 1) * 100%), transparent); border-radius: 12px; background-color: color-mix(in srgb, var(--color-background) calc(var(--menu-opacity-value, 1) * 100%), transparent); padding: 12px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 12px; position: relative;" data-theme-colors="--color-border, --color-background">
            <div class="dockit-search-title" style="font-weight: 600; font-size: 14px; color: var(--color-foreground);" data-theme-colors="--color-foreground">${_t('search_title')}</div>
            <div class="dockit-settings-search-wrapper dockit-search-bar-container" data-theme-colors="--color-primary, --color-border, --color-secondary">
              ${searchIconSvg}
              <input class="dockit-settings-search-input dockit-search-input" type="text" placeholder="${_t('search_placeholder')}" data-theme-colors="--color-foreground" />
            </div>
            <div class="dockit-suggestions-dropdown" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; background-color: color-mix(in srgb, var(--color-secondary) calc(var(--menu-opacity-value, 1) * 100%), transparent); border: 1px solid color-mix(in srgb, var(--color-border) calc(var(--menu-opacity-value, 1) * 100%), transparent); border-radius: 8px; z-index: 1000; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); max-height: 250px; overflow-y: auto; padding: 6px 0;" data-theme-colors="--color-border, --color-secondary"></div>
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
              <div style="font-size: 13px; opacity: 0.5; text-align: center; padding: 20px 10px; line-height: 1.4; border: 1.5px dashed color-mix(in srgb, var(--color-border) calc(var(--menu-opacity-value, 1) * 100%), transparent); border-radius: 8px;">
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
              appEl.style.cssText = 'width: 100%; height: 56px; background-color: transparent; display: flex; align-items: center; justify-content: center; cursor: grab; position: relative; user-select: none;';

              const innerEl = document.createElement('div');
              innerEl.className = 'dockit-grid-app-inner';
              innerEl.setAttribute('data-theme-colors', '--color-primary');
              innerEl.style.cssText = 'width: 56px; height: 56px; background-color: transparent; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s, box-shadow 0.2s; pointer-events: none;';
              innerEl.innerHTML = `<img src="${app.iconUrl}" alt="${app.title}" style="width: 38px; height: 38px; pointer-events: none;" draggable="false" />`;
              appEl.appendChild(innerEl);

              appEl.addEventListener('mouseenter', () => {
                innerEl.style.backgroundColor = 'var(--color-primary)';
              });
              appEl.addEventListener('mouseleave', () => {
                innerEl.style.backgroundColor = 'transparent';
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
              row.setAttribute('data-theme-colors', '--color-foreground');
              row.style.cssText = 'display: flex; align-items: center; padding: 8px 12px; gap: 10px; cursor: pointer; transition: background-color 0.15s; min-height: 48px;';

              row.innerHTML = `
                <img src="${item.iconUrl}" style="width: 24px; height: 24px; border-radius: 4px; flex-shrink: 0;" />
                <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 2px;">
                  <div style="font-weight: 500; font-size: 13px; color: var(--color-foreground);" data-theme-colors="--color-foreground">${item.title}</div>
                  <div style="font-size: 11px; color: var(--color-foreground); opacity: 0.5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.2;" data-theme-colors="--color-foreground-rgba">${_formatUrl(item.url)}</div>
                </div>
                <div class="dockit-suggestion-plus" style="width: 20px; height: 20px; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--color-primary); flex-shrink: 0;" data-theme-colors="--color-primary">
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
    if (name === 'Drive') return 'Drive';
    return name;
  }

  async openSystemApp(name) {
    if (this._flushProfileUpdates) await this._flushProfileUpdates();
    const inPage = this.element.querySelector('.dockit-in-page');
    if (!inPage) return;

    if (this.isSidePanel && chrome.runtime?.id) {
      chrome.storage.local.set({ activeSystemApp: name, activeApp: null });
    }
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
      } else if (name === 'Customization') {
        contentEl.innerHTML = `<div style="font-size: 14px; opacity: 0.8;">Loading customization...</div>`;
        await this._renderCustomization();
      } else if (name === 'Drive') {
        contentEl.innerHTML = `<div style="font-size: 14px; opacity: 0.8;">Loading Drive...</div>`;
        await this._renderDrive();
      } else {
        contentEl.innerHTML = `<div style="font-size: 14px; opacity: 0.8;">Welcome to ${name}</div>`;
      }
    }
    inPage.classList.remove('dockit-hidden');
    this._updateSidebarVisibility();
  }

  async closeSystemApp() {
    if (this._themeEditor) {
      this._themeEditor.discard();
      return;
    }
    const inPage = this.element.querySelector('.dockit-in-page');
    if (inPage) {
      inPage.classList.add('dockit-hidden');
      this._updateSidebarVisibility();

      if (this.isSidePanel && chrome.runtime?.id) {
        chrome.storage.local.remove('activeSystemApp');
      }

      if (this._flushProfileUpdates) await this._flushProfileUpdates();

      if (chrome.runtime?.id) {
        chrome.storage.local.get(['appwriteSession'], (data) => {
          if (data.appwriteSession) {
            chrome.runtime.sendMessage({ type: 'APPWRITE_SYNC_PUSH' }).catch(() => { });
          }
        });
      }
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
    const isActuallyOpen = inPage && !inPage.classList.contains('dockit-hidden');
    const host = this.element.getRootNode()?.host || document.getElementById('dockit-host-root');
    if (isActuallyOpen) {
      this.element.classList.add('dockit-sidebar-hidden');
      if (host) {
        host.classList.add('dockit-host-panel-open');
      }
      document.documentElement.classList.add('dockit-host-panel-open');
      document.body.classList.add('dockit-host-panel-open');
    } else {
      this.element.classList.remove('dockit-sidebar-hidden');
      if (host) {
        host.classList.remove('dockit-host-panel-open');
      }
      document.documentElement.classList.remove('dockit-host-panel-open');
      document.body.classList.remove('dockit-host-panel-open');
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
      el.setAttribute('data-theme-colors', '--color-primary, --color-foreground');
      el.dataset.id = app.id;
      el.dataset.list = listType;
      el.dataset.index = index;
      el.dataset.url = app.url;
      el.title = app.title;
      el.innerHTML = `<img src="${app.iconUrl}" alt="${app.title}" draggable="false" />`;

      //apply reactive loaded vs unloaded opacities based on in-page memory indicators
      if (this.isSidePanel) {
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
      if (this.isSidePanel) {
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
            const h = target.rect.height;
            const y = e.clientY - target.rect.top;
            if (y < h * 0.25) {
              target.el.style.boxShadow = '0 -3px 0 0 var(--color-primary)';
              target.el.style.backgroundColor = 'transparent';
            } else if (y > h * 0.75) {
              target.el.style.boxShadow = '0 3px 0 0 var(--color-primary)';
              target.el.style.backgroundColor = 'transparent';
            } else {
              target.el.style.boxShadow = 'none';
              target.el.style.backgroundColor = 'var(--color-primary)';
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
            const w = target.rect.width;
            const x = e.clientX - target.rect.left;
            const inner = target.el.querySelector('.dockit-grid-app-inner');
            if (x < w * 0.25) {
              if (inner) {
                inner.style.boxShadow = '-3px 0 0 0 var(--color-primary)';
                inner.style.backgroundColor = 'transparent';
              }
            } else if (x > w * 0.75) {
              if (inner) {
                inner.style.boxShadow = '3px 0 0 0 var(--color-primary)';
                inner.style.backgroundColor = 'transparent';
              }
            } else {
              if (inner) {
                inner.style.boxShadow = 'none';
                inner.style.backgroundColor = 'var(--color-primary)';
              }
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
        const oldRects = this._captureAppPositions();

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
            const h = target.rect.height;
            const y = e.clientY - target.rect.top;
            if (y < h * 0.25) {
              let idx = parseInt(target.el.dataset.index);
              await this._moveApp(ds.app, ds.listType, target.el.dataset.list, idx);
            } else if (y > h * 0.75) {
              let idx = parseInt(target.el.dataset.index) + 1;
              await this._moveApp(ds.app, ds.listType, target.el.dataset.list, idx);
            } else {
              await this._replaceApp(ds.app, ds.listType, target.el.dataset.list, target.el.dataset.id);
            }
          } else if (target.type === 'section') {
            await this._moveApp(ds.app, ds.listType, target.list, -1);
          }
        }

        this._dragState = null;
        this._animateAppPositions(oldRects);
      } else if (this._gridDragState) {
        const ds = this._gridDragState;
        const oldRects = this._captureAppPositions();
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
            const w = target.rect.width;
            const x = e.clientX - target.rect.left;
            if (x < w * 0.25) {
              let targetIndex = parseInt(target.el.dataset.index, 10);
              await this._moveGridApp(ds.app, targetIndex);
            } else if (x > w * 0.75) {
              let targetIndex = parseInt(target.el.dataset.index, 10) + 1;
              await this._moveGridApp(ds.app, targetIndex);
            } else {
              await this._replaceGridApp(ds.app, target.el.dataset.id);
            }
          }
        }

        this._gridDragState = null;
        this._animateAppPositions(oldRects);
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

  _captureAppPositions() {
    const rects = new Map();
    this.element.querySelectorAll('.dockit-app, .dockit-grid-app').forEach(el => {
      if (!el.dataset.id) return;
      const key = el.classList.contains('dockit-app') ? `sidebar_${el.dataset.id}` : `grid_${el.dataset.id}`;
      if (this._dragState && this._dragState.el === el && this._dragState.ghost) {
        rects.set(key, this._dragState.ghost.getBoundingClientRect());
      } else if (this._gridDragState && this._gridDragState.el === el && this._gridDragState.ghost) {
        rects.set(key, this._gridDragState.ghost.getBoundingClientRect());
      } else {
        rects.set(key, el.getBoundingClientRect());
      }
    });
    return rects;
  }

  _animateAppPositions(oldRects) {
    const afterRects = new Map();
    this.element.querySelectorAll('.dockit-app, .dockit-grid-app').forEach(el => {
      if (!el.dataset.id) return;
      const key = el.classList.contains('dockit-app') ? `sidebar_${el.dataset.id}` : `grid_${el.dataset.id}`;
      afterRects.set(key, { el, rect: el.getBoundingClientRect() });
    });

    afterRects.forEach((after, key) => {
      const beforeRect = oldRects.get(key);
      if (beforeRect) {
        const dx = beforeRect.left - after.rect.left;
        const dy = beforeRect.top - after.rect.top;
        if (dx !== 0 || dy !== 0) {
          after.el.style.transform = `translate(${dx}px, ${dy}px)`;
          after.el.style.transition = 'none';
          
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              after.el.style.transform = 'translate(0, 0)';
              after.el.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
              const cleanup = (e) => {
                if (e.target !== after.el) return;
                after.el.style.transform = '';
                after.el.style.transition = '';
                after.el.removeEventListener('transitionend', cleanup);
              };
              after.el.addEventListener('transitionend', cleanup);
            });
          });
        }
      }
    });
  }

  _clearHighlights() {
    this.element.querySelectorAll('.dockit-app').forEach(el => {
      el.style.boxShadow = '';
      el.style.backgroundColor = '';
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
    await this.refreshActiveSite();
  }

  async _replaceApp(draggedApp, fromList, toList, targetId) {
    const data = await chrome.storage.local.get(['pinnedApps', 'temporaryApps']);
    let fromArr = fromList === 'pinned' ? (data.pinnedApps || []) : (data.temporaryApps || []);
    let toArr = toList === 'pinned' ? (data.pinnedApps || []) : (data.temporaryApps || []);

    const origIndex = fromArr.findIndex(a => a.id === draggedApp.id);
    if (origIndex !== -1) {
      fromArr.splice(origIndex, 1);
    }
    
    if (fromList === 'pinned') data.pinnedApps = fromArr; else data.temporaryApps = fromArr;
    toArr = toList === 'pinned' ? (data.pinnedApps || []) : (data.temporaryApps || []);

    const targetIndex = toArr.findIndex(a => a.id === targetId);
    if (targetIndex !== -1) {
      toArr.splice(targetIndex, 1, draggedApp);
    } else {
      toArr.push(draggedApp);
    }

    if (toList === 'pinned') data.pinnedApps = toArr; else data.temporaryApps = toArr;

    await chrome.storage.local.set({ pinnedApps: data.pinnedApps, temporaryApps: data.temporaryApps });
    await this.loadData();
    await this.refreshActiveSite();
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
    await this.refreshActiveSite();
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
      const inner = el.querySelector('.dockit-grid-app-inner');
      if (inner) {
        inner.style.boxShadow = '';
        inner.style.backgroundColor = '';
      }
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

  async _replaceGridApp(draggedApp, targetId) {
    const data = await chrome.storage.local.get(['pinnedApps']);
    let pinnedApps = data.pinnedApps || [];

    const origIndex = pinnedApps.findIndex(a => a.id === draggedApp.id);
    if (origIndex !== -1) {
      pinnedApps.splice(origIndex, 1);
    }

    const targetIndex = pinnedApps.findIndex(a => a.id === targetId);
    if (targetIndex !== -1) {
      pinnedApps.splice(targetIndex, 1, draggedApp);
    } else {
      pinnedApps.push(draggedApp);
    }

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
          <div class="dockit-settings-search-wrapper" data-theme-colors="--color-primary, --color-border, --color-secondary">
            ${searchIconSvg}
            <input class="dockit-settings-search-input" id="dockit-settings-search" type="text" placeholder="Search..." data-theme-colors="--color-foreground" />
          </div>
          <label class="dockit-settings-expand-all-wrapper" id="dockit-settings-toggle-all-label">
            <input class="dockit-settings-expand-all-input" id="dockit-settings-toggle-all" type="checkbox" checked data-theme-colors="--color-primary, --color-border" />
            <span class="dockit-settings-expand-all-label" id="dockit-settings-toggle-all-text" data-theme-colors="--color-foreground">Collapse All</span>
          </label>
        </div>

        <div class="dockit-settings-list">
          <!-- Language Category -->
          <div class="dockit-settings-category" data-category="language" data-theme-colors="--color-border, --color-secondary">
            <div class="dockit-settings-category-header">
              <span class="dockit-settings-category-title" data-theme-colors="--color-foreground">Language</span>
              <span class="dockit-settings-category-chevron" data-theme-colors="--color-foreground">${chevronUpSvg}</span>
            </div>
            <div class="dockit-settings-category-content">
              <div class="dockit-settings-item" data-title="select language" data-desc="change the interface language of settings">
                <div class="dockit-settings-item-info">
                  <span class="dockit-settings-item-title" data-theme-colors="--color-foreground">Select Language</span>
                  <span class="dockit-settings-item-desc" data-theme-colors="--color-foreground-rgba">Change the interface language of settings.</span>
                </div>
                <div class="dockit-settings-item-control" style="width: 140px; position: relative;">
                  <div class="dockit-settings-language-picker" id="dockit-lang-picker" data-theme-colors="--color-border, --color-secondary, --color-foreground">
                    <div class="dockit-language-selected">
                      <img class="dockit-flag-icon" src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f1fa-1f1f8.svg" />
                      <span>English</span>
                    </div>
                    <div class="dockit-language-dropdown">
                      <div class="dockit-language-option is-selected" data-lang="en" data-theme-colors="--color-primary, --color-background, --color-foreground">
                        <img class="dockit-flag-icon" src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f1fa-1f1f8.svg" />
                        <span>English</span>
                      </div>
                      <div class="dockit-language-option" data-lang="es" data-theme-colors="--color-primary, --color-background, --color-foreground">
                        <img class="dockit-flag-icon" src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f1ea-1f1f8.svg" />
                        <span>Español</span>
                      </div>
                      <div class="dockit-language-option" data-lang="fr" data-theme-colors="--color-primary, --color-background, --color-foreground">
                        <img class="dockit-flag-icon" src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f1eb-1f1f7.svg" />
                        <span>Français</span>
                      </div>
                      <div class="dockit-language-option" data-lang="de" data-theme-colors="--color-primary, --color-background, --color-foreground">
                        <img class="dockit-flag-icon" src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f1e9-1f1ea.svg" />
                        <span>Deutsch</span>
                      </div>
                      <div class="dockit-language-option" data-lang="ja" data-theme-colors="--color-primary, --color-background, --color-foreground">
                        <img class="dockit-flag-icon" src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f1ef-1f1f5.svg" />
                        <span>日本語</span>
                      </div>
                      <div class="dockit-language-option" data-lang="zh" data-theme-colors="--color-primary, --color-background, --color-foreground">
                        <img class="dockit-flag-icon" src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f1e8-1f1f3.svg" />
                        <span>中文</span>
                      </div>
                    </div>
                  </div>
                  <div class="dockit-translation-loading" id="dockit-translation-status" data-theme-colors="--color-foreground-rgba">Translating...</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Appearance Category -->
          <div class="dockit-settings-category" data-category="appearance" data-theme-colors="--color-border, --color-secondary">
            <div class="dockit-settings-category-header">
              <span class="dockit-settings-category-title" data-theme-colors="--color-foreground">Appearance</span>
              <span class="dockit-settings-category-chevron" data-theme-colors="--color-foreground">${chevronUpSvg}</span>
            </div>
            <div class="dockit-settings-category-content">
              <div class="dockit-settings-item" data-title="enable taper" data-desc="enable rounded edges along the sidebar">
                <div class="dockit-settings-item-info">
                  <span class="dockit-settings-item-title" data-theme-colors="--color-foreground">Enable Taper</span>
                  <span class="dockit-settings-item-desc" data-theme-colors="--color-foreground-rgba">Enable rounded edges along the sidebar.</span>
                </div>
                <div class="dockit-settings-item-control">
                  <label class="dockit-ios-switch">
                    <input type="checkbox" id="setting-appearance-taper" />
                    <span class="dockit-ios-slider" data-theme-colors="--color-primary, --color-border, --color-background"></span>
                  </label>
                </div>
              </div>
              <div class="dockit-settings-item" data-title="show url bar" data-desc="display url and navigation controls in side panels">
                <div class="dockit-settings-item-info">
                  <span class="dockit-settings-item-title" data-theme-colors="--color-foreground">Show URL Bar</span>
                  <span class="dockit-settings-item-desc" data-theme-colors="--color-foreground-rgba">Display URL and navigation controls in side panels.</span>
                </div>
                <div class="dockit-settings-item-control">
                  <label class="dockit-ios-switch">
                    <input type="checkbox" id="setting-appearance-urlbar" checked />
                    <span class="dockit-ios-slider" data-theme-colors="--color-primary, --color-border, --color-background"></span>
                  </label>
                </div>
              </div>
              <div class="dockit-settings-item" data-title="mobile default view" data-desc="open apps using the mobile site by default">
                <div class="dockit-settings-item-info">
                  <span class="dockit-settings-item-title" data-theme-colors="--color-foreground">Mobile Default View</span>
                  <span class="dockit-settings-item-desc" data-theme-colors="--color-foreground-rgba">Open apps using the mobile site by default.</span>
                </div>
                <div class="dockit-settings-item-control">
                  <label class="dockit-ios-switch">
                    <input type="checkbox" id="dockit-settings-mobiledefault" checked />
                    <span class="dockit-ios-slider" data-theme-colors="--color-primary, --color-border, --color-background"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Functionality Category -->
          <div class="dockit-settings-category" data-category="functionality" data-theme-colors="--color-border, --color-secondary">
            <div class="dockit-settings-category-header">
              <span class="dockit-settings-category-title" data-theme-colors="--color-foreground">Functionality</span>
              <span class="dockit-settings-category-chevron" data-theme-colors="--color-foreground">${chevronUpSvg}</span>
            </div>
            <div class="dockit-settings-category-content">
              <div class="dockit-settings-item" data-title="auto-hide sidepanel" data-desc="automatically hide side panels when focus is lost">
                <div class="dockit-settings-item-info">
                  <span class="dockit-settings-item-title" data-theme-colors="--color-foreground">Auto-hide Sidebar</span>
                  <span class="dockit-settings-item-desc" data-theme-colors="--color-foreground-rgba">Automatically hide side panels when focus is lost.</span>
                </div>
                <div class="dockit-settings-item-control">
                  <label class="dockit-ios-switch">
                    <input type="checkbox" id="setting-functionality-autohide" />
                    <span class="dockit-ios-slider" data-theme-colors="--color-primary, --color-border, --color-background"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Blocklists Category -->
          <div class="dockit-settings-category" data-category="blocklists" data-theme-colors="--color-border, --color-secondary">
            <div class="dockit-settings-category-header">
              <span class="dockit-settings-category-title" data-theme-colors="--color-foreground">Blocklists</span>
              <span class="dockit-settings-category-chevron" data-theme-colors="--color-foreground">${chevronUpSvg}</span>
            </div>
            <div class="dockit-settings-category-content">
              <!-- Disable Sidebar -->
              <div class="dockit-settings-item" data-title="disable sidebar" data-desc="pages where the sidebar will be completely disabled">
                <div class="dockit-settings-list-wrapper">
                  <div class="dockit-settings-item-info">
                    <span class="dockit-settings-item-title" data-theme-colors="--color-foreground">Disable Sidebar</span>
                    <span class="dockit-settings-item-desc" data-theme-colors="--color-foreground-rgba">Pages where the sidebar will be completely disabled.</span>
                  </div>
                  <div class="dockit-settings-list-input-container" data-theme-colors="--color-border">
                    <input class="dockit-settings-list-input" type="text" placeholder="${currentSitePlaceholder}" id="input-blocklist-disable" data-theme-colors="--color-foreground" />
                    <button class="dockit-settings-list-add-btn" data-target="blocklist-disable" data-theme-colors="--color-primary">Add</button>
                  </div>
                  <div class="dockit-settings-tags" id="tags-blocklist-disable"></div>
                </div>
              </div>
              <!-- Force Auto-hide -->
              <div class="dockit-settings-item" data-title="force auto-hide" data-desc="pages that will always force auto-hide behavior">
                <div class="dockit-settings-list-wrapper">
                  <div class="dockit-settings-item-info">
                    <span class="dockit-settings-item-title" data-theme-colors="--color-foreground">Force Auto-hide</span>
                    <span class="dockit-settings-item-desc" data-theme-colors="--color-foreground-rgba">Pages that will always force auto-hide behavior.</span>
                  </div>
                  <div class="dockit-settings-list-input-container" data-theme-colors="--color-border">
                    <input class="dockit-settings-list-input" type="text" placeholder="${currentSitePlaceholder}" id="input-blocklist-autohide" data-theme-colors="--color-foreground" />
                    <button class="dockit-settings-list-add-btn" data-target="blocklist-autohide" data-theme-colors="--color-primary">Add</button>
                  </div>
                  <div class="dockit-settings-tags" id="tags-blocklist-autohide"></div>
                </div>
              </div>
              <!-- Force View -->
              <div class="dockit-settings-item" data-title="force opposite view" data-desc="pages that will force the opposite of the default view">
                <div class="dockit-settings-list-wrapper">
                  <div class="dockit-settings-item-info">
                    <span class="dockit-settings-item-title" id="title-blocklist-forceview" data-theme-colors="--color-foreground">${forceViewTitle}</span>
                    <span class="dockit-settings-item-desc" id="desc-blocklist-forceview" data-theme-colors="--color-foreground-rgba">${forceViewDesc}</span>
                  </div>
                  <div class="dockit-settings-list-input-container" data-theme-colors="--color-border">
                    <input class="dockit-settings-list-input" type="text" placeholder="${currentSitePlaceholder}" id="input-blocklist-forceview" data-theme-colors="--color-foreground" />
                    <button class="dockit-settings-list-add-btn" data-target="blocklist-forceview" data-theme-colors="--color-primary">Add</button>
                  </div>
                  <div class="dockit-settings-tags" id="tags-blocklist-forceview"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Debug Category -->
          <div class="dockit-settings-category" data-category="debug" data-theme-colors="--color-border, --color-secondary">
            <div class="dockit-settings-category-header">
              <span class="dockit-settings-category-title" data-theme-colors="--color-foreground">Debug</span>
              <span class="dockit-settings-category-chevron" data-theme-colors="--color-foreground">${chevronUpSvg}</span>
            </div>
            <div class="dockit-settings-category-content">
              <div class="dockit-settings-item" data-title="cloud sync" data-desc="force instant synchronization of configuration to the cloud">
                <div class="dockit-settings-item-info">
                  <span class="dockit-settings-item-title" data-theme-colors="--color-foreground">Cloud Sync</span>
                  <span class="dockit-settings-item-desc" data-theme-colors="--color-foreground-rgba">Force instant synchronization of configuration to the cloud.</span>
                </div>
                <div class="dockit-settings-item-control" style="width: 100px;">
                  <button class="dockit-settings-btn" id="btn-debug-sync" data-theme-colors="--color-border, --color-foreground">Sync Now</button>
                </div>
              </div>
              <div class="dockit-settings-item" data-title="clear cache" data-desc="purge cached asset resources and system pre-fetches">
                <div class="dockit-settings-item-info">
                  <span class="dockit-settings-item-title" data-theme-colors="--color-foreground">Clear Cache</span>
                  <span class="dockit-settings-item-desc" data-theme-colors="--color-foreground-rgba">Purge cached asset resources and system pre-fetches.</span>
                </div>
                <div class="dockit-settings-item-control" style="width: 100px;">
                  <button class="dockit-settings-btn" id="btn-debug-cache" data-theme-colors="--color-border, --color-foreground">Clear Cache</button>
                </div>
              </div>
              <div class="dockit-settings-item" data-title="clear data" data-desc="clear all extension storage and reset default states">
                <div class="dockit-settings-item-info">
                  <span class="dockit-settings-item-title" data-theme-colors="--color-foreground">Clear Local Data</span>
                  <span class="dockit-settings-item-desc" data-theme-colors="--color-foreground-rgba">Clear all local extension storage and reset default states.</span>
                </div>
                <div class="dockit-settings-item-control" style="width: 100px;">
                  <button class="dockit-settings-btn accent" id="btn-debug-clear" data-theme-colors="--color-accent, --color-accent-rgba, --color-foreground">Clear Data</button>
                </div>
              </div>
              <div class="dockit-settings-item" data-title="clear cloud data" data-desc="clear all synced data from the cloud">
                <div class="dockit-settings-item-info">
                  <span class="dockit-settings-item-title" data-theme-colors="--color-foreground">Clear All Data</span>
                  <span class="dockit-settings-item-desc" data-theme-colors="--color-foreground-rgba">Clear all synced settings and data stored in the cloud.</span>
                </div>
                <div class="dockit-settings-item-control" style="width: 100px;">
                  <button class="dockit-settings-btn accent" id="btn-debug-clear-cloud" data-theme-colors="--color-accent, --color-accent-rgba, --color-foreground">Clear Cloud</button>
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
        tagEl.setAttribute('data-theme-colors', '--color-border, --color-foreground');
        tagEl.innerHTML = `
          <span data-theme-colors="--color-foreground">${tag}</span>
          <span class="dockit-settings-tag-remove" data-index="${idx}" data-theme-colors="--color-accent, --color-foreground">${xIconSvg}</span>
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
        'clear cloud data': ['clear_cloud_data', 'clear_cloud_data_desc'],
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
      const clearCloudBtn = contentEl.querySelector('#btn-debug-clear-cloud');
      if (clearCloudBtn && !clearCloudBtn.dataset.busy) clearCloudBtn.textContent = t('clear_cloud');

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
      syncBtn.addEventListener('click', async () => {
        if (syncBtn.dataset.busy) return;
        syncBtn.dataset.busy = '1';
        syncBtn.textContent = 'Authenticating...';

        try {
          const storage = await chrome.storage.local.get(['appwriteSession']);
          if (!storage.appwriteSession) {
            delete syncBtn.dataset.busy;
            syncBtn.textContent = t('sync_now');

            const overlay = document.createElement('div');
            Object.assign(overlay.style, {
              position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
              backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: '9999999', opacity: '0', transition: 'opacity 0.2s'
            });

            const dialog = document.createElement('div');
            Object.assign(dialog.style, {
              backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-border)',
              borderRadius: '12px', padding: '20px', maxWidth: '300px', width: '90%',
              color: 'var(--color-foreground)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              transform: 'scale(0.95)', transition: 'transform 0.2s', display: 'flex',
              flexDirection: 'column', gap: '16px', textAlign: 'center'
            });

            const title = document.createElement('div');
            title.style.fontWeight = '600';
            title.style.fontSize = '16px';
            title.textContent = 'Authentication Required';

            const desc = document.createElement('div');
            desc.style.fontSize = '13px';
            desc.style.lineHeight = '1.5';
            desc.style.color = 'var(--color-foreground-rgba)';
            desc.textContent = 'You must be logged in to sync your workspace. Please go to the Customization tab to connect your account.';

            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'Close';
            Object.assign(closeBtn.style, {
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              backgroundColor: 'var(--color-primary)', color: '#fff', cursor: 'pointer',
              fontSize: '13px', fontWeight: 'bold'
            });

            closeBtn.addEventListener('click', () => {
              overlay.style.opacity = '0';
              dialog.style.transform = 'scale(0.95)';
              setTimeout(() => overlay.remove(), 200);
            });

            dialog.appendChild(title);
            dialog.appendChild(desc);
            dialog.appendChild(closeBtn);
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            requestAnimationFrame(() => {
              overlay.style.opacity = '1';
              dialog.style.transform = 'scale(1)';
            });

            return;
          }

          syncBtn.textContent = 'Syncing...';
          const syncRes = await chrome.runtime.sendMessage({ type: 'APPWRITE_SYNC_PUSH' });
          if (!syncRes || !syncRes.success) throw new Error(syncRes?.error || 'Sync failed');

          syncBtn.textContent = 'Synced!';
        } catch (e) {
          syncBtn.textContent = 'Failed';
          console.error(e);
        }

        setTimeout(() => {
          delete syncBtn.dataset.busy;
          syncBtn.textContent = t('sync_now');
        }, 2000);
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

        if (chrome.runtime?.id) {
          chrome.runtime.sendMessage({ type: 'REFETCH_ASSETS' });
        }

        setTimeout(() => {
          clearBtn.textContent = 'Reset!';
          setTimeout(() => { window.location.reload(); }, 500);
        }, 800);
      });
    }

    const clearCloudBtn = contentEl.querySelector('#btn-debug-clear-cloud');
    if (clearCloudBtn) {
      clearCloudBtn.addEventListener('click', async () => {
        if (clearCloudBtn.dataset.busy) return;
        clearCloudBtn.dataset.busy = '1';
        clearCloudBtn.textContent = 'Calculating...';

        try {
          const storage = await chrome.storage.local.get(['appwriteSession']);
          if (!storage.appwriteSession) {
            const authRes = await chrome.runtime.sendMessage({ type: 'APPWRITE_LOGIN' });
            if (!authRes || !authRes.success) throw new Error(authRes?.error || 'Auth failed');
          }

          const countRes = await chrome.runtime.sendMessage({ type: 'APPWRITE_GET_CLOUD_DATA_COUNTS' });
          if (!countRes || !countRes.success) throw new Error(countRes?.error || 'Failed to fetch counts');

          const { settings, profiles, themes, interactions } = countRes.counts;
          const msg = `Are you sure you want to completely erase all your cloud data?\n\nThis will permanently delete:\n- ${settings} Settings profile(s)\n- ${profiles} User profile(s)\n- ${themes} Published Theme(s)\n- ${interactions} Like(s) / Download(s)\n\nThis action cannot be undone.`;

          const confirmed = await new Promise(resolve => {
            const overlay = document.createElement('div');
            Object.assign(overlay.style, {
              position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
              backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: '9999999', opacity: '0', transition: 'opacity 0.2s'
            });

            const dialog = document.createElement('div');
            Object.assign(dialog.style, {
              backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-border)',
              borderRadius: '12px', padding: '20px', maxWidth: '300px', width: '90%',
              color: 'var(--color-foreground)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              transform: 'scale(0.95)', transition: 'transform 0.2s', display: 'flex',
              flexDirection: 'column', gap: '16px'
            });

            const text = document.createElement('div');
            text.style.fontSize = '13px';
            text.style.lineHeight = '1.5';
            text.style.whiteSpace = 'pre-wrap';
            text.textContent = msg;

            const btnContainer = document.createElement('div');
            btnContainer.style.display = 'flex';
            btnContainer.style.gap = '10px';
            btnContainer.style.justifyContent = 'flex-end';

            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancel';
            Object.assign(cancelBtn.style, {
              padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)',
              backgroundColor: 'transparent', color: 'var(--color-foreground)', cursor: 'pointer',
              fontSize: '12px'
            });

            const confirmBtn = document.createElement('button');
            confirmBtn.textContent = 'Erase Data';
            Object.assign(confirmBtn.style, {
              padding: '6px 12px', borderRadius: '6px', border: 'none',
              backgroundColor: 'var(--color-accent)', color: '#fff', cursor: 'pointer',
              fontSize: '12px', fontWeight: 'bold'
            });

            btnContainer.appendChild(cancelBtn);
            btnContainer.appendChild(confirmBtn);
            dialog.appendChild(text);
            dialog.appendChild(btnContainer);
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            requestAnimationFrame(() => { 
              overlay.style.opacity = '1';
              dialog.style.transform = 'scale(1)';
            });

            const close = (res) => {
              overlay.style.opacity = '0';
              dialog.style.transform = 'scale(0.95)';
              setTimeout(() => { overlay.remove(); resolve(res); }, 200);
            };

            cancelBtn.onclick = () => close(false);
            confirmBtn.onclick = () => close(true);
          });

          if (!confirmed) {
            clearCloudBtn.textContent = t('clear_cloud');
            delete clearCloudBtn.dataset.busy;
            return;
          }

          clearCloudBtn.textContent = 'Clearing...';
          const clearRes = await chrome.runtime.sendMessage({ type: 'APPWRITE_SYNC_CLEAR' });
          if (!clearRes || !clearRes.success) throw new Error(clearRes?.error || 'Clear failed');

          clearCloudBtn.textContent = 'Resetting...';
          const storageAll = await chrome.storage.local.get(null);
          const keysToRemove = Object.keys(storageAll).filter(key => !key.startsWith('sidePanelOpen_'));
          await chrome.storage.local.remove(keysToRemove);
          if (chrome.runtime?.id) {
            chrome.runtime.sendMessage({ type: 'REFETCH_ASSETS' });
          }

          clearCloudBtn.textContent = 'Cleared!';
          setTimeout(() => { window.location.reload(); }, 500);
          return;
        } catch (err) {
          clearCloudBtn.textContent = 'Failed';
          console.error(err);
        }

        setTimeout(() => {
          delete clearCloudBtn.dataset.busy;
          clearCloudBtn.textContent = t('clear_cloud');
        }, 2000);
      });
    }
  }

  async _renderCustomization(isBackground = false) {
    const contentEl = this.element.querySelector('#dockit-in-page-content');
    if (!contentEl) return;

    const storageData = await chrome.storage.local.get(['appwriteSession', 'lucideIcons']);
    const searchIconSvg = (storageData.lucideIcons && storageData.lucideIcons['search']) || `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;

    contentEl.innerHTML = `
      <div class="dockit-customization-container" style="display: flex; flex-direction: column; height: 100%; position: relative;">
        <div style="padding: 16px; display: flex; flex-direction: column; gap: 12px; border-bottom: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent); flex-shrink: 0;" data-theme-colors="--color-border">
          
          <div id="dockit-profile-dashboard" style="display: none; flex-direction: column; gap: 16px; margin-bottom: 4px; padding-bottom: 12px; border-bottom: 1px dashed color-mix(in srgb, var(--color-border) 40%, transparent);" data-theme-colors="--color-border"></div>

          <button class="dockit-btn dockit-enter-editor-btn" id="dockit-enter-editor-btn" style="width: 100%; height: 86px; position: relative; overflow: hidden; border-radius: 12px; border: 1px solid color-mix(in srgb, var(--color-border) 30%, transparent); cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center; transition: filter 0.2s ease, transform 0.2s ease; background: var(--color-background);" data-theme-colors="--color-border, --color-background">
            <img src="https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.9;" alt="Theme background">
            <div style="position: absolute; inset: 0; background: linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%);"></div>
            <div style="position: relative; z-index: 1; display: flex; flex-direction: column; align-items: flex-start; padding: 0 20px; width: 100%; text-align: left;">
              <span style="color: #ffffff; font-weight: 600; font-size: 16px; letter-spacing: 0.3px;">Theme Studio</span>
              <span style="color: rgba(255,255,255,0.75); font-weight: 400; font-size: 13px; margin-top: 4px;">Craft your perfect workspace</span>
            </div>
          </button>

          <div style="display: flex; gap: 8px;">
            <div class="dockit-settings-search-wrapper dockit-search-bar-container" style="flex: 1;" data-theme-colors="--color-primary, --color-border, --color-secondary">
              ${searchIconSvg}
              <input type="search" id="dockit-theme-search" class="dockit-settings-search-input dockit-search-input" placeholder="Search themes..." data-theme-colors="--color-foreground" />
            </div>
            <div style="position: relative; display: flex;">
              <button id="dockit-theme-filter-btn" class="dockit-btn" style="background: transparent; border: 1px solid color-mix(in srgb, var(--color-border) 80%, transparent); border-radius: 8px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--color-foreground); transition: background 0.2s;" title="Filter Themes" data-theme-colors="--color-border, --color-foreground">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              </button>
              <div id="dockit-theme-filter-dropdown" style="display: none; position: absolute; top: calc(100% + 4px); right: 0; background-color: color-mix(in srgb, var(--color-secondary) calc(var(--menu-opacity-value, 1) * 100%), transparent); border: 1px solid color-mix(in srgb, var(--color-border) calc(var(--menu-opacity-value, 1) * 100%), transparent); border-radius: 8px; z-index: 1000; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); min-width: 140px; padding: 6px 0;" data-theme-colors="--color-border, --color-secondary">
                <div class="dockit-filter-option active" data-value="community" style="padding: 8px 12px; font-size: 13px; cursor: pointer; color: var(--color-primary); background: color-mix(in srgb, var(--color-primary) 15%, transparent); display: flex; justify-content: space-between; align-items: center;" data-theme-colors="--color-primary">
                  All <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div class="dockit-filter-option" data-value="liked" style="padding: 8px 12px; font-size: 13px; cursor: pointer; color: var(--color-foreground); display: flex; justify-content: space-between; align-items: center;" data-theme-colors="--color-foreground">
                  Liked
                </div>
                <div class="dockit-filter-option" data-value="mine" style="padding: 8px 12px; font-size: 13px; cursor: pointer; color: var(--color-foreground); display: flex; justify-content: space-between; align-items: center;" data-theme-colors="--color-foreground">
                  Your Themes
                </div>
              </div>
            </div>
          </div>
          
          <div style="display: flex; position: relative; border-bottom: 1px solid var(--color-border);" data-theme-colors="--color-border">
            <div class="dockit-filter-btn active" data-sort="downloads" style="flex: 1; text-align: center; padding: 8px 0; font-size: 13px; font-weight: 600; cursor: pointer; color: var(--color-foreground); transition: color 0.2s, opacity 0.2s;" data-theme-colors="--color-foreground">Popular</div>
            <div class="dockit-filter-btn" data-sort="created" style="flex: 1; text-align: center; padding: 8px 0; font-size: 13px; font-weight: 600; cursor: pointer; color: var(--color-foreground); opacity: 0.6; transition: color 0.2s, opacity 0.2s;" data-theme-colors="--color-foreground">Newest</div>
            <div id="dockit-filter-indicator" style="position: absolute; bottom: -1px; left: 0; width: 50%; height: 2px; background: var(--color-primary); transition: transform 0.3s ease;" data-theme-colors="--color-primary"></div>
          </div>
        </div>

        <div id="dockit-theme-gallery" style="flex: 1; overflow-y: auto; padding: 16px; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; align-content: flex-start;">
        </div>
      </div>
    `;

    const galleryEl = contentEl.querySelector('#dockit-theme-gallery');
    const searchInput = contentEl.querySelector('#dockit-theme-search');
    const filterBtn = contentEl.querySelector('#dockit-theme-filter-btn');
    const filterBtns = contentEl.querySelectorAll('.dockit-filter-btn');
    const enterBtn = contentEl.querySelector('#dockit-enter-editor-btn');

    if (enterBtn) {
      enterBtn.addEventListener('click', () => this.enterThemeEditor());
    }

    if (storageData.appwriteSession) {
      this._renderProfileDashboard(contentEl.querySelector('#dockit-profile-dashboard'), storageData.appwriteSession);
    } else {
      const dashboardEl = contentEl.querySelector('#dockit-profile-dashboard');
      dashboardEl.style.display = 'flex';
      const checkSvg = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--color-primary)" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 1px;"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      const googleSvg = `<svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>`;
      const msSvg = `<svg viewBox="0 0 21 21" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/><rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/></svg>`;

      dashboardEl.innerHTML = `
        <div style="padding-bottom: 4px;">
          <div style="font-size: 15px; font-weight: 700; color: var(--color-foreground); margin-bottom: 8px;" data-theme-colors="--color-foreground">Connect & Sync Your Workspace</div>
          <div style="font-size: 13px; color: color-mix(in srgb, var(--color-foreground) 65%, transparent); margin-bottom: 20px; line-height: 1.5;" data-theme-colors="--color-foreground">Join now to activate secure, real-time cloud synchronization and premium features.</div>
          
          <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; line-height: 1.5;">
              ${checkSvg}
              <div style="color: color-mix(in srgb, var(--color-foreground) 75%, transparent);" data-theme-colors="--color-foreground">
                <span style="font-weight: 600; color: var(--color-foreground);" data-theme-colors="--color-foreground">Free Forever:</span> Access all cloud features, synchronization, and 2GB of free storage without any costs.
              </div>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; line-height: 1.5;">
              ${checkSvg}
              <div style="color: color-mix(in srgb, var(--color-foreground) 75%, transparent);" data-theme-colors="--color-foreground">
                <span style="font-weight: 600; color: var(--color-foreground);" data-theme-colors="--color-foreground">Real-time Cloud Sync:</span> Keep pinned apps and custom settings aligned across all your browsers and devices instantly.
              </div>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; line-height: 1.5;">
              ${checkSvg}
              <div style="color: color-mix(in srgb, var(--color-foreground) 75%, transparent);" data-theme-colors="--color-foreground">
                <span style="font-weight: 600; color: var(--color-foreground);" data-theme-colors="--color-foreground">Community Theme Store:</span> Publish your own customized themes, like creations, and download curated designs.
              </div>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; line-height: 1.5;">
              ${checkSvg}
              <div style="color: color-mix(in srgb, var(--color-foreground) 75%, transparent);" data-theme-colors="--color-foreground">
                <span style="font-weight: 600; color: var(--color-foreground);" data-theme-colors="--color-foreground">Dockit Warp:</span> Drag-and-drop sharing between your devices.
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 12px;">
            <button id="dockit-login-google" class="dockit-btn" style="flex: 1; display: flex; align-items: center; justify-content: center; background: transparent; border: 1px solid color-mix(in srgb, var(--color-border) 60%, transparent); padding: 12px 0; border-radius: 8px; cursor: pointer; transition: background 0.2s;" data-theme-colors="--color-border">
              ${googleSvg}
            </button>
            <button id="dockit-login-microsoft" class="dockit-btn" style="flex: 1; display: flex; align-items: center; justify-content: center; background: transparent; border: 1px solid color-mix(in srgb, var(--color-border) 60%, transparent); padding: 12px 0; border-radius: 8px; cursor: pointer; transition: background 0.2s;" data-theme-colors="--color-border">
              ${msSvg}
            </button>
          </div>
        </div>
      `;

      const btnGoogle = dashboardEl.querySelector('#dockit-login-google');
      const btnMicrosoft = dashboardEl.querySelector('#dockit-login-microsoft');

      const loginFn = async (provider) => {
        const btn = provider === 'google' ? btnGoogle : btnMicrosoft;
        const originalText = btn.textContent;
        btn.textContent = 'Wait...';
        const res = await chrome.runtime.sendMessage({ type: 'APPWRITE_LOGIN', provider });
        if (res && res.success) {
          this._renderCustomization();
        } else {
          btn.textContent = 'Failed';
          setTimeout(() => btn.textContent = originalText, 2000);
        }
      };

      btnGoogle.addEventListener('click', () => loginFn('google'));
      btnMicrosoft.addEventListener('click', () => loginFn('microsoft'));
    }

    let currentQuery = '';
    let currentSort = 'downloads';
    let currentFilter = 'community';
    let isFetching = false;

    const filterDropdown = contentEl.querySelector('#dockit-theme-filter-dropdown');
    if (filterBtn && filterDropdown) {
      filterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        filterDropdown.style.display = filterDropdown.style.display === 'none' ? 'block' : 'none';
      });

      document.addEventListener('click', (e) => {
        if (filterDropdown.isConnected && !filterDropdown.contains(e.target) && !filterBtn.contains(e.target)) {
          filterDropdown.style.display = 'none';
        }
      });

      const updateDropdownUI = (selectedVal) => {
        const options = filterDropdown.querySelectorAll('.dockit-filter-option');
        options.forEach(opt => {
          if (opt.dataset.value === selectedVal) {
            opt.style.color = 'var(--color-primary)';
            opt.style.background = 'color-mix(in srgb, var(--color-primary) 15%, transparent)';
            if (!opt.querySelector('svg')) {
              opt.innerHTML += ' <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            }
          } else {
            opt.style.color = 'var(--color-foreground)';
            opt.style.background = 'transparent';
            const svg = opt.querySelector('svg');
            if (svg) svg.remove();
          }
        });
      };

      const options = filterDropdown.querySelectorAll('.dockit-filter-option');
      options.forEach(opt => {
        opt.addEventListener('mouseenter', () => {
          if (opt.dataset.value !== currentFilter) opt.style.background = 'color-mix(in srgb, var(--color-foreground) 10%, transparent)';
        });
        opt.addEventListener('mouseleave', () => {
          if (opt.dataset.value !== currentFilter) opt.style.background = 'transparent';
        });

        opt.addEventListener('click', async (e) => {
          e.stopPropagation();
          filterDropdown.style.display = 'none';
          const newValue = opt.dataset.value;

          if (newValue !== 'community') {
            const hasSession = !!(await chrome.storage.local.get(['appwriteSession'])).appwriteSession;
            if (!hasSession) {
              this.showDialog({ message: 'You must be logged in to filter themes.' });
              return;
            }
          }

          currentFilter = newValue;
          updateDropdownUI(currentFilter);

          if (currentFilter === 'community') {
            filterBtn.style.background = 'transparent';
            filterBtn.style.color = 'var(--color-foreground)';
          } else if (currentFilter === 'liked') {
            filterBtn.style.background = 'color-mix(in srgb, var(--color-primary) 15%, transparent)';
            filterBtn.style.color = 'var(--color-primary)';
          } else {
            filterBtn.style.background = 'color-mix(in srgb, var(--color-primary) 30%, transparent)';
            filterBtn.style.color = 'var(--color-primary)';
          }

          loadBatch(true);
        });
      });
    }

    if (!this.themeGalleryCache) {
      this.themeGalleryCache = {};
    }

    const getStateKey = () => {
      const qKey = currentQuery ? `search_${currentQuery}` : currentSort;
      return `${qKey}_${currentFilter}`;
    };

    const getState = () => {
      const key = getStateKey();
      if (!this.themeGalleryCache[key]) {
        this.themeGalleryCache[key] = { data: [], cursor: null, hasMore: true };
      }
      return this.themeGalleryCache[key];
    };

    const renderGallery = () => {
      galleryEl.innerHTML = '';
      const state = getState();

      if (state.data.length === 0 && !state.hasMore) {
        galleryEl.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; opacity: 0.5; padding: 40px 0;">No themes found.</div>';
        return;
      }

      state.data.forEach(doc => {
        let themeData;
        try {
          themeData = JSON.parse(doc.theme || doc.payload);
          themeData.name = doc.name;
          themeData.publisherId = doc.profile || doc.publisherId;
          if (doc.publisherName) themeData.publisherName = doc.publisherName;
          if (doc.publisherAvatar) themeData.publisherAvatar = doc.publisherAvatar;
          themeData.createdAt = doc.$createdAt;
          themeData.likes = doc.likes || 0;
          themeData.downloads = doc.downloads || 0;
          themeData.hasLiked = doc.hasLiked || false;
          themeData.hasDownloaded = doc.hasDownloaded || false;

          themeData.onLike = async () => {
            const sessionData = await chrome.storage.local.get(['appwriteSession']);
            if (!sessionData.appwriteSession) {
              this.showDialog({ message: 'You must be logged in to like a theme.' });
              return false;
            }
            this._executeInteraction(doc.$id, 'like', true);
            doc.hasLiked = true;
            doc.likes = (doc.likes || 0) + 1;
            return true;
          };
          themeData.onUnlike = async () => {
            const sessionData = await chrome.storage.local.get(['appwriteSession']);
            if (!sessionData.appwriteSession) {
              this.showDialog({ message: 'You must be logged in to unlike a theme.' });
              return false;
            }
            this._executeInteraction(doc.$id, 'like', false);
            doc.hasLiked = false;
            doc.likes = Math.max((doc.likes || 0) - 1, 0);
            return true;
          };
          themeData.onInstall = () => {
            this._installTheme(themeData);
            if (!doc.hasDownloaded) {
              this._executeInteraction(doc.$id, 'download', true);
              doc.hasDownloaded = true;
            }
          };
          themeData.onEdit = () => {
            this._openThemeEditor(themeData);
            if (!doc.hasDownloaded) {
              this._executeInteraction(doc.$id, 'download', true);
              doc.hasDownloaded = true;
            }
          };
          if (storageData.appwriteSession && themeData.publisherId === storageData.appwriteSession.userId) {
            themeData.onDelete = () => { this._deleteTheme(doc.$id); };
          }
        } catch (e) { return; }

        const card = DockitSidebar.createThemeCardDOM(themeData);
        card.style.height = 'auto';
        galleryEl.appendChild(card);
      });

      const hasSession = !!storageData.appwriteSession;
      if (!hasSession && state.data.length >= 5) {
        const loginPromo = document.createElement('div');
        loginPromo.id = 'dockit-gallery-login-promo';
        loginPromo.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 40px; background: color-mix(in srgb, var(--color-background) 80%, var(--color-foreground)); border-radius: 12px; margin-top: 20px;';
        loginPromo.innerHTML = `
          <div style="font-size: 18px; font-weight: 600; color: var(--color-foreground); margin-bottom: 8px;" data-theme-colors="--color-foreground">View More Themes</div>
          <div style="font-size: 14px; opacity: 0.7; color: var(--color-foreground); margin-bottom: 16px;" data-theme-colors="--color-foreground-rgba">Log in to unlock infinite scrolling and publish your own themes.</div>
          <button class="dockit-btn" style="background: var(--color-primary); color: var(--color-foreground); border: none; padding: 10px 24px; border-radius: 100px; font-weight: 600; cursor: pointer;" data-theme-colors="--color-primary, --color-foreground">Log In</button>
        `;
        const loginBtn = loginPromo.querySelector('button');
        loginBtn.addEventListener('click', async () => {
          const authRes = await chrome.runtime.sendMessage({ type: 'APPWRITE_LOGIN' });
          if (authRes && authRes.success) {
            this._renderCustomization();
          }
        });
        galleryEl.appendChild(loginPromo);
      }
    };

    const loadBatch = async (reset = false) => {
      const state = getState();

      if (reset) {
        state.data = [];
        state.cursor = null;
        state.hasMore = true;
        galleryEl.innerHTML = '';
      }

      if (isFetching || (!state.hasMore && !reset)) return;
      isFetching = true;

      const hasSession = !!storageData.appwriteSession;

      if (!hasSession && state.cursor) {
        renderGallery();
        isFetching = false;
        return;
      }

      const projectId = '6a0a1cc000178886bfaf';

      try {
        let url = `https://nyc.cloud.appwrite.io/v1/databases/dockit_cloud/collections/themes/documents?`;
        const queries = [
          JSON.stringify({ method: 'limit', values: [5] }),
          JSON.stringify({ method: 'orderDesc', attribute: currentSort })
        ];

        if (currentSort !== 'created') {
          queries.push(JSON.stringify({ method: 'orderDesc', attribute: 'created' }));
        }

        if (currentQuery) {
          queries.push(JSON.stringify({ method: 'search', attribute: 'name', values: [currentQuery] }));
        }

        if (currentFilter === 'mine') {
          queries.push(JSON.stringify({ method: 'equal', attribute: 'profile', values: [storageData.appwriteSession.userId] }));
        } else if (currentFilter === 'liked') {
          const interUrl = `https://nyc.cloud.appwrite.io/v1/databases/dockit_cloud/collections/theme_interactions/documents?queries[]=${encodeURIComponent(JSON.stringify({ method: 'equal', attribute: 'userId', values: [storageData.appwriteSession.userId] }))}&queries[]=${encodeURIComponent(JSON.stringify({ method: 'equal', attribute: 'type', values: ['like'] }))}&queries[]=${encodeURIComponent(JSON.stringify({ method: 'limit', values: [100] }))}`;
          const headers = { 'X-Appwrite-Project': projectId, 'X-Fallback-Cookies': `a_session_${projectId}=${storageData.appwriteSession.secret}` };
          const interRes = await fetch(interUrl, { headers });
          if (!interRes.ok) throw new Error('Failed to fetch liked themes');
          const interData = await interRes.json();
          const likedThemeIds = interData.documents.map(d => d.themeId);
          if (likedThemeIds.length === 0) {
            state.data = [];
            state.hasMore = false;
            renderGallery();
            isFetching = false;
            return;
          }
          queries.push(JSON.stringify({ method: 'equal', attribute: '$id', values: likedThemeIds }));
        }

        if (state.cursor) {
          queries.push(JSON.stringify({ method: 'cursorAfter', values: [state.cursor] }));
        }

        queries.forEach(q => url += `queries[]=${encodeURIComponent(q)}&`);

        const headers = { 'X-Appwrite-Project': projectId };
        if (hasSession) {
          headers['X-Fallback-Cookies'] = `a_session_${projectId}=${storageData.appwriteSession.secret}`;
        }

        const res = await fetch(url, { headers });

        if (!res.ok) {
          let errMsg = 'Fetch failed';
          try {
            const errData = await res.json();
            errMsg = errData.message || errMsg;
          } catch (e) { }
          throw new Error(errMsg);
        }

        const data = await res.json();
        const docs = data.documents;

        if (docs.length < 5) state.hasMore = false;

        if (docs.length > 0) {
          const profileIds = [...new Set(docs.map(d => d.profile || d.publisherId).filter(Boolean))];
          this._themeProfileCache = this._themeProfileCache || {};
          const missingProfileIds = profileIds.filter(id => !this._themeProfileCache[id]);

          if (missingProfileIds.length > 0) {
            try {
              let profilesUrl = `https://nyc.cloud.appwrite.io/v1/databases/dockit_cloud/collections/profiles/documents?`;
              const pQuery = JSON.stringify({ method: 'equal', attribute: '$id', values: missingProfileIds });
              profilesUrl += `queries[]=${encodeURIComponent(pQuery)}`;
              const pRes = await fetch(profilesUrl, { headers });
              if (pRes.ok) {
                const pData = await pRes.json();
                pData.documents.forEach(p => {
                  this._themeProfileCache[p.$id] = { username: p.username, avatar: p.avatar };
                });
              }
            } catch (e) { console.error('Failed to fetch profiles', e); }
          }
          
          docs.forEach(d => {
            const pid = d.profile || d.publisherId;
            if (this._themeProfileCache[pid]) {
              d.publisherName = this._themeProfileCache[pid].username;
              if (this._themeProfileCache[pid].avatar) {
                d.publisherAvatar = this._themeProfileCache[pid].avatar;
              }
            }
          });

          if (hasSession && storageData.appwriteSession.userId) {
            try {
              let interUrl = `https://nyc.cloud.appwrite.io/v1/databases/dockit_cloud/collections/theme_interactions/documents?`;
              const themeIds = docs.map(d => d.$id);
              interUrl += `queries[]=${encodeURIComponent(JSON.stringify({ method: 'equal', attribute: 'themeId', values: themeIds }))}&`;
              interUrl += `queries[]=${encodeURIComponent(JSON.stringify({ method: 'equal', attribute: 'userId', values: [storageData.appwriteSession.userId] }))}`;
              const interRes = await fetch(interUrl, { headers });
              if (interRes.ok) {
                const interData = await interRes.json();
                interData.documents.forEach(inter => {
                  const doc = docs.find(d => d.$id === inter.themeId);
                  if (doc) {
                    if (inter.type === 'like') doc.hasLiked = true;
                    if (inter.type === 'download') doc.hasDownloaded = true;
                  }
                });
              }
            } catch (e) { console.error('Failed to fetch interactions', e); }
          }

          state.cursor = docs[docs.length - 1].$id;
          const newDocs = docs.filter(d => !state.data.some(existing => existing.$id === d.$id));
          state.data.push(...newDocs);
        }

        renderGallery();

      } catch (err) {
        console.error(err);
        if (reset) galleryEl.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: red;">Failed to load themes.</div>';
      } finally {
        isFetching = false;
      }
    };

    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const val = e.target.value.trim();
        if (currentQuery === val) return;
        currentQuery = val;

        if (val) {
          this.themeGalleryCache.search = { query: val, data: [], cursor: null, hasMore: true };
          loadBatch(true);
        } else {
          if (getState().data.length > 0) renderGallery();
          else loadBatch(true);
        }
      }, 500);
    });

    const indicator = contentEl.querySelector('#dockit-filter-indicator');

    filterBtns.forEach((btn, index) => {
      btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.style.opacity = '0.6';
        });
        const target = e.currentTarget;
        target.classList.add('active');
        target.style.opacity = '1';

        if (indicator) {
          indicator.style.transform = `translateX(${index * 100}%)`;
        }

        currentSort = target.dataset.sort;
        if (currentQuery) {
          currentQuery = '';
          searchInput.value = '';
        }

        if (getState().data.length > 0) renderGallery();
        else loadBatch(true);
      });
    });

    galleryEl.addEventListener('scroll', () => {
      if (galleryEl.scrollTop + galleryEl.clientHeight >= galleryEl.scrollHeight - 50) {
        loadBatch();
      }
    });

    if (isBackground) {
      if (getState().data.length > 0) renderGallery();
    } else {
      loadBatch(true);
    }
  }

  async _renderProfileDashboard(containerEl, sessionData) {
    containerEl.style.display = 'flex';
    containerEl.innerHTML = `
      <style>
        #dockit-profile-name:empty:before {
          content: attr(data-placeholder);
          opacity: 0.5;
        }
      </style>
      <div style="display: flex; align-items: center; gap: 12px;">
        <img id="dockit-profile-avatar" src="" style="width: 40px; height: 40px; border-radius: 50%; background: var(--color-background); border: 1px solid var(--color-border); cursor: pointer;" title="Click or drop an image to change profile picture" data-theme-colors="--color-background, --color-border" />
        <div style="display: flex; flex-direction: column;">
          <div id="dockit-profile-name" contenteditable="true" spellcheck="false" style="font-weight: 600; font-size: 15px; color: var(--color-foreground); outline: none; border-bottom: 1px dashed transparent; transition: border-color 0.2s;" data-theme-colors="--color-foreground">Loading...</div>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; color: var(--color-foreground); opacity: 0.8;" data-theme-colors="--color-foreground">
          <span>Storage</span>
          <span id="dockit-storage-text">Calculating...</span>
        </div>
        <button id="dockit-profile-open-drive" style="margin-top: 12px; padding: 8px 16px; border-radius: 100px; border: 1px solid color-mix(in srgb, var(--color-border) 40%, transparent); background: transparent; color: var(--color-foreground); font-weight: 500; font-size: 11px; cursor: pointer; transition: all 0.2s;" data-theme-colors="--color-border, --color-foreground">Open Drive</button>
      </div>
    `;

    const projectId = '6a0a1cc000178886bfaf';
    const headers = {
      'X-Appwrite-Project': projectId,
      'X-Fallback-Cookies': `a_session_${projectId}=${sessionData.secret}`,
      'Content-Type': 'application/json'
    };

    try {
      const getProfileData = async () => {
        const cacheData = await chrome.storage.local.get(['dockitProfileCache']);
        if (cacheData.dockitProfileCache && Date.now() - cacheData.dockitProfileCache.timestamp < 3600000) {
          return cacheData.dockitProfileCache.data;
        }

        const accRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', { headers });
        if (!accRes.ok) throw new Error('Account fetch failed');
        const acc = await accRes.json();
        
        let customAvatar = null;
        try {
          const prefsRes = await fetch('https://nyc.cloud.appwrite.io/v1/account/prefs', { headers });
          if (prefsRes.ok) {
            const prefs = await prefsRes.json();
            if (prefs.avatarUrl) {
              customAvatar = prefs.avatarUrl.startsWith('http') ? prefs.avatarUrl : `https://nyc.cloud.appwrite.io/v1/storage/buckets/Cloud-Drive/files/${prefs.avatarUrl}/view?project=${projectId}`;
            }
          }
        } catch(e) {}
        
        let avatarDataUrl = null;
        if (!customAvatar) {
          const avatarRes = await fetch(`https://nyc.cloud.appwrite.io/v1/avatars/initials?name=${encodeURIComponent(acc.name || 'User')}&width=80&height=80&project=${projectId}`);
          if (avatarRes.ok) {
             const blob = await avatarRes.blob();
             const buffer = await blob.arrayBuffer();
             const bytes = new Uint8Array(buffer);
             let binary = '';
             for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
             avatarDataUrl = 'data:image/png;base64,' + btoa(binary);
          }
        }
        
        const finalData = { acc, customAvatar, avatarDataUrl };
        await chrome.storage.local.set({ dockitProfileCache: { data: finalData, timestamp: Date.now() } });
        return finalData;
      };

      const { acc, customAvatar, avatarDataUrl } = await getProfileData();

      const nameEl = containerEl.querySelector('#dockit-profile-name');
      nameEl.textContent = acc.name || 'User';
      nameEl.dataset.placeholder = acc.name || 'User';

      const avatarEl = containerEl.querySelector('#dockit-profile-avatar');
      if (customAvatar) {
        avatarEl.src = customAvatar;
      } else if (avatarDataUrl) {
        avatarEl.src = avatarDataUrl;
      }

        this._pendingProfileUpdates = { name: null, avatarUrl: null };
        this._originalProfileName = acc.name || 'User';

        nameEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            nameEl.blur();
          }
        });

        nameEl.addEventListener('input', () => {
          let text = nameEl.innerText.replace(/[<>\s]/g, '');
          if (nameEl.innerHTML !== text) {
            nameEl.innerHTML = text;

            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(nameEl);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
          this._pendingProfileUpdates.name = text;
        });

        nameEl.addEventListener('paste', (e) => {
          e.preventDefault();
          const text = e.clipboardData.getData('text/plain').replace(/[<>\s]/g, '');
          document.execCommand('insertText', false, text);
        });

        nameEl.addEventListener('focusout', () => {
          if (!nameEl.textContent.trim()) {
            nameEl.textContent = this._originalProfileName;
            this._pendingProfileUpdates.name = this._originalProfileName;
          }
        });

        avatarEl.addEventListener('dragover', (e) => {
          e.preventDefault();
          avatarEl.style.opacity = '0.5';
        });
        avatarEl.addEventListener('dragleave', () => {
          avatarEl.style.opacity = '1';
        });
        const handleImageFile = (file) => {
          if (!file || !file.type.startsWith('image/')) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              const maxSize = 128;
              if (width > height) {
                if (width > maxSize) {
                  height *= maxSize / width;
                  width = maxSize;
                }
              } else {
                if (height > maxSize) {
                  width *= maxSize / height;
                  height = maxSize;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
              avatarEl.src = dataUrl;
              this._pendingProfileUpdates.avatarUrl = dataUrl;
            };
            img.src = ev.target.result;
          };
          reader.readAsDataURL(file);
        };

        avatarEl.addEventListener('click', () => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e) => {
            if (e.target.files && e.target.files[0]) {
              handleImageFile(e.target.files[0]);
            }
          };
          input.click();
        });

        avatarEl.addEventListener('drop', (e) => {
          e.preventDefault();
          avatarEl.style.opacity = '1';
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageFile(e.dataTransfer.files[0]);
          }
        });

        const openDriveBtn = containerEl.querySelector('#dockit-profile-open-drive');
        if (openDriveBtn) {
          openDriveBtn.addEventListener('click', () => {
            this.openSystemApp('Drive');
          });
        }

        let isFlushing = false;
        this._flushProfileUpdates = async () => {
          if (!this._pendingProfileUpdates || isFlushing) return;
          isFlushing = true;

          let newName = this._pendingProfileUpdates.name;
          if (newName !== null) {
            newName = newName.trim();
            if (!newName) newName = this._originalProfileName;

            if (newName !== this._originalProfileName) {
              try {
                await fetch('https://nyc.cloud.appwrite.io/v1/account/name', {
                  method: 'PATCH',
                  headers,
                  keepalive: true,
                  body: JSON.stringify({ name: newName })
                });

                await fetch(`https://nyc.cloud.appwrite.io/v1/databases/dockit_cloud/collections/profiles/documents/${sessionData.userId}`, {
                  method: 'PATCH',
                  headers,
                  keepalive: true,
                  body: JSON.stringify({ data: { username: newName, updated: new Date().toISOString() } })
                });

                this._originalProfileName = newName;
                await chrome.storage.local.remove('dockitProfileCache');
              } catch (e) { console.error('Failed to update name', e); }
            }
          }

          if (this._pendingProfileUpdates.avatarUrl) {
            try {
              const base64Response = await fetch(this._pendingProfileUpdates.avatarUrl);
              const blob = await base64Response.blob();

              const mimeMatch = this._pendingProfileUpdates.avatarUrl.match(/:(.*?);/);
              const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
              const ext = mime.split('/')[1] || 'jpg';

              const formData = new FormData();
              formData.append('fileId', 'unique()');
              formData.append('file', blob, `upload.${ext}`);
              formData.append('permissions[]', 'read("any")');
              formData.append('permissions[]', `update("user:${sessionData.userId}")`);
              formData.append('permissions[]', `delete("user:${sessionData.userId}")`);

              const uploadRes = await fetch('https://nyc.cloud.appwrite.io/v1/storage/buckets/Cloud-Drive/files', {
                method: 'POST',
                headers: {
                  'X-Appwrite-Project': '6a0a1cc000178886bfaf',
                  'X-Fallback-Cookies': headers['X-Fallback-Cookies']
                },
                body: formData
              });

              if (uploadRes.ok) {
                const uploadData = await uploadRes.json();
                let actualFileId = uploadData.$id;
                let finalUrl = `https://nyc.cloud.appwrite.io/v1/storage/buckets/Cloud-Drive/files/${actualFileId}/view?project=6a0a1cc000178886bfaf`;

                try {
                  const funcRes = await fetch(`https://nyc.cloud.appwrite.io/v1/functions/process-image/executions`, {
                    method: 'POST',
                    headers: {
                      'X-Appwrite-Project': '6a0a1cc000178886bfaf',
                      'X-Fallback-Cookies': headers['X-Fallback-Cookies'],
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      body: JSON.stringify({ fileId: actualFileId, bucketId: 'Cloud-Drive', userId: sessionData.userId }),
                      async: false,
                      path: '/',
                      method: 'POST',
                      headers: {}
                    })
                  });
                  const funcData = await funcRes.json();
                  if (funcData.responseBody) {
                    const result = JSON.parse(funcData.responseBody);
                    if (result.success && result.fileId) {
                      actualFileId = result.fileId;
                      finalUrl = `https://nyc.cloud.appwrite.io/v1/storage/buckets/Cloud-Drive/files/${actualFileId}/view?project=6a0a1cc000178886bfaf`;
                    }
                  }
                } catch (e) {
                  console.error('Dockit: Server deduplication failed for avatar:', e);
                }

                let existingPrefs = {};
                const pRes = await fetch('https://nyc.cloud.appwrite.io/v1/account/prefs', { headers, keepalive: true });
                if (pRes.ok) existingPrefs = await pRes.json();

                await fetch('https://nyc.cloud.appwrite.io/v1/account/prefs', {
                  method: 'PATCH',
                  headers,
                  keepalive: true,
                  body: JSON.stringify({ prefs: { ...existingPrefs, avatarUrl: finalUrl } })
                });

                await fetch(`https://nyc.cloud.appwrite.io/v1/databases/dockit_cloud/collections/profiles/documents/${sessionData.userId}`, {
                  method: 'PATCH',
                  headers,
                  keepalive: true,
                  body: JSON.stringify({ data: { avatar: finalUrl, updated: new Date().toISOString() } })
                }).catch(() => { });
                await chrome.storage.local.remove('dockitProfileCache');
              } else {
                console.error('Failed to upload avatar to storage', await uploadRes.text());
              }
            } catch (e) { console.error('Failed to update avatar', e); }
          }
          this._pendingProfileUpdates = null;
          isFlushing = false;
        };

        window.addEventListener('beforeunload', () => {
          if (this._flushProfileUpdates) {
            this._flushProfileUpdates();
          }
        });

      const userId = sessionData.userId;
      let totalDocsSize = 0;
      let totalMsgsSize = 0; // Mock for now

      const docQueries = [
        JSON.stringify({ method: 'equal', attribute: 'profile', values: [userId] }),
        JSON.stringify({ method: 'limit', values: [100] })
      ];
      let docUrl = `https://nyc.cloud.appwrite.io/v1/databases/dockit_cloud/collections/themes/documents?`;
      docQueries.forEach(q => docUrl += `queries[]=${encodeURIComponent(q)}&`);

      const docRes = await fetch(docUrl, { headers });
      if (docRes.ok) {
        const docData = await docRes.json();
        docData.documents.forEach(d => {
          totalDocsSize += new TextEncoder().encode(JSON.stringify(d)).length;
        });
      }

      let driveImgsSize = 0;
      let driveVidsSize = 0;
      let driveDocsSize = 0;
      let driveOthersSize = 0;

      const imgQueries = [JSON.stringify({ method: 'limit', values: [100] })];
      let imgUrl = `https://nyc.cloud.appwrite.io/v1/storage/buckets/Cloud-Drive/files?`;
      imgQueries.forEach(q => imgUrl += `queries[]=${encodeURIComponent(q)}&`);

      const imgRes = await fetch(imgUrl, { headers });
      if (imgRes.ok) {
        const imgData = await imgRes.json();
        const userFiles = imgData.files.filter(f => f.$permissions && f.$permissions.some(p => p.includes(`user:${userId}`)));
        userFiles.forEach(f => {
          if (f.mimeType.startsWith('image/')) driveImgsSize += f.sizeOriginal;
          else if (f.mimeType.startsWith('video/')) driveVidsSize += f.sizeOriginal;
          else if (f.mimeType.includes('pdf') || f.mimeType.includes('text') || f.mimeType.includes('document')) driveDocsSize += f.sizeOriginal;
          else driveOthersSize += f.sizeOriginal;
        });
      }

      let totalExtSize = 0;
      if (chrome.storage && chrome.storage.local && chrome.storage.local.getBytesInUse) {
        try {
          totalExtSize = await new Promise(r => chrome.storage.local.getBytesInUse(null, r));
        } catch (e) { }
      } else if (this.themeGalleryCache) {
        totalExtSize = new TextEncoder().encode(JSON.stringify(this.themeGalleryCache)).length;
      }

      this._userStorageExt = totalDocsSize + totalMsgsSize + totalExtSize;
      this._userStorageImgs = driveImgsSize;
      this._userStorageVids = driveVidsSize;
      this._userStorageDocs = driveDocsSize;
      this._userStorageOthers = driveOthersSize;

      const totalSize = this._userStorageExt + driveImgsSize + driveVidsSize + driveDocsSize + driveOthersSize;
      const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

      const storageText = containerEl.querySelector('#dockit-storage-text');
      if (storageText) storageText.textContent = `${(totalSize / 1024 / 1024).toFixed(2)} MB / 2 GB`;

      this._userStorageTotal = totalSize;

    } catch (err) {
      console.error('Dockit: Failed to fetch profile stats', err);
      const storageText = containerEl.querySelector('#dockit-storage-text');
      if (storageText) storageText.textContent = 'Error calculating storage';
    }
  }

  async _renderDrive() {
    const contentEl = this.element.querySelector('#dockit-in-page-content');
    if (!contentEl) return;

    const projectId = '6a0a1cc000178886bfaf';
    const storageData = await chrome.storage.local.get(['appwriteSession']);

    if (!storageData.appwriteSession) {
      contentEl.innerHTML = `<div style="padding: 20px; color: var(--color-foreground);">Authentication required. Please sign in via the Customization tab.</div>`;
      return;
    }

    const headers = {
      'X-Appwrite-Project': projectId,
      'X-Fallback-Cookies': `a_session_${projectId}=${storageData.appwriteSession.secret}`,
      'Content-Type': 'application/json'
    };

    let driveState = {
      files: [],
      chips: ['All'],
      activeChip: 'All',
      viewMode: 'grid', // 'grid' or 'list'
      loading: true,
      error: null,
      pageCursor: null,
      hasNext: false,
      selectedFiles: new Set()
    };

    const docIconBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjODg4IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTE0IDJIMmEyIDIgMCAwIDAtMiAyVjIyaDIwVjhsLTYtNnoiLz48cGF0aCBkPSJNMTQgMnY2aDZyLTEyIDEySDZtMC00aDgiLz48L3N2Zz4=";
    const genericFileSvg = `
      <svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg" style="width: 48px; height: 60px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15));">
        <defs>
          <linearGradient id="docGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#f5f5f5"/>
          </linearGradient>
          <linearGradient id="foldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#e0e0e0"/>
          </linearGradient>
          <filter id="foldShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="-1" dy="1" stdDeviation="2" flood-opacity="0.15"/>
          </filter>
        </defs>
        <path d="M10 0 C4.5 0 0 4.5 0 10 L0 120 C0 125.5 4.5 130 10 130 L90 130 C95.5 130 100 125.5 100 120 L100 30 L70 0 Z" fill="url(#docGrad)" stroke="#cccccc" stroke-width="1"/>
        <path d="M70 0 L70 25 C70 27.8 72.2 30 75 30 L100 30 Z" fill="url(#foldGrad)" filter="url(#foldShadow)"/>
        <rect x="20" y="55" width="60" height="4" rx="2" fill="#d8d8d8"/>
        <rect x="20" y="75" width="60" height="4" rx="2" fill="#d8d8d8"/>
        <rect x="20" y="95" width="40" height="4" rx="2" fill="#d8d8d8"/>
        <rect x="20" y="35" width="20" height="4" rx="2" fill="#b0c4de"/>
      </svg>
    `;

    const renderUI = () => {
      let filesHtml = '';

      if (driveState.loading) {
        filesHtml = `<div style="padding: 40px; text-align: center; color: var(--color-foreground-rgba);" data-theme-colors="--color-foreground-rgba">Loading your files...</div>`;
      } else if (driveState.error) {
        filesHtml = `<div style="padding: 40px; text-align: center; color: var(--color-accent);">${driveState.error}</div>`;
      } else {
        const filteredFiles = driveState.activeChip === 'All' ? driveState.files : driveState.files.filter(f => {
          if (driveState.activeChip === 'Images' && f.mimeType.startsWith('image/')) return true;
          if (driveState.activeChip === 'Videos' && f.mimeType.startsWith('video/')) return true;
          if (driveState.activeChip === 'Documents' && (f.mimeType.includes('pdf') || f.mimeType.includes('text') || f.mimeType.includes('document'))) return true;
          if (driveState.activeChip === 'Others' && !f.mimeType.startsWith('image/') && !f.mimeType.startsWith('video/') && !f.mimeType.includes('pdf') && !f.mimeType.includes('text') && !f.mimeType.includes('document')) return true;
          return false;
        });

        if (filteredFiles.length === 0) {
          filesHtml = `<div style="padding: 40px; text-align: center; color: var(--color-foreground-rgba);" data-theme-colors="--color-foreground-rgba">No files found.</div>`;
        } else {
          if (driveState.viewMode === 'grid') {
            filesHtml = `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 16px; padding: 4px;">`;
            filteredFiles.forEach(f => {
              const isImage = f.mimeType.startsWith('image/');
              const viewUrl = `https://nyc.cloud.appwrite.io/v1/storage/buckets/Cloud-Drive/files/${f.$id}/view?project=${projectId}`;
              const thumbHtml = isImage ?
                `<img src="${viewUrl}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px 8px 0 0;" loading="lazy" />` :
                `<div style="width: 100%; height: 100px; display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--color-foreground) 5%, var(--color-background)); border-radius: 8px 8px 0 0;">${genericFileSvg}</div>`;

              const isSelected = driveState.selectedFiles.has(f.$id);
              const selectHtml = `
                <button class="dockit-drive-select-btn" data-id="${f.$id}" style="position: absolute; top: 4px; left: 4px; background: ${isSelected ? 'var(--color-primary)' : 'rgba(0,0,0,0.3)'}; color: white; border: 1px solid rgba(255,255,255,0.5); border-radius: 50%; width: 20px; height: 20px; padding: 0; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s;">
                  ${isSelected ? '<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="3" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
                </button>
              `;

              filesHtml += `
                <div class="dockit-drive-item" style="border: 1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}; border-radius: 8px; overflow: hidden; background: var(--color-secondary); position: relative; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" data-theme-colors="--color-border, --color-secondary">
                  ${thumbHtml}
                  ${selectHtml}
                  <div style="padding: 8px;">
                    <div style="font-size: 11px; font-weight: 600; color: var(--color-foreground); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" data-theme-colors="--color-foreground" title="${f.name}">${f.name}</div>
                    <div style="font-size: 10px; color: var(--color-foreground-rgba); margin-top: 4px; display: flex; justify-content: space-between;" data-theme-colors="--color-foreground-rgba">
                      <span>${(f.sizeOriginal / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  <button class="dockit-drive-delete-btn" data-id="${f.$id}" style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 4px; padding: 4px; cursor: pointer; opacity: 0; transition: opacity 0.2s;">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              `;
            });
            filesHtml += '</div>';
          } else {
            // list view
            filesHtml = `<div style="display: flex; flex-direction: column; gap: 8px; padding: 4px;">`;
            filteredFiles.forEach(f => {
              const isImage = f.mimeType.startsWith('image/');
              const viewUrl = `https://nyc.cloud.appwrite.io/v1/storage/buckets/Cloud-Drive/files/${f.$id}/view?project=${projectId}`;
              const thumbHtml = isImage ?
                `<img src="${viewUrl}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px;" loading="lazy" />` :
                `<div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--color-foreground) 5%, var(--color-background)); border-radius: 4px;">${genericFileSvg.replace('width: 48px; height: 60px;', 'width: 20px; height: 26px;')}</div>`;

              const isSelected = driveState.selectedFiles.has(f.$id);
              const date = new Date(f.$createdAt).toLocaleDateString();
              filesHtml += `
                <div class="dockit-drive-item" style="display: flex; align-items: center; padding: 8px 12px; border: 1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}; border-radius: 8px; background: var(--color-secondary); gap: 12px; position: relative;" data-theme-colors="--color-border, --color-secondary">
                  ${thumbHtml}
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 13px; font-weight: 600; color: var(--color-foreground); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" data-theme-colors="--color-foreground" title="${f.name}">${f.name}</div>
                    <div style="font-size: 11px; color: var(--color-foreground-rgba);" data-theme-colors="--color-foreground-rgba">${date} • ${(f.sizeOriginal / 1024).toFixed(1)} KB</div>
                  </div>
                  <button class="dockit-drive-select-btn" data-id="${f.$id}" style="background: ${isSelected ? 'var(--color-primary)' : 'transparent'}; color: ${isSelected ? '#fff' : 'var(--color-foreground)'}; border: 1px solid color-mix(in srgb, var(--color-border) 80%, transparent); padding: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: background 0.2s;">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" style="${!isSelected ? 'opacity: 0;' : ''}"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </button>
                  <button class="dockit-drive-delete-btn" data-id="${f.$id}" style="background: transparent; color: var(--color-foreground); border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: background 0.2s;">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              `;
            });
            filesHtml += '</div>';
          }
        }
      }

      const chipsHtml = driveState.chips.map(chip => `
        <button class="dockit-drive-chip ${driveState.activeChip === chip ? 'active' : ''}" data-chip="${chip}" style="padding: 6px 12px; border-radius: 100px; border: 1px solid color-mix(in srgb, var(--color-border) ${driveState.activeChip === chip ? '100%' : '50%'}, transparent); background: ${driveState.activeChip === chip ? 'var(--color-primary)' : 'transparent'}; color: ${driveState.activeChip === chip ? '#fff' : 'var(--color-foreground)'}; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
          ${chip}
        </button>
      `).join('');

      contentEl.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%;">
          <div style="padding: 16px 20px; border-bottom: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent); display: flex; justify-content: space-between; align-items: center;" data-theme-colors="--color-border">
            <div style="font-size: 16px; font-weight: 700; color: var(--color-foreground);" data-theme-colors="--color-foreground">Cloud Drive</div>
            <div style="display: flex; gap: 8px;">
              <button id="dockit-drive-upload" style="padding: 6px 16px; border-radius: 8px; background: var(--color-primary); color: #fff; border: none; font-size: 12px; font-weight: 600; cursor: pointer;">Upload</button>
              <div style="display: flex; background: var(--color-secondary); border-radius: 8px; border: 1px solid var(--color-border); overflow: hidden;" data-theme-colors="--color-secondary, --color-border">
                <button id="dockit-drive-view-grid" style="padding: 6px 10px; background: ${driveState.viewMode === 'grid' ? 'var(--color-primary)' : 'transparent'}; color: ${driveState.viewMode === 'grid' ? '#fff' : 'var(--color-foreground)'}; border: none; cursor: pointer;"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg></button>
                <button id="dockit-drive-view-list" style="padding: 6px 10px; background: ${driveState.viewMode === 'list' ? 'var(--color-primary)' : 'transparent'}; color: ${driveState.viewMode === 'list' ? '#fff' : 'var(--color-foreground)'}; border: none; cursor: pointer;"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg></button>
              </div>
            </div>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 6px; padding: 12px 20px; border-bottom: 1px solid color-mix(in srgb, var(--color-border) 30%, transparent);" data-theme-colors="--color-border">
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; color: var(--color-foreground); opacity: 0.8;" data-theme-colors="--color-foreground">
              <span>Storage Usage</span>
              <span id="dockit-drive-storage-text">Calculating...</span>
            </div>
            <div style="width: 100%; height: 6px; border-radius: 9999px; background: color-mix(in srgb, var(--color-border) 50%, transparent); display: flex; overflow: hidden;" data-theme-colors="--color-border">
              <div id="dockit-drive-storage-bar-docs" style="height: 100%; background: var(--color-primary); width: 0%;"></div>
              <div id="dockit-drive-storage-bar-imgs" style="height: 100%; background: color-mix(in srgb, var(--color-primary) 80%, var(--color-background)); width: 0%;"></div>
              <div id="dockit-drive-storage-bar-vids" style="height: 100%; background: color-mix(in srgb, var(--color-primary) 60%, var(--color-background)); width: 0%;"></div>
              <div id="dockit-drive-storage-bar-others" style="height: 100%; background: color-mix(in srgb, var(--color-primary) 40%, var(--color-background)); width: 0%;"></div>
              <div id="dockit-drive-storage-bar-ext" style="height: 100%; background: color-mix(in srgb, var(--color-primary) 20%, var(--color-background)); width: 0%;"></div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 12px; font-size: 10px; color: var(--color-foreground); opacity: 0.6; margin-top: 2px;" data-theme-colors="--color-foreground">
              <div style="display: flex; align-items: center; gap: 4px;"><div style="width: 6px; height: 6px; border-radius: 50%; background: var(--color-primary);"></div><span id="dockit-drive-storage-lbl-docs">Documents 0%</span></div>
              <div style="display: flex; align-items: center; gap: 4px;"><div style="width: 6px; height: 6px; border-radius: 50%; background: color-mix(in srgb, var(--color-primary) 80%, var(--color-background));"></div><span id="dockit-drive-storage-lbl-imgs">Images 0%</span></div>
              <div style="display: flex; align-items: center; gap: 4px;"><div style="width: 6px; height: 6px; border-radius: 50%; background: color-mix(in srgb, var(--color-primary) 60%, var(--color-background));"></div><span id="dockit-drive-storage-lbl-vids">Videos 0%</span></div>
              <div style="display: flex; align-items: center; gap: 4px;"><div style="width: 6px; height: 6px; border-radius: 50%; background: color-mix(in srgb, var(--color-primary) 40%, var(--color-background));"></div><span id="dockit-drive-storage-lbl-others">Others 0%</span></div>
              <div style="display: flex; align-items: center; gap: 4px;"><div style="width: 6px; height: 6px; border-radius: 50%; background: color-mix(in srgb, var(--color-primary) 20%, var(--color-background));"></div><span id="dockit-drive-storage-lbl-ext">Extension 0%</span></div>
            </div>
          </div>
          
          <div style="padding: 12px 20px; display: flex; gap: 8px; overflow-x: auto; flex-wrap: nowrap; border-bottom: 1px solid color-mix(in srgb, var(--color-border) 30%, transparent);" data-theme-colors="--color-border">
            ${chipsHtml}
          </div>

          <div id="dockit-drive-dropzone" style="flex: 1; overflow-y: auto; padding: 16px; position: relative;">
            ${filesHtml}
            ${driveState.hasNext && !driveState.loading ? `<button id="dockit-drive-load-more" style="width: 100%; padding: 10px; margin-top: 16px; border-radius: 8px; background: transparent; border: 1px solid var(--color-border); color: var(--color-foreground); font-weight: 600; font-size: 12px; cursor: pointer;">Load More</button>` : ''}
            <div id="dockit-drive-drag-overlay" style="display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: color-mix(in srgb, var(--color-primary) 10%, var(--color-background)); border: 2px dashed var(--color-primary); border-radius: 8px; z-index: 10; align-items: center; justify-content: center; flex-direction: column;">
              <div style="pointer-events: none; display: flex; flex-direction: column; align-items: center;">
                <svg viewBox="0 0 24 24" width="32" height="32" stroke="var(--color-primary)" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                <div style="margin-top: 12px; font-weight: 600; color: var(--color-primary);">Drop files to upload</div>
              </div>
            </div>
          </div>
          ${driveState.selectedFiles.size > 0 ? `
            <div style="padding: 12px 20px; border-top: 1px solid color-mix(in srgb, var(--color-border) 30%, transparent); display: flex; justify-content: flex-end; background: var(--color-background); flex-shrink: 0;" data-theme-colors="--color-border, --color-background">
              <button id="dockit-drive-batch-delete" style="padding: 8px 16px; border-radius: 8px; background: rgba(255, 77, 77, 0.1); color: #ff4d4d; border: 1px solid #ff4d4d; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s;">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                Delete Selected (${driveState.selectedFiles.size})
              </button>
            </div>
          ` : ''}
        </div>
      `;

      setTimeout(() => {
        const totalSize = this._userStorageTotal || 0;
        const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
        const relDocs = totalSize > 0 ? ((this._userStorageDocs || 0) / totalSize) * 100 : 0;
        const relImgs = totalSize > 0 ? ((this._userStorageImgs || 0) / totalSize) * 100 : 0;
        const relVids = totalSize > 0 ? ((this._userStorageVids || 0) / totalSize) * 100 : 0;
        const relOthers = totalSize > 0 ? ((this._userStorageOthers || 0) / totalSize) * 100 : 0;
        const relExt = totalSize > 0 ? ((this._userStorageExt || 0) / totalSize) * 100 : 0;

        const docsBar = contentEl.querySelector('#dockit-drive-storage-bar-docs');
        if (docsBar) {
          docsBar.style.width = `${Math.max(0, ((this._userStorageDocs || 0) / MAX_SIZE) * 100)}%`;
          contentEl.querySelector('#dockit-drive-storage-bar-imgs').style.width = `${Math.max(0, ((this._userStorageImgs || 0) / MAX_SIZE) * 100)}%`;
          contentEl.querySelector('#dockit-drive-storage-bar-vids').style.width = `${Math.max(0, ((this._userStorageVids || 0) / MAX_SIZE) * 100)}%`;
          contentEl.querySelector('#dockit-drive-storage-bar-others').style.width = `${Math.max(0, ((this._userStorageOthers || 0) / MAX_SIZE) * 100)}%`;
          contentEl.querySelector('#dockit-drive-storage-bar-ext').style.width = `${Math.max(0, ((this._userStorageExt || 0) / MAX_SIZE) * 100)}%`;

          contentEl.querySelector('#dockit-drive-storage-lbl-docs').textContent = `Documents ${Math.round(relDocs)}%`;
          contentEl.querySelector('#dockit-drive-storage-lbl-imgs').textContent = `Images ${Math.round(relImgs)}%`;
          contentEl.querySelector('#dockit-drive-storage-lbl-vids').textContent = `Videos ${Math.round(relVids)}%`;
          contentEl.querySelector('#dockit-drive-storage-lbl-others').textContent = `Others ${Math.round(relOthers)}%`;
          contentEl.querySelector('#dockit-drive-storage-lbl-ext').textContent = `Extension ${Math.round(relExt)}%`;

          contentEl.querySelector('#dockit-drive-storage-text').textContent = `${(totalSize / 1024 / 1024).toFixed(2)} MB / 2 GB`;
        }
      }, 0);

      // bind events
      const dropzone = contentEl.querySelector('#dockit-drive-dropzone');
      const dragOverlay = contentEl.querySelector('#dockit-drive-drag-overlay');

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragOverlay.style.display = 'flex';
      });

      dropzone.addEventListener('dragleave', (e) => {
        if (!e.relatedTarget || !dropzone.contains(e.relatedTarget)) {
          dragOverlay.style.display = 'none';
        }
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dragOverlay.style.display = 'none';
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          uploadFiles(Array.from(e.dataTransfer.files));
        }
      });

      contentEl.querySelector('#dockit-drive-upload').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = e => {
          if (e.target.files && e.target.files.length > 0) {
            uploadFiles(Array.from(e.target.files));
          }
        };
        input.click();
      });

      const batchDeleteBtn = contentEl.querySelector('#dockit-drive-batch-delete');
      if (batchDeleteBtn) {
        batchDeleteBtn.addEventListener('click', async () => {
          const filesToDelete = Array.from(driveState.selectedFiles);
          if (filesToDelete.length === 0) return;

          const confirmed = await new Promise(resolve => {
            const overlay = document.createElement('div');
            Object.assign(overlay.style, {
              position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
              backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: '9999999', opacity: '0', transition: 'opacity 0.2s'
            });

            const dialog = document.createElement('div');
            Object.assign(dialog.style, {
              backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-border)',
              borderRadius: '12px', padding: '20px', maxWidth: '300px', width: '90%',
              color: 'var(--color-foreground)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              transform: 'scale(0.95)', transition: 'transform 0.2s', display: 'flex',
              flexDirection: 'column', gap: '16px'
            });

            const text = document.createElement('div');
            text.style.fontSize = '13px';
            text.style.lineHeight = '1.5';
            text.style.whiteSpace = 'pre-wrap';
            text.innerHTML = `Are you sure you want to delete <b>${filesToDelete.length} selected files</b>?<br><br><span style="color: var(--color-accent); font-weight: 600;">Warning: If any of these files are used by your themes, their backgrounds will break.</span><br><br>This action cannot be undone.`;

            const btnContainer = document.createElement('div');
            btnContainer.style.display = 'flex';
            btnContainer.style.gap = '10px';
            btnContainer.style.justifyContent = 'flex-end';

            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancel';
            Object.assign(cancelBtn.style, {
              padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)',
              backgroundColor: 'transparent', color: 'var(--color-foreground)', cursor: 'pointer',
              fontSize: '12px'
            });

            const confirmBtn = document.createElement('button');
            confirmBtn.textContent = 'Delete All';
            Object.assign(confirmBtn.style, {
              padding: '6px 12px', borderRadius: '6px', border: 'none',
              backgroundColor: 'var(--color-accent)', color: '#fff', cursor: 'pointer',
              fontSize: '12px', fontWeight: 'bold'
            });

            const close = (val) => {
              overlay.style.opacity = '0';
              dialog.style.transform = 'scale(0.95)';
              setTimeout(() => { overlay.remove(); resolve(val); }, 200);
            };

            cancelBtn.onclick = () => close(false);
            confirmBtn.onclick = () => close(true);

            btnContainer.appendChild(cancelBtn);
            btnContainer.appendChild(confirmBtn);
            dialog.appendChild(text);
            dialog.appendChild(btnContainer);
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            requestAnimationFrame(() => {
              overlay.style.opacity = '1';
              dialog.style.transform = 'scale(1)';
            });
          });

          if (confirmed) {
            driveState.loading = true;
            renderUI();

            let failedCount = 0;
            for (const fileId of filesToDelete) {
              try {
                const res = await fetch(`https://nyc.cloud.appwrite.io/v1/storage/buckets/Cloud-Drive/files/${fileId}`, {
                  method: 'DELETE',
                  headers
                });
                if (res.ok) {
                  const deletedFile = driveState.files.find(f => f.$id === fileId);
                  if (deletedFile) {
                    if (deletedFile.mimeType.startsWith('image/')) this._userStorageImgs = Math.max(0, (this._userStorageImgs || 0) - deletedFile.sizeOriginal);
                    else if (deletedFile.mimeType.startsWith('video/')) this._userStorageVids = Math.max(0, (this._userStorageVids || 0) - deletedFile.sizeOriginal);
                    else if (deletedFile.mimeType.includes('pdf') || deletedFile.mimeType.includes('text') || deletedFile.mimeType.includes('document')) this._userStorageDocs = Math.max(0, (this._userStorageDocs || 0) - deletedFile.sizeOriginal);
                    else this._userStorageOthers = Math.max(0, (this._userStorageOthers || 0) - deletedFile.sizeOriginal);
                    this._userStorageTotal = (this._userStorageExt || 0) + (this._userStorageImgs || 0) + (this._userStorageVids || 0) + (this._userStorageDocs || 0) + (this._userStorageOthers || 0);
                  }
                  driveState.files = driveState.files.filter(f => f.$id !== fileId);
                  driveState.selectedFiles.delete(fileId);
                } else {
                  failedCount++;
                }
              } catch (e) {
                failedCount++;
              }
            }

            if (failedCount > 0) {
              const errOverlay = document.createElement('div');
              Object.assign(errOverlay.style, {
                position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
                backgroundColor: 'var(--color-accent)', color: '#fff', padding: '10px 20px',
                borderRadius: '8px', zIndex: '9999999', fontSize: '13px', fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)', opacity: '0', transition: 'opacity 0.2s'
              });
              errOverlay.textContent = `Failed to delete ${failedCount} file(s)`;
              document.body.appendChild(errOverlay);
              requestAnimationFrame(() => errOverlay.style.opacity = '1');
              setTimeout(() => {
                errOverlay.style.opacity = '0';
                setTimeout(() => errOverlay.remove(), 200);
              }, 3000);
            }

            driveState.loading = false;
            renderUI();
          }
        });
      }

      contentEl.querySelectorAll('.dockit-drive-chip').forEach(btn => {
        btn.addEventListener('click', (e) => {
          driveState.activeChip = e.currentTarget.dataset.chip;
          renderUI();
        });
      });

      contentEl.querySelector('#dockit-drive-view-grid').addEventListener('click', () => {
        driveState.viewMode = 'grid';
        renderUI();
      });
      contentEl.querySelector('#dockit-drive-view-list').addEventListener('click', () => {
        driveState.viewMode = 'list';
        renderUI();
      });

      const loadMoreBtn = contentEl.querySelector('#dockit-drive-load-more');
      if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => fetchFiles(driveState.pageCursor));
      }

      contentEl.querySelectorAll('.dockit-drive-select-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const fileId = e.currentTarget.dataset.id;
          if (driveState.selectedFiles.has(fileId)) {
            driveState.selectedFiles.delete(fileId);
          } else {
            driveState.selectedFiles.add(fileId);
          }
          renderUI();
        });
      });

      contentEl.querySelectorAll('.dockit-drive-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
          const btn = item.querySelector('.dockit-drive-delete-btn');
          if (btn) btn.style.opacity = '1';
        });
        item.addEventListener('mouseleave', () => {
          const btn = item.querySelector('.dockit-drive-delete-btn');
          if (btn) btn.style.opacity = '0';
        });
        item.addEventListener('click', (e) => {
          if (e.target.closest('.dockit-drive-delete-btn') || e.target.closest('.dockit-drive-select-btn')) return;

          const fileId = item.querySelector('.dockit-drive-delete-btn').dataset.id;
          const file = driveState.files.find(f => f.$id === fileId);
          if (!file) return;

          const viewUrl = `https://nyc.cloud.appwrite.io/v1/storage/buckets/Cloud-Drive/files/${file.$id}/view?project=${projectId}`;
          const downloadUrl = `https://nyc.cloud.appwrite.io/v1/storage/buckets/Cloud-Drive/files/${file.$id}/download?project=${projectId}`;

          let previewHtml = '';
          if (file.mimeType.startsWith('image/')) {
            previewHtml = `<img src="${viewUrl}" style="max-width: 100%; max-height: 50vh; object-fit: contain; border-radius: 8px;" />`;
          } else if (file.mimeType.startsWith('video/')) {
            previewHtml = `<video src="${viewUrl}" controls style="max-width: 100%; max-height: 50vh; border-radius: 8px; width: 100%;"></video>`;
          } else if (file.mimeType.startsWith('audio/')) {
            previewHtml = `<audio src="${viewUrl}" controls style="width: 100%;"></audio>`;
          } else if (file.mimeType === 'application/pdf') {
            previewHtml = `<iframe src="${viewUrl}" style="width: 100%; height: 50vh; border: none; border-radius: 8px; background: white;"></iframe>`;
          } else {
            previewHtml = `<div style="padding: 40px; background: color-mix(in srgb, var(--color-foreground) 5%, var(--color-background)); border-radius: 8px; display: flex; align-items: center; justify-content: center;">${genericFileSvg}</div>`;
          }

          const overlay = document.createElement('div');
          Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: '9999999', opacity: '0', transition: 'opacity 0.2s', padding: '20px'
          });

          const dialog = document.createElement('div');
          Object.assign(dialog.style, {
            backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-border)',
            borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '100%',
            color: 'var(--color-foreground)', boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5)',
            transform: 'scale(0.95)', transition: 'transform 0.2s', display: 'flex',
            flexDirection: 'column', gap: '20px', maxHeight: '90vh', overflowY: 'auto'
          });

          dialog.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
              <div style="font-size: 16px; font-weight: 700; word-break: break-all;">${file.name}</div>
              <button class="dockit-preview-close" style="background: transparent; border: none; color: var(--color-foreground-rgba); cursor: pointer; padding: 4px; border-radius: 4px;">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 20px;">
              ${previewHtml}
              <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; font-size: 12px; color: var(--color-foreground-rgba);">
                <strong style="color: var(--color-foreground);">Type:</strong> <span>${file.mimeType}</span>
                <strong style="color: var(--color-foreground);">Size:</strong> <span>${(file.sizeOriginal / 1024).toFixed(2)} KB</span>
                <strong style="color: var(--color-foreground);">Uploaded:</strong> <span>${new Date(file.$createdAt).toLocaleString()}</span>
              </div>
              <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: auto;">
                <button class="dockit-preview-select" style="padding: 8px 16px; border-radius: 8px; background: ${driveState.selectedFiles.has(file.$id) ? 'var(--color-primary)' : 'transparent'}; color: ${driveState.selectedFiles.has(file.$id) ? '#fff' : 'var(--color-foreground)'}; border: 1px solid ${driveState.selectedFiles.has(file.$id) ? 'var(--color-primary)' : 'var(--color-border)'}; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s;">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" style="${!driveState.selectedFiles.has(file.$id) ? 'opacity: 0;' : ''}"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span class="dockit-preview-select-text">${driveState.selectedFiles.has(file.$id) ? 'Selected' : 'Select'}</span>
                </button>
                <button class="dockit-preview-download" style="padding: 8px 16px; border-radius: 8px; background: var(--color-primary); color: #fff; border: none; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Download
                </button>
              </div>
            </div>
          `;

          const closeDialog = () => {
            overlay.style.opacity = '0';
            dialog.style.transform = 'scale(0.95)';
            setTimeout(() => overlay.remove(), 200);
          };

          dialog.querySelector('.dockit-preview-close').onclick = closeDialog;
          overlay.onclick = (e) => { if (e.target === overlay) closeDialog(); };

          dialog.querySelector('.dockit-preview-download').onclick = () => {
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = file.name;
            a.target = '_blank';
            a.click();
          };

          const selectBtn = dialog.querySelector('.dockit-preview-select');
          selectBtn.onclick = () => {
            const isSelected = driveState.selectedFiles.has(file.$id);
            if (isSelected) driveState.selectedFiles.delete(file.$id);
            else driveState.selectedFiles.add(file.$id);

            const nowSelected = !isSelected;
            selectBtn.style.background = nowSelected ? 'var(--color-primary)' : 'transparent';
            selectBtn.style.color = nowSelected ? '#fff' : 'var(--color-foreground)';
            selectBtn.style.border = `1px solid ${nowSelected ? 'var(--color-primary)' : 'var(--color-border)'}`;
            selectBtn.querySelector('svg').style.opacity = nowSelected ? '1' : '0';
            selectBtn.querySelector('.dockit-preview-select-text').textContent = nowSelected ? 'Selected' : 'Select';
            renderUI();
          };

          overlay.appendChild(dialog);
          document.body.appendChild(overlay);

          requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            dialog.style.transform = 'scale(1)';
          });
        });
      });

      contentEl.querySelectorAll('.dockit-drive-delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const fileId = e.currentTarget.dataset.id;
          const fileName = driveState.files.find(f => f.$id === fileId)?.name || 'this file';
          const btnTarget = e.currentTarget;

          // Check if file is used by a theme
          let usedByTheme = null;
          try {
            const docQueries = [
              JSON.stringify({ method: 'equal', attribute: 'profile', values: [storageData.appwriteSession.userId] })
            ];
            let docUrl = `https://nyc.cloud.appwrite.io/v1/databases/dockit_cloud/collections/themes/documents?`;
            docQueries.forEach(q => docUrl += `queries[]=${encodeURIComponent(q)}&`);
            const docRes = await fetch(docUrl, { headers });
            if (docRes.ok) {
              const docData = await docRes.json();
              const themeWithFile = docData.documents.find(t => t.background && t.background.includes(fileId));
              if (themeWithFile) {
                usedByTheme = themeWithFile.name;
              }
            }
          } catch (err) { }

          const confirmed = await new Promise(resolve => {
            const overlay = document.createElement('div');
            Object.assign(overlay.style, {
              position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
              backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: '9999999', opacity: '0', transition: 'opacity 0.2s'
            });

            const dialog = document.createElement('div');
            Object.assign(dialog.style, {
              backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-border)',
              borderRadius: '12px', padding: '20px', maxWidth: '300px', width: '90%',
              color: 'var(--color-foreground)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              transform: 'scale(0.95)', transition: 'transform 0.2s', display: 'flex',
              flexDirection: 'column', gap: '16px'
            });

            const text = document.createElement('div');
            text.style.fontSize = '13px';
            text.style.lineHeight = '1.5';
            text.style.whiteSpace = 'pre-wrap';

            if (usedByTheme) {
              text.innerHTML = `Are you sure you want to delete "<b>${fileName}</b>"?<br><br><span style="color: var(--color-accent); font-weight: 600;">Warning: This file is currently used as the background for your theme "${usedByTheme}".</span><br><br>This action cannot be undone.`;
            } else {
              text.innerHTML = `Are you sure you want to delete "<b>${fileName}</b>"?<br><br>This action cannot be undone.`;
            }

            const btnContainer = document.createElement('div');
            btnContainer.style.display = 'flex';
            btnContainer.style.gap = '10px';
            btnContainer.style.justifyContent = 'flex-end';

            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancel';
            Object.assign(cancelBtn.style, {
              padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)',
              backgroundColor: 'transparent', color: 'var(--color-foreground)', cursor: 'pointer',
              fontSize: '12px'
            });

            const confirmBtn = document.createElement('button');
            confirmBtn.textContent = 'Delete';
            Object.assign(confirmBtn.style, {
              padding: '6px 12px', borderRadius: '6px', border: 'none',
              backgroundColor: 'var(--color-accent)', color: '#fff', cursor: 'pointer',
              fontSize: '12px', fontWeight: 'bold'
            });

            const close = (val) => {
              overlay.style.opacity = '0';
              dialog.style.transform = 'scale(0.95)';
              setTimeout(() => { overlay.remove(); resolve(val); }, 200);
            };

            cancelBtn.onclick = () => close(false);
            confirmBtn.onclick = () => close(true);

            btnContainer.appendChild(cancelBtn);
            btnContainer.appendChild(confirmBtn);
            dialog.appendChild(text);
            dialog.appendChild(btnContainer);
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            requestAnimationFrame(() => {
              overlay.style.opacity = '1';
              dialog.style.transform = 'scale(1)';
            });
          });

          if (confirmed) {
            try {
              btnTarget.textContent = '...';
              const res = await fetch(`https://nyc.cloud.appwrite.io/v1/storage/buckets/Cloud-Drive/files/${fileId}`, {
                method: 'DELETE',
                headers
              });
              if (!res.ok) throw new Error('Failed to delete from Appwrite');
              const deletedFile = driveState.files.find(f => f.$id === fileId);
              if (deletedFile) {
                if (deletedFile.mimeType.startsWith('image/')) this._userStorageImgs = Math.max(0, (this._userStorageImgs || 0) - deletedFile.sizeOriginal);
                else if (deletedFile.mimeType.startsWith('video/')) this._userStorageVids = Math.max(0, (this._userStorageVids || 0) - deletedFile.sizeOriginal);
                else if (deletedFile.mimeType.includes('pdf') || deletedFile.mimeType.includes('text') || deletedFile.mimeType.includes('document')) this._userStorageDocs = Math.max(0, (this._userStorageDocs || 0) - deletedFile.sizeOriginal);
                else this._userStorageOthers = Math.max(0, (this._userStorageOthers || 0) - deletedFile.sizeOriginal);
                this._userStorageTotal = (this._userStorageExt || 0) + (this._userStorageImgs || 0) + (this._userStorageVids || 0) + (this._userStorageDocs || 0) + (this._userStorageOthers || 0);
              }
              driveState.files = driveState.files.filter(f => f.$id !== fileId);
              renderUI();
            } catch (err) {
              const errOverlay = document.createElement('div');
              Object.assign(errOverlay.style, {
                position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
                backgroundColor: 'var(--color-accent)', color: '#fff', padding: '10px 20px',
                borderRadius: '8px', zIndex: '9999999', fontSize: '13px', fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)', opacity: '0', transition: 'opacity 0.2s'
              });
              errOverlay.textContent = 'Failed to delete file';
              document.body.appendChild(errOverlay);
              requestAnimationFrame(() => errOverlay.style.opacity = '1');
              setTimeout(() => {
                errOverlay.style.opacity = '0';
                setTimeout(() => errOverlay.remove(), 200);
              }, 3000);
            }
          }
        });
      });
    };

    let isUploadingFiles = false;
    const uploadFiles = async (files) => {
      if (isUploadingFiles) return;
      isUploadingFiles = true;
      driveState.loading = true;
      renderUI();

      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append('fileId', 'unique()');
          formData.append('file', file, file.name);
          formData.append('permissions[]', 'read("any")');
          formData.append('permissions[]', `update("user:${storageData.appwriteSession.userId}")`);
          formData.append('permissions[]', `delete("user:${storageData.appwriteSession.userId}")`);

          const res = await fetch('https://nyc.cloud.appwrite.io/v1/storage/buckets/Cloud-Drive/files', {
            method: 'POST',
            headers: {
              'X-Appwrite-Project': projectId,
              'X-Fallback-Cookies': headers['X-Fallback-Cookies']
            },
            body: formData
          });
          if (res.ok) {
            const f = await res.json();
            if (f.mimeType.startsWith('image/')) this._userStorageImgs = (this._userStorageImgs || 0) + f.sizeOriginal;
            else if (f.mimeType.startsWith('video/')) this._userStorageVids = (this._userStorageVids || 0) + f.sizeOriginal;
            else if (f.mimeType.includes('pdf') || f.mimeType.includes('text') || f.mimeType.includes('document')) this._userStorageDocs = (this._userStorageDocs || 0) + f.sizeOriginal;
            else this._userStorageOthers = (this._userStorageOthers || 0) + f.sizeOriginal;
            this._userStorageTotal = (this._userStorageExt || 0) + (this._userStorageImgs || 0) + (this._userStorageVids || 0) + (this._userStorageDocs || 0) + (this._userStorageOthers || 0);
          } else {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || 'Failed to upload');
          }
        } catch (e) {
          console.error('Failed to upload', e);
          const errOverlay = document.createElement('div');
          Object.assign(errOverlay.style, {
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
            backgroundColor: 'var(--color-accent)', color: '#fff', padding: '10px 20px',
            borderRadius: '8px', zIndex: '9999999', fontSize: '13px', fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)', opacity: '0', transition: 'opacity 0.2s'
          });
          errOverlay.textContent = 'Upload failed: ' + e.message;
          document.body.appendChild(errOverlay);
          requestAnimationFrame(() => errOverlay.style.opacity = '1');
          setTimeout(() => {
            errOverlay.style.opacity = '0';
            setTimeout(() => errOverlay.remove(), 200);
          }, 4000);
        }
      }

      // refresh
      fetchFiles();
      isUploadingFiles = false;
    };

    const fetchFiles = async (cursor = null) => {
      if (!cursor) {
        const cache = await chrome.storage.local.get(['dockitDriveCache']);
        if (cache.dockitDriveCache) {
          driveState.files = cache.dockitDriveCache.files;
          driveState.chips = cache.dockitDriveCache.chips;
          driveState.hasNext = cache.dockitDriveCache.hasNext;
          driveState.pageCursor = cache.dockitDriveCache.pageCursor;
          driveState.loading = false;
          renderUI();
        } else {
          driveState.files = [];
          driveState.chips = ['All'];
          driveState.loading = true;
          renderUI();
        }
      } else {
        driveState.loading = true;
        renderUI();
      }

      try {
        let url = `https://nyc.cloud.appwrite.io/v1/storage/buckets/Cloud-Drive/files?queries[]=${encodeURIComponent(JSON.stringify({ method: 'limit', values: [50] }))}&queries[]=${encodeURIComponent(JSON.stringify({ method: 'orderDesc', attribute: '$createdAt' }))}`;
        if (cursor) {
          url += `&queries[]=${encodeURIComponent(JSON.stringify({ method: 'cursorAfter', values: [cursor] }))}`;
        }

        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error('Failed to load files');

        const data = await res.json();

        // Ensure we only show files the user has permission to delete (their own files)
        const userFiles = data.files.filter(f => f.$permissions && f.$permissions.some(p => p.includes(`user:${storageData.appwriteSession.userId}`)));

        driveState.files = cursor ? [...driveState.files, ...userFiles] : userFiles;
        driveState.hasNext = data.files.length === 50;
        if (data.files.length > 0) {
          driveState.pageCursor = data.files[data.files.length - 1].$id;
        }

        let hasImages = false;
        let hasVideos = false;
        let hasDocs = false;
        let hasOthers = false;

        driveState.files.forEach(f => {
          if (f.mimeType.startsWith('image/')) hasImages = true;
          else if (f.mimeType.startsWith('video/')) hasVideos = true;
          else if (f.mimeType.includes('pdf') || f.mimeType.includes('text') || f.mimeType.includes('document')) hasDocs = true;
          else hasOthers = true;
        });

        driveState.chips = ['All'];
        if (hasDocs) driveState.chips.push('Documents');
        if (hasImages) driveState.chips.push('Images');
        if (hasOthers) driveState.chips.push('Others');
        if (hasVideos) driveState.chips.push('Videos');

        if (!cursor) {
          await chrome.storage.local.set({
            dockitDriveCache: {
              files: driveState.files,
              chips: driveState.chips,
              hasNext: driveState.hasNext,
              pageCursor: driveState.pageCursor
            }
          });
        }

        driveState.loading = false;
        renderUI();
      } catch (err) {
        driveState.error = err.message;
        driveState.loading = false;
        renderUI();
      }
    };

    fetchFiles();
  }

  async enterThemeEditor(initialTheme = null) {
    const host = this.element.getRootNode()?.host || document.getElementById('dockit-host-root');
    if (host) {
      host.classList.add('dockit-theme-editor-active');
    }
    document.documentElement.classList.add('dockit-theme-editor-active');
    document.body.classList.add('dockit-theme-editor-active');

    const editorEl = document.createElement('div');
    editorEl.className = 'dockit-theme-editor';
    editorEl.id = 'dockit-theme-editor';

    const container = this.element.parentNode || document.body;
    container.appendChild(editorEl);

    this._themeEditor = new DockitThemeEditor(editorEl, this, () => {
      editorEl.remove();
      if (host) {
        host.classList.remove('dockit-theme-editor-active');
      }
      document.documentElement.classList.remove('dockit-theme-editor-active');
      document.body.classList.remove('dockit-theme-editor-active');
      this._themeEditor = null;
      this._renderCustomization();
    });

    await this._themeEditor.init(initialTheme);
  }
}

class DockitThemeEditor {
  constructor(containerEl, sidebarInstance, onClose) {
    this.container = containerEl;
    this.sidebar = sidebarInstance;
    this.onClose = onClose;
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.isPanning = false;

    this.theme = {
      name: 'My Custom Theme',
      colors: {
        '--color-background': '#333333',
        '--color-foreground': '#ffffff',
        '--color-primary': '#3b82f6',
        '--color-secondary': '#252525',
        '--color-border': '#434343',
        '--color-accent': '#ef4444'
      },
      options: {
        '--padding-value': '0px',
        '--blur-value': '0px',
        '--opacity-value': '1.0',
        '--corner-radius-value': '0px'
      }
    };

    this.isIsolated = false;
    this.isolatedMockup = null;
    this.selectedElement = null;
    this.selectedMockupWrapper = null;
    this.dragMockup = null;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragStartLeft = 0;
    this.dragStartTop = 0;
  }

  async init(initialTheme = null) {
    if (initialTheme) {
      this.theme = JSON.parse(JSON.stringify(initialTheme));
    } else {
      const data = await chrome.storage.local.get(['dockitTheme']);
      if (data.dockitTheme) {
        this.theme = JSON.parse(JSON.stringify(data.dockitTheme));
      }
    }
    this.originalThemeStr = JSON.stringify(this.theme);

    const storageData = await chrome.storage.local.get(['lucideIcons']);
    this.lucideIcons = storageData.lucideIcons || {};

    this.render();
    this.setupEvents();
    this.applyEditingThemeCSS();
  }

  render() {
    const menuIcon = this.lucideIcons['menu'] || `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
    const editIcon = this.lucideIcons['edit-3'] || `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;

    const trashIcon = this.lucideIcons['trash-2'] || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
    const resetIcon = this.lucideIcons['rotate-cw'] || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>`;
    const checkIcon = this.lucideIcons['check'] || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    const uploadIcon = this.lucideIcons['upload'] || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>`;
    const discardIcon = this.lucideIcons['x'] || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    const plusIcon = this.lucideIcons['plus'] || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
    const minusIcon = this.lucideIcons['minus'] || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
    const maximizeIcon = this.lucideIcons['maximize'] || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`;
    const alignTopIcon = this.lucideIcons['align-horizontal-space-around'] || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><rect width="6" height="14" x="9" y="5" rx="2"/><path d="M4 22V2m16 20V2"/></svg>`;
    const stretchVerticalIcon = this.lucideIcons['stretch-vertical'] || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><rect width="20" height="16" x="2" y="4" rx="2"/></svg>`;

    this.container.innerHTML = `
      <div class="dockit-theme-editor-menubar">
        <div class="dockit-menubar-left">
          <button class="dockit-menu-trigger-btn">
            <span class="dockit-menu-trigger-icon">${menuIcon}</span>
          </button>
          <div class="dockit-theme-name-container">
            <span class="dockit-theme-name-label">${this.theme.name}</span>
            <input class="dockit-theme-name-input" type="text" value="${this.theme.name}" style="display: none;" />
            <span class="dockit-theme-name-edit-icon">${editIcon}</span>
          </div>
        </div>
        
        <div class="dockit-theme-dropdown" style="display: none;">
          <button class="dockit-dropdown-item" id="btn-apply-theme">
            ${checkIcon} <span>Apply Theme</span>
          </button>
          <button class="dockit-dropdown-item" id="btn-publish-theme">
            ${uploadIcon} <span>Publish Theme</span>
          </button>
          <button class="dockit-dropdown-item" id="btn-discard-theme">
            ${discardIcon} <span>Exit Editor</span>
          </button>
          <div class="dockit-dropdown-divider"></div>
          <button class="dockit-dropdown-item" id="btn-reset-theme">
            ${resetIcon} <span>Discard Changes</span>
          </button>
          <button class="dockit-dropdown-item" id="btn-clear-theme">
            ${trashIcon} <span>Reset to Default Theme</span>
          </button>
        </div>
      </div>
      
      <div class="dockit-theme-editor-canvas" style="user-select: none; -webkit-user-select: none;">
        <div class="dockit-theme-editor-grid"></div>
      </div>
      
      <div class="dockit-zoom-controls">
        <button class="dockit-zoom-btn" id="btn-zoom-out" title="Zoom Out">${minusIcon}</button>
        <div class="dockit-zoom-level-container">
          <button class="dockit-zoom-level-btn" id="btn-zoom-toggle">${Math.round((this.zoom || 1) * 100)}%</button>
          <div class="dockit-zoom-menu" style="display: none;">
            <button class="dockit-dropdown-item" id="btn-zoom-100">
              <span style="opacity: 0.7; width: 14px; height: 14px; display: inline-flex; align-items: center; justify-content: center;">1:1</span>
              <span>Zoom to 100%</span>
            </button>
            <button class="dockit-dropdown-item" id="btn-zoom-fit">
              ${maximizeIcon} <span>Zoom to Fit</span>
            </button>
            <div class="dockit-dropdown-divider"></div>
            <button class="dockit-dropdown-item" id="btn-organize-objects">
              ${alignTopIcon} <span>Organize Objects</span>
            </button>
            <button class="dockit-dropdown-item" id="btn-stretch-objects">
              ${stretchVerticalIcon} <span>Stretch Objects</span>
            </button>
          </div>
        </div>
        <button class="dockit-zoom-btn" id="btn-zoom-in" title="Zoom In">${plusIcon}</button>
      </div>

      <div class="dockit-context-toolbar" style="display: none;"></div>
    `;

    this.renderMockups();
  }

  async renderMockups() {
    const grid = this.container.querySelector('.dockit-theme-editor-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const clones = await this.getLiveMockupClones();
    if (!clones) return;

    const mockupsData = [
      { id: 'sidebar', title: 'Sidebar', left: 100, top: 150, width: 48, height: 500, node: clones.sidebar },
      { id: 'settings', title: 'Settings', left: 220, top: 150, width: 320, height: 500, node: clones.settings },
      { id: 'edit-apps', title: 'Edit Apps', left: 580, top: 150, width: 320, height: 500, node: clones.editApps },
      { id: 'customization', title: 'Customization', left: 940, top: 150, width: 320, height: 500, node: clones.customization },
      { id: 'theme-card', title: 'Theme Card', left: 1300, top: 150, width: 280, height: 160, node: clones.themeCard }
    ];

    mockupsData.forEach(data => {
      const wrapper = document.createElement('div');
      wrapper.className = `dockit-mockup-wrapper mockup-${data.id}`;
      wrapper.dataset.id = data.id;
      wrapper.style.left = `${data.left}px`;
      wrapper.style.top = `${data.top}px`;
      wrapper.style.width = `${data.width}px`;
      wrapper.style.height = `${data.height}px`;



      wrapper.appendChild(data.node);

      let directions = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
      if (data.id === 'sidebar') directions = ['n', 's'];

      directions.forEach(dir => {
        const handle = document.createElement('div');
        handle.className = `dockit-resize-handle ${dir}`;
        handle.dataset.direction = dir;
        wrapper.appendChild(handle);
      });

      grid.appendChild(wrapper);
    });

    this.renderImages();
  }

  renderImages() {
    const grid = this.container.querySelector('.dockit-theme-editor-grid');
    if (!grid) return;

    let selectedImageId = null;
    let selectedImageWrapperId = null;
    if (this.selectedElement && this.selectedElement.classList.contains('dockit-mockup-image-container')) {
      selectedImageId = this.selectedElement.dataset.imageId;
      const parentWrapper = this.selectedElement.closest('.dockit-mockup-wrapper');
      if (parentWrapper) {
        selectedImageWrapperId = parentWrapper.dataset.id;
      }
    }

    grid.querySelectorAll('.dockit-mockup-image-container').forEach(el => el.remove());
    grid.querySelectorAll('.dockit-mockup-pattern-layer').forEach(el => el.remove());
    grid.querySelectorAll('.dockit-in-page, .dockit-sidebar').forEach(el => {
      el.style.removeProperty('overflow');
    });

    if (!this.theme.images || this.theme.images.length === 0) {
      this.updateThemeCardImages();
      return;
    }

    this.theme.images.sort((a, b) => {
      if (a.isPattern && !b.isPattern) return -1;
      if (!a.isPattern && b.isPattern) return 1;
      return 0;
    });

    const wrappers = Array.from(grid.querySelectorAll('.dockit-mockup-wrapper'));
    const refNodes = new Map();
    wrappers.forEach(wrapper => {
      const clipTarget = wrapper.querySelector('.dockit-in-page') || wrapper.querySelector('.dockit-sidebar') || wrapper;
      refNodes.set(clipTarget, clipTarget.firstChild);
    });

    this.theme.images.forEach(imgData => {
      wrappers.forEach(wrapper => {
        const isParent = wrapper.dataset.id === imgData.parentId;
        if (wrapper.dataset.id === 'theme-card') return; // theme-card handles its own images
        const clipTarget = wrapper.querySelector('.dockit-in-page') || wrapper.querySelector('.dockit-sidebar') || wrapper;
        const isSidebar = wrapper.dataset.id === 'sidebar';

        let scaledWidth = imgData.width;
        let scaledHeight = imgData.height;

        if (imgData.parentId === 'sidebar' && !isSidebar) {
          scaledWidth *= 2;
          scaledHeight *= 2;
        } else if (imgData.parentId !== 'sidebar' && isSidebar) {
          scaledWidth *= 0.5;
          scaledHeight *= 0.5;
        }

        if (imgData.isPattern) {
          const patternLayer = document.createElement('div');
          patternLayer.className = 'dockit-mockup-pattern-layer';
          patternLayer.dataset.imageId = imgData.id;
          patternLayer.style.position = 'absolute';
          patternLayer.style.left = '0';
          patternLayer.style.top = '0';
          patternLayer.style.width = '100%';
          patternLayer.style.height = '100%';
          patternLayer.style.backgroundImage = `url(${imgData.src})`;
          patternLayer.style.backgroundRepeat = 'repeat';
          patternLayer.style.pointerEvents = 'none';
          patternLayer.style.zIndex = '-1';
          patternLayer.style.backgroundSize = `${scaledWidth}px ${scaledHeight}px`;
          patternLayer.style.backgroundPosition = `calc(50% + ${imgData.offsetX}% + ${imgData.offsetX * scaledWidth / 100}px) calc(50% + ${imgData.offsetY}% + ${imgData.offsetY * scaledHeight / 100}px)`;

          clipTarget.insertBefore(patternLayer, refNodes.get(clipTarget));
        }

        const imgContainer = document.createElement('div');
        imgContainer.className = `dockit-mockup-image-container ${isParent ? 'is-parent' : 'is-child'}`;
        imgContainer.dataset.imageId = imgData.id;

        imgContainer.style.width = `${scaledWidth}px`;
        imgContainer.style.height = `${scaledHeight}px`;
        imgContainer.style.left = `calc(50% + ${imgData.offsetX}% - ${scaledWidth / 2}px)`;
        imgContainer.style.top = `calc(50% + ${imgData.offsetY}% - ${scaledHeight / 2}px)`;

        if (!imgData.isPattern) {
          const imgEl = document.createElement('img');
          imgEl.src = imgData.src;
          imgEl.className = 'dockit-mockup-image';
          imgEl.draggable = false;
          imgContainer.appendChild(imgEl);
        } else {
          imgContainer.dataset.isPattern = "true";
        }

        if (isParent) {
          let directions = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
          directions.forEach(dir => {
            const handle = document.createElement('div');
            handle.className = `dockit-resize-handle ${dir}`;
            handle.dataset.direction = dir;
            imgContainer.appendChild(handle);
          });
          if (clipTarget !== wrapper) {
            clipTarget.style.setProperty('overflow', 'visible', 'important');
          }
        }

        if (imgData.isCropped) {
          let cropWrapper = clipTarget.querySelector(':scope > .dockit-mockup-crop-wrapper');
          if (!cropWrapper) {
            cropWrapper = document.createElement('div');
            cropWrapper.className = 'dockit-mockup-crop-wrapper';
            cropWrapper.style.position = 'absolute';
            cropWrapper.style.inset = '0';
            cropWrapper.style.overflow = 'hidden';
            cropWrapper.style.borderRadius = 'inherit';
            cropWrapper.style.zIndex = '0';
            clipTarget.insertBefore(cropWrapper, refNodes.get(clipTarget));
          }
          cropWrapper.appendChild(imgContainer);
        } else {
          clipTarget.insertBefore(imgContainer, refNodes.get(clipTarget));
        }

        if (selectedImageId && imgData.id === selectedImageId && wrapper.dataset.id === selectedImageWrapperId) {
          this.selectedElement = imgContainer;
          imgContainer.classList.add('dockit-element-selected');
          const rect = imgContainer.getBoundingClientRect();
          this.showToolbar(rect, 'image', imgContainer);
        }
      });
    });

    this.updateThemeCardImages();
  }

  updateThemeCardImages() {
    const cardImagesContainer = this.container.querySelector('.dockit-theme-card-images');
    const card = this.container.querySelector('.dockit-theme-card-mockup');
    if (!cardImagesContainer || !card) return;

    cardImagesContainer.innerHTML = '';

    const existingPattern = card.querySelector('.dockit-theme-card-pattern');
    if (existingPattern) existingPattern.remove();

    if (!this.theme.images || this.theme.images.length === 0) return;

    const patternImg = this.theme.images.find(img => img.isPattern);
    if (patternImg) {
      const patternLayer = document.createElement('div');
      patternLayer.className = 'dockit-theme-card-pattern';
      patternLayer.style.cssText = `
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        background-image: url(${patternImg.src});
        background-repeat: repeat;
        background-size: ${patternImg.width}px ${patternImg.height}px;
        background-position: calc(50% + ${patternImg.offsetX}% + ${patternImg.offsetX * patternImg.width / 100}px) calc(50% + ${patternImg.offsetY}% + ${patternImg.offsetY * patternImg.height / 100}px);
        z-index: 0;
        pointer-events: none;
      `;
      card.insertBefore(patternLayer, card.firstChild);
    }

    const objectImgs = this.theme.images.filter(img => !img.isPattern);

    objectImgs.forEach((imgData, index) => {
      const img = document.createElement('img');
      img.src = imgData.src;
      img.style.cssText = `
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: ${imgData.fit || 'contain'};
        -webkit-mask-image: linear-gradient(to bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.2) 100%);
        mask-image: linear-gradient(to bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.2) 100%);
        pointer-events: none;
        opacity: ${index === 0 ? '1' : '0'};
        transition: opacity 1s ease-in-out;
      `;
      cardImagesContainer.appendChild(img);
    });

    if (objectImgs.length > 1) {
      let currentIdx = 0;
      const fader = () => {
        if (!cardImagesContainer.isConnected) return;
        const imgs = cardImagesContainer.querySelectorAll('img');
        if (imgs.length === 0) return;

        currentIdx = (currentIdx + 1) % imgs.length;
        imgs.forEach((img, i) => {
          img.style.opacity = (i === currentIdx) ? '1' : '0';
        });

        setTimeout(fader, 3000);
      };
      setTimeout(fader, 3000);
    }
  }

  async getLiveMockupClones() {
    const realContentEl = this.sidebar.element.querySelector('#dockit-in-page-content');
    const titleEl = this.sidebar.element.querySelector('#dockit-in-page-title');
    if (!realContentEl) return null;

    const origAppName = titleEl ? titleEl.dataset.appName : '';

    const tempContentEl = document.createElement('div');
    tempContentEl.id = 'dockit-in-page-content';
    tempContentEl.className = 'dockit-in-page-content';
    tempContentEl.style.display = 'none';

    realContentEl.parentNode.appendChild(tempContentEl);
    realContentEl.removeAttribute('id');

    if (titleEl) titleEl.dataset.appName = 'Settings';
    await this.sidebar._renderSettings();
    const settingsContent = tempContentEl.cloneNode(true);
    settingsContent.style.display = '';
    settingsContent.removeAttribute('id');

    if (titleEl) titleEl.dataset.appName = 'Edit Apps';
    await this.sidebar.refreshActiveSite();
    const editAppsContent = tempContentEl.cloneNode(true);
    editAppsContent.style.display = '';
    editAppsContent.removeAttribute('id');

    if (titleEl) titleEl.dataset.appName = 'Customization';
    await this.sidebar._renderCustomization(true);
    const customizationContent = tempContentEl.cloneNode(true);
    customizationContent.style.display = '';
    customizationContent.removeAttribute('id');

    realContentEl.id = 'dockit-in-page-content';
    if (titleEl) titleEl.dataset.appName = origAppName;
    tempContentEl.remove();

    const clonedSidebar = this.sidebar.element.cloneNode(true);
    const sidebarInPage = clonedSidebar.querySelector('.dockit-in-page');
    if (sidebarInPage) sidebarInPage.remove();
    clonedSidebar.classList.remove('dockit-sidebar-hidden');
    clonedSidebar.style.cssText = 'height: 100%; width: 100%; position: relative; border-right: none; margin: 0; padding: 12px 0; box-sizing: border-box; border-radius: var(--corner-radius-value, 0px); overflow: hidden;';

    const FAKE_FAVICONS = [
      { domain: 'github.com', label: 'GitHub' },
      { domain: 'youtube.com', label: 'YouTube' },
      { domain: 'figma.com', label: 'Figma' },
      { domain: 'notion.so', label: 'Notion' },
      { domain: 'linear.app', label: 'Linear' },
      { domain: 'vercel.com', label: 'Vercel' },
    ];

    const FAKE_APPS = [
      { domain: 'github.com', title: 'GitHub', url: 'github.com' },
      { domain: 'youtube.com', title: 'YouTube', url: 'youtube.com' },
      { domain: 'figma.com', title: 'Figma', url: 'figma.com' },
      { domain: 'notion.so', title: 'Notion Workspace', url: 'notion.so' },
      { domain: 'linear.app', title: 'Linear — Issues', url: 'linear.app' },
      { domain: 'vercel.com', title: 'Vercel Dashboard', url: 'vercel.com' },
      { domain: 'reddit.com', title: 'Reddit', url: 'reddit.com' },
      { domain: 'x.com', title: 'X / Twitter', url: 'x.com' },
    ];

    //sidebar: populate #pinned-section with fake .dockit-app icon elements
    const sidebarPinnedSection = clonedSidebar.querySelector('#pinned-section');
    if (sidebarPinnedSection) {
      sidebarPinnedSection.innerHTML = '';
      FAKE_FAVICONS.forEach(f => {
        const appEl = document.createElement('div');
        appEl.className = 'dockit-app';
        appEl.setAttribute('data-theme-colors', '--color-primary, --color-foreground');
        appEl.title = f.label;
        appEl.innerHTML = `<img src="https://www.google.com/s2/favicons?domain=${f.domain}&sz=32" alt="${f.label}" draggable="false" style="width:100%;height:100%;border-radius:6px;" />`;
        sidebarPinnedSection.appendChild(appEl);
      });
      //also show the divider below pinned section
      const pinnedDivider = clonedSidebar.querySelector('.dockit-divider');
      if (pinnedDivider) pinnedDivider.style.display = 'block';
    }

    //edit-apps: overwrite active site container with a fake entry
    const activeSiteContainer = editAppsContent.querySelector('.dockit-active-site-container');
    if (activeSiteContainer) {
      const pinIcon = this.lucideIcons['pin'] || `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>`;
      activeSiteContainer.innerHTML = `
        <img src="https://www.google.com/s2/favicons?domain=figma.com&sz=32"
          class="dockit-active-site-favicon" style="width:32px;height:32px;border-radius:6px;flex-shrink:0;" />
        <div class="dockit-active-site-info" style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;">
          <div class="dockit-active-site-title" style="font-weight:600;font-size:14px;line-height:1.15;" data-theme-colors="--color-foreground">Figma — Design File</div>
          <div class="dockit-active-site-url" style="font-size:12px;opacity:0.6;line-height:1.15;margin-top:1px;" data-theme-colors="--color-foreground-rgba">figma.com/file/abc123</div>
        </div>
        <div style="width:24px;height:24px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--color-primary);" data-theme-colors="--color-primary">
          <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; transform: rotate(45deg); pointer-events: none; color: currentColor;">
            ${pinIcon}
          </div>
        </div>
      `;
    }

    //edit-apps: populate pinned apps grid with fake icons
    const appsGrid = editAppsContent.querySelector('.dockit-apps-grid');
    if (appsGrid) {
      appsGrid.style.display = 'grid';
      appsGrid.innerHTML = FAKE_FAVICONS.map(f => `
        <div class="dockit-grid-app" style="width:100%;height:56px;display:flex;align-items:center;justify-content:center;cursor:grab;">
          <div class="dockit-grid-app-inner" data-theme-colors="--color-primary"
            style="width:56px;height:56px;border-radius:8px;display:flex;align-items:center;justify-content:center;background-color:transparent;">
            <img src="https://www.google.com/s2/favicons?domain=${f.domain}&sz=32"
              alt="${f.label}" style="width:38px;height:38px;" draggable="false" />
          </div>
        </div>
      `).join('');
    }

    //edit-apps: replace absolute dropdown with a standalone rounded results list below the search card
    const searchCard = editAppsContent.querySelector('.dockit-search-card');
    const suggestionsDropdown = editAppsContent.querySelector('.dockit-suggestions-dropdown');
    if (suggestionsDropdown) suggestionsDropdown.remove(); //remove from inside search card

    if (searchCard) {
      searchCard.style.marginBottom = '4px'; //close gap to match live dropdown placement
      const plusSvg = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
      const resultsContainer = document.createElement('div');
      resultsContainer.setAttribute('data-theme-colors', '--color-border, --color-secondary');
      resultsContainer.style.cssText = 'border: 1px solid color-mix(in srgb, var(--color-border) calc(var(--menu-opacity-value, 1) * 100%), transparent); border-radius: 8px; background-color: color-mix(in srgb, var(--color-secondary) calc(var(--menu-opacity-value, 1) * 100%), transparent); overflow: hidden; margin-bottom: 24px;';
      resultsContainer.innerHTML = FAKE_APPS.map(app => `
        <div class="dockit-suggestion-row" data-theme-colors="--color-foreground"
          style="display:flex;align-items:center;padding:8px 12px;gap:10px;cursor:pointer;transition:background-color 0.15s;min-height:48px;">
          <img src="https://www.google.com/s2/favicons?domain=${app.domain}&sz=32"
            style="width:24px;height:24px;border-radius:4px;flex-shrink:0;" />
          <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:2px;">
            <div style="font-weight:500;font-size:13px;color:var(--color-foreground);" data-theme-colors="--color-foreground">${app.title}</div>
            <div style="font-size:11px;color:var(--color-foreground);opacity:0.5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.2;" data-theme-colors="--color-foreground-rgba">${app.url}</div>
          </div>
          <div class="dockit-suggestion-plus" data-theme-colors="--color-primary"
            style="width:20px;height:20px;border-radius:4px;display:flex;align-items:center;justify-content:center;color:var(--color-primary);flex-shrink:0;">
            ${plusSvg}
          </div>
        </div>
      `).join('');
      searchCard.insertAdjacentElement('afterend', resultsContainer);
    }


    //settings: inject fake blocklist tags
    const blocklistContainers = settingsContent.querySelectorAll('.dockit-settings-tags');
    const FAKE_BLOCKED = ['reddit.com', 'twitter.com', 'facebook.com'];
    const FAKE_AUTOHIDE = ['mail.google.com', 'docs.google.com'];
    blocklistContainers.forEach((container, i) => {
      const domains = i === 0 ? FAKE_BLOCKED : FAKE_AUTOHIDE;
      container.innerHTML = domains.map(d => `
        <div class="dockit-settings-tag" data-theme-colors="--color-secondary, --color-border, --color-foreground">
          <span>${d}</span>
        </div>
      `).join('');
    });

    //settings: alternate toggle checked states to show on/off
    settingsContent.querySelectorAll('input[type="checkbox"]').forEach((cb, i) => {
      cb.checked = i % 2 === 0;
    });



    const result = {
      sidebar: clonedSidebar,
      settings: this.wrapInPageMockup('Settings', settingsContent),
      editApps: this.wrapInPageMockup('Edit Apps', editAppsContent),
      customization: this.wrapInPageMockup('Customization', customizationContent),
      themeCard: this.createThemeCardMockup()
    };

    Object.values(result).forEach(node => {
      node.querySelectorAll('svg').forEach(svg => {
        if (!svg.hasAttribute('data-theme-colors')) {
          const closestTheme = svg.parentElement ? svg.parentElement.closest('[data-theme-colors]:not(.dockit-in-page):not(.dockit-sidebar):not(.dockit-section)') : null;
          if (!closestTheme) {
            svg.setAttribute('data-theme-colors', '--color-foreground');
          }
        }
      });
      node.querySelectorAll('input').forEach(input => {
        input.setAttribute('readonly', 'true');
      });
      node.querySelectorAll('label, input[type="checkbox"]').forEach(el => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
        }, true);
      });
    });

    return result;
  }


  wrapInPageMockup(title, contentNode) {
    const wrapper = document.createElement('div');
    wrapper.className = 'dockit-in-page';
    wrapper.setAttribute('data-theme-colors', '--color-background');
    wrapper.style.cssText = 'position: relative; right: auto; width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden;';

    const xIcon = this.lucideIcons['x'] || `<svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    wrapper.innerHTML = `
      <div class="dockit-in-page-header">
        <div class="dockit-action-btn" style="padding: 0; opacity: 1; margin: 0; background: transparent; display: flex; align-items: center; justify-content: center; border: none; color: var(--color-foreground);" data-theme-colors="--color-foreground">${xIcon}</div>
        <span class="dockit-in-page-title" data-theme-colors="--color-foreground">${title}</span>
      </div>
    `;

    wrapper.appendChild(contentNode);
    return wrapper;
  }

  createThemeCardMockup() {
    return DockitSidebar.createThemeCardDOM(this.theme);
  }

  applyEditingThemeCSS() {
    let styleEl = this.container.querySelector('#editing-theme-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'editing-theme-styles';
      this.container.appendChild(styleEl);
    }

    let css = '.dockit-theme-editor-grid {\n';
    for (const [key, val] of Object.entries(this.theme.colors)) {
      css += `  ${key}: ${val} !important;\n`;
    }
    for (const [key, val] of Object.entries(this.theme.options)) {
      css += `  ${key}: ${val} !important;\n`;
    }
    css += '}\n';

    styleEl.textContent = css;

    const card = this.container.querySelector('.dockit-theme-card-mockup');
    if (card) {
      for (const [key, val] of Object.entries(this.theme.colors)) {
        card.style.setProperty(key, val);
      }
      for (const [key, val] of Object.entries(this.theme.options)) {
        card.style.setProperty(key, val);
      }
    }
  }

  setupEvents() {
    const canvas = this.container.querySelector('.dockit-theme-editor-canvas');
    const grid = this.container.querySelector('.dockit-theme-editor-grid');

    // Setup zoom controls
    const btnZoomIn = this.container.querySelector('#btn-zoom-in');
    const btnZoomOut = this.container.querySelector('#btn-zoom-out');
    const btnZoomToggle = this.container.querySelector('#btn-zoom-toggle');
    const zoomMenu = this.container.querySelector('.dockit-zoom-menu');

    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => {
        const rect = canvas.getBoundingClientRect();
        zoomAtPoint(1.1, rect.width / 2, rect.height / 2);
      });
    }

    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => {
        const rect = canvas.getBoundingClientRect();
        zoomAtPoint(1 / 1.1, rect.width / 2, rect.height / 2);
      });
    }

    if (btnZoomToggle && zoomMenu) {
      btnZoomToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = zoomMenu.style.display !== 'none';
        zoomMenu.style.display = isVisible ? 'none' : 'block';
      });

      document.addEventListener('click', (e) => {
        if (!e.target.closest('.dockit-zoom-level-container')) {
          zoomMenu.style.display = 'none';
        }
      });
    }

    // Zoom to 100%
    const btnZoom100 = this.container.querySelector('#btn-zoom-100');
    if (btnZoom100) {
      btnZoom100.addEventListener('click', () => {
        zoomMenu.style.display = 'none';
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const oldZoom = this.zoom;
        this.zoom = 1.0;
        const gridX = (centerX - this.panX) / oldZoom;
        const gridY = (centerY - this.panY) / oldZoom;
        this.panX = centerX - gridX * this.zoom;
        this.panY = centerY - gridY * this.zoom;
        updateTransform();
      });
    }

    // Zoom to Fit
    const btnZoomFit = this.container.querySelector('#btn-zoom-fit');
    if (btnZoomFit) {
      btnZoomFit.addEventListener('click', () => {
        zoomMenu.style.display = 'none';
        const mockups = Array.from(grid.querySelectorAll('.dockit-mockup-wrapper'));
        if (mockups.length === 0) return;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        mockups.forEach(m => {
          const l = parseFloat(m.style.left) || 0;
          const t = parseFloat(m.style.top) || 0;
          const w = parseFloat(m.style.width) || 0;
          const h = parseFloat(m.style.height) || 0;
          minX = Math.min(minX, l);
          minY = Math.min(minY, t);
          maxX = Math.max(maxX, l + w);
          maxY = Math.max(maxY, t + h);
        });

        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        const rect = canvas.getBoundingClientRect();
        const padding = 40;

        const scaleX = (rect.width - padding * 2) / contentWidth;
        const scaleY = (rect.height - padding * 2) / contentHeight;
        this.zoom = Math.max(0.3, Math.min(Math.min(scaleX, scaleY), 3.0));

        const contentCenterX = minX + contentWidth / 2;
        const contentCenterY = minY + contentHeight / 2;
        this.panX = (rect.width / 2) - (contentCenterX * this.zoom);
        this.panY = (rect.height / 2) - (contentCenterY * this.zoom);

        updateTransform();
      });
    }

    // Organize Objects
    const btnOrganize = this.container.querySelector('#btn-organize-objects');
    if (btnOrganize) {
      btnOrganize.addEventListener('click', () => {
        zoomMenu.style.display = 'none';
        const mockups = Array.from(grid.querySelectorAll('.dockit-mockup-wrapper'));
        mockups.sort((a, b) => (parseFloat(a.style.left) || 0) - (parseFloat(b.style.left) || 0));

        let currentLeft = 100;
        const topY = 150;
        const gap = 40;

        mockups.forEach(m => {
          m.style.top = `${topY}px`;
          m.style.left = `${currentLeft}px`;
          currentLeft += (parseFloat(m.style.width) || 320) + gap;
        });
      });
    }

    // Stretch Objects
    const btnStretch = this.container.querySelector('#btn-stretch-objects');
    if (btnStretch) {
      btnStretch.addEventListener('click', () => {
        zoomMenu.style.display = 'none';
        const mockups = Array.from(grid.querySelectorAll('.dockit-mockup-wrapper:not(.mockup-sidebar)'));
        mockups.forEach(m => {
          const originalHeight = m.style.height;
          m.style.height = 'auto';
          const newHeight = m.scrollHeight;
          m.style.height = `${Math.max(500, newHeight)}px`;
        });
      });
    }
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    const triggerBtn = this.container.querySelector('.dockit-menu-trigger-btn');
    const dropdown = this.container.querySelector('.dockit-theme-dropdown');

    triggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });

    document.addEventListener('click', (e) => {
      if (!triggerBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });

    const nameLabel = this.container.querySelector('.dockit-theme-name-label');
    const nameInput = this.container.querySelector('.dockit-theme-name-input');
    const editIcon = this.container.querySelector('.dockit-theme-name-edit-icon');

    const startEditName = (e) => {
      e.stopPropagation();
      nameLabel.style.display = 'none';
      editIcon.style.display = 'none';
      nameInput.style.display = 'inline-block';
      nameInput.focus();
      nameInput.select();
    };

    nameLabel.addEventListener('click', startEditName);
    editIcon.addEventListener('click', startEditName);

    nameInput.addEventListener('input', () => {
      const cardTitle = this.container.querySelector('.dockit-theme-card-title');
      if (cardTitle) cardTitle.innerText = nameInput.value.trim() || 'My Custom Theme';
    });

    nameInput.addEventListener('blur', () => {
      this.theme.name = nameInput.value.trim() || 'My Custom Theme';
      nameLabel.textContent = this.theme.name;
      nameInput.style.display = 'none';
      nameLabel.style.display = 'inline-block';
      editIcon.style.display = 'inline-block';
      const cardTitle = this.container.querySelector('.dockit-theme-card-title');
      if (cardTitle) cardTitle.innerText = this.theme.name;
    });

    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        nameInput.blur();
      }
    });

    const BASE_GRID_SIZE = 20;
    const updateToolbarPosition = () => {
      if (this.selectedMockupWrapper) {
        this.showToolbar(this.selectedMockupWrapper.getBoundingClientRect(), 'wrapper', this.selectedMockupWrapper);
      } else if (this.selectedElement) {
        this.showToolbar(this.selectedElement.getBoundingClientRect(), 'element', this.selectedElement);
      }
    };
    const updateTransform = () => {
      grid.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
      const scaledGrid = BASE_GRID_SIZE * this.zoom;
      canvas.style.backgroundSize = `${scaledGrid}px ${scaledGrid}px`;
      canvas.style.backgroundPosition = `${this.panX}px ${this.panY}px`;

      const zoomTextBtn = this.container.querySelector('#btn-zoom-toggle');
      if (zoomTextBtn) {
        zoomTextBtn.textContent = `${Math.round((this.zoom || 1) * 100)}%`;
      }

      updateToolbarPosition();
    };

    const zoomAtPoint = (zoomFactor, centerX, centerY) => {
      const oldZoom = this.zoom;
      this.zoom = Math.max(0.3, Math.min(this.zoom * zoomFactor, 3.0));
      const gridX = (centerX - this.panX) / oldZoom;
      const gridY = (centerY - this.panY) / oldZoom;
      this.panX = centerX - gridX * this.zoom;
      this.panY = centerY - gridY * this.zoom;
      updateTransform();
    };

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const zoomFactor = e.deltaY < 0 ? 1.1 : (1 / 1.1);
      zoomAtPoint(zoomFactor, mouseX, mouseY);
    });

    canvas.addEventListener('mousedown', (e) => {
      const isCanvasBackground = e.target === canvas || e.target === grid;
      if (e.button === 1 || e.button === 2 || (e.button === 0 && isCanvasBackground)) {
        this.isPanning = true;
        this.dragStartX = e.clientX - this.panX;
        this.dragStartY = e.clientY - this.panY;
        canvas.style.cursor = 'grabbing';
        if (e.button === 0 && isCanvasBackground) {
          this.deselectAll();
        }
        e.preventDefault();
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isPanning) {
        this.panX = e.clientX - this.dragStartX;
        this.panY = e.clientY - this.dragStartY;
        updateTransform();
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isPanning) {
        this.isPanning = false;
        canvas.style.cursor = '';
      }
    });

    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    grid.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;

      const imageContainer = e.target.closest('.dockit-mockup-image-container');
      const handle = e.target.closest('.dockit-resize-handle');
      const wrapper = e.target.closest('.dockit-mockup-wrapper');

      if (this.isIsolated) {
        if (wrapper !== this.isolatedMockup) {
          this.deselectAll();
        }
        return;
      }

      if (imageContainer) {
        e.stopPropagation();
        this.selectImage(imageContainer);

        if (handle) {
          this.initImageResizing(e, imageContainer, handle.dataset.direction);
        } else {
          this.dragImage = imageContainer;
          this.dragStartX = e.clientX;
          this.dragStartY = e.clientY;
          const imgObj = this.theme.images.find(img => img.id === imageContainer.dataset.imageId);
          if (imgObj) {
            this.dragStartOffsetX = imgObj.offsetX;
            this.dragStartOffsetY = imgObj.offsetY;
          }
        }
        return;
      }

      if (wrapper) {
        const patternImg = this.theme.images ? this.theme.images.find(img => img.parentId === wrapper.dataset.id && img.isPattern) : null;
        if (patternImg && !handle) {
          const clipTarget = wrapper.querySelector('.dockit-in-page') || wrapper.querySelector('.dockit-sidebar') || wrapper;
          const rect = clipTarget.getBoundingClientRect();
          const mouseX = (e.clientX - rect.left) / this.zoom;
          const mouseY = (e.clientY - rect.top) / this.zoom;

          const containerWidth = clipTarget.offsetWidth;
          const containerHeight = clipTarget.offsetHeight;

          const currentX = (containerWidth / 2) + (containerWidth * patternImg.offsetX / 100);
          const currentY = (containerHeight / 2) + (containerHeight * patternImg.offsetY / 100);

          const deltaX = mouseX - currentX;
          const deltaY = mouseY - currentY;

          const colShift = Math.round(deltaX / patternImg.width);
          const rowShift = Math.round(deltaY / patternImg.height);

          if (colShift !== 0 || rowShift !== 0) {
            patternImg.offsetX += (colShift * patternImg.width / containerWidth) * 100;
            patternImg.offsetY += (rowShift * patternImg.height / containerHeight) * 100;
            this.updateImagesDOM();
          }

          const realContainer = clipTarget.querySelector(`.dockit-mockup-image-container[data-image-id="${patternImg.id}"]`);
          if (realContainer) {
            e.stopPropagation();
            this.selectImage(realContainer);
            this.dragImage = realContainer;
            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;
            this.dragStartOffsetX = patternImg.offsetX;
            this.dragStartOffsetY = patternImg.offsetY;
            return;
          }
        }

        e.stopPropagation();
        this.selectMockup(wrapper);

        if (handle) {
          this.initResizing(e, wrapper, handle.dataset.direction);
        } else {
          this.dragMockup = wrapper;
          this.dragStartX = e.clientX;
          this.dragStartY = e.clientY;
          this.dragStartLeft = parseInt(wrapper.style.left) || 0;
          this.dragStartTop = parseInt(wrapper.style.top) || 0;
        }
      } else {
        this.deselectAll();
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.dragMockup && !this.isIsolated) {
        const deltaX = (e.clientX - this.dragStartX) / this.zoom;
        const deltaY = (e.clientY - this.dragStartY) / this.zoom;
        this.dragMockup.style.left = `${this.dragStartLeft + deltaX}px`;
        this.dragMockup.style.top = `${this.dragStartTop + deltaY}px`;
        if (this.selectedMockupWrapper === this.dragMockup) {
          const rect = this.dragMockup.getBoundingClientRect();
          this.showToolbar(rect, 'wrapper', this.dragMockup);
        }
      } else if (this.dragImage && !this.isIsolated) {
        const deltaX = (e.clientX - this.dragStartX) / this.zoom;
        const deltaY = (e.clientY - this.dragStartY) / this.zoom;

        const imgObj = this.theme.images.find(img => img.id === this.dragImage.dataset.imageId);
        if (imgObj) {
          const wrapper = this.dragImage.closest('.dockit-mockup-wrapper');
          const wrapperWidth = parseInt(wrapper.style.width) || wrapper.offsetWidth;
          const wrapperHeight = parseInt(wrapper.style.height) || wrapper.offsetHeight;

          imgObj.offsetX = this.dragStartOffsetX + (deltaX / wrapperWidth) * 100;
          imgObj.offsetY = this.dragStartOffsetY + (deltaY / wrapperHeight) * 100;

          this.updateImagesDOM();

          if (this.selectedElement === this.dragImage) {
            const rect = this.dragImage.getBoundingClientRect();
            this.showToolbar(rect, 'image', this.dragImage);
          }
        }
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.dragMockup) {
        if (this.selectedMockupWrapper === this.dragMockup) {
          const rect = this.dragMockup.getBoundingClientRect();
          this.showToolbar(rect, 'wrapper', this.dragMockup);
        }
        this.dragMockup = null;
      }
      if (this.dragImage) {
        if (this.selectedElement === this.dragImage) {
          const rect = this.dragImage.getBoundingClientRect();
          this.showToolbar(rect, 'image', this.dragImage);
        }
        this.dragImage = null;
      }
    });

    grid.addEventListener('dblclick', (e) => {
      const wrapper = e.target.closest('.dockit-mockup-wrapper');
      if (wrapper) {
        e.stopPropagation();
        this.enterIsolationMode(wrapper);
      }
    });

    grid.addEventListener('mousemove', (e) => {
      if (!this.isIsolated) return;

      const wrapper = e.target.closest('.dockit-mockup-wrapper');
      if (wrapper !== this.isolatedMockup) return;

      let target = e.target;
      if (target === wrapper || target.classList.contains('dockit-resize-handle')) {
        this.removeHoverBorder();
        return;
      }

      const selectable = target.closest('[data-theme-colors]');
      if (!selectable || !wrapper.contains(selectable) || selectable === wrapper.firstElementChild || selectable.getAttribute('data-theme-colors') === '--color-background') {
        this.removeHoverBorder();
        return;
      }

      this.updateHoverBorder(selectable);
    });

    grid.addEventListener('click', (e) => {
      if (!this.isIsolated) return;

      const wrapper = e.target.closest('.dockit-mockup-wrapper');
      if (wrapper !== this.isolatedMockup) return;

      let target = e.target;
      if (target === wrapper || target.classList.contains('dockit-resize-handle')) {
        this.removeSelectionBorder();
        this.selectedElement = null;
        const toolbar = this.container.querySelector('.dockit-context-toolbar');
        if (toolbar) toolbar.style.display = 'none';
        return;
      }

      const selectable = target.closest('[data-theme-colors]');
      if (!selectable || !wrapper.contains(selectable)) return;

      if (selectable === wrapper.firstElementChild || selectable.getAttribute('data-theme-colors') === '--color-background') {
        this.removeSelectionBorder();
        this.selectedElement = null;
        const toolbar = this.container.querySelector('.dockit-context-toolbar');
        if (toolbar) toolbar.style.display = 'none';
        return;
      }

      e.stopPropagation();
      this.selectElement(selectable);
    });

    this.container.querySelector('#btn-clear-theme').addEventListener('click', () => this.clearTheme());
    this.container.querySelector('#btn-reset-theme').addEventListener('click', () => this.resetTheme());
    this.container.querySelector('#btn-apply-theme').addEventListener('click', () => this.applyTheme());
    this.container.querySelector('#btn-publish-theme').addEventListener('click', () => this.publishTheme());
    this.container.querySelector('#btn-discard-theme').addEventListener('click', () => this.discard());

    window.addEventListener('keydown', (e) => {
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        return;
      }

      if ((e.key === 'Backspace' || e.key === 'Delete') && this.selectedElement && this.selectedElement.classList.contains('dockit-mockup-image-container')) {
        e.preventDefault();
        const imageId = this.selectedElement.dataset.imageId;
        if (this.theme.images) {
          this.theme.images = this.theme.images.filter(img => img.id !== imageId);
          this.removeSelectionBorder();
          const toolbar = this.container.querySelector('.dockit-context-toolbar');
          if (toolbar) toolbar.style.display = 'none';
          this.renderImages();
          this.updateThemeCardImages();
        }
      }
    });

    updateTransform();
  }

  selectMockup(wrapper) {
    if (this.selectedMockupWrapper === wrapper) return;
    this.deselectAll();

    this.selectedMockupWrapper = wrapper;
    wrapper.classList.add('is-selected');

    const rect = wrapper.getBoundingClientRect();
    this.showToolbar(rect, 'wrapper', wrapper);
  }

  deselectAll() {
    if (this.selectedMockupWrapper) {
      this.selectedMockupWrapper.classList.remove('is-selected');
      this.selectedMockupWrapper = null;
    }

    this.exitIsolationMode();

    if (this.selectedElement && this.selectedElement.classList.contains('dockit-mockup-image-container')) {
      this.selectedElement.classList.remove('dockit-element-selected');
      this.selectedElement = null;
    }

    const toolbar = this.container.querySelector('.dockit-context-toolbar');
    if (toolbar) toolbar.style.display = 'none';
  }

  selectImage(imageContainer) {
    if (this.selectedElement === imageContainer) return;
    this.deselectAll();

    this.selectedElement = imageContainer;
    imageContainer.classList.add('dockit-element-selected');

    const rect = imageContainer.getBoundingClientRect();
    this.showToolbar(rect, 'image', imageContainer);
  }

  updateImagesDOM() {
    const grid = this.container.querySelector('.dockit-theme-editor-grid');
    if (!grid || !this.theme.images) return;

    this.updateThemeCardImages();

    grid.querySelectorAll('.dockit-mockup-image-container').forEach(imgContainer => {
      const imgObj = this.theme.images.find(img => img.id === imgContainer.dataset.imageId);
      if (imgObj) {
        const wrapper = imgContainer.closest('.dockit-mockup-wrapper');
        const isSidebar = wrapper && wrapper.dataset.id === 'sidebar';

        let scaledWidth = imgObj.width;
        let scaledHeight = imgObj.height;

        if (imgObj.parentId === 'sidebar' && !isSidebar) {
          scaledWidth *= 2;
          scaledHeight *= 2;
        } else if (imgObj.parentId !== 'sidebar' && isSidebar) {
          scaledWidth *= 0.5;
          scaledHeight *= 0.5;
        }

        imgContainer.style.width = `${scaledWidth}px`;
        imgContainer.style.height = `${scaledHeight}px`;
        imgContainer.style.left = `calc(50% + ${imgObj.offsetX}% - ${scaledWidth / 2}px)`;
        imgContainer.style.top = `calc(50% + ${imgObj.offsetY}% - ${scaledHeight / 2}px)`;
      }
    });

    grid.querySelectorAll('.dockit-mockup-pattern-layer').forEach(patternLayer => {
      const imgObj = this.theme.images.find(img => img.id === patternLayer.dataset.imageId);
      if (imgObj) {
        const wrapper = patternLayer.closest('.dockit-mockup-wrapper');
        const isSidebar = wrapper && wrapper.dataset.id === 'sidebar';

        let scaledWidth = imgObj.width;
        let scaledHeight = imgObj.height;

        if (imgObj.parentId === 'sidebar' && !isSidebar) {
          scaledWidth *= 2;
          scaledHeight *= 2;
        } else if (imgObj.parentId !== 'sidebar' && isSidebar) {
          scaledWidth *= 0.5;
          scaledHeight *= 0.5;
        }

        patternLayer.style.backgroundSize = `${scaledWidth}px ${scaledHeight}px`;
        patternLayer.style.backgroundPosition = `calc(50% + ${imgObj.offsetX}% + ${imgObj.offsetX * scaledWidth / 100}px) calc(50% + ${imgObj.offsetY}% + ${imgObj.offsetY * scaledHeight / 100}px)`;
      }
    });
  }

  initImageResizing(e, imageContainer, direction) {
    e.stopPropagation();
    e.preventDefault();
    const imgObj = this.theme.images.find(img => img.id === imageContainer.dataset.imageId);
    if (!imgObj) return;

    const startWidth = imgObj.width;
    const startHeight = imgObj.height;
    const startOffsetX = imgObj.offsetX;
    const startOffsetY = imgObj.offsetY;
    const startX = e.clientX;
    const startY = e.clientY;

    const wrapper = imageContainer.closest('.dockit-mockup-wrapper');
    const wrapperWidth = parseInt(wrapper.style.width) || wrapper.offsetWidth;
    const wrapperHeight = parseInt(wrapper.style.height) || wrapper.offsetHeight;
    const aspectRatio = startWidth / startHeight;

    const onMouseMove = (moveEvent) => {
      const deltaX = (moveEvent.clientX - startX) / this.zoom;
      const deltaY = (moveEvent.clientY - startY) / this.zoom;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes('e')) {
        newWidth = startWidth + deltaX;
      }
      if (direction.includes('w')) {
        newWidth = startWidth - deltaX;
      }
      if (direction.includes('s')) {
        newHeight = startHeight + deltaY;
      }
      if (direction.includes('n')) {
        newHeight = startHeight - deltaY;
      }

      if (moveEvent.shiftKey) {
        if (direction === 'e' || direction === 'w') {
          newHeight = newWidth / aspectRatio;
        } else if (direction === 'n' || direction === 's') {
          newWidth = newHeight * aspectRatio;
        } else {
          const scaleX = newWidth / startWidth;
          const scaleY = newHeight / startHeight;
          const scale = Math.abs(newWidth - startWidth) > Math.abs(newHeight - startHeight) ? scaleX : scaleY;
          newWidth = startWidth * scale;
          newHeight = startHeight * scale;
        }
      }

      if (newWidth < 20) {
        newWidth = 20;
        if (moveEvent.shiftKey) newHeight = newWidth / aspectRatio;
      }
      if (newHeight < 20) {
        newHeight = 20;
        if (moveEvent.shiftKey) newWidth = newHeight * aspectRatio;
      }

      let newOffsetX = startOffsetX;
      let newOffsetY = startOffsetY;

      if (direction.includes('e')) {
        newOffsetX = startOffsetX + ((newWidth - startWidth) / 2 / wrapperWidth) * 100;
      }
      if (direction.includes('w')) {
        newOffsetX = startOffsetX - ((newWidth - startWidth) / 2 / wrapperWidth) * 100;
      }
      if (direction.includes('s')) {
        newOffsetY = startOffsetY + ((newHeight - startHeight) / 2 / wrapperHeight) * 100;
      }
      if (direction.includes('n')) {
        newOffsetY = startOffsetY - ((newHeight - startHeight) / 2 / wrapperHeight) * 100;
      }

      imgObj.width = newWidth;
      imgObj.height = newHeight;
      imgObj.offsetX = newOffsetX;
      imgObj.offsetY = newOffsetY;

      this.updateImagesDOM();

      const rect = imageContainer.getBoundingClientRect();
      this.showToolbar(rect, 'image', imageContainer);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      const rect = imageContainer.getBoundingClientRect();
      this.showToolbar(rect, 'image', imageContainer);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  initResizing(e, wrapper, direction) {
    e.stopPropagation();
    e.preventDefault();
    const computedStyle = getComputedStyle(wrapper);
    const startWidth = parseFloat(computedStyle.width) || wrapper.offsetWidth;
    const startHeight = parseFloat(computedStyle.height) || wrapper.offsetHeight;
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = parseInt(wrapper.style.left) || 0;
    const startTop = parseInt(wrapper.style.top) || 0;
    const aspectRatio = startWidth / startHeight;

    const onMouseMove = (moveEvent) => {
      const deltaX = (moveEvent.clientX - startX) / this.zoom;
      const deltaY = (moveEvent.clientY - startY) / this.zoom;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes('e')) {
        newWidth = startWidth + deltaX;
      }
      if (direction.includes('w')) {
        newWidth = startWidth - deltaX;
      }
      if (direction.includes('s')) {
        newHeight = startHeight + deltaY;
      }
      if (direction.includes('n')) {
        newHeight = startHeight - deltaY;
      }

      if (moveEvent.shiftKey) {
        if (direction === 'e' || direction === 'w') {
          newHeight = newWidth / aspectRatio;
        } else if (direction === 'n' || direction === 's') {
          newWidth = newHeight * aspectRatio;
        } else {
          const scaleX = newWidth / startWidth;
          const scaleY = newHeight / startHeight;
          const scale = Math.abs(newWidth - startWidth) > Math.abs(newHeight - startHeight) ? scaleX : scaleY;
          newWidth = startWidth * scale;
          newHeight = startHeight * scale;
        }
      }

      const minWidth = Math.min(startWidth, 32);
      const minHeight = Math.min(startHeight, 32);

      if (newWidth < minWidth) {
        newWidth = minWidth;
        if (moveEvent.shiftKey) newHeight = newWidth / aspectRatio;
      }
      if (newHeight < minHeight) {
        newHeight = minHeight;
        if (moveEvent.shiftKey) newWidth = newHeight * aspectRatio;
      }

      wrapper.style.width = `${newWidth}px`;
      wrapper.style.height = `${newHeight}px`;

      if (direction.includes('w')) {
        wrapper.style.left = `${startLeft + (startWidth - newWidth)}px`;
      }
      if (direction.includes('n')) {
        wrapper.style.top = `${startTop + (startHeight - newHeight)}px`;
      }

      if (this.selectedMockupWrapper === wrapper) {
        const rect = wrapper.getBoundingClientRect();
        this.showToolbar(rect, 'wrapper', wrapper);
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  enterIsolationMode(wrapper) {
    this.deselectAll();

    this.isIsolated = true;
    this.isolatedMockup = wrapper;
    wrapper.classList.add('is-isolated');
    this.container.querySelector('.dockit-theme-editor-canvas').classList.add('dockit-theme-editor-isolated');
  }

  exitIsolationMode() {
    if (this.isIsolated && this.isolatedMockup) {
      this.isolatedMockup.classList.remove('is-isolated');
      this.container.querySelector('.dockit-theme-editor-canvas').classList.remove('dockit-theme-editor-isolated');
    }

    this.isIsolated = false;
    this.isolatedMockup = null;
    this.removeHoverBorder();
    this.removeSelectionBorder();
  }

  updateHoverBorder(target) {
    this.removeHoverBorder();
    this.hoveredElement = target;
    target.classList.add('dockit-element-hover');
  }

  removeHoverBorder() {
    if (this.hoveredElement) {
      this.hoveredElement.classList.remove('dockit-element-hover');
      this.hoveredElement = null;
    }
  }

  selectElement(target) {
    this.removeSelectionBorder();
    this.selectedElement = target;
    target.classList.add('dockit-element-selected');

    const rect = target.getBoundingClientRect();
    this.showToolbar(rect, 'element', target);
  }

  removeSelectionBorder() {
    if (this.selectedElement) {
      this.selectedElement.classList.remove('dockit-element-selected');
      this.selectedElement = null;
    }
  }

  showToolbar(rect, type, target) {
    const toolbar = this.container.querySelector('.dockit-context-toolbar');
    if (!toolbar) return;

    if (target && target.classList.contains('dockit-mockup-image-container')) {
      type = 'image';
    }

    toolbar.style.display = 'flex';

    const apertureIcon = this.lucideIcons['aperture'] || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94"></path></svg>`;
    const blendIcon = this.lucideIcons['mirror-rectangular'] || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M12 3v18"></path></svg>`;
    const panelTransparencyIcon = `<svg viewBox="0 0 22 18" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8,5l-3,3"/><path d="M14,5l-8,8"/><rect x="3" y="-1" width="16" height="20" rx="2" ry="2" transform="translate(20 -2) rotate(90)"/></svg>`;
    const paddingIcon = this.lucideIcons['squares-subtract'] || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="10" height="10" rx="1" ry="1"></rect></svg>`;
    const radiusIcon = this.lucideIcons['square-round-corner'] || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 9v-2a4 4 0 0 0-4-4h-2M9 3H7a4 4 0 0 0-4 4v2M3 15v2a4 4 0 0 0 4 4h2M15 21h2a4 4 0 0 0 4-4v-2"></path></svg>`;
    const imageIcon = this.lucideIcons['image'] || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;

    let swatches = [];
    if (type === 'wrapper') {
      swatches = ['--color-background'];
    } else if (type === 'element') {
      const vars = this.getThemeVariableForElement(target);
      swatches = vars.filter(v => !v.includes('--color-background')).slice(0, 3);
    } else if (type === 'image') {
      swatches = [];
    }

    let swatchesHtml = '';
    swatches.forEach(v => {
      const baseVar = v.endsWith('-rgba') ? v.slice(0, -5) : v;
      const val = this.theme.colors[baseVar] || '#000000';
      swatchesHtml += `
        <div class="dockit-color-field ${v.endsWith('-rgba') ? 'is-rgba' : ''}">
          <input type="color" data-var="${v}" value="${this.normalizeColorForPicker(val)}" title="Modifying ${v}" />
        </div>
      `;
    });

    let toolsHtml = '';
    if (type === 'wrapper') {
      if (target.dataset.id !== 'theme-card') {
        toolsHtml += `
          <div class="dockit-toolbar-tool">
            <button class="dockit-toolbar-icon-btn" title="Blur">${apertureIcon}</button>
            <div class="dockit-toolbar-slider-container">
              <input type="range" id="slider-blur" min="0" max="20" value="${parseInt(this.theme.options['--blur-value']) || 0}" />
            </div>
          </div>
          <div class="dockit-toolbar-tool">
            <button class="dockit-toolbar-icon-btn" title="Transparency">${blendIcon}</button>
            <div class="dockit-toolbar-slider-container">
              <input type="range" id="slider-opacity" min="10" max="100" value="${Math.round(parseFloat(this.theme.options['--opacity-value']) * 100) || 100}" />
            </div>
          </div>
          <div class="dockit-toolbar-tool">
            <button class="dockit-toolbar-icon-btn" title="Menu Transparency">${panelTransparencyIcon}</button>
            <div class="dockit-toolbar-slider-container">
              <input type="range" id="slider-menu-opacity" min="0" max="100" value="${Math.round(parseFloat(this.theme.options['--menu-opacity-value'] ?? 1) * 100)}" />
            </div>
          </div>
        `;
      }
      if (target.dataset.id === 'sidebar') {
        toolsHtml += `
          <div class="dockit-toolbar-tool">
            <button class="dockit-toolbar-icon-btn" title="Padding">${paddingIcon}</button>
            <div class="dockit-toolbar-slider-container">
              <input type="range" id="slider-padding" min="0" max="32" value="${parseInt(this.theme.options['--padding-value']) || 0}" />
            </div>
          </div>
          <div class="dockit-toolbar-tool">
            <button class="dockit-toolbar-icon-btn" title="Corners">${radiusIcon}</button>
            <div class="dockit-toolbar-slider-container">
              <input type="range" id="slider-corners" min="0" max="24" value="${parseInt(this.theme.options['--corner-radius-value']) || 0}" />
            </div>
          </div>
        `;
      }
    } else if (type === 'image') {
      const trashIcon = this.lucideIcons['trash-2'] || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
      const patternIcon = this.lucideIcons['brick-wall'] || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 9v6"/><path d="M16 15v6"/><path d="M16 3v6"/><path d="M3 15h18"/><path d="M3 9h18"/><path d="M8 15v6"/><path d="M8 3v6"/></svg>`;
      const objectIcon = this.lucideIcons['images'] || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 22H4a2 2 0 0 1-2-2V6"/><rect width="16" height="16" x="6" y="2" rx="2"/></svg>`;
      const cropIcon = this.lucideIcons['crop'] || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14"></path><path d="M18 22V8a2 2 0 0 0-2-2H2"></path></svg>`;
      const imgObj = this.theme.images.find(img => img.id === target.dataset.imageId);
      const isPatternActive = imgObj && imgObj.isPattern;
      const isCropActive = imgObj && imgObj.isCropped;
      toolsHtml = `
        <div class="dockit-toolbar-tool">
          <button class="dockit-toolbar-icon-btn ${isPatternActive ? 'is-active' : ''}" id="btn-image-pattern" title="Toggle Pattern Mode">${patternIcon}</button>
        </div>
        <div class="dockit-toolbar-tool">
          <button class="dockit-toolbar-icon-btn ${!isPatternActive ? 'is-active' : ''}" id="btn-image-object" title="Toggle Object Mode">${objectIcon}</button>
        </div>
        <div class="dockit-toolbar-divider"></div>
        <div class="dockit-toolbar-tool">
          <button class="dockit-toolbar-icon-btn ${isCropActive ? 'is-active' : ''}" id="btn-image-crop" title="Clip to Parent">${cropIcon}</button>
        </div>
        <div class="dockit-toolbar-divider"></div>
        <div class="dockit-toolbar-tool">
          <button class="dockit-toolbar-icon-btn" id="btn-image-delete" title="Delete Image">${trashIcon}</button>
        </div>
      `;
    }

    toolbar.innerHTML = `
      ${swatches.length > 0 ? `
        <div class="dockit-toolbar-colors">
          ${swatchesHtml}
        </div>
      ` : ''}
      ${(type === 'wrapper' && target.dataset.id !== 'theme-card') ? '<div class="dockit-toolbar-divider"></div>' + toolsHtml : ''}
      ${(type === 'image') ? toolsHtml : ''}
      ${(type === 'wrapper' && target.dataset.id !== 'theme-card') ? `
        <div class="dockit-toolbar-divider"></div>
        <button class="dockit-toolbar-icon-btn dockit-toolbar-img-btn" id="btn-img-importer" title="Import Image">
          ${imageIcon}
        </button>
      ` : ''}
    `;

    swatches.forEach(v => {
      const picker = toolbar.querySelector(`input[data-var="${v}"]`);
      if (picker) {
        picker.addEventListener('input', (e) => {
          const baseVar = v.endsWith('-rgba') ? v.slice(0, -5) : v;
          this.theme.colors[baseVar] = e.target.value;

          toolbar.querySelectorAll('input[type="color"]').forEach(otherPicker => {
            const otherV = otherPicker.getAttribute('data-var');
            const otherBaseVar = otherV.endsWith('-rgba') ? otherV.slice(0, -5) : otherV;
            if (otherBaseVar === baseVar && otherPicker !== picker) {
              otherPicker.value = e.target.value;
            }
          });

          this.applyEditingThemeCSS();
        });
      }
    });

    ['blur', 'opacity', 'menu-opacity', 'padding', 'corners'].forEach(type => {
      const slider = toolbar.querySelector(`#slider-${type}`);
      if (slider) {
        slider.addEventListener('input', (e) => {
          let val = e.target.value;
          if (type === 'opacity' || type === 'menu-opacity') {
            this.theme.options[`--${type}-value`] = (val / 100).toString();
          } else if (type === 'blur' || type === 'padding') {
            this.theme.options[`--${type}-value`] = val + 'px';
          } else if (type === 'corners') {
            this.theme.options['--corner-radius-value'] = val + 'px';
          }
          this.applyEditingThemeCSS();
        });
      }
    });

    toolbar.querySelectorAll('.dockit-toolbar-icon-btn:not(#btn-img-importer)').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tool = e.currentTarget.closest('.dockit-toolbar-tool');
        const isActive = tool.classList.contains('is-active');
        toolbar.querySelectorAll('.dockit-toolbar-tool').forEach(t => t.classList.remove('is-active'));
        toolbar.querySelectorAll('.dockit-toolbar-icon-btn').forEach(b => b.classList.remove('is-active'));

        if (!isActive) {
          tool.classList.add('is-active');
          e.currentTarget.classList.add('is-active');
        }
      });
    });

    const btnImgImporter = toolbar.querySelector('#btn-img-importer');
    if (btnImgImporter) {
      btnImgImporter.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            const src = ev.target.result;
            const img = new Image();
            img.onload = () => {
              if (!this.theme.images) this.theme.images = [];
              const w = img.naturalWidth > 300 ? 300 : img.naturalWidth;
              const h = img.naturalWidth > 300 ? (img.naturalHeight * 300 / img.naturalWidth) : img.naturalHeight;
              this.theme.images.push({
                id: 'img-' + Date.now(),
                src: src,
                parentId: target.dataset.id,
                width: w,
                height: h,
                offsetX: 0,
                offsetY: 0,
                isPattern: false
              });
              this.renderImages();
            };
            img.src = src;
          };
          reader.readAsDataURL(file);
        };
        input.click();
      });
    }

    if (type === 'image') {
      const btnDelete = toolbar.querySelector('#btn-image-delete');
      if (btnDelete) {
        btnDelete.addEventListener('click', () => {
          if (!this.theme.images) return;
          this.theme.images = this.theme.images.filter(img => img.id !== target.dataset.imageId);
          this.removeSelectionBorder();
          toolbar.style.display = 'none';
          this.renderImages();
        });
      }

      const btnPattern = toolbar.querySelector('#btn-image-pattern');
      if (btnPattern) {
        btnPattern.addEventListener('click', () => {
          if (!this.theme.images) return;
          const imgObj = this.theme.images.find(img => img.id === target.dataset.imageId);
          if (imgObj) {
            this.theme.images.forEach(img => {
              if (img.id !== imgObj.id) {
                img.isPattern = false;
              }
            });
            imgObj.isPattern = true;
            this.renderImages();
          }
        });
      }

      const btnObject = toolbar.querySelector('#btn-image-object');
      if (btnObject) {
        btnObject.addEventListener('click', () => {
          if (!this.theme.images) return;
          const imgObj = this.theme.images.find(img => img.id === target.dataset.imageId);
          if (imgObj) {
            imgObj.isPattern = false;
            this.renderImages();
          }
        });
      }

      const btnCrop = toolbar.querySelector('#btn-image-crop');
      if (btnCrop) {
        btnCrop.addEventListener('click', () => {
          if (!this.theme.images) return;
          const imgObj = this.theme.images.find(img => img.id === target.dataset.imageId);
          if (imgObj) {
            imgObj.isCropped = !imgObj.isCropped;
            this.renderImages();
          }
        });
      }
    }

    const toolbarWidth = toolbar.offsetWidth || 240;
    const editorRect = this.container.getBoundingClientRect();
    const top = rect.top - editorRect.top;
    const left = rect.left - editorRect.left;

    let toolbarTop = top - 45;
    if (toolbarTop < 50) {
      toolbarTop = top + rect.height + 10;
    }

    let toolbarLeft = left + (rect.width - toolbarWidth) / 2;
    toolbarLeft = Math.max(10, Math.min(toolbarLeft, editorRect.width - toolbarWidth - 10));

    toolbar.style.top = `${toolbarTop}px`;
    toolbar.style.left = `${toolbarLeft}px`;
  }

  normalizeColorForPicker(colorStr) {
    if (!colorStr) return '#000000';
    colorStr = colorStr.trim();
    if (colorStr.startsWith('#')) {
      if (colorStr.length === 4) {
        return '#' + colorStr[1] + colorStr[1] + colorStr[2] + colorStr[2] + colorStr[3] + colorStr[3];
      }
      return colorStr;
    }
    const div = document.createElement('div');
    div.style.color = colorStr;
    document.body.appendChild(div);
    const computed = window.getComputedStyle(div).color;
    document.body.removeChild(div);
    const match = computed.match(/\d+/g);
    if (match && match.length >= 3) {
      const r = parseInt(match[0]).toString(16).padStart(2, '0');
      const g = parseInt(match[1]).toString(16).padStart(2, '0');
      const b = parseInt(match[2]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
    return '#333333';
  }

  getThemeVariableForElement(element) {
    if (!element) return [];
    const colorsAttr = element.getAttribute('data-theme-colors');
    if (!colorsAttr) return [];
    return colorsAttr.split(',').map(c => c.trim()).filter(Boolean);
  }

  clearTheme() {
    this.theme.name = 'My Custom Theme';
    this.theme.images = [];
    const nameInput = this.container.querySelector('#dockit-theme-name-input');
    if (nameInput) nameInput.value = this.theme.name;

    this.theme.colors = {
      '--color-background': '#333333',
      '--color-foreground': '#ffffff',
      '--color-primary': '#3b82f6',
      '--color-secondary': '#252525',
      '--color-border': '#434343',
      '--color-accent': '#ef4444'
    };
    this.theme.options = {
      '--padding-value': '0px',
      '--blur-value': '0px',
      '--opacity-value': '1.0',
      '--corner-radius-value': '0px'
    };
    this.applyEditingThemeCSS();
    if (this.renderImages) this.renderImages();
    if (this.updateThemeCardImages) this.updateThemeCardImages();

    if (this.selectedMockupWrapper) {
      this.showToolbar(this.selectedMockupWrapper.getBoundingClientRect(), 'wrapper', this.selectedMockupWrapper);
    } else if (this.selectedElement) {
      this.showToolbar(this.selectedElement.getBoundingClientRect(), 'element', this.selectedElement);
    }
  }

  async resetTheme() {
    const data = await chrome.storage.local.get(['dockitTheme']);
    if (data.dockitTheme) {
      this.theme = JSON.parse(JSON.stringify(data.dockitTheme));
      const nameInput = this.container.querySelector('#dockit-theme-name-input');
      if (nameInput) nameInput.value = this.theme.name || 'My Custom Theme';
    } else {
      this.clearTheme();
      return;
    }
    this.applyEditingThemeCSS();
    if (this.renderImages) this.renderImages();
    if (this.updateThemeCardImages) this.updateThemeCardImages();

    if (this.selectedMockupWrapper) {
      this.showToolbar(this.selectedMockupWrapper.getBoundingClientRect(), 'wrapper', this.selectedMockupWrapper);
    } else if (this.selectedElement) {
      this.showToolbar(this.selectedElement.getBoundingClientRect(), 'element', this.selectedElement);
    }
  }


  _dataURLtoBlob(dataurl) {
    const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  async publishTheme() {
    const publishBtn = this.container.querySelector('#btn-publish-theme');
    const originalContent = publishBtn ? publishBtn.innerHTML : '<span>Publish Theme</span>';

    let storage = await chrome.storage.local.get(['appwriteSession']);
    if (!storage.appwriteSession) {
      const authRes = await chrome.runtime.sendMessage({ type: 'APPWRITE_LOGIN' });
      if (!authRes || !authRes.success) {
        this.sidebar.showDialog({ message: 'Authentication required to publish themes.' });
        return;
      }
      storage = await chrome.storage.local.get(['appwriteSession']);
      if (!storage.appwriteSession) return;
    }

    if (publishBtn) {
      publishBtn.style.opacity = '1';
      publishBtn.innerHTML = '<span>Publishing...</span>';
    }

    if (typeof this._userStorageTotal === 'number') {
      const MAX_SIZE = 2 * 1024 * 1024 * 1024;
      const estimatedNewSize = new TextEncoder().encode(JSON.stringify(this.theme)).length + (this.theme.images ? this.theme.images.length * 500000 : 0);
      if (this._userStorageTotal + estimatedNewSize > MAX_SIZE) {
        this.sidebar.showDialog({ message: 'Storage quota exceeded (2GB). Cannot publish theme.' });
        if (publishBtn) {
          publishBtn.innerHTML = originalContent;
          publishBtn.style.opacity = '0.5';
        }
        return;
      }
    }

    try {
      await this._processImagesInBackground();

      const session = storage.appwriteSession;
      const { secret, userId } = session;
      const projectId = '6a0a1cc000178886bfaf';

      let userName = 'User';
      try {
        const accRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
          headers: {
            'X-Appwrite-Project': projectId,
            'X-Fallback-Cookies': `a_session_${projectId}=${secret}`,
            'Content-Type': 'application/json'
          }
        });
        if (accRes.ok) {
          const acc = await accRes.json();
          if (acc.name) userName = acc.name;
        }
      } catch (e) { }
      this.theme.publisherName = userName;

      const payloadString = JSON.stringify(this.theme);

      if (!this.theme.publishedId) {
        try {
          const themeName = this.theme.name || 'My Custom Theme';
          const checkQueries = [
            JSON.stringify({ method: 'equal', attribute: 'profile', values: [userId] }),
            JSON.stringify({ method: 'equal', attribute: 'name', values: [themeName] }),
            JSON.stringify({ method: 'limit', values: [1] })
          ];
          let checkUrl = `https://nyc.cloud.appwrite.io/v1/databases/dockit_cloud/collections/themes/documents?`;
          checkQueries.forEach(q => checkUrl += `queries[]=${encodeURIComponent(q)}&`);

          const checkRes = await fetch(checkUrl, {
            headers: {
              'X-Appwrite-Project': projectId,
              'X-Fallback-Cookies': `a_session_${projectId}=${secret}`
            }
          });

          if (checkRes.ok) {
            const checkData = await checkRes.json();
            if (checkData.documents && checkData.documents.length > 0) {
              this.theme.publishedId = checkData.documents[0].$id;
            }
          }
        } catch (e) {
          console.warn("Error checking existing themes:", e);
        }
      }

      const method = this.theme.publishedId ? 'PATCH' : 'POST';
      const endpoint = this.theme.publishedId
        ? `https://nyc.cloud.appwrite.io/v1/databases/dockit_cloud/collections/themes/documents/${this.theme.publishedId}`
        : `https://nyc.cloud.appwrite.io/v1/databases/dockit_cloud/collections/themes/documents`;

      const bodyData = {
        name: this.theme.name || 'My Custom Theme',
        theme: payloadString,
        profile: userId,
        updated: new Date().toISOString()
      };

      if (method === 'POST') {
        bodyData.downloads = 0;
        bodyData.created = new Date().toISOString();
      }

      const reqBody = method === 'POST' ? {
        documentId: 'unique()',
        data: bodyData,
        permissions: [
          `read("any")`,
          `update("user:${userId}")`,
          `delete("user:${userId}")`
        ]
      } : { data: bodyData };

      const res = await fetch(endpoint, {
        method: method,
        headers: {
          'X-Appwrite-Project': projectId,
          'X-Fallback-Cookies': `a_session_${projectId}=${secret}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqBody)
      });

      if (!res.ok) {
        let errMsg = `Failed to publish theme: ${res.statusText}`;
        try {
          const errData = await res.json();
          errMsg = errData.message || errMsg;
        } catch (e) { }
        throw new Error(errMsg);
      }

      const data = await res.json();
      this.theme.publishedId = data.$id; // track locally to avoid duplicates

      if (!this.themeGalleryCache) this.themeGalleryCache = {};
      if (this.themeGalleryCache.created && method === 'POST') {
        this.themeGalleryCache.created.data.unshift(data);
      } else if (this.themeGalleryCache.created && method === 'PATCH') {
        const existingIdx = this.themeGalleryCache.created.data.findIndex(d => d.$id === data.$id);
        if (existingIdx !== -1) {
          this.themeGalleryCache.created.data[existingIdx] = data;
        }
      }

      this.sidebar.showDialog({ message: 'Theme published successfully!' });
    } catch (err) {
      console.error(err);
      this.sidebar.showDialog({ message: 'Error publishing theme.' });
    } finally {
      if (publishBtn) {
        publishBtn.innerHTML = originalContent;
        publishBtn.style.opacity = '0.5';
      }
    }
  }

  async applyTheme() {
    const applyBtn = this.container.querySelector('#btn-apply-theme');
    const originalText = applyBtn ? applyBtn.innerHTML : '<span>Apply Theme</span>';

    const hasNewImages = this.theme.images && this.theme.images.some(img => img.src.startsWith('data:image/'));

    if (hasNewImages) {
      let storage = await chrome.storage.local.get(['appwriteSession']);
      if (!storage.appwriteSession) {
        if (applyBtn) applyBtn.innerHTML = originalText;

        const userProceeds = await new Promise((resolve) => {
          this.sidebar.showDialog({
            title: 'Account Required',
            message: 'You need an account to save custom images. Would you like to log in now?',
            type: 'confirm',
            confirmText: 'Log In',
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false)
          });
        });

        if (!userProceeds) return;

        const authRes = await chrome.runtime.sendMessage({ type: 'APPWRITE_LOGIN' });
        if (!authRes || !authRes.success) return; // Wait for login
      }
    }

    try {
      await chrome.storage.local.set({ dockitTheme: this.theme });
      this.originalThemeStr = JSON.stringify(this.theme);
    } catch (e) {
      console.warn("Dockit: Failed to save to local storage immediately, quota exceeded?", e);
    }

    if (applyBtn) {
      applyBtn.innerHTML = `<span>Applied!</span>`;
      setTimeout(() => {
        applyBtn.innerHTML = originalText;
      }, 1500);
    }

    if (hasNewImages) {
      this._processImagesInBackground().catch(e => console.error("Dockit: Background processing error", e));
    }
  }

  async _processImagesInBackground() {
    let storage = await chrome.storage.local.get(['appwriteSession']);
    if (!storage.appwriteSession) return;
    const session = storage.appwriteSession;
    const { secret, userId } = session;

    const projectId = '6a0a1cc000178886bfaf';
    const bucketId = 'Cloud-Drive';
    const headers = {
      'X-Appwrite-Project': projectId,
      'X-Fallback-Cookies': `a_session_${projectId}=${secret}`
    };

    let modified = false;

    if (this.theme.images && this.theme.images.length > 0) {
      for (const img of this.theme.images) {
        if (img.src.startsWith('data:image/')) {
          try {
            const parts = img.src.split(',');
            const mimeMatch = parts[0].match(/:(.*?);/);
            if (!mimeMatch) continue;
            const mime = mimeMatch[1];
            const bstr = atob(parts[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            const blob = new Blob([u8arr], { type: mime });

            console.log('Dockit: Uploading raw image to storage...');
            const formData = new FormData();
            formData.append('fileId', 'unique()');
            formData.append('file', blob, `upload.${mime.split('/')[1]}`);
            formData.append('permissions[]', `read("any")`);
            formData.append('permissions[]', `update("user:${userId}")`);
            formData.append('permissions[]', `delete("user:${userId}")`);

            const res = await fetch(`https://nyc.cloud.appwrite.io/v1/storage/buckets/${bucketId}/files`, {
              method: 'POST',
              headers,
              body: formData
            });

            const uploadData = await res.json();
            if (uploadData.$id) {
              console.log(`Dockit: Calling process-image function for ${uploadData.$id}...`);
              const funcRes = await fetch(`https://nyc.cloud.appwrite.io/v1/functions/process-image/executions`, {
                method: 'POST',
                headers: {
                  ...headers,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  body: JSON.stringify({ fileId: uploadData.$id, bucketId, userId }),
                  async: false,
                  path: '/',
                  method: 'POST',
                  headers: {}
                })
              });

              const funcData = await funcRes.json();
              if (funcData.responseBody) {
                try {
                  const result = JSON.parse(funcData.responseBody);
                  if (result.success && result.fileId) {
                    console.log(`Dockit: Backend process complete. Final file ID: ${result.fileId}`);
                    img.src = `https://nyc.cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${result.fileId}/view?project=${projectId}`;
                    modified = true;
                  } else {
                    console.error('Dockit: Server deduplication failed:', result.error);
                  }
                } catch (e) {
                  console.error('Dockit: Failed to parse function response', funcData.responseBody);
                }
              } else {
                console.error('Dockit: Function execution failed:', funcData);
              }
            } else {
              console.error('Dockit: Upload failed:', uploadData);
            }
          } catch (err) {
            console.error('Dockit: Image processing error', err);
          }
        }
      }
    }

    if (modified) {
      await chrome.storage.local.set({ dockitTheme: this.theme });
      this.originalThemeStr = JSON.stringify(this.theme);
      console.log('Dockit: Image processing and deduplication complete.');
    }
  }

  discard() {
    if (this.originalThemeStr && JSON.stringify(this.theme) !== this.originalThemeStr) {
      this.sidebar.showDialog({
        title: 'Unsaved Changes',
        message: 'You have unapplied changes. Are you sure you want to exit?',
        type: 'confirm',
        confirmText: 'Exit',
        onConfirm: () => {
          this.exitIsolationMode();
          this.onClose();
        }
      });
      return;
    }
    this.exitIsolationMode();
    this.onClose();
  }
}
