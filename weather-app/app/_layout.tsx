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
  const [temperatures, setTemperatures] = useState<{
    today: number | null;
    yesterday: number | null;
  }>({
    today: null,
    yesterday: null,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { today: todayTemp, yesterday: yesterdayTemp } = temperatures;

  const getLocation = async () => {
    // 사용자에게 위치 정보 접근 권한 요청
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
    setLocation(`${region} ${city}`);
  };

  const getTemperatures = async () => {
    let {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({});

    const coordinates = await getCooridnates(latitude, longitude);
    if (coordinates) {
      const { x, y } = coordinates;
      const yesterdayTempData = await getYesterdayWeather(x, y);
      const todayTempData = await getTodayWeather(latitude, longitude);

      setTemperatures({
        yesterday: yesterdayTempData,
        today: todayTempData,
      });
    } else {
      console.error("좌표를 가져올 수 없습니다.");
    }
  };

  useEffect(() => {
    getLocation();
    getTemperatures();
  }, []);

  // 온도 차이 계산
  let temperatureMessage = "";
  if (todayTemp && yesterdayTemp) {
    const tempDifference = (todayTemp - yesterdayTemp).toFixed(1);
    temperatureMessage =
      todayTemp > yesterdayTemp
        ? `어제보다 ${tempDifference}℃ 더 높아요🥵`
        : `어제보다 ${tempDifference}℃ 더 낮아요🥶`;
  }

  // 위치 및 오류 메시지 처리
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
          <Text style={styles.description}>{temperatureMessage}</Text>
        </View>
        {/* mock data start */}
        <View style={styles.day}>
          <Text style={styles.temp}>27</Text>
          <Text style={styles.description}>Sunny</Text>
        </View>
        <View style={styles.day}>
          <Text style={styles.temp}>27</Text>
          <Text style={styles.description}>Sunny</Text>
        </View>
        {/* mock data end */}
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
