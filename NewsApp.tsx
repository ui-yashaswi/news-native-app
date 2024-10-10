// src/NewsApp.tsx
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import useSWR from "swr";
import axios from "axios";
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const NewsApp: React.FC = () => {
  const { data, error, isValidating, mutate } = useSWR(
    "https://newsapi.org/v2/top-headlines?country=us&apiKey=bc595c1fd1d34bf186d326147057bc88",
    fetcher
  );

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const translateX = useSharedValue(0); // Shared value for circle animation

  const onSwipeRight = () => {
    // Show the next article
    if (data && currentIndex < data.articles.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      translateX.value = withSpring(0); // Reset circle position
    } else if (data) {
      loadNewData();
    }
  };

  const onSwipeLeft = () => {
    // Show the previous article
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
      translateX.value = withSpring(0); // Reset circle position
    }
  };

  const loadNewData = async () => {
    setIsLoading(true);
    await mutate(); // Fetch new data
    setIsLoading(false);
  };

  const animatedCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const handleGestureEvent = (event: any) => {
    const { translationX } = event.nativeEvent;

    // Limit the swipe range
    if (translationX < 0 && currentIndex > 0) {
      translateX.value = translationX;
    } else if (translationX > 0 && currentIndex < data?.articles.length - 1) {
      translateX.value = translationX;
    }
  };

  const handleGestureEnd = (event: any) => {
    const { translationX } = event.nativeEvent;

    if (translationX > 50) {
      onSwipeRight();
    } else if (translationX < -50) {
      onSwipeLeft();
    } else {
      translateX.value = withSpring(0);
    }
  };

  if (error) return <Text>Error loading news: {error.message}</Text>;
  if (!data && isValidating)
    return <ActivityIndicator size="large" color="#007AFF" />;

  const currentArticle = data?.articles[currentIndex];

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          currentArticle && (
            <View style={styles.articleContainer}>
              {currentArticle.urlToImage ? (
                <Image
                  source={{ uri: currentArticle.urlToImage }}
                  style={styles.image}
                  resizeMode="cover"
                  onLoad={() => console.log("Image loaded successfully")}
                  onError={(error) => console.log("Error loading image", error)}
                />
              ) : (
                <Image
                  source={{ uri: "https://via.placeholder.com/150" }}
                  style={styles.image}
                  resizeMode="cover"
                />
              )}
              <Text style={styles.headline}>{currentArticle.title}</Text>
              <Text style={styles.description}>
                {currentArticle.description}
              </Text>
            </View>
          )
        )}
        <PanGestureHandler
          onGestureEvent={handleGestureEvent}
          onEnded={handleGestureEnd}
        >
          <View style={styles.button}>
            <Animated.View style={[styles.circle, animatedCircleStyle]} />
            <Text style={styles.buttonText}>Swipe </Text>
          </View>
        </PanGestureHandler>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  articleContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  image: {
    width: 300,
    height: 400,

    objectFit: "cover",
    borderRadius: 10,
    marginBottom: 10,
  },
  headline: {
    marginTop: 20,

    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: 10,
    width: 300,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  circle: {
    position: "absolute",
    borderRadius: 25,
    width: 50,
    height: 50,
    top: "50%",
    left: "50%",
    backgroundColor: "pink",

    

    transform: [{ translateX: -25 }, { translateY: -25 }], 
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
  },
});

export default NewsApp;
