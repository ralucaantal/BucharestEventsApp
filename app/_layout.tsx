import { Stack } from "expo-router";
// Import the global.css file in the index.js file:
import "../global.css";

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }}/>;
}
