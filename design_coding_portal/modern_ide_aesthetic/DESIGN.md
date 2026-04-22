---
name: Modern IDE Aesthetic
colors:
  surface: '#101419'
  surface-dim: '#101419'
  surface-bright: '#36393f'
  surface-container-lowest: '#0b0e13'
  surface-container-low: '#181c21'
  surface-container: '#1c2025'
  surface-container-high: '#272a30'
  surface-container-highest: '#31353b'
  on-surface: '#e0e2ea'
  on-surface-variant: '#c0c7d3'
  inverse-surface: '#e0e2ea'
  inverse-on-surface: '#2d3136'
  outline: '#8a919d'
  outline-variant: '#404751'
  surface-tint: '#9fcaff'
  primary: '#9fcaff'
  on-primary: '#003258'
  primary-container: '#007acc'
  on-primary-container: '#ffffff'
  inverse-primary: '#0061a4'
  secondary: '#c8c6c7'
  on-secondary: '#303031'
  secondary-container: '#474648'
  on-secondary-container: '#b6b4b5'
  tertiary: '#ffb784'
  on-tertiary: '#4f2500'
  tertiary-container: '#b95e01'
  on-tertiary-container: '#ffffff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d1e4ff'
  primary-fixed-dim: '#9fcaff'
  on-primary-fixed: '#001d36'
  on-primary-fixed-variant: '#00497d'
  secondary-fixed: '#e4e2e3'
  secondary-fixed-dim: '#c8c6c7'
  on-secondary-fixed: '#1b1b1c'
  on-secondary-fixed-variant: '#474648'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb784'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#713700'
  background: '#101419'
  on-background: '#e0e2ea'
  surface-variant: '#31353b'
typography:
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-main:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-mono:
    fontFamily: Space Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 1px
  sidebar-width: 260px
---

## Brand & Style

The brand personality of this design system is centered on technical precision, focus, and utility. It targets developers and students who value a distraction-free environment that mirrors their professional tools. The emotional response is one of "flow"—where the interface recedes to let the code and logic take center stage.

The design style is a sophisticated blend of **Minimalism** and **Modern Corporate** aesthetics. It utilizes a restrained color palette and strict alignment to create a sense of order. By leveraging the familiar visual language of modern Integrated Development Environments (IDEs), the design system reduces cognitive load for users transitioning from their local editors to this platform.

## Colors

The color strategy for this design system is rooted in high-functionality dark mode. The core palette is derived from industry-standard editor themes to ensure long-term eye comfort during intense coding sessions.

- **Primary Blue (#007acc):** Reserved exclusively for primary actions, focus states, and active indicators. It serves as the "source of truth" for where the user is interacting.
- **Deep Dark (#1e1e1e):** The primary canvas color. It provides a low-contrast base that makes syntax highlighting pop without straining the eyes.
- **Secondary Dark (#252526):** Used for structural elements like sidebars, activity bars, and headers to create a clear architectural hierarchy.
- **Surface Accents:** Borders use a subtle grey (#333333) to define boundaries without adding visual noise.

## Typography

Typography in this design system is divided into two functional roles: **UI Navigation** and **Data Consumption**.

1.  **UI Navigation:** Utilizes **Inter** for its exceptional legibility at small sizes and neutral character. Headlines are kept compact to maximize vertical screen real estate.
2.  **Data Consumption:** Utilizes a monospace font (Space Grotesk/JetBrains Mono equivalent) for all code blocks, inline snippets, and terminal outputs.

Line heights are intentionally tight (1.4x to 1.5x) to maintain the high information density expected in technical tools. Letter spacing is slightly reduced for large headings and increased for small uppercase labels to ensure readability.

## Layout & Spacing

This design system employs a **Fluid IDE Grid** model. The layout is dominated by a fixed-width left sidebar for navigation and a fluid main content area that adapts to the viewport.

- **The 4px Rule:** All spacing and sizing must be multiples of 4px to ensure mathematical harmony across the UI.
- **Gutterless Dividers:** To maintain the minimalist aesthetic, use 1px solid borders (#333333) as separators instead of wide margins or gutters.
- **Density:** Information density should be high. Use 8px (sm) for internal component padding and 16px (md) for container padding.

## Elevation & Depth

In this design system, depth is communicated through **Tonal Layering** rather than shadows. This mimics the "flat-stack" nature of modern code editors.

- **Level 0 (Background):** #1e1e1e. The main editor and content area.
- **Level 1 (Surface):** #252526. Sidebars, panels, and secondary navigation.
- **Level 2 (Elevated):** #2d2d2d. Hover states for list items or dropdown menus.
- **Interactive Depth:** Do not use drop shadows for cards or panels. Instead, use a 1px border (#333333) to define the edge. Shadows are reserved exclusively for floating modals or context menus to provide a distinct "float" over the workspace.

## Shapes

The shape language of this design system is primarily **Sharp**. To maintain a professional and technical feel, we avoid organic or overly rounded shapes.

- **Standard Radius:** A minimal 4px (Soft) radius is applied to buttons, input fields, and cards to provide a hint of modernity without sacrificing the precision of the layout.
- **Strict Sharpness:** Inner elements like code editor lines, tabs, and sidebar items should have 0px rounding to maintain the "grid-aligned" feel of a professional IDE.

## Components

### Buttons & Actions
- **Primary:** Solid #007acc background with white text. 4px border radius. No gradients.
- **Secondary:** Ghost style with #333333 border and #cccccc text. Transitions to a light grey background on hover.

### Code Editor Mockup
- The editor should feature a gutter for line numbers with a subtle vertical line separator. 
- Active lines are highlighted with a #2a2d2e background.
- Syntax highlighting should follow a "dark plus" color scheme (Soft blues, greens, and oranges).

### Sleek Cards
- Cards are flat with no shadow. They use a 1px border (#333333) and a slightly lighter background (#252526) than the main canvas.

### Data Tables
- Header rows use `label-caps` typography and a #252526 background.
- Rows are separated by 1px borders.
- Hover states on rows use #2a2d2e to indicate selection without shifting layout.

### Side Panels
- Collapsible panels should use a simple chevron icon. 
- Active tab indicators in side panels should be a 2px vertical blue line on the far left or right of the item.