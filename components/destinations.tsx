import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants";
import { theme } from "../theme";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

type Place = {
  place_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  types: string[];
  photo_url: string | null;
  user_ratings_total?: number;
};

type Props = {
  activeCategory: string;
};

const DestinationCard: React.FC<{
  item: Place;
  userId: number;
  favorites: string[];
  onToggleFavorite: (placeId: string, isAdding: boolean) => void;
}> = ({ item, userId, favorites, onToggleFavorite }) => {
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    setIsFavourite(favorites.includes(item.place_id));
  }, [favorites, item.place_id]);

  const toggle = async () => {
    const newStatus = !isFavourite;
    try {
      await fetch(`${BASE_URL}/favorites`, {
        method: newStatus ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, placeId: item.place_id }),
      });
      setIsFavourite(newStatus);
      onToggleFavorite(item.place_id, newStatus);
    } catch (e) {
      console.error("Favorite toggle failed", e);
    }
  };

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/destination",
          params: { placeId: item.place_id },
        })
      }
      style={{
        width: width * 0.44,
        height: width * 0.65,
        marginBottom: 20,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#f3f4f6",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
        position: "relative",
      }}
      activeOpacity={0.9}>
      {item.photo_url ? (
        <Image
          source={{ uri: item.photo_url }}
          resizeMode="cover"
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: "#d1d5db",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <Text>No image</Text>
        </View>
      )}

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.85)"]}
        style={{
          position: "absolute",
          bottom: 0,
          height: "45%",
          width: "100%",
        }}
      />

      <TouchableOpacity
        onPress={toggle}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          backgroundColor: "rgba(255,255,255,0.5)",
          padding: 8,
          borderRadius: 999,
        }}>
        <FontAwesome
          name="heart"
          size={20}
          color={isFavourite ? "red" : "white"}
          solid={isFavourite}
        />
      </TouchableOpacity>

      <View style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
        <Text
          style={{
            color: "white",
            fontWeight: "bold",
            fontSize: width * 0.042,
            marginBottom: 4,
          }}>
          {item.name}
        </Text>
        <Text
          style={{
            color: "#e5e7eb",
            fontSize: width * 0.031,
            lineHeight: width * 0.04,
          }}
          numberOfLines={2}>
          {item.address}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const Destinations: React.FC<Props> = ({ activeCategory }) => {
  const [destinations, setDestinations] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  const fetchFavorites = async (uid: number) => {
    try {
      const res = await fetch(`${BASE_URL}/favorites/${uid}`);
      const data = await res.json();
      setFavorites(data.map((place: Place) => place.place_id));
    } catch (e) {
      console.error("Failed to load favorites", e);
    }
  };

  const handleToggleFavorite = async (placeId: string, isAdding: boolean) => {
    await fetchFavorites(userId!);

    if (activeCategory === "Favorites" && !isAdding) {
      setDestinations((prev) =>
        prev.filter((place) => place.place_id !== placeId)
      );
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchUserAndFavorites = async () => {
        const stored = await AsyncStorage.getItem("user");
        if (!stored) return;
        const parsed = JSON.parse(stored);
        const uid = parsed.id;
        setUserId(uid);
        await fetchFavorites(uid);
      };

      fetchUserAndFavorites();
    }, [])
  );

  useEffect(() => {
    const fetchPlaces = async () => {
      if (!userId) return;

      setLoading(true);

      try {
        const isFavorites = activeCategory === "Favorites";
        const url = isFavorites
          ? `${BASE_URL}/places?category=Favorites&userId=${userId}`
          : `${BASE_URL}/places?category=${encodeURIComponent(
              activeCategory
            )}&limit=4`;

        const res = await fetch(url);
        const data = await res.json();
        setDestinations(data);
      } catch (error) {
        console.error("Failed to fetch places", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [activeCategory, userId]);

  return (
    <View style={{ minHeight: 280, paddingHorizontal: 20 }}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#3b82f6"
          style={{ marginTop: 20, alignSelf: "center" }}
        />
      ) : (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}>
          {destinations.map((item) => (
            <DestinationCard
              item={item}
              key={item.place_id}
              userId={userId!}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </View>
      )}

      {!loading && destinations.length === 4 && (
        <View style={{ alignItems: "center", marginTop: 10 }}>
          <TouchableOpacity
            onPress={() =>
              router.push(
                `/allCategories?category=${encodeURIComponent(activeCategory)}`
              )
            }
            style={{
              backgroundColor: theme.buttons1,
              paddingHorizontal: 30,
              paddingVertical: 12,
              borderRadius: 999,
              marginBottom: 20,
            }}>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
              See All
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Destinations;
