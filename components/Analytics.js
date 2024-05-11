import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { ListItem } from "@rneui/themed";

import { getDatabase, push, ref, onValue } from "firebase/database";
import firebaseApp from "./FirebaseConfig";
import { getAuth } from "firebase/auth";
import { useFocusEffect } from "@react-navigation/native";

const database = getDatabase(firebaseApp);
const auth = getAuth(firebaseApp);

export default function AnalyticsScreen({ navigation }) {
  const [runs, setRuns] = useState([]);

  // Fetch runs data every time the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const user = auth.currentUser;

      const fetchRunsData = () => {
        if (user) {
          const userID = user.uid;
          const userRunsRef = ref(database, `/runs/${userID}`);
          onValue(userRunsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
              setRuns(Object.values(data));
            } else {
              setRuns([]);
            }
          });
        } else {
          // Clear runs data if user is not authenticated
          setRuns([]);
        }
      };

      fetchRunsData();
      const unsubscribe = auth.onAuthStateChanged(fetchRunsData);

      // Cleanup function
      return () => {
        unsubscribe();
      };
    }, [])
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const renderItem = ({ item }) => (
    <ListItem bottomDivider>
      <ListItem.Content>
        <ListItem.Title>Date: {formatDate(item.date)}</ListItem.Title>
        <ListItem.Subtitle>Distance: {item.distance} km</ListItem.Subtitle>
        <ListItem.Subtitle>Duration: {item.duration}</ListItem.Subtitle>
        <ListItem.Subtitle>
          Average Speed:{item.averageSpeed} Km/h
        </ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  );

  return (
    <View>
      <FlatList
        data={runs}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}
