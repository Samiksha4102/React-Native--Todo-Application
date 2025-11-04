import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function WelcomePage() {
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <LinearGradient
            colors={["#7B61FF", "#A88BFF", "#DCC7FF"]}
            style={styles.container}
        >
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <Text style={styles.logo}>📝</Text>

                <Text style={styles.title}>Welcome to ToDo App</Text>
                <Text style={styles.subtitle}>Plan it. Do it. Achieve it.</Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.replace("/HomePage")}
                    activeOpacity={0.85}
                >
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 30,
    },
    logo: {
        fontSize: 70,
        marginBottom: 20,
    },
    title: {
        fontSize: 34,
        fontWeight: "800",
        color: "#fff",
        marginBottom: 12,
        textAlign: "center",
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 18,
        color: "#F5F2FF",
        marginBottom: 50,
        textAlign: "center",
        lineHeight: 25,
    },
    button: {
        backgroundColor: "#fff",
        paddingVertical: 15,
        paddingHorizontal: 60,
        borderRadius: 35,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonText: {
        color: "#7B61FF",
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
    },
});
