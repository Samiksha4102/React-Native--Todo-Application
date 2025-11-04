import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function AddTask() {
    const { selectedDate } = useLocalSearchParams();
    const router = useRouter();

    const [task, setTask] = useState("");
    const [priority, setPriority] = useState("");
    const [category, setCategory] = useState("");
    const [repeat, setRepeat] = useState("");

    const [modalVisible, setModalVisible] = useState(false);
    const [currentModal, setCurrentModal] = useState("");

    const handleAddTask = async () => {
        if (!task.trim()) {
            alert("Please enter a task");
            return;
        }

        try {
            const response = await fetch("http://192.168.1.13:5000/api/tasks/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    taskName: task,
                    date: selectedDate || "",
                    time: new Date().toLocaleTimeString(),
                    priority: priority || "",
                    category: category || "",
                    repeat: repeat || "",
                }),
            });

            const data = await response.json();
            if (data.success) {
                alert("✅ Task added successfully!");
                router.push("/HomePage");
            } else {
                alert("❌ Failed to add task.");
            }
        } catch (error) {
            console.error("Error adding task:", error);
            alert("⚠️ Something went wrong!");
        }
    };

    const openModal = (type: string) => {
        setCurrentModal(type);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setCurrentModal("");
    };

    const renderModalOptions = () => {
        let options: string[] = [];

        switch (currentModal) {
            case "priority":
                options = ["Low", "High", "Very High"];
                break;
            case "category":
                options = ["Work", "Personal", "Wishlist"];
                break;
            case "repeat":
                options = ["Hours", "Daily", "Weekly", "Yearly"];
                break;
            default:
                return null;
        }

        return (
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>
                        Select {currentModal.charAt(0).toUpperCase() + currentModal.slice(1)}
                    </Text>
                    <ScrollView>
                        {options.map((opt) => (
                            <TouchableOpacity
                                key={opt}
                                style={styles.optionButton}
                                onPress={() => {
                                    if (currentModal === "priority") setPriority(opt);
                                    if (currentModal === "category") setCategory(opt);
                                    if (currentModal === "repeat") setRepeat(opt);
                                    closeModal();
                                }}
                            >
                                <Text style={styles.optionText}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity onPress={closeModal} style={styles.cancelButton}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.root}>
            {/* ✅ Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Task</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* ✅ Centered Body */}
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.formWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter a task..."
                        value={task}
                        onChangeText={setTask}
                        placeholderTextColor="#888"
                    />

                    <View style={styles.optionContainer}>
                        <View style={styles.row}>
                            <TouchableOpacity
                                style={[styles.optionBtn, priority && styles.activeButton]}
                                onPress={() => openModal("priority")}
                            >
                                <Text style={styles.optionBtnText}>
                                    {priority ? `Priority: ${priority}` : "Priority"}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.optionBtn, category && styles.activeButton]}
                                onPress={() => openModal("category")}
                            >
                                <Text style={styles.optionBtnText}>
                                    {category ? `Category: ${category}` : "Category"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.row}>
                            <TouchableOpacity
                                style={[styles.optionBtn, repeat && styles.activeButton]}
                                onPress={() => openModal("repeat")}
                            >
                                <Text style={styles.optionBtnText}>
                                    {repeat ? `Repeat: ${repeat}` : "Repeat"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
                        <Text style={styles.addButtonText}>Add Task</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                {renderModalOptions()}
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#e1c6fdff",
        paddingTop: 40,
    },
    header: {
        height: 70,
        paddingTop: 20,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    backBtn: {
        width: 60,
        alignItems: "flex-start",
        paddingLeft: 15,   // ✅ Added small inward padding
    },

    headerTitle: {
        fontSize: 26,
        fontWeight: "700",
        color: "#4B0082",
    },

    // 💜 Centered scroll area
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 60,
    },

    formWrapper: {
        width: "100%",
        alignItems: "center",
    },

    input: {
        width: "90%",
        borderWidth: 1,
        borderColor: "#7B61FF",
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: "#000",
        backgroundColor: "#fff",
        marginBottom: 30,
    },

    optionContainer: {
        width: "100%",
        alignItems: "center",
        marginBottom: 50,
    },

    row: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 12,
        gap: 10,
    },

    optionBtn: {
        backgroundColor: "#E6D9FF",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#7B61FF",
        marginHorizontal: 6,
    },
    activeButton: {
        backgroundColor: "#7B61FF",
    },
    optionBtnText: {
        color: "#4B0082",
        fontWeight: "500",
    },
    addButton: {
        backgroundColor: "#7B61FF",
        paddingVertical: 14,
        borderRadius: 25,
        width: "60%",
        alignItems: "center",
        elevation: 4,
    },
    addButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },

    // Modal styles
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    modalContent: {
        backgroundColor: "#fff",
        marginHorizontal: 30,
        borderRadius: 20,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#4B0082",
        marginBottom: 15,
    },
    optionButton: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderBottomWidth: 0.5,
        borderColor: "#ccc",
    },
    optionText: {
        fontSize: 16,
        color: "#4B0082",
    },
    cancelButton: {
        marginTop: 10,
        alignItems: "center",
    },
    cancelText: {
        color: "#7B61FF",
        fontWeight: "600",
    },
});
