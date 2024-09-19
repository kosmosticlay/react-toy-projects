import "react-native-reanimated";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import * as Location from "expo-location";
import { useEffect, useState } from "react";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function RootLayout() {
  const [location, setLocation] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }

    let {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({});
    const [{ region, city }] = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    );
    const location = `${region} ${city}`; // 경기도 고양시
    setLocation(location);
  };

  useEffect(() => {
    getLocation();
  }, []);

  let locationText = "Waiting..";
  if (errorMsg) {
    locationText = errorMsg;
  } else if (location) {
    locationText = JSON.stringify(location);
  }

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{locationText}</Text>
      </View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.weather}
      >
        <View style={styles.day}>
          <Text style={styles.temp}>27</Text>
          <Text style={styles.description}>Sunny</Text>
        </View>
        <View style={styles.day}>
          <Text style={styles.temp}>27</Text>
          <Text style={styles.description}>Sunny</Text>
        </View>
        <View style={styles.day}>
          <Text style={styles.temp}>27</Text>
          <Text style={styles.description}>Sunny</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "tomato",
  },
  city: {
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    fontSize: 38,
    fontWeight: "500",
  },
  weather: {
    // flex: 3,
    backgroundColor: "blue",
  },
  day: {
    width: SCREEN_WIDTH,
    alignItems: "center",
  },
  temp: {
    marginTop: 50,
    fontSize: 178,
  },
  description: {
    marginTop: -30,
    fontSize: 60,
  },
});
