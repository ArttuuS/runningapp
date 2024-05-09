import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import firebaseApp from "./FirebaseConfig";

const auth = getAuth(firebaseApp);

export default function LoginScreen() {
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
        setIsAuthenticated(true); // Update state after successful sign in
        setEmail(""); // Clear input fields after sign in (optional)
        setPassword("");
        setError(null); // Clear any previous errors
      })
      .catch((error) => setError(error.message));
  };

  const handleSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential);
        setEmail(""); // Clear input fields after sign up (optional)
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
      <Text style={styles.title}>Login</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSignUp} />
      <Button title="Sign In" onPress={handleSignIn} />
      <View>
        {isAuthenticated ? (
          <>
            <Text>{`Signed In as ${email}`}</Text>
            <Button onPress={handleSignOut} title="Sign Out" />
          </>
        ) : (
          <Text>Signed Out</Text>
        )}
      </View>
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
});
