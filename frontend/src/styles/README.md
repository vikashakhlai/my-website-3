# Styles System

This directory contains the organized global styles for the application.

## Structure

```
styles/
├── variables.css    # CSS custom properties (design tokens)
├── reset.css       # CSS reset and base element styles
├── utilities.css   # Utility classes (spacing, typography, etc.)
├── components.css  # Reusable component styles (buttons, cards, etc.)
└── index.css       # Main entry point that imports all styles
```

## Usage

The styles are automatically imported in `src/index.css` which is loaded in `main.tsx`.

### CSS Variables

All design tokens are defined in `variables.css` using CSS custom properties:

```css
.my-component {
  color: var(--color-primary);
  padding: var(--space-4);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
}
```

### Utility Classes

Use utility classes for common styling patterns:

```html
<div class="d-flex justify-between align-center gap-4 p-6">
  <button class="btn btn-primary">Click me</button>
</div>
```

### Component Classes

Use component classes for reusable UI elements:

```html
<button class="btn btn-primary btn-lg">Large Button</button>
<div class="card">
  <div class="card-header">Header</div>
  <div class="card-body">Content</div>
</div>
```

## UI Components

Reusable React components are available in `src/components/ui/`:

- `Button` - Button component with variants and sizes
- `Card` - Card component with header/footer support
- `Input` - Input component with label and error handling
- `Badge` - Badge component for labels and tags

Example:

```tsx
import { Button, Card, Input } from '@/components/ui';

<Button variant="primary" size="lg">Click me</Button>
<Card title="My Card" header={<Badge>New</Badge>}>
  Content here
</Card>
<Input label="Email" error="Invalid email" />
```

## Customization

To customize the design system:

1. **Colors**: Update CSS variables in `variables.css`
2. **Spacing**: Modify spacing scale in `variables.css`
3. **Components**: Override styles in `components.css` or use component-specific CSS files
4. **Utilities**: Add new utility classes in `utilities.css`

## RTL Support

The styles system includes RTL (Right-to-Left) support for Arabic text. Use the `rtl` class or `dir="rtl"` attribute:

```html
<div dir="rtl" class="arabic-text">
  النص العربي
</div>
```

## Best Practices

1. **Use CSS variables** instead of hardcoded values
2. **Prefer utility classes** for simple styling
3. **Use component classes** for reusable patterns
4. **Create component-specific CSS** for complex components
5. **Keep styles organized** by feature/component

