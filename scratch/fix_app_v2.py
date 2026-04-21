import sys

path = '/Users/admin/Downloads/ai-sre-console_v2/src/App.tsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Restore the Header Logo and Title
# Find the start of the header div after "{/* Global Header */}"
import re

# Match the corrupted header div
m_header = re.search(r'\{/\* Global Header \*/\}\s*<header[^>]*>\s*<div[^>]*>(.*?)</div>\s*<div className="w-px h-8 bg-slate-800/60"', content, re.DOTALL)
if m_header:
    logo_markup = f"""
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <Activity size={20} />
            </div>
            <h1 className="font-bold text-slate-100 tracking-wide text-[15px] whitespace-nowrap">
              SRE Agent
            </h1>
          </div>
        """
    # Replace only the inner content of the first div
    # Re-build the header correctly
    # actually let's just replace the whole header inner div block
    pattern = r'(<header[^>]*>\s*<div[^>]*>).*?(</div>\s*<div className="w-px h-8 bg-slate-800/60")'
    content = re.sub(pattern, r'\1' + logo_markup + r'\2', content, flags=re.DOTALL)

# 2. Fix the DiagnosticChatPanel prop syntax error
# This is the smeared line: onToggle={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}                   selectedAlarm={selectedAlarm} showBanner={showContextBanner}
bad_line = 'onToggle={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}                   selectedAlarm={selectedAlarm} showBanner={showContextBanner}'
good_line = """onToggle={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                    selectedAlarm={selectedAlarm} 
                    showBanner={showContextBanner}"""

content = content.replace(bad_line, good_line)

# 3. Final cleanup - sometimes tools leave double newlines or mess with indentation
# No need for now.

with open(path, 'w') as f:
    f.write(content)

print("Restoration v2 complete.")
