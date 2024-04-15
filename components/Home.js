import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Button,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import navigationArrow from "../assets/arrow.png";

export default function HomeScreen() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distance, setDistance] = useState(0);

  const mapRef = useRef(null);

  useEffect(() => {
    getLocation();
  }, []);

  async function getLocation() {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("No permission to get location");
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(location.coords);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function startTracking() {
    if (!isTracking) {
      setIsTracking(true);
      setRouteCoordinates([]);
      setDistance(0);
    } else {
      setIsTracking(false);
    }
  }

  useEffect(() => {
    let interval;
    if (isTracking) {
      interval = setInterval(updateLocation, 5000); // Update location every 5 seconds
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  async function updateLocation() {
    try {
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(location.coords);
      setRouteCoordinates((prevCoordinates) => [
        ...prevCoordinates,
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      ]);

      if (routeCoordinates.length > 1) {
        const previousCoordinate =
          routeCoordinates[routeCoordinates.length - 2];
        const newCoordinate = routeCoordinates[routeCoordinates.length - 1];
        const newDistance = calculateDistance(
          previousCoordinate,
          newCoordinate
        );
        setDistance(distance + newDistance);
      }
    } catch (error) {
      console.error("Error updating location: ", error);
    }
  }

  function calculateDistance(prevCoords, newCoords) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(newCoords.latitude - prevCoords.latitude);
    const dLon = deg2rad(newCoords.longitude - prevCoords.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(prevCoords.latitude)) *
        Math.cos(deg2rad(newCoords.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const initialRegion = {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.0322,
    longitudeDelta: 0.0221,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion} ref={mapRef}>
        {location && (
          <Marker
            coordinate={location}
            title="Current location"
            image={navigationArrow}
          />
        )}
        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#000"
            strokeWidth={2}
          />
        )}
      </MapView>
      <View style={styles.infoContainer}>
        <Text>Distance Travelled: {distance.toFixed(2)} km</Text>
        <Button
          title={isTracking ? "Stop Tracking" : "Start Tracking"}
          onPress={startTracking}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    position: "absolute",
    top: 20,
    left: 10,
    right: 10,
    alignItems: "center",
  },
});
