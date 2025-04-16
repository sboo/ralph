# Feature-Based Code Organization

This project follows a feature-based organization pattern where code is grouped by features rather than by technical types. This approach helps with:

1. **Better discoverability** - Related code is grouped together
2. **Improved maintainability** - Changes to a feature are isolated to that feature's directory
3. **Cleaner imports** - Import paths are simpler and more consistent
4. **Feature isolation** - Easier to understand feature boundaries

## Directory Structure

Each feature follows this standard structure:

```
feature-name/
├── index.ts             # Exports the public API of the feature
├── components/          # React components specific to this feature
│   └── Component.tsx
├── screens/             # Screen components used by the navigator
│   └── FeatureScreen.tsx
├── hooks/               # Custom hooks specific to this feature
│   └── useFeature.ts
├── helpers/             # Helper functions specific to this feature
│   └── helperFunction.ts
└── types.ts             # TypeScript interfaces, types, and enums
```

Not all features need all these subdirectories. Only create what you need.

## Import Guidelines

Always import from the feature's index file when accessing a feature from another feature:

```typescript
// Good
import { HomeScreen } from '@/features/home';

// Avoid
import HomeScreen from '@/features/home/screens/HomeScreen';
```

For imports within a feature, use relative paths:

```typescript
// From within the same feature
import { helperFunction } from '../helpers/helperFunction';
```

## Feature Communication

Features should communicate through:

1. **Props** - For parent-child relationships
2. **Context** - For shared state across multiple components
3. **Events** - For cross-feature communication

Avoid direct imports of internal feature components from other features.

## Creating a New Feature

When creating a new feature:

1. Create a directory in the `/src/features/` folder
2. Add an `index.ts` file that exports the public API
3. Create subdirectories for components, screens, etc.
4. Update this README if needed

## Example Features

Current features include:
- **assessments** - Functionality for pet health assessments
- **avatar** - Pet avatar handling
- **home** - Main screens and home functionality
- **navigation** - App navigation structure
- **pets** - Pet management functionality
- **settings** - App settings
- **tips** - Pet care tips