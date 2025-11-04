import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";

export default function HomePage() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const bounceAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    // Bounce animation
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(bounceAnim, {
                    toValue: -10,
                    duration: 700,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(bounceAnim, {
                    toValue: 0,
                    duration: 700,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [bounceAnim]);

    // Glow animation
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0.4,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [glowAnim]);

    // ✅ New gesture setup using Gesture API
    // ✅ Gesture setup using Gesture API (supports up + right swipe)
    const panGesture = Gesture.Pan()
        .onEnd((event) => {
            const { translationX, translationY, velocityX, velocityY } = event;

            // Swipe Up → TaskDetails
            if (translationY < -80 && Math.abs(velocityY) > 500) {
                router.push("/TaskDetails");
            }

            // Swipe Right → WelcomePage
            else if (translationX > 80 && Math.abs(velocityX) > 500) {
                router.push("/WelcomePage");
            }
        })
        .minDistance(10)
        .runOnJS(true);



    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <GestureDetector gesture={panGesture}>

                <View style={styles.container}>
                    {/* Calendar Section */}
                    {/* <Text style={styles.swipeHint}>→ Swipe right to go home</Text> */}
                    <Calendar
                        style={styles.calendar}
                        theme={{
                            backgroundColor: "#F3E8FF",
                            calendarBackground: "#F3E8FF",
                            todayTextColor: "#7B61FF",
                            selectedDayBackgroundColor: "#7B61FF",
                            selectedDayTextColor: "#fff",
                            dayTextColor: "#000000",
                            monthTextColor: "#4B0082",
                            arrowColor: "#7B61FF",
                            textMonthFontWeight: "bold",
                            textDayFontSize: 16,
                            textMonthFontSize: 20,
                            textSectionTitleColor: "#7B61FF",
                        }}
                        onDayPress={(day) => setSelectedDate(day.dateString)}
                        markedDates={
                            selectedDate ? { [selectedDate]: { selected: true } } : {}
                        }
                    />

                    {/* Instruction below calendar */}
                    <View style={styles.instructionContainer}>
                        <Text style={styles.instruction}>
                            {selectedDate
                                ? `Selected Date: ${selectedDate}`
                                : "Tap a date to plan your day ✨"}
                        </Text>
                    </View>

                    {/* Floating + Button */}
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() =>
                            router.push({
                                pathname: "/AddTask",
                                params: selectedDate ? { selectedDate } : {},
                            })
                        }
                    >
                        <AntDesign name="plus" size={28} color="#fff" />
                    </TouchableOpacity>

                    {/* Swipe Up Arrow */}
                    <Animated.View
                        style={[
                            styles.arrowContainer,
                            { transform: [{ translateY: bounceAnim }], opacity: glowAnim },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name="arrow-up-bold-circle"
                            size={48}
                            color="#7B61FF"
                        />
                        <Text style={styles.swipeText}>Swipe up to see tasks</Text>

                    </Animated.View>
                </View>
            </GestureDetector>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#e1c6fdff",
        justifyContent: "center",
        alignItems: "center",
        marginTop: -100,   // Move all content upward
    },
    calendar: {
        borderRadius: 12,
        width: "90%",
        elevation: 3,
    },

    instructionContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
    },
    instruction: {
        fontSize: 16,
        color: "#4B0082",
        textAlign: "center",
        fontWeight: "500",
    },
    fab: {
        backgroundColor: "#7B61FF",
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        right: 25,
        bottom: 100,
        elevation: 6,
    },
    arrowContainer: {
        position: "absolute",
        bottom: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    swipeText: {
        fontSize: 14,
        color: "#7B61FF",
        marginTop: 8,
        fontWeight: "500",
    },
    // swipeHint: {
    //     fontSize: 12,
    //     color: "#A188FF",
    //     marginTop: 4,
    //     paddingTop: 4,
    // },
});
