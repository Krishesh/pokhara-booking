---
name: Alpine Horizon
colors:
  surface: '#f3faff'
  surface-dim: '#d1dce1'
  surface-bright: '#f3faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ebf5fb'
  surface-container: '#e5eff5'
  surface-container-high: '#e0eaf0'
  surface-container-highest: '#dae4ea'
  on-surface: '#131d21'
  on-surface-variant: '#3e494b'
  inverse-surface: '#283236'
  inverse-on-surface: '#e8f2f8'
  outline: '#6e797c'
  outline-variant: '#bdc8cb'
  surface-tint: '#006877'
  primary: '#006574'
  on-primary: '#ffffff'
  primary-container: '#008092'
  on-primary-container: '#f8fdff'
  inverse-primary: '#76d4e7'
  secondary: '#a14000'
  on-secondary: '#ffffff'
  secondary-container: '#ff8342'
  on-secondary-container: '#682700'
  tertiary: '#545c72'
  on-tertiary: '#ffffff'
  tertiary-container: '#6c748b'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a3eeff'
  primary-fixed-dim: '#76d4e7'
  on-primary-fixed: '#001f25'
  on-primary-fixed-variant: '#004e5a'
  secondary-fixed: '#ffdbcc'
  secondary-fixed-dim: '#ffb694'
  on-secondary-fixed: '#351000'
  on-secondary-fixed-variant: '#7a2f00'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f3faff'
  on-background: '#131d21'
  surface-variant: '#dae4ea'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.005em
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.03em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system embodies the invigorating, serene, and majestic spirit of Himalayan travel. Designed for global trekkers, paragliders, and expedition seekers, the aesthetic balances modern luxury with utilitarian outdoor reliability. The emotional response is one of clarity, boundless optimism, trust, and adventurous thrill.

The style fuses **Modern Scandinavian Outdoor** with **Airy Soft-Layered Minimalism**:
- Pristine, ice-melt sky backgrounds invoke high-altitude open air.
- Pure white elevated cards act as clean resting ledges for complex booking data and photography.
- High-contrast botanical teal grounds interactive focal points, balanced by warm sunrise amber accents that evoke dawn breaking over the Annapurna range.
- Expansive spacing, pill-like interactive elements, and fine borders maintain effortless legibility and effortless navigation across rugged itineraries and equipment lists.

## Colors
The color palette represents high alpine clarity, glacial lakes, and Himalayan dawn.

- **Primary Teal (`#088395`)**: Represents alpine glacial waters and deep mountain forests. Used for primary CTAs, active itinerary tabs, selective icon fills, and key progression indicators.
- **Secondary Sunrise Coral (`#E26D2D`)**: Evokes the early morning alpine glow against snowcaps. Strictly reserved for callouts, pricing highlights, urgency triggers ("Only 2 seats left"), and critical review ratings.
- **Tertiary Deep Slate Navy (`#0F172A`)**: Provides razor-sharp editorial contrast for display titles, data tables, and structural frames.
- **Neutral Glacial Mist (`#EBF5FB`)**: Forms the default expansive background canvas, softening ocular fatigue compared to harsh sterile white.
- **Surface Elevation (`#FFFFFF`)**: Pure alpine snow white used exclusively for raised cards, booking summary panels, flyout menus, and modals to pop against the canvas.
- **Structural Borders (`#CFE2EE`)**: Crisp, subtle sky-slate outlines that frame surfaces without adding visual heaviness.

## Typography
Plus Jakarta Sans delivers geometric precision mixed with approachable, sculpted human curves. The letterforms convey technical reliability for expedition gear parameters and date pickers while remaining welcoming for leisure seekers.

- Use tighter letter spacing on `headline-xl` and `headline-lg` to create editorial authority in hero tour titles.
- Render pricing tags and primary figures using `headline-md` or `headline-sm` with `fontWeight: 700` paired with `secondary_color_hex` for instantaneous scanning.
- Reserve `label-sm` in all-caps strictly for categorical overlines (e.g., "7-DAY TREK", "ANNAPURNA CIRCUIT", "INCLUDED GEAR").

## Layout & Spacing
The layout adheres to a 12-column responsive fluid grid designed to display multi-stage expedition packages and immersive photography.

