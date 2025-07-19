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
- Npm
- For iOS: macOS, Xcode 13+
- For Android: Android Studio, JDK 11

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Development Client

1. Run prebuild:

```bash
npx expo prebuild
```

2. Run on the desired platform:
```bash
npx expo run:ios
# or
npx expo run:android
```

This will build the app and launch it in the simulator or on your connected device.

### Building for Production

#### iOS

1. Open the Xcode workspace:
   ```bash
   open ios/Ralph.xcworkspace
   ```
2. Select the "Product" menu and choose "Archive"
3. Follow the prompts to distribute your app

#### Android

1. Create a production build:
   ```bash
   npx react-native build-android --mode=release
   ```
2. The AAB will be available at `android/app/build/outputs/bundle/release/app-release.aab`


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
- [Privacy Policy](https://ralph.pet/#privacy)
- [Support](mailto:support@ralph.pet)

---

<p align="center">
  Made with ❤️ for pets and their humans
</p>
