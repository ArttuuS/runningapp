import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import firebaseApp from "./FirebaseConfig";
import { getDatabase, ref, push, onValue, set } from "firebase/database";
const auth = getAuth(firebaseApp);
const database = getDatabase(firebaseApp);
import { Input, Button } from "@rneui/themed";

export default function RegisterScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Track user authentication state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // State for username
  const [error, setError] = useState(null); // State for handling errors

  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.goBack(); // Navigate back to the login screen if user is authenticated
      }
    });

    return unsubscribe;
  }, []);

  const handleSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential);
        const user = userCredential.user;
        const userID = user.uid;

        // Save the username to the database
        set(ref(database, `users/${userID}`), {
          email: email,
          username: username,
        })
          .then(() => {
            console.log("Username saved successfully!");
          })
          .catch((error) => {
            console.error("Error saving username: ", error);
          });

        setEmail(""); // Clear input fields after sign up (optional)
        setPassword("");
        setUsername("");
        setError(null); // Clear any previous errors
      })
      .catch((error) => setError(error.message));
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.backButton}>
        <Button title="Back" onPress={handleBack} />
      </View>
      <Text style={styles.title}>Register</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <Input
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={(text) => setUsername(text)}
        autoCapitalize="none"
      />
      <Input
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSignUp} />
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
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    marginTop: 20,
    marginLeft: 20,
  },
});
