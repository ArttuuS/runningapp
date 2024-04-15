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
        accuracy: Location.Accuracy.BestForNavigation,
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
      interval = setInterval(() => updateLocation(routeCoordinates), 500); // Pass routeCoordinates as an argument
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTracking, routeCoordinates]); // Add routeCoordinates to the dependency array

  async function updateLocation(prevCoordinates) {
    try {
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      setLocation(location.coords);

      // Use callback form of setRouteCoordinates to ensure it's based on the latest state
      setRouteCoordinates((prevCoordinates) => [
        ...prevCoordinates,
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      ]);

      // Pass prevCoordinates as an argument and use it within setDistance callback
      setDistance((prevDistance) => {
        if (prevCoordinates.length > 0) {
          const previousCoordinate =
            prevCoordinates[prevCoordinates.length - 1];
          const newCoordinate = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          const newDistance = calculateDistance(
            previousCoordinate,
            newCoordinate
          );
          return prevDistance + newDistance;
        } else {
          return prevDistance;
        }
      }, routeCoordinates); // Pass routeCoordinates as the second argument to updateLocation
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

  // Function to interpolate points between two coordinates
  function interpolatePoints(coord1, coord2, numPoints) {
    const latDelta = (coord2.latitude - coord1.latitude) / (numPoints + 1);
    const lonDelta = (coord2.longitude - coord1.longitude) / (numPoints + 1);
    const interpolatedPoints = [];

    for (let i = 1; i <= numPoints; i++) {
      interpolatedPoints.push({
        latitude: coord1.latitude + latDelta * i,
        longitude: coord1.longitude + lonDelta * i,
      });
    }

    return interpolatedPoints;
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

  // Interpolating points for smoother polyline
  const interpolatedRouteCoordinates = [];
  for (let i = 0; i < routeCoordinates.length - 1; i++) {
    const interpolatedPoints = interpolatePoints(
      routeCoordinates[i],
      routeCoordinates[i + 1],
      10 // Number of points to interpolate between each pair of coordinates
    );
    interpolatedRouteCoordinates.push(...interpolatedPoints);
  }

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
        {interpolatedRouteCoordinates.length > 1 && (
          <Polyline
            coordinates={interpolatedRouteCoordinates}
            strokeColor="#0000FF"
            strokeWidth={8}
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
