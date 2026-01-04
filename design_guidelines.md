# Islamic Quran Application Design Guidelines

## Design Approach

**Hybrid Reference System**: Drawing from Spotify's audio-first UX patterns, Apple Music's elegant content presentation, and Islamic design principles (geometric patterns, calligraphic inspiration, spacious layouts that convey reverence).

**Core Philosophy**: Sacred simplicity - every element serves the spiritual experience. Clean, uncluttered interfaces that honor the content's significance while providing modern functionality.

---

## Typography System

**Primary Font**: Amiri (Google Fonts) - authentic Arabic calligraphic style for Quranic text and Arabic headings
**Secondary Font**: Inter (Google Fonts) - clean, modern for UI elements and English text

**Hierarchy**:
- Surah titles: Amiri, 32px/40px desktop, 24px mobile
- Section headings: Inter SemiBold, 24px/28px
- Body/UI text: Inter Regular, 16px/18px
- Surah numbers: Amiri, 48px (decorative)
- Player controls: Inter Medium, 14px

---

## Layout & Spacing System

**Tailwind Units**: Use 4, 6, 8, 12, 16, 24 for consistent rhythm (p-4, gap-6, h-16, etc.)

**Container Strategy**:
- App shell: Full viewport with sidebar navigation
- Content areas: max-w-7xl with px-6 padding
- Card components: Consistent p-6 internal padding

**Responsive Breakpoints**: Mobile-first, stack at base, 2-column at md:, full layout at lg:

---

## Core Layout Structure

### App Shell (Desktop)
**Sidebar Navigation** (w-64, fixed left):
- Logo/app branding at top (h-20)
- Primary navigation items with icons (Home, Browse, Favorites, Playlists, Downloads)
- User profile/settings at bottom

**Main Content Area** (ml-64 on desktop):
- Persistent audio player bar at bottom (h-24, fixed)
- Scrollable content region between header and player

### Mobile Layout
- Bottom tab navigation (h-16)
- Collapsible player drawer
- Full-screen content views

---

## Component Library

### 1. Audio Player (Bottom Bar)
**Full-width sticky bar with**:
- Left: Current surah info (thumbnail 56x56, title, reciter name)
- Center: Playback controls (previous, play/pause, next, shuffle, repeat)
- Right: Volume, download indicator, timestamp, progress bar spanning full width above controls
- Progress bar: Interactive scrubber with verse markers

### 2. Surah Cards (Browse View)
**Grid layout** (grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-6):
- Decorative geometric pattern background (subtle)
- Surah number in large Amiri font (top-left)
- Surah name (Arabic + transliteration)
- Verse count, revelation location
- Play button overlay (center) - blurred background
- Favorite heart icon (top-right)

### 3. Reciter Profiles
**Horizontal scrollable carousel** + grid below:
- Circular avatar (w-24 h-24)
- Reciter name beneath
- Active reciter highlighted with border treatment

### 4. Playlist Management
**Card-based interface**:
- Create new playlist card (dashed border, plus icon)
- Playlist cards showing first 3 surah thumbnails in mosaic
- Playlist title, surah count
- Quick play button with blurred background

### 5. Search & Filter Bar
**Sticky header component** (h-16):
- Search input (w-full md:w-96) with icon
- Filter chips for: Reciter, Revelation (Meccan/Medinan), Length
- Sort dropdown

### 6. Content Lists
**Alternating row styles** for browsability:
- Row height: h-20
- Left: Surah number in decorative circle
- Middle: Title, verse count, metadata
- Right: Download status icon, duration, play button
- Hover state: Elevated with shadow

---

## Imagery & Visual Elements

### Hero Section (Home Screen)
**Large hero banner** (h-96 on desktop, h-64 mobile):
- Beautiful calligraphic Quranic verse imagery with subtle geometric overlay
- Centered heading: "Continue Your Journey" or daily verse
- CTA button with blurred glass-morphic background: "Start Listening"
- Image should evoke spirituality: Islamic art patterns, mosque architecture silhouettes, or elegant Arabic calligraphy

### Featured Content
**Use imagery throughout**:
- Surah cards: Abstract geometric patterns or subtle texture backgrounds
- Reciter profiles: Professional portraits
- Playlists: Mosaic thumbnails of contained surahs

**Image Descriptions**:
1. **Hero**: Elegant Islamic geometric patterns (arabesque) with soft glow, dimension: 1920x600
2. **Surah Cards**: Unique geometric backgrounds per surah (8-pointed stars, tessellations)
3. **Reciter Portraits**: Circular crops, professional photography
4. **Empty States**: Minimalist line-art illustrations of mosques, prayer beads, or open Quran

---

## Navigation Patterns

**Primary Nav Items** (Sidebar/Bottom Tabs):
- Home (featured, continue listening, daily verse)
- Browse (all surahs in list/grid toggle)
- Reciters (carousel + filterable grid)
- Favorites (saved surahs)
- Playlists (user-created collections)
- Downloads (offline content)
- Settings (preferences, about)

**Interaction Model**:
- Tap surah card → Expand to full surah view with verse-by-verse playback
- Tap reciter → Show all surahs by that reciter
- Long-press → Quick actions (add to playlist, download, share)

---

## Special Features UI

### Download Manager
**Progress indicators**:
- Individual surah download cards with circular progress
- Batch download option with overall progress bar
- Storage usage indicator at top

### Verse-by-Verse Mode
**Full-screen reading experience**:
- Large Arabic text (Amiri, 28px) centered
- Synchronized highlighting as audio plays
- Translation toggle below verse
- Swipe between verses

### Dark Mode (Primary Mode)
Given religious context, dark mode creates contemplative atmosphere - make this the default with light mode alternative.

---

## Accessibility
- Text size controls for Arabic/translation
- Playback speed adjustment (0.5x - 2x)
- High contrast mode for better readability
- Keyboard shortcuts for player controls
- Screen reader optimizations for Arabic text flow

---

## Key Interactions
- **Swipe gestures**: Next/previous surah in player
- **Pull-to-refresh**: Update reciter library
- **Drag-and-drop**: Reorder playlist items
- **Pinch-to-zoom**: Arabic text in verse mode (mobile)

This design balances spiritual reverence with modern usability, creating an app that feels both sacred and accessible.