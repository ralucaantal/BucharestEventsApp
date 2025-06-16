export const sortCategoryData = ['All', 'Popular', 'Recommended', 'Favorites'];

//telefon sap
//export const BASE_URL = 'http://172.20.10.5:3000';
//bucuresti
export const BASE_URL = 'http://192.168.1.129:3000';
//bacau
//  export const BASE_URL = 'http://192.168.1.168:3000';

export const categoriesData = [
    { title: '🏛 Monuments', image: require('../assets/images/categories/monuments.png') },
    { title: '🖼 Museums', image: require('../assets/images/categories/museums.png') },
    { title: '🍴 Restaurants', image: require('../assets/images/categories/restaurants.png') },
    { title: '🌳 Parks', image: require('../assets/images/categories/parks.png') },
    { title: '🎭 Culture', image: require('../assets/images/categories/culture.png') },
    { title: '🎬 Cinemas', image: require('../assets/images/categories/cinemas.png') },
    { title: '☕ Cafes', image: require('../assets/images/categories/cafes.png') },
    { title: '🍻 Bars & Pubs', image: require('../assets/images/categories/barsPubs.png') },
    { title: '🛍 Shops & Markets', image: require('../assets/images/categories/shopsMarkets.png') },
    { title: '🎨 Art Galleries', image: require('../assets/images/categories/artGalleries.png') },
    { title: '📚 Libraries', image: require('../assets/images/categories/libraries.png') },
    { title: '🧘‍♀️ Wellness', image: require('../assets/images/categories/wellness.png') },
  ];
  
  export const destinationData = [
    {
      title: 'Palace of Parliament',
      duration: 'Visit Time: ~1h',
      distance: '2 KM',
      weather: '22°C',
      price: 0,
      shortDescription: "The Palace of Parliament is the heaviest building in the world and a symbol of Romania’s past.",
      longDescription: "Built during the Ceaușescu regime, the Palace of Parliament is the second largest administrative building in the world. Visitors can take guided tours and explore its grand halls, museums, and historical significance.",
      latitude: 44.4274,
      longitude: 26.0875,
      image: require('../assets/images/destinations/parliament.png'),
    },
    {
      title: 'National Museum of Art',
      duration: 'Visit Time: ~1.5h',
      distance: '1.5 KM',
      weather: '22°C',
      price: 25,
      shortDescription: "Romania's leading art museum, located in the former Royal Palace in Revolution Square.",
      longDescription: "The National Museum of Art of Romania holds impressive collections of medieval, modern, and contemporary Romanian art, as well as European art. Located in the heart of Bucharest.",
      latitude: 44.4397,
      longitude: 26.0962,
      image: require('../assets/images/destinations/artmuseum.png'),
    },
    {
      title: 'Herăstrău (King Michael I Park)',
      duration: 'Stay Time: Flexible',
      distance: '4 KM',
      weather: '23°C',
      price: 0,
      shortDescription: "The largest park in Bucharest, ideal for walking, boating, and relaxation.",
      longDescription: "Herăstrău Park surrounds Lake Herăstrău and offers beautiful walking paths, restaurants, bike rentals, and the open-air Village Museum showcasing traditional Romanian houses.",
      latitude: 44.4745,
      longitude: 26.0808,
      image: require('../assets/images/destinations/herastrau.png'),
    },
    {
      title: 'Street Delivery 2024',
      duration: '12-14 July',
      distance: 'Central Area',
      weather: '28°C',
      price: 0,
      shortDescription: "An urban culture festival that brings creativity and community to the streets of Bucharest.",
      longDescription: "Street Delivery transforms the streets of Bucharest into open pedestrian areas filled with live music, art, street food, architecture, workshops, and urban activism. A must-see for anyone exploring local culture.",
      latitude: 44.4351,
      longitude: 26.0987,
      image: require('../assets/images/destinations/streetdelivery.png'),
    },
  ];
  