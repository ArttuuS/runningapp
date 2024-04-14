import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./components/Home";
import LoginScreen from "./components/Login";
import AnalyticsScreen from "./components/Analytics";
import LeaderboardScreen from "./components/Leaderboard";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Header } from "@rneui/themed";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Header
        centerComponent={{ text: "Running App", style: { color: "#fff" } }}
      />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Home") {
              iconName = "home";
            } else if (route.name === "Analytics") {
              iconName = "analytics";
            } else if (route.name === "Leaderboard") {
              iconName = "podium";
            } else if (route.name === "Login") {
              iconName = "log-in";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Analytics" component={AnalyticsScreen} />
        <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Tab.Screen name="Login" component={LoginScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
