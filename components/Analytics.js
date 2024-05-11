import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { FlatList } from "react-native";

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

  return (
    <View>
      <FlatList
        data={runs}
        renderItem={({ item }) => (
          <Text>
            {item.date} {item.distance} {item.duration} {item.averageSpeed}
          </Text>
        )}
      />
    </View>
  );
}
