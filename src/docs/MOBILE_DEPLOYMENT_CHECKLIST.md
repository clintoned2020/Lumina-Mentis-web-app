# Mobile WebView Deployment Checklist

This checklist ensures Lumina Mentis is optimized for mobile app deployment (iOS/Android WebView).

## Pre-Deployment Checklist

### 1. Bottom Tab Navigation ✅
- [x] Implemented persistent navigation stacks per tab
- [x] 5 core tabs: Home, Disorders, Community (Forum), Wellness, Profile
- [x] Double-tap active tab returns to root
- [x] Profile tab shows current user email
- **File**: `components/layout/MobileBottomTabs`

### 2. Back Navigation Consistency ✅
- [x] Sticky header with back button on all non-root screens
- [x] Hidden on desktop (lg: breakpoint)
- [x] Visible on mobile (bottom navigation)
- **Files**: 
  - `components/layout/MobileBackHeader` (optional per-page implementation)
  - `hooks/useTabStack` (stack management)

### 3. Touch Target Sizes ✅
- [x] All buttons minimum 44×44px (CSS pixels)
- [x] Tab navigation buttons: 48px height
- [x] Form inputs: 44px height
- [x] Proper padding to prevent accidental taps
- **Verification**: Run Lighthouse audit → "Touch targets are appropriately sized"

### 4. Radix Components (Replace `<select>`)
- [x] `Select` component implemented (Radix UI)
- [x] `MobileSelect` component for mobile drawer variant
- [ ] **TODO**: Grep for remaining native `<select>` elements
- [ ] **TODO**: Replace with Radix components where found
- **Command**: `grep -r "<select" src/ --include="*.jsx"`

### 5. Accessibility Audit ✅
- [x] WCAG 2.1 Level AA compliance documented
- [x] Color contrast verified (4.5:1 minimum)
- [x] Semantic HTML with ARIA labels
- [x] Keyboard navigation supported
- [ ] **TODO**: Run Chrome DevTools Lighthouse
  - Target: Accessibility score ≥90
  - Target: Best Practices ≥95

### 6. Pull-to-Refresh Compatibility ✅
- [x] CSS `overscroll-behavior-y: auto` on main
- [x] `.no-pull-to-refresh` utility for fixed elements
- [x] Verified on pages with sticky headers
- [ ] **TODO**: Test on real iOS/Android devices

## Safe Area Support

iOS notch, home indicator, and Android system UI safe areas are handled via CSS:

```css
/* In index.css */
:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
}

/* Applied to nav and main */
nav { padding-bottom: var(--safe-bottom); }
```

## Device Testing Matrix

### iOS
- [ ] iPhone 14 (6.1" standard)
- [ ] iPhone 14 Pro (6.1" notch)
- [ ] iPhone SE (no safe area)
- [ ] iPad (landscape orientation)

### Android
- [ ] Pixel 7 (6.3" standard)
- [ ] Pixel 7 Pro (6.7" larger)
- [ ] Samsung Galaxy S23 (6.1" standard)
- [ ] Device with custom system UI (notch/punch hole)

### Testing Procedures

#### Hardware Back Button (Android)
```
1. Navigate to child page (e.g., /disorders/anxiety)
2. Press hardware back button
3. Should return to parent tab root
4. Continue pressing back, should cycle through tab history
5. At root, pressing back should close app (not go to previous tab)
```

#### Pull-to-Refresh
```
1. On each page, scroll to top
2. Pull down with finger
3. Verify refresh indicator appears
4. Release to trigger refresh
5. Verify no conflict with sticky header or bottom tabs
```

#### Touch Targets
```
1. Use accessibility inspector (iOS) or accessibility viewer (Android)
2. Tap each button/link
3. Verify feedback is immediate
4. Verify 44px minimum is met (try tapping edges)
```

#### Safe Areas
```
iOS:
1. On iPhone with notch, verify content doesn't hide behind notch
2. Verify bottom content visible above home indicator

Android:
1. On device with rounded corners, verify content not clipped
2. Test landscape orientation on device with system gestures
```

## Lighthouse Audit Steps

### Local Testing
```bash
# Option 1: Chrome DevTools
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select "Mobile" device
4. Check: Accessibility, Best Practices, Performance
5. Click "Analyze page load"

# Option 2: CLI (if lighthouse-cli installed)
lighthouse https://lumina-mentis.app --mobile --view
```

### Expected Results
- **Accessibility**: 90+
- **Best Practices**: 95+
- **Performance**: 75+
- **SEO**: 90+

### Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Touch targets too small" | Ensure all buttons `min-h-[44px]` |
| "Missing form labels" | Add `<label htmlFor="id">` |
| "Low color contrast" | Check text on bg (use WebAIM checker) |
| "Missing alt text" | Add `alt="description"` to images |
| "Focus indicators invisible" | Verify `focus-visible:ring` applied |

## Performance Checklist

- [ ] Bundle size < 500KB gzipped
- [ ] First paint < 2s on 4G
- [ ] Largest contentful paint < 3s
- [ ] No layout shifts (CLS < 0.1)
- [ ] Images optimized (WebP, lazy loading)
- [ ] No unused CSS/JS

## Deployment Steps

1. **Code Review**
   - [ ] All components use Radix UI
   - [ ] Touch targets verified
   - [ ] ARIA labels complete
   - [ ] Pull-to-refresh tested

2. **Build & Optimize**
   ```bash
   npm run build
   # Verify bundle size
   ls -lh dist/
   ```

3. **Testing on Device**
   - [ ] Install on real iOS device via TestFlight
   - [ ] Install on real Android device via Firebase App Distribution
   - [ ] Run through device testing matrix above

4. **Lighthouse Audit**
   - [ ] Score ≥90 accessibility
   - [ ] No critical warnings

5. **Release**
   - [ ] App Store submission (iOS)
   - [ ] Google Play submission (Android)

## Post-Deployment Monitoring

- Monitor crash reports (Firebase, Sentry)
- Track user feedback for UX issues
- Monitor Lighthouse scores monthly
- Test new features on device before release

## Resources

- [iOS Safe Area Documentation](https://developer.apple.com/design/human-interface-guidelines/notch)
- [Android Safe Area Documentation](https://developer.android.com/guide/navigation/custom-back)
- [Chrome DevTools Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebAIM Resources](https://webaim.org/)