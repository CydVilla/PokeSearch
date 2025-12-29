# PokéSearch

A modern, mobile-friendly Pokémon search application that allows users to look up detailed information about their favorite Pokémon. Built with React and the PokéAPI.

![PokéSearch Screenshot](https://raw.githubusercontent.com/CydVilla/PokeSearch/main/screenshot.png)

## Features

- 🔍 Real-time Pokémon search with autocomplete suggestions
- 🃏 **NEW: Pokémon Card Scanner** - Scan physical cards to get pricing information
  - Upload card images from your device
  - Use your camera to capture cards in real-time
  - Get market pricing from multiple sources (TCGPlayer, eBay, Card Market)
  - View trending value and price history
  - AI-powered card recognition (demo mode with mock data)
- 📱 Fully responsive design for mobile and desktop
- 🎨 Beautiful UI with smooth animations and transitions
- 📊 Detailed Pokémon information including:
  - Types with color-coded badges
  - Height and weight
  - Base experience
  - Abilities
  - Interactive sprite view (hover to see back view)
- ⚡ Fast and efficient search using the PokéAPI
- 🌙 Modern, clean interface with excellent readability

## Live Demo

Visit the live application at: [https://CydVilla.github.io/PokeSearch](https://CydVilla.github.io/PokeSearch)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/CydVilla/PokeSearch.git
cd PokeSearch
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open in your default browser at `http://localhost:3000`.

## Deployment

This project is configured for deployment to GitHub Pages. To deploy:

1. Make sure all your changes are committed to the main branch
2. Run the deployment command:
```bash
npm run deploy
```

This will build the project and deploy it to the `gh-pages` branch, making it available at `https://CydVilla.github.io/PokeSearch`.

## Technologies Used

- React.js
- PokéAPI
- Axios for API requests
- CSS3 with modern features
- GitHub Pages for hosting
- Media Devices API for camera access
- FileReader API for image upload

## Card Scanner Feature

The Pokémon Card Scanner allows you to:

1. **Upload a photo** of your Pokémon card from your device
2. **Use your camera** to capture a card image in real-time
3. **Scan the card** to identify it and get pricing information
4. **View pricing data** from multiple marketplaces:
   - Market price (average)
   - Low, mid, and high price ranges
   - Individual prices from TCGPlayer, eBay, and Card Market
   - 30-day price trend indicator

### Implementation Notes

The current implementation uses **mock data for demonstration purposes**. In a production environment, this feature would integrate with:

- **AI Image Recognition Services** (e.g., Google Vision API, AWS Rekognition) to identify card details from the image
- **Card Pricing APIs** (e.g., TCGPlayer API, eBay API, PokemonPrices.com) to fetch real-time market prices
- **Card Database APIs** to match identified cards with accurate set information and rarity

This provides a proof-of-concept for the card scanning and pricing lookup workflow.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [PokéAPI](https://pokeapi.co/) for providing the Pokémon data
- [React](https://reactjs.org/) for the amazing framework
- [GitHub Pages](https://pages.github.com/) for hosting
