# Feature-Based Architecture

This project follows a feature-based architecture pattern to improve maintainability, modularity, and readability. This document outlines the architectural approach and provides guidelines for developers working on this project.

## Principles

1. **Feature Isolation**: Each feature is self-contained with its own components, screens, hooks, helpers, and types.
2. **Clear Boundaries**: Features have well-defined responsibilities and boundaries.
3. **Explicit Dependencies**: Dependencies between features are made explicit through imports.
4. **Single Responsibility**: Each file and component should have a single responsibility.

## Directory Structure

The project is structured as follows:

```
src/
├── core/                 # Application-level concerns (App.tsx, assets, etc.)
├── features/            # Feature modules
│   ├── feature-name/    # Each feature gets its own directory
│   │   ├── index.ts     # Public API of the feature
│   │   ├── components/  # Components specific to this feature
│   │   ├── screens/     # Screen components for navigation
│   │   ├── hooks/       # Custom hooks 
│   │   ├── helpers/     # Helper functions and utilities
│   │   ├── types.ts     # TypeScript types for this feature
│   │   └── ...          # Other feature-specific files
└── shared/             # Shared utilities and constants
```

## Feature Organization

Each feature directory should:

1. Have an `index.ts` file that exports the public API
2. Contain subdirectories for different concerns (components, screens, etc.)
3. Keep related code together regardless of file type
4. Hide implementation details, exposing only what's necessary

## Import Guidelines

### Inter-feature Imports

When importing from another feature, always import from the feature's index file:

```typescript
// Good
import { HomeScreen } from '@/features/home';

// Avoid
import HomeScreen from '@/features/home/screens/HomeScreen';
```

### Intra-feature Imports

When importing within a feature, use relative paths:

```typescript
// From within the same feature
import { SomeComponent } from '../components/SomeComponent';
```

## Feature Communication

Features should communicate using:

1. **Props**: For parent-child relationships
2. **Context Providers**: For state that needs to be shared across components
3. **Event System**: For loose coupling between features
4. **Navigation Parameters**: For passing data during navigation

## Adding a New Feature

When adding a new feature:

1. Create a directory in `/src/features/`
2. Create an `index.ts` file that exports the public API
3. Add necessary subdirectories (components, screens, etc.)
4. Update navigation if needed

## Existing Features

Here's a brief description of our core features:

- **assessments**: Manages pet health assessments and tracking
- **avatar**: Handles pet avatar selection and display
- **debug**: Contains development debugging tools
- **events**: Event system for cross-feature communication
- **home**: Main screens including HomeScreen, Onboarding, etc.
- **homeHeader**: Header components for the home screen
- **navigation**: Navigation configuration and components
- **pets**: Pet management (add, edit, settings)
- **settings**: Application settings and preferences
- **tips**: Pet care tips and guidance

## Benefits of Feature-Based Organization

- **Easier Onboarding**: New developers can understand features in isolation
- **Better Maintainability**: Changes are isolated to specific features
- **Improved Testability**: Features can be tested independently
- **Clear Boundaries**: Prevents unintended dependencies between unrelated code
- **Scalability**: Makes the codebase easier to expand with new features