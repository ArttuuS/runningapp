import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import firebaseApp from "./FirebaseConfig";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { Input, Button } from "@rneui/themed";

const auth = getAuth(firebaseApp);
const database = getDatabase(firebaseApp);

export default function LoginScreen({ navigation }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Track user authentication state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // State for handling errors

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setEmail(user.email); // Fetch and set the user's email
      } else {
        setIsAuthenticated(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential);
        const user = userCredential.user;
        const userID = user.uid;
        const userRunsRef = ref(database, `/runs/${userID}`);
        onValue(userRunsRef, (snapshot) => {
          if (!snapshot.exists()) {
            set(userRunsRef, {});
          }
        });
        setEmail(user.email); // Update email state
        setIsAuthenticated(true); // Update state after successful sign in
        setPassword("");
        setError(null); // Clear any previous errors
      })
      .catch((error) => setError(error.message));
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("sign out successful");
        setIsAuthenticated(false); // Update state after sign out
      })
      .catch((error) => console.log(error));
  };

  return (
    <View style={styles.container}>
      {!isAuthenticated && (
        <>
          <View style={styles.registerButton}>
            <Text style={styles.registerText}>Don't have an account yet?</Text>
            <Button
              title="Register"
              onPress={() => navigation.navigate("Register")}
            />
          </View>
          <Text style={styles.title}>Login</Text>
          {error && <Text style={styles.error}>{error}</Text>}
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
          <Button title="Sign In" onPress={handleSignIn} />
        </>
      )}

      {isAuthenticated && (
        <>
          <View style={styles.signedInText}>
            <Text>{`Signed in as ${email}`}</Text>
          </View>
          <Button onPress={handleSignOut} title="Sign Out" />
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
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    marginTop: 10,
    marginLeft: 70,
  },
  registerText: {
    marginRight: 10,
  },
  signedInText: {
    marginBottom: 20,
  },
});
