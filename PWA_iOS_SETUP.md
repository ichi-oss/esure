# Aviva Insurance PWA - iOS Setup Guide

## Overview

The Aviva Insurance Policy Management Portal is now configured as a Progressive Web App (PWA) with full iOS support. Users can install the app on their iOS devices for a native app-like experience.

## Generated Icons

The following icons have been generated from the AVIVA logo for optimal iOS compatibility:

### Apple Touch Icons (iOS Specific)

- `apple-touch-icon-57x57.png` - iPhone (iOS 6 and earlier)
- `apple-touch-icon-60x60.png` - iPhone (iOS 7+)
- `apple-touch-icon-72x72.png` - iPad (iOS 6 and earlier)
- `apple-touch-icon-76x76.png` - iPad (iOS 7+)
- `apple-touch-icon-114x114.png` - iPhone Retina (iOS 6 and earlier)
- `apple-touch-icon-120x120.png` - iPhone Retina (iOS 7+)
- `apple-touch-icon-144x144.png` - iPad Retina (iOS 6 and earlier)
- `apple-touch-icon-152x152.png` - iPad Retina (iOS 7+)
- `apple-touch-icon-180x180.png` - iPhone 6 Plus and newer

### PWA Icons

- `icon-72x72.png` through `icon-512x512.png` - Various sizes for PWA manifest
- `favicon-16x16.png`, `favicon-32x32.png`, `favicon-48x48.png` - Browser favicons

## How to Install on iOS

### For Users:

1. Open Safari on your iOS device
2. Navigate to the Aviva Insurance Portal website
3. Tap the Share button (square with arrow pointing up)
4. Scroll down and tap "Add to Home Screen"
5. Customize the name if desired (default: "Aviva Insurance")
6. Tap "Add" in the top right corner

### Features When Installed:

- **Standalone Mode**: Runs without Safari's browser UI
- **Native Feel**: Looks and behaves like a native iOS app
- **Offline Capability**: Basic functionality available offline
- **Push Notifications**: (If implemented) Receive policy updates
- **Fast Loading**: Cached resources for quick startup

## Technical Configuration

### Manifest.json Features:

- **Name**: "Aviva - Insurance Policy Management Portal"
- **Short Name**: "Aviva Insurance"
- **Display**: Standalone (full-screen app experience)
- **Theme Color**: #FFD700 (Aviva yellow)
- **Background Color**: #FFFBF0 (Light cream)
- **Orientation**: Portrait (optimized for mobile use)

### iOS-Specific Meta Tags:

- `apple-mobile-web-app-capable`: Enables standalone mode
- `apple-mobile-web-app-status-bar-style`: Controls status bar appearance
- `apple-mobile-web-app-title`: Sets the app name on home screen
- `apple-touch-fullscreen`: Enables full-screen mode

### Shortcuts (Quick Actions):

When installed, users can access:

- **Admin Dashboard**: Direct access to admin panel
- **Policy Portal**: Direct access to user policies

## Browser Compatibility

- **iOS Safari**: Full PWA support
- **iOS Chrome**: Limited PWA support (can bookmark to home screen)
- **Desktop Browsers**: Full PWA support with install prompts

## Development Notes

- Icons are generated with a cream background (#FFFBF0) to match the app theme
- All icons maintain the AVIVA branding and logo consistency
- The PWA is configured for optimal iOS performance and user experience

## Testing the PWA

1. Start the development server: `npm run dev`
2. Open the app in Safari on an iOS device
3. Test the "Add to Home Screen" functionality
4. Verify the app opens in standalone mode
5. Check that all icons display correctly

## Troubleshooting

- **Icons not showing**: Clear browser cache and try again
- **App not installing**: Ensure you're using Safari (not Chrome) on iOS
- **Standalone mode not working**: Check that `apple-mobile-web-app-capable` is set to "yes"

## Future Enhancements

- Push notification implementation
- Offline data synchronization
- Background app refresh for policy updates
- Enhanced caching strategies
