import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";
import firebaseApp from "./FirebaseConfig";
import { useFocusEffect } from "@react-navigation/native";

const database = getDatabase(firebaseApp);

export default function LeaderboardScreen() {
  const [leaderboardData, setLeaderboardData] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const runsRef = ref(database, "runs");
      onValue(runsRef, (snapshot) => {
        const runs = snapshot.val();
        if (runs) {
          const distances = {}; // Object to store total distance for each user // Calculate total distance for each user

          Object.values(runs).forEach((run) => {
            const { username, distance } = run;
            distances[username] =
              (distances[username] || 0) + parseFloat(distance);
          }); // Convert distances object to an array of objects

          const leaderboard = Object.entries(distances).map(
            ([username, distance]) => ({
              username: username, // For simplicity, use userID as username
              distance: distance.toFixed(2), // Convert distance to string with two decimal places
            })
          ); // Sort the leaderboard by distance in descending order

          leaderboard.sort(
            (a, b) => parseFloat(b.distance) - parseFloat(a.distance)
          );
          setLeaderboardData(leaderboard);
        }
      });
    }, [])
  );

  return (
    <View style={styles.container}>
      {leaderboardData.length === 0 ? (
        <Text>No recorded runs</Text>
      ) : (
        <>
          <Text style={styles.title}>Leaderboard</Text>
          {leaderboardData.map((entry, index) => (
            <View key={index} style={styles.entry}>
              <Text style={styles.username}>{entry.username}</Text>
              <Text style={styles.runs}>{entry.distance} km</Text>
            </View>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  entry: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  username: {
    marginRight: 10,
  },
  runs: {
    fontWeight: "bold",
  },
});
