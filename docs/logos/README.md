# SwiftAPI Logo

## Active Logo: Lightning Bolt + API Brackets

The SwiftAPI logo features a lightning bolt inside curly braces (API brackets), symbolizing both speed and API development.

### Design Elements
- **Lightning Bolt**: Represents speed, performance, and efficiency
- **Curly Braces `{ }`**: Universal symbol for APIs and code
- **Color**: Primary brand blue (#007bff) for light mode, lighter blue (#4d9fff) for dark mode
- **Style**: Clean, modern, minimal, scalable

### Files

#### Application Assets
- `src/assets/icons/logo.svg` - Main logo for light mode
- `src/assets/icons/logo-dark.svg` - Logo variant for dark mode
- `build/icon.svg` - High-resolution app icon (512x512)

#### Component
- `src/renderer/components/Logo/Logo.tsx` - React component with theme support

### Usage

```tsx
import { Logo } from './components/Logo/Logo';

// With text
<Logo size={40} showText={true} />

// Icon only
<Logo size={32} showText={false} />
```

### Other Concepts

Additional logo concepts are available in `docs/logos/`:
- `option1-lightning-brackets.svg` - ✅ **Selected**
- `option2-swift-bird.svg` - Geometric bird in flight
- `option3-sa-monogram.svg` - SA lettermark with speed lines
- `option4-rocket.svg` - Rocket ship with API nodes
- `option5-network-nodes.svg` - Connected network forming 'S'

View all concepts: Open `docs/logos/preview.html` in a browser

### Build Configuration

The logo is configured in `package.json` under the `build` section:
```json
{
  "build": {
    "icon": "build/icon.svg",
    "mac": {
      "icon": "build/icon.svg"
    }
  }
}
```

### Theme Integration

The logo automatically adapts to the current theme (light/dark) using the app's theme system. Colors are pulled from `theme.colors.interactive.primary`.