- **Desktop (1200px and above)**: 12-column grid, max container width of 1320px, 48px outer canvas margin, 24px column gutters. Sticky reservation summary card occupies a 4-column span while the itinerary details span the remaining 8 columns.
- **Tablet (768px – 1199px)**: 8-column grid with 32px canvas margins and 16px gutters. Itinerary filters condense into an off-canvas drawer.
- **Mobile (< 768px)**: 4-column fluid system with 20px outer margin and 16px gutters. Booking controls become pinned to a bottom dock with safe-area spacing.
- **Rhythm**: Component spacing strictly leverages the 8pt spatial grid scale (`0.25rem`, `0.5rem`, `1rem`, `1.5rem`, `2.5rem`). Never crowd adventure descriptions; ensure cards have at least `space-lg` internal clearance.

## Elevation & Depth
Depth mimics sunlight reflecting on snow: bright, diffused, non-muddy, and light-handed. Shadows utilize an alpine sky tint rather than pure achromatic grey.

- **Level 0 (Canvas Base)**: Flat `#EBF5FB` background. Zero shadow.
- **Level 1 (Cards & Lists)**: Pure `#FFFFFF` surface enclosed by a fine 1px border (`#CFE2EE`). Shadow: `0 4px 16px -2px rgba(8, 131, 149, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)`.
- **Level 2 (Hover States & Selectable Expedition Tiles)**: Raised border tinting (`#088395` at 20% opacity). Shadow: `0 12px 28px -4px rgba(8, 131, 149, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Sticky Booking Bars & Modals)**: Pure `#FFFFFF` card surface. Shadow: `0 20px 40px -6px rgba(15, 23, 42, 0.1), 0 8px 16px -4px rgba(8, 131, 149, 0.08)`.

## Shapes
A balanced medium-to-large rounded profile mirrors river-smoothed stones and sleek outdoor equipment.

- Standard cards, itinerary panels, review containers, and image masks utilize `rounded-xl` (1.5rem / 24px) for a soft, welcoming, and premium feel.
- Interactive form controls, text inputs, search modules, and buttons adopt `rounded-lg` (1rem / 16px).
- Status chips, badges, and quick-filter tags adopt full capsule pill styling (`rounded-full` / 9999px).

## Components

### Buttons
- **Primary Action (Book Now, Confirm Dates)**: Background in Primary Teal (`#088395`), text in `#FFFFFF`, font weight 600. Height 48px, horizontal padding `space-lg`, border-radius 16px (`rounded-lg`). On hover: shifts to `#066B7A` with elevated shadow.
- **Secondary Action (Explore Itinerary, View Map)**: Background `#FFFFFF`, 1.5px border in `#088395`, text in `#088395`.
- **Urgent Action / Flash Deal**: Sunrise Coral (`#E26D2D`) fill with white text, used for flash discounts or high-demand booking alerts.

### Cards (Expedition & Package Cards)
- Background pure `#FFFFFF`, border 1px solid `#CFE2EE`, border-radius 24px (`rounded-xl`), overflow hidden.
- Includes a 16:10 aspect ratio imagery container with a subtle corner gradient overlay for overlay tags (e.g., altitude badge, trip duration).
- Internal content padded with `space-lg` (24px). Price section anchored bottom right using Sunrise Coral typography.

### Chips & Filter Tags
- **Default**: Background `#FFFFFF`, border 1px solid `#CFE2EE`, text `#0F172A`, font size `label-md`.
- **Active / Selected**: Background `#088395` with text `#FFFFFF` and no border.
- **Highlight (Difficulty / Altitude Badges)**: Background tint `rgba(8, 131, 149, 0.1)` with text `#088395` and pill curvature.

### Form Inputs & Date Pickers
- Background `#FFFFFF`, 1.5px border `#CFE2EE`, height 52px, internal horizontal padding `space-md`, border-radius 16px.
- Focus state: Border transitions to `#088395` with an ambient glow (`box-shadow: 0 0 0 4px rgba(8, 131, 149, 0.12)`). Label positioned above in deep navy `#0F172A` with weight 600.

### Checkboxes & Radios
- Size 20px x 20px, border-radius 6px for checkboxes and 50% for radios.
- Unchecked: `#FFFFFF` fill with 1.5px `#CFE2EE` border. Checked: `#088395` fill with crisp white internal icon/dot.

### Altitude & Difficulty Indicators
- Horizontal stacked progression indicator displaying acclimatization meters and trek grade (Easy, Moderate, Alpine Technical) using an alpine teal track with coral alert flags for passes over 4,500m.