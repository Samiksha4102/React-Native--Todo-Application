import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from "react-native-gesture-handler/Swipeable";


const swipeableRefs = useRef(new Map());
const { width } = Dimensions.get("window");

type Task = {
  _id: string;
  taskName: string;
  priority: "High" | "Medium" | "Low";
  category?: string;
  completed?: boolean;
  date?: string;
  time?: string;
  repeat?: string;
};

export default function TaskDetails() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<"progress" | "tasks">("progress");
  const [showRemaining, setShowRemaining] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editFields, setEditFields] = useState({
    taskName: "",
    category: "",
    priority: "Low",
    repeat: "",
  });

  const API_URL = "http://192.168.1.13:5000/api/tasks";

  const priorityColors: Record<string, string> = {
    High: "#9400D3",
    Medium: "#DA70D6",
    Low: "#9370DB",
    Default: "#CCCCCC",
  };

  // ✅ Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : data.tasks || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      Alert.alert("Error", "Unable to load tasks from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    return () => swipeableRefs.current.clear();
  }, []);


  // ✅ Show congratulations when all tasks are completed
  useEffect(() => {
    if (tasks.length > 0 && tasks.every((t) => t.completed)) {
      Alert.alert(
        "🎉 Congratulations!",
        "You completed all your tasks for today!"
      );
    }
  }, [tasks]);

  // ✅ Toggle completion
  const toggleCompletion = async (taskId: string) => {
    swipeableRefs.current.get(taskId)?.close();
    try {
      const res = await fetch(`${API_URL}/${taskId}/complete`, {
        method: "PATCH",
      });
      const data = await res.json();

      console.log("🔄 Toggle response:", data);

      if (data.success && data.task) {
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t._id === taskId ? { ...t, completed: data.task.completed } : t
          )
        );
      } else {
        Alert.alert("Error", data.message || "Failed to toggle task");
      }
    } catch (error) {
      console.error("❌ Toggle error:", error);
      Alert.alert("Error", "Something went wrong while toggling task");
    }
  };


  // ✅ Delete task
  const onDeleteTask = async (taskId: string) => {
    swipeableRefs.current.get(taskId)?.close();
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(`${API_URL}/${taskId}`, { method: "DELETE" });
            if (res.ok) {
              Alert.alert("Success", "Task deleted successfully!");
              fetchTasks();
            } else {
              Alert.alert("Failed", "Could not delete the task.");
            }
          } catch (err) {
            console.error("Error deleting task:", err);
            Alert.alert("Error", "Something went wrong while deleting the task.");
          }
        },
      },
    ]);
  };

  // ✅ Update task
  const updateTask = async (taskId: string, updates: object) => {
    swipeableRefs.current.get(taskId)?.close();
    try {
      const res = await fetch(`${API_URL}/${taskId}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) fetchTasks();
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  // ✅ Pie chart data
  // ✅ Pie chart data (only Completed vs Remaining)
  const pieData = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const remaining = total - completed;

    if (total === 0) return [];

    const completedPercent = ((completed / total) * 100).toFixed(1);
    const remainingPercent = ((remaining / total) * 100).toFixed(1);

    return [
      {
        name: `Completed (${completedPercent}%)`,
        population: completed,
        color: "#7B61FF",
        legendFontColor: "#333",
        legendFontSize: 14,
      },
      {
        name: `Remaining (${remainingPercent}%)`,
        population: remaining,
        color: "#C9B6FF",
        legendFontColor: "#333",
        legendFontSize: 14,
      },
    ];
  }, [tasks]);


  function shadeColor(color: string = "#CCCCCC", percent: number) {
    const f = parseInt(color.slice(1), 16);
    const t = percent < 0 ? 0 : 255;
    const p = Math.abs(percent) / 100;
    const R = f >> 16;
    const G = (f >> 8) & 0x00ff;
    const B = f & 0x0000ff;
    const newR = Math.round((t - R) * p) + R;
    const newG = Math.round((t - G) * p) + G;
    const newB = Math.round((t - B) * p) + B;
    return (
      "#" +
      [newR, newG, newB]
        .map((x) => (x.toString(16).length === 1 ? "0" + x.toString(16) : x.toString(16)))
        .join("")
    );
  }

  // ✅ Swipeable actions
  const renderRightActions = (task: Task) => (
    <View style={styles.rightActionContainer}>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: "#4B8BF5" }]}
        onPress={() => {
          setEditingTask(task);
          setEditFields({
            taskName: task.taskName,
            category: task.category || "",
            priority: task.priority || "Low",
            repeat: task.repeat || "",
          });
          setEditModalVisible(true);
        }}
      >
        <AntDesign name="edit" size={20} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: "#FF6B6B" }]}
        onPress={() => onDeleteTask(task._id)}
      >
        <AntDesign name="delete" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderLeftActions = (task: Task) => (
    <TouchableOpacity
      style={[styles.leftAction, { backgroundColor: "#7BD389" }]}
      onPress={() => toggleCompletion(task._id)}
    >
      <Feather name="check" size={20} color="#fff" />
    </TouchableOpacity>

  );

  // ✅ Count remaining tasks
  const remainingTasks = tasks.filter((t) => !t.completed);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.root}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/HomePage")} style={styles.backBtn}>
            <MaterialIcons name="arrow-back-ios" size={22} color="#333" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Task Details</Text>
          </View>
          <View style={{ width: 60 }} />
        </View>

        {/* Tabs */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === "progress" && styles.toggleBtnActive]}
            onPress={() => setActiveTab("progress")}
          >
            <Text
              style={[styles.toggleText, activeTab === "progress" && styles.toggleTextActive]}
            >
              Check Progress
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === "tasks" && styles.toggleBtnActive]}
            onPress={() => setActiveTab("tasks")}
          >
            <Text style={[styles.toggleText, activeTab === "tasks" && styles.toggleTextActive]}>
              My Tasks
            </Text>
          </TouchableOpacity>
        </View>

        {/* ✅ Tabs Content */}
        <View style={{ flex: 1 }}>
          {activeTab === "progress" && (
            <ScrollView
              key="progress"
              contentContainerStyle={{
                alignItems: "center",
                paddingHorizontal: 20,
                paddingBottom: 120,
              }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.pieContainer}>
                {pieData.length > 0 ? (
                  <>
                    <PieChart
                      data={pieData}
                      width={width - 80}
                      height={260}
                      chartConfig={{
                        backgroundGradientFrom: "#fff",
                        backgroundGradientTo: "#fff",
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      }}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="30"
                      center={[0, 0]}
                      absolute
                      hasLegend={false}
                    />
                    <View style={styles.legendContainer}>
                      {pieData.map((item, index) => (
                        <View key={index} style={styles.legendItem}>
                          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                          <Text style={styles.legendText}>{item.name}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <Text style={{ marginTop: 40 }}>No data yet.</Text>
                )}
              </View>

              {/* ✅ Remaining Tasks Section */}
              {showRemaining && (
                <View style={styles.remainingList}>
                  {remainingTasks.length > 0 ? (
                    remainingTasks.map((t) => (
                      <View key={t._id} style={styles.remainingItem}>
                        <Text style={styles.remainingTaskText}>{t.taskName}</Text>
                        <View
                          style={[
                            styles.priorityDot,
                            { backgroundColor: priorityColors[t.priority] },
                          ]}
                        />
                      </View>
                    ))
                  ) : (
                    <Text style={{ textAlign: "center", marginTop: 10, color: "#666" }}>
                      ✅ No remaining tasks!
                    </Text>
                  )}
                </View>
              )}

              <TouchableOpacity
                style={styles.remainingBtn}
                onPress={() => setShowRemaining((s) => !s)}
              >
                <Text style={styles.remainingBtnText}>
                  {showRemaining ? "Hide Remaining Tasks" : "Show Remaining Tasks"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* ✅ My Tasks Tab */}
          {activeTab === "tasks" && (
            <FlatList
              key="tasks"
              data={tasks}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingBottom: 100 }}
              renderItem={({ item }) => (
                <Swipeable
                  ref={(ref) => {
                    if (ref) swipeableRefs.current.set(item._id, ref);
                  }}
                  renderLeftActions={() => renderLeftActions(item)}
                  renderRightActions={() => renderRightActions(item)}
                  onSwipeableClose={() => swipeableRefs.current.delete(item._id)}
                >
                  <View style={styles.taskRow}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <View
                        style={[
                          styles.priorityBadge,
                          { backgroundColor: priorityColors[item.priority] },
                        ]}
                      />
                      <Text
                        style={[
                          styles.taskName,
                          item.completed && styles.taskCompleted,
                        ]}
                      >
                        {item.taskName}
                      </Text>
                    </View>
                    <Text>{item.priority}</Text>
                  </View>
                </Swipeable>
              )}
            />
          )}
        </View>
      </View>
      {/* ✅ Edit Task Modal */}
      {editModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Task</Text>

            <TextInput
              style={styles.input}
              placeholder="Task Name"
              value={editFields.taskName}
              onChangeText={(text) => setEditFields({ ...editFields, taskName: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Category"
              value={editFields.category}
              onChangeText={(text) => setEditFields({ ...editFields, category: text })}
            />

            {/* Priority Selector */}
            <View style={styles.priorityRow}>
              {["High", "Medium", "Low"].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityButton,
                    editFields.priority === p && styles.prioritySelected,
                  ]}
                  onPress={() => setEditFields({ ...editFields, priority: p })}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      editFields.priority === p && { color: "#fff" },
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#7B61FF" }]}
                onPress={async () => {
                  if (!editingTask) return;
                  await updateTask(editingTask._id, editFields);
                  setEditModalVisible(false);
                  setEditingTask(null);
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={{ color: "#333", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </GestureHandlerRootView>
  );
}


const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F3E8FF", paddingTop: 40 },
  header: {
    height: 70,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 60,
    alignItems: "flex-start",
    paddingLeft: 15,   // ✅ Added small inward padding
  },
  titleContainer: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 26, fontWeight: "700", color: "#4B0082" },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#E8D9FF",
    borderRadius: 30,
    padding: 5,
    marginTop: 20,
    width: "90%",
    alignSelf: "center",
  },
  toggleBtn: {
    flex: 1,
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: "center",
  },
  toggleBtnActive: { backgroundColor: "#7B61FF" },
  toggleText: { fontSize: 14, color: "#4B0082", fontWeight: "600" },
  toggleTextActive: { color: "#fff" },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  remainingList: { width: "100%", marginTop: 20 },
  remainingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  remainingTaskText: { fontSize: 16, color: "#333" },
  priorityDot: { width: 12, height: 12, borderRadius: 6 },

  remainingBtn: {
    backgroundColor: "#7B61FF",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 40, // ensures spacing at bottom
    alignSelf: "center",
  },

  remainingBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  taskRow: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 30,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  priorityBadge: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  taskName: { fontSize: 16, maxWidth: width - 160 },
  taskCompleted: { textDecorationLine: "line-through", color: "#999" },
  rightActionContainer: {
    flexDirection: "row",
    width: 120,
    justifyContent: "space-around",
    alignItems: "center",
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  leftAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 10,
    marginVertical: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4B0082",
    textAlign: "center",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  priorityRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  priorityButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#7B61FF",
  },
  prioritySelected: {
    backgroundColor: "#7B61FF",
  },
  priorityText: {
    fontWeight: "600",
    color: "#7B61FF",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  pieContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    width: "100%",
  },

  legendContainer: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "90%",
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    marginVertical: 5,
  },

  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
  },

  legendText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },


});
