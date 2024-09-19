import "react-native-reanimated";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  getCooridnates,
  getYesterdayWeather,
  getTodayWeather,
} from "@/api/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function RootLayout() {
  const [location, setLocation] = useState<string | null>(null);
  const [todayTemp, setTodayTemp] = useState<number | null>(null);
  const [yesterdayTemp, setYesterdayTemp] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("위치 정보에 접근할 수 있는 권한이 없습니다!😭");
      return;
    }

    let {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({});

    const [{ region, city }] = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    );
    setLocation(`${region} ${city}`); // 예: 경기도 고양시
  };

  const getTemperatures = async () => {
    let {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({});

    const coordinates = await getCooridnates(latitude, longitude);
    if (coordinates) {
      const { x, y } = coordinates;
      const yesterdayTempData = await getYesterdayWeather(x, y);
      setYesterdayTemp(yesterdayTempData);

      const todayTempData = await getTodayWeather(latitude, longitude);
      setTodayTemp(todayTempData);
    } else {
      console.error("좌표를 가져올 수 없습니다.");
    }
  };

  useEffect(() => {
    getLocation(); // 위치 정보를 가져오는 로직
    getTemperatures(); // 온도 정보를 가져오는 로직
  }, []);

  let locationText = errorMsg || location || "로딩중...";

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
          <Text style={styles.temp}>
            {todayTemp !== null ? `${todayTemp}℃` : ""}
          </Text>
          {todayTemp !== null && yesterdayTemp !== null && (
            <Text style={styles.description}>
              {todayTemp > yesterdayTemp
                ? `어제보다 ${(todayTemp - yesterdayTemp).toFixed(
                    1
                  )}℃ 더 높아요🥵`
                : `어제보다 ${(yesterdayTemp - todayTemp).toFixed(
                    1
                  )}℃ 더 낮아요🥶`}
            </Text>
          )}
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
  weather: {},
  day: {
    width: SCREEN_WIDTH,
    alignItems: "center",
  },
  temp: {
    marginTop: 50,
    fontSize: 100,
  },
  description: {
    marginTop: 30,
    fontSize: 30,
  },
});
