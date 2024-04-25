import { View, Text } from "react-native";
import { initializeApp } from "firebase/app";
import { getDatabase, push, ref, onValue } from "firebase/database";
import firebaseConfig from "./FirebaseConfig";
import { useEffect, useState } from "react";
import { FlatList } from "react-native";

export default function AnalyticsScreen() {
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  const [runs, setRuns] = useState([]);

  useEffect(() => {
    onValue(ref(database, "/runs"), (snapshot) => {
      const data = snapshot.val();
      setRuns(Object.values(data));
    });
  }, []);

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
