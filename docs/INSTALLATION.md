# SwiftAPI Installation Guide

## macOS Installation

SwiftAPI is currently **unsigned** (not notarized with Apple). This means macOS Gatekeeper will block installation by default with a "damaged" or "can't be opened" message.

### Method 1: Using Terminal (Recommended)

1. Download the `.dmg` or `.zip` file from the [Releases page](https://github.com/gmoorevt/swiftapi/releases)
2. If you downloaded the DMG:
   - Mount the DMG by double-clicking it
   - Drag SwiftAPI.app to your Applications folder
3. Open **Terminal** and run:
   ```bash
   xattr -cr /Applications/SwiftAPI.app
   ```
4. Now you can launch SwiftAPI from Applications

### Method 2: Right-Click to Open

1. Download and install the app as above
2. **Right-click** (or Control+click) on SwiftAPI.app
3. Select **"Open"** from the context menu
4. Click **"Open"** in the security dialog that appears
5. The app will now run and be trusted for future launches

### Method 3: System Settings

1. Try to open SwiftAPI normally (it will be blocked)
2. Open **System Settings** → **Privacy & Security**
3. Scroll down to find the message about SwiftAPI being blocked
4. Click **"Open Anyway"**
5. Confirm by clicking **"Open"**

### Why Is This Happening?

SwiftAPI is an open-source project and doesn't have an Apple Developer certificate ($99/year). Code signing and notarization require:
- Paid Apple Developer account
- Annual renewal fees
- Complex CI/CD setup for notarization

For an open-source local-first tool, this isn't currently viable. The methods above safely bypass Gatekeeper while still protecting you - you're explicitly choosing to trust the app.

### Is It Safe?

Yes! SwiftAPI is:
- ✅ **Open source** - All code is visible on GitHub
- ✅ **Local-first** - No data sent to external servers
- ✅ **Privacy-focused** - Everything runs on your machine
- ✅ **Built in public** - CI/CD pipelines are transparent

You can review the source code at: https://github.com/gmoorevt/swiftapi

---

## Windows Installation

1. Download the `.exe` installer from the [Releases page](https://github.com/gmoorevt/swiftapi/releases)
2. Windows Defender SmartScreen may show a warning (unsigned app)
3. Click **"More info"** → **"Run anyway"**
4. Follow the installation wizard

### Windows Alternative: Portable Version

Download the `portable` version - no installation required:
1. Download `SwiftAPI-x.x.x-portable.exe`
2. Run directly from any folder
3. No admin rights needed

---

## Linux Installation

### AppImage (Universal)

1. Download the `.AppImage` file
2. Make it executable:
   ```bash
   chmod +x SwiftAPI-x.x.x.AppImage
   ```
3. Run it:
   ```bash
   ./SwiftAPI-x.x.x.AppImage
   ```

### Debian/Ubuntu (.deb)

```bash
sudo dpkg -i SwiftAPI-x.x.x.deb
sudo apt-get install -f  # Fix any dependency issues
```

### Fedora/RHEL (.rpm)

```bash
sudo rpm -i SwiftAPI-x.x.x.rpm
```

---

## Building From Source

If you prefer to build SwiftAPI yourself:

### Prerequisites
- Node.js 18+ and npm 9+
- Git

### Steps

```bash
# Clone the repository
git clone https://github.com/gmoorevt/swiftapi.git
cd swiftapi

# Install dependencies
npm install

# Build the application
npm run electron:build

# Built files will be in the `release/` directory
```

---

## Troubleshooting

### macOS: "App is damaged and can't be opened"

This is Gatekeeper blocking unsigned apps. Use Method 1 above (`xattr -cr`).

### macOS: "App can't be opened because Apple cannot check it for malicious software"

Use Method 2 (Right-click → Open) or Method 3 (System Settings).

### Windows: "Windows protected your PC"

This is SmartScreen blocking unsigned apps. Click "More info" → "Run anyway".

### Linux: Permission denied

Make the AppImage executable: `chmod +x SwiftAPI-*.AppImage`

### Still Having Issues?

Open an issue on GitHub: https://github.com/gmoorevt/swiftapi/issues

---

## Future Plans

We're exploring options for code signing:
- Community-funded Apple Developer account
- Alternative distribution methods (Homebrew, Snap, Flatpak)
- Self-signing certificates for enterprises

For now, the manual trust methods above are the recommended approach.

---

**Last Updated**: 2025-11-13
**Version**: 0.2.0
