# Legacy Realm Database

## Purpose

This folder contains code related to the legacy Realm database implementation that is being phased out in favor of WatermelonDB. It is maintained solely for the purpose of migrating existing users' data from Realm to WatermelonDB.

## Context

Ralph previously used Realm as its primary database solution. As the app evolved, we made the decision to transition to WatermelonDB for the following reasons:

- Better performance with large datasets
- Improved TypeScript support
- Simpler synchronization capabilities
- More flexible querying options

However, to ensure a smooth experience for existing users, we need to maintain compatibility with the previous database structure until all users have been migrated.

## Migration Process

The migration process is managed by `MigrationProvider.tsx` in the core/providers directory:

1. When a user opens the app, the provider checks if migration has already been completed by looking for the `ralph_realm_to_watermelon_migration_complete` flag in AsyncStorage
2. If the migration hasn't been completed:
   - The provider displays the MigrationScreen to the user
   - The `migrateFromRealm()` utility function reads data from Realm models
   - This data is transformed to match the WatermelonDB schema
   - The data is then written to the new WatermelonDB database
   - If successful, the migration is marked as complete in AsyncStorage
   - If unsuccessful, it will attempt migration again on next app launch

## File Structure

- `models/` - Contains the Realm model definitions for Pet and Measurement
- `helper.ts` - Utility functions for working with Realm data
- `providers/` - Contains legacy migration components

Note that the main `MigrationProvider.tsx` is located in `core/providers/` for better architectural organization.

## Removal Timeline

This folder and all related code will be removed once we're confident that all users have been migrated to the new database system.

## Development Notes

- Do not add new features to this code
- Bug fixes should only be made if critical for the migration process
- Use the `@deprecated` JSDoc tag on all functions in this directory
- All new database operations should use the WatermelonDB implementation in `core/database/`
- The migration process uses AsyncStorage to track migration status with the key `ralph_realm_to_watermelon_migration_complete`
- If you need to test migration, you can clear this flag from AsyncStorage

## Questions?

If you have questions about the migration process or this code, please contact the lead developer or refer to the migration documentation in the project wiki.