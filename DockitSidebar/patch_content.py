import re

with open('/Users/raymondsicloud/Documents/Projects/dockit/DockitSidebar/content.js', 'r') as f:
    content = f.read()

# 1. Add _getSidebarLayoutWidth
content = content.replace(
    'const SIDEBAR_WIDTH = 48;',
    'const SIDEBAR_WIDTH = 48;\nfunction _getSidebarLayoutWidth() {\n  const zoom = parseFloat(document.documentElement.style.getPropertyValue(\'--dockit-zoom\') || \'1\');\n  return SIDEBAR_WIDTH / zoom;\n}'
)

# 2. Update layout styles to include :root var and replace SIDEBAR_WIDTH interpolation
# Wait, replacing ${SIDEBAR_WIDTH} with var(--dockit-sidebar-width)
style_block_start = "layoutStyle.textContent = `"
style_block_end = "  document.head.appendChild(layoutStyle);"

# Let's just do regex replacements for the specific things.
# In layoutStyle.textContent:
content = content.replace(
    '    html:not(.dockit-autohide-active) {\n      overflow: hidden !important;',
    '    :root {\n      --dockit-zoom: 1;\n      --dockit-sidebar-width: calc(48px / var(--dockit-zoom, 1));\n    }\n    html:not(.dockit-autohide-active) {\n      overflow: hidden !important;'
)

content = content.replace('width: calc(100% - ${SIDEBAR_WIDTH}px)', 'width: calc(100% - var(--dockit-sidebar-width))')
content = content.replace('max-width: calc(100vw - ${SIDEBAR_WIDTH}px)', 'max-width: calc(100vw - var(--dockit-sidebar-width))')
content = content.replace('right: ${SIDEBAR_WIDTH}px !important;', 'right: var(--dockit-sidebar-width) !important;')
content = content.replace('margin-right: ${SIDEBAR_WIDTH}px !important;', 'margin-right: var(--dockit-sidebar-width) !important;')

# For #dockit-host-root, add zoom and fix height
content = content.replace(
    '      height: 100vh;\n      position: fixed !important;',
    '      height: calc(100vh * var(--dockit-zoom, 1));\n      position: fixed !important;\n      zoom: calc(1 / var(--dockit-zoom, 1));'
)
# For #dockit-autohide-indicator
content = content.replace(
    '      width: 50px;\n      height: 100vh;\n      pointer-events: none;',
    '      width: 50px;\n      height: calc(100vh * var(--dockit-zoom, 1));\n      pointer-events: none;\n      zoom: calc(1 / var(--dockit-zoom, 1));'
)

# 3. Add zoom logic to init()
init_end = """
  chrome.storage.onChanged.addListener((changes) => {
"""
zoom_logic = """
  const updateZoom = (zoom) => {
    if (zoom > 0) {
      document.documentElement.style.setProperty('--dockit-zoom', zoom);
    }
  };

  chrome.runtime.sendMessage({ type: 'GET_ZOOM' }, (zoom) => {
    if (zoom) updateZoom(zoom);
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'ZOOM_CHANGED') {
      updateZoom(msg.zoom);
    }
  });

  chrome.storage.onChanged.addListener((changes) => {
"""
content = content.replace(init_end, zoom_logic)

# 4. Update _constrainFixedElement
content = content.replace(
    'const totalOffset = SIDEBAR_WIDTH;',
    'const totalOffset = _getSidebarLayoutWidth();'
)
content = content.replace(
    'const isOverlappingRight = rect.right > window.innerWidth - SIDEBAR_WIDTH;',
    'const isOverlappingRight = rect.right > window.innerWidth - _getSidebarLayoutWidth();'
)

with open('/Users/raymondsicloud/Documents/Projects/dockit/DockitSidebar/content.js', 'w') as f:
    f.write(content)

print("Patch applied.")
