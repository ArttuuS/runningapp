import { View, Text } from "react-native";
import { getDatabase, push, ref, onValue } from "firebase/database";
import { useEffect, useState } from "react";
import { FlatList } from "react-native";

import firebaseApp from "./FirebaseConfig";

export default function AnalyticsScreen() {
  const database = getDatabase(firebaseApp);

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
