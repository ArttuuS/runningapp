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

import { initializeApp } from "firebase/app";
import { getDatabase, push, ref, onValue } from "firebase/database";
import firebaseConfig from "./FirebaseConfig";

export default function HomeScreen() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const mapRef = useRef(null);

  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  function saveRunToFirebase() {
    const newRun = {
      date: new Date().toISOString(),
      distance: distance.toFixed(2),
      duration: formatDuration(duration),
      averageSpeed: averageSpeed.toFixed(2),
    };

    push(ref(database, "/runs"), newRun)
      .then(() => {
        console.log("Run saved successfully!");
      })
      .catch((error) => {
        console.error("Error saving run: ", error);
      });
  }

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
      setDuration(0);
      setStartTime(Date.now());
    } else {
      setIsTracking(false);
      setStartTime(null);

      saveRunToFirebase();
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
      setDuration((Date.now() - startTime) / 1000);
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

  const averageSpeed = duration !== 0 ? (distance / duration) * 3600 : 0;

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
        <Text style={styles.text}>
          Distance Travelled: {distance.toFixed(2)} km
        </Text>
        <Text style={styles.text}>Duration: {formatDuration(duration)}</Text>
        <Text style={styles.text}>
          Average Speed: {averageSpeed.toFixed(2)} km/h
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title={isTracking ? "Stop Tracking" : "Start Tracking"}
          onPress={startTracking}
        />
      </View>
    </View>
  );
}

function formatDuration(durationInSeconds) {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = durationInSeconds % 60;
  return `${hours}:${minutes}:${seconds}`;
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
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "rgba(128, 128, 128, 0.5)",
  },
  buttonContainer: {
    position: "absolute",
    left: 120,
    top: 40,
    width: 200,
    height: 100,
  },
  text: {
    fontSize: 16,
  },
});
