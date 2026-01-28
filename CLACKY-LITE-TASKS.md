# Clacky Lite Task List - UI/UX Polish

These are straightforward UI/UX fixes that don't require advanced engineering. They focus on visual polish, readability, and professional appearance.

---

## Task 1: Settings Panel - Dark Mode IDE Redesign

**Current Problem:**
- Settings modal looks like a "website form" trapped in a modal
- White backgrounds clash with dark IDE theme
- Text is hard to read, cluttered layout
- Looks unprofessional ("third rate AI model on a Commodore 64")

**Goal:**
Make Settings look like a native IDE settings panel (like VS Code settings or Cursor preferences).

**Visual Requirements:**
1. **Background**: Change from white to dark zinc (`bg-zinc-900`, `bg-zinc-950`)
2. **Modal Container**: Dark with subtle borders (`border-zinc-800`)
3. **Tabs**: Style as IDE tabs (dark, subtle hover states)
4. **Input Fields**: Dark backgrounds (`bg-zinc-950`), monospace font, subtle borders
5. **Labels**: Uppercase, small, tracking-wider, `text-zinc-500`
6. **Buttons**: Match the blue button style from Send button in PromptEditor
7. **Overall Vibe**: Professional developer tool, not a web form

**Files to Edit:**
- `src/components/Settings/SettingsPanel.tsx`
- `src/components/Settings/ApiKeyInput.tsx`
- `src/components/Settings/ProviderConfig.tsx`
- `src/components/Settings/ExportImport.tsx`

**Specific Changes:**
- Modal overlay: `bg-black/70` instead of `bg-gray-500/75`
- Modal container: `bg-zinc-900 border border-zinc-800` instead of white
- All text: Change from gray-700/900 to zinc-300/100
- All input fields: `bg-zinc-950 border-zinc-800 text-zinc-300`
- All buttons: Match the blue button style (see PromptEditor line ~180)
- Section headers: `text-zinc-500 uppercase tracking-wider text-xs font-semibold`

---

## Task 2: Settings Panel - Improve Layout & Readability

**Current Problem:**
- Provider sections are cramped and hard to scan
- Blue "Get API Key" links blend in
- No clear visual hierarchy

**Goal:**
Make it easy to scan and find what you need.

**Changes:**
1. Add more spacing between provider sections (`gap-6` instead of `gap-4`)
2. Each provider should be in a card/panel with `bg-zinc-950/50 border border-zinc-800 rounded-lg p-4`
3. Provider name should be larger and more prominent
4. "Get API Key" links should be subtle but visible: `text-blue-400 hover:text-blue-300`
5. Status indicators (✅, ⚠️) should be more prominent with background colors

---

## Task 3: Settings Panel - Better Status Indicators

**Current Problem:**
- Checkmarks and warnings are hard to notice
- No visual distinction between "Format OK" and "Valid and working"

**Goal:**
Clear visual feedback for API key status.

**Changes:**
1. "Format OK": Show as `text-zinc-500` with small checkmark
2. "Valid and working": Show as `text-emerald-400` with prominent checkmark and background badge
3. "Invalid": Show as `text-red-400` with X icon and background badge
4. Use badge style: `px-2 py-0.5 text-xs rounded border`

---

## Task 4: Fix Modal Z-Index & Overlay

**Current Problem:**
- Settings modal might not properly overlay main content

**Goal:**
Ensure modal appears above everything with proper backdrop.

**Changes:**
1. Modal wrapper: `fixed inset-0 z-50`
2. Overlay: `bg-black/70` (semi-transparent dark)
3. Modal content: `relative z-10`

---

## Task 5: Settings Close Button

**Current Problem:**
- Close button might not be visible or prominent enough

**Goal:**
Make it easy to close Settings.

**Changes:**
1. Add subtle X button in top-right of modal
2. Style: `p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded`
3. Position: `absolute top-4 right-4`

---

## Task 6: Token Counter Component - Dark Theme

**Current Problem:**
- TokenCounter might still have light theme styles

**Goal:**
Match the IDE dark theme.

**Changes in `src/components/PromptEditor/TokenCounter.tsx`:**
1. Text color: `text-zinc-500` instead of gray
2. Numbers: `text-zinc-300 font-medium` for emphasis

---

## Task 7: Make Send Button More Prominent

**Current Problem:**
- User might not notice the Send button integrated into textarea

**Goal:**
Make it visually pop so users know where to click.

**Changes:**
1. Increase button shadow: `shadow-xl shadow-blue-900/30`
2. Add subtle animation on hover: `hover:shadow-2xl hover:scale-105 transition-all`
3. Maybe add a subtle pulse animation when ready to send

---

## General Guidelines for All Tasks:

**Color Palette to Use:**
- Backgrounds: `bg-zinc-900`, `bg-zinc-950`
- Borders: `border-zinc-800`, `border-zinc-700`
- Text primary: `text-zinc-100`, `text-zinc-300`
- Text secondary: `text-zinc-500`, `text-zinc-600`
- Accent blue: `bg-blue-600`, `text-blue-400`, `border-blue-500`
- Success green: `text-emerald-400`, `bg-emerald-950/30`, `border-emerald-800/30`
- Error red: `text-red-400`, `bg-red-950/30`, `border-red-800/30`
- Warning amber: `text-amber-400`, `bg-amber-950/30`, `border-amber-800/30`

**Typography:**
- All code/data: `font-mono`
- Labels: `text-xs uppercase tracking-wider`
- Headings: `text-sm font-semibold`

**Spacing:**
- Use generous gaps between sections: `gap-6`
- Padding in cards: `p-4` or `p-6`
- Consistent rounded corners: `rounded-lg`

---

## Success Criteria:

When you're done, the Settings panel should:
1. ✅ Look like VS Code or Cursor settings (native IDE feel)
2. ✅ Use dark theme consistently (no white backgrounds)
3. ✅ Be easy to scan and read
4. ✅ Have clear visual hierarchy
5. ✅ Match the style of the PromptEditor (cohesive design)
6. ✅ Feel professional, not like a commodity web form

---

## Priority Order:

**HIGH PRIORITY:**
- Task 1 (Settings dark theme)
- Task 2 (Layout & readability)
- Task 4 (Modal z-index)

**MEDIUM PRIORITY:**
- Task 3 (Status indicators)
- Task 5 (Close button)

**LOW PRIORITY:**
- Task 6 (TokenCounter)
- Task 7 (Send button animation)

---

**Note to Clacky Lite:** These are all visual/CSS changes. No complex logic needed. Focus on making it look good and be easy to use.
