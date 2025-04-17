# Ralph - Pet Quality of Life

<p align="center">
  <img src="src/core/assets/images/logo.png" alt="Ralph App Logo" width="200"/>
</p>

## 🐾 About Ralph

Ralph is an easy-to-use app that helps pet owners understand and monitor their elderly or sick pet's quality of life. It guides you in making the best decisions for their care, including knowing when it might be time to consult your vet about serious decisions.

### Key Features

- **Quality of Life Assessments**: Track your pet's wellbeing over time
- **Vet Visit Preparation**: Compile health data to share with your veterinarian  
- **Multilingual Support**: Available in English, German, Spanish, and Dutch
- **Data Visualization**: See trends in your pet's health with intuitive charts
- **PDF Export**: Generate reports to share with your vet

## 📱 App Availability

- [iOS App Store](https://apps.apple.com/us/app/ralph-pet-quality-of-life/id6480064704)
- [Google Play Store](https://play.google.com/store/apps/details?id=eu.sboo.ralph)
- [Website](https://ralph.pet/)

## 🏗️ Project Structure

```
src/
├── core/             # Core infrastructure
│   ├── database/     # WatermelonDB configuration and models
│   ├── legacy-realm/ # Legacy database for migration
│   ├── localization/ # i18n configuration
│   ├── providers/    # Context providers
│   ├── themes/       # Theme configuration
│   └── ...
├── features/         # Feature modules
│   ├── assessments/  # Pet health assessments
│   ├── pets/         # Pet management
│   ├── navigation/   # Navigation configuration
│   └── ...
└── shared/           # Shared components and utilities
```

## 🛠️ Technology Stack

- React Native
- TypeScript
- WatermelonDB (database)
- i18next (localization)
- React Navigation

## 🔧 Setup & Installation

### Prerequisites

- Node.js 16 or newer
- Yarn (preferred) or npm
- For iOS: macOS, Xcode 13+
- For Android: Android Studio, JDK 11

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/sboo/ralph.git
   cd ralph
   ```

2. Install dependencies:
   ```sh
   yarn install
   ```

3. Set up environment:
   ```sh
   cp .env.example .env
   # Configure your .env file
   ```

4. Run the app:
   - For iOS:
     ```sh
     cd ios && pod install && cd ..
     yarn ios
     ```
   - For Android:
     ```sh
     yarn android
     ```

## 🧪 Testing

```sh
# Run unit tests
yarn test

# Run specific tests
yarn test -t "component name"
```

## 📋 Development Workflow

1. Create a new branch for your feature: `git checkout -b feature/your-feature-name`
2. Make your changes and commit: `git commit -m "Add your feature"`
3. Push to your branch: `git push origin feature/your-feature-name`
4. Create a Pull Request against the main branch

## 🤝 Contributing

We welcome contributions to improve Ralph! Please:

1. Check existing issues or create a new one to discuss your ideas
2. Follow our code style and structure
3. Write tests for new features
4. Update documentation as needed
5. Submit a pull request

For more details, see our [Contributing Guidelines](CONTRIBUTING.md).

## 📄 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE.md) file for details.

## 🌐 Links

- [Website](https://ralph.pet/)
- [Privacy Policy](https://ralph.pet/privacy)
- [Support](mailto:support@ralph.pet)

---

<p align="center">
  Made with ❤️ for pets and their humans
</p>
