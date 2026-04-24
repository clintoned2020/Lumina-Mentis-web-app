# Form Components Guide — Radix UI Migration

This guide ensures all forms use Radix UI components instead of native HTML `<select>` elements for consistency, accessibility, and mobile optimization.

## Native Select → Radix Select Migration

### Before (❌ Don't Use)
```jsx
<select className="form-control">
  <option value="">Select an option</option>
  <option value="opt1">Option 1</option>
  <option value="opt2">Option 2</option>
</select>
```

### After (✅ Use This)
```jsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="opt1">Option 1</SelectItem>
    <SelectItem value="opt2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

## Mobile-Optimized Select (Bottom Sheet)

For mobile WebView apps, use `MobileSelect` which opens a bottom sheet drawer on mobile and dropdown on desktop:

```jsx
import { MobileSelect } from '@/components/ui/mobile-select';

<MobileSelect
  value={sessionType}
  onValueChange={setSessionType}
  label="Session Type"
  placeholder="Select type..."
  options={[
    { value: 'in_person', label: 'In-Person' },
    { value: 'telehealth', label: 'Telehealth' }
  ]}
/>
```

## Touch Target Requirements

All form controls must meet minimum 44×44px touch targets:

```jsx
// ❌ Too small
<input className="px-2 py-1 h-6" />

// ✅ Correct size
<input className="px-4 py-2 h-11" />

// ✅ With helper text below
<div>
  <input className="px-4 py-2.5 h-11 w-full" />
  <p className="text-xs mt-1 text-muted-foreground">Helper text</p>
</div>
```

## Form Input Accessibility

### Labels
Always pair inputs with labels:

```jsx
// ❌ Bad
<input placeholder="Email" />

// ✅ Good
<label htmlFor="email">Email Address</label>
<input id="email" placeholder="user@example.com" />
```

### Error States
Use semantic markup for validation:

```jsx
<div>
  <label htmlFor="name">Full Name</label>
  <input
    id="name"
    aria-invalid={error ? 'true' : 'false'}
    aria-describedby={error ? 'name-error' : undefined}
  />
  {error && <p id="name-error" className="text-destructive text-sm">{error}</p>}
</div>
```

### Required Fields
Clearly mark required fields:

```jsx
<label>
  Full Name <span aria-label="required">*</span>
</label>
<input required />
```

## Examples in Codebase

### Good Examples (Already Updated)
- `components/directory/ConsultationRequestModal` — Uses `MobileSelect` for session type
- `components/wellness/GoalForm` — Uses Radix `Select` for category
- `components/profile/ProfileSettingsModal` — Form with proper labels

### Files to Audit
Run the following command to find remaining `<select>` elements:
```bash
grep -r "<select" src/components src/pages src/functions
```

### Known Locations
- [ ] Review `components/journal/JournalEntryForm` for selects
- [ ] Check `components/groups/ScheduleSessionForm` for time selects
- [ ] Audit `pages/AdminModeration` for filter selects

## Testing Checklist

For each form component, verify:

- [ ] All inputs have associated labels
- [ ] Minimum 44×44px touch targets
- [ ] Focus indicators visible
- [ ] Tab order is logical
- [ ] Error messages announce via aria-describedby
- [ ] Required fields marked with aria-required
- [ ] Select uses Radix component, not HTML `<select>`
- [ ] Mobile select uses bottom sheet drawer

## Performance Considerations

- Radix components add ~5KB gzipped to bundle
- No impact on initial page load (lazy loaded)
- Prefer `Select` over `MobileSelect` when not on mobile
- Use `useMemo` for large option lists (100+ items)

## Reference Links

- [Radix UI Select Docs](https://www.radix-ui.com/docs/primitives/components/select)
- [WCAG Form Labels](https://www.w3.org/WAI/tutorials/forms/labels/)
- [WebAIM Form Validation](https://webaim.org/articles/form_validation/)