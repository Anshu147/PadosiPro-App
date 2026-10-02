import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, Rect } from "react-native-svg";
import { router, useFocusEffect } from "expo-router";

import { getSelectedTasks } from "@/api/tasks.api";
import { useAuth } from "@/context/AuthContext";
import type { Task } from "@/types/api";

export default function HomeScreen() {
    const { user, logout } = useAuth();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadSelectedTasks = useCallback(async () => {
        try {
            setError("");

            const response = await getSelectedTasks();

            setTasks(response.tasks);
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Unable to load your selected services.";

            setError(message);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadSelectedTasks();
        }, [loadSelectedTasks])
    );

    async function handleRefresh() {
        setIsRefreshing(true);
        await loadSelectedTasks();
    }

    async function handleLogout() {
        await logout();
        router.replace("/login");
    }

    const userInitial = user?.email?.charAt(0).toUpperCase() || "P";

    if (isLoading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#52B69A" />
                <Text style={styles.loadingText}>Loading your services...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Brand Bar */}
            <View style={styles.topBar}>
                <View style={styles.brandRow}>
                    <View style={styles.logoBadge}>
                        <Svg width={30} height={30} viewBox="0 0 100 100">
                            <Rect width="100" height="100" rx="24" fill="#143438" />
                            <Path d="M50 24L26 48L36 58L50 44L64 58L74 48L50 24Z" fill="#52B69A" />
                            <Path d="M50 48L34 64L42 72L50 64L58 72L66 64L50 48Z" fill="#76C893" />
                        </Svg>
                    </View>
                    <Text style={styles.brandTitle}>
                        Padosi<Text style={styles.brandTeal}>Pro</Text>
                    </Text>
                </View>

                <Pressable
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Ionicons name="log-out-outline" size={16} color="#DC2626" />
                    <Text style={styles.logoutText}>Logout</Text>
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor="#52B69A"
                        colors={["#52B69A"]}
                    />
                }
            >
                {/* User Info Bar */}
                <View style={styles.userSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{userInitial}</Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.email} numberOfLines={1}>{user?.email}</Text>
                    </View>
                </View>

                {/* Hero Banner */}
                <View style={styles.heroCard}>
                    <View style={styles.heroPill}>
                        <View style={styles.activeDot} />
                        <Text style={styles.heroPillText}>Active Preferences</Text>
                    </View>
                    <Text style={styles.heroTitle}>Your Selected Services</Text>
                    <Text style={styles.heroSubtitle}>
                        Personalized dashboard with verified neighbors and custom service notifications.
                    </Text>
                </View>

                {/* Subheading row */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Enrolled Services</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{tasks.length}</Text>
                    </View>
                </View>

                {error ? (
                    <View style={styles.errorCard}>
                        <Ionicons name="alert-circle-outline" size={24} color="#DC2626" />
                        <Text style={styles.errorTitle}>Unable to load services</Text>
                        <Text style={styles.errorText}>{error}</Text>
                        <Pressable style={styles.retryButton} onPress={loadSelectedTasks}>
                            <Text style={styles.retryText}>Try Again</Text>
                        </Pressable>
                    </View>
                ) : tasks.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <View style={styles.emptyIconCircle}>
                            <Ionicons name="sparkles-outline" size={32} color="#52B69A" />
                        </View>
                        <Text style={styles.emptyTitle}>No services selected yet</Text>
                        <Text style={styles.emptyText}>
                            Choose some services to tailor your neighbor network and receive requests.
                        </Text>
                        <Pressable
                            style={styles.primaryButton}
                            onPress={() => router.push("/tasks")}
                        >
                            <Text style={styles.primaryButtonText}>Choose Services</Text>
                            <Ionicons name="arrow-forward" size={16} color="#76C893" />
                        </Pressable>
                    </View>
                ) : (
                    <View style={styles.taskList}>
                        {tasks.map((task) => (
                            <View key={task.id} style={styles.taskCard}>
                                <View style={styles.iconBox}>
                                    <Ionicons name="checkmark-sharp" size={20} color="#143438" />
                                </View>
                                <View style={styles.taskContent}>
                                    <View style={styles.categoryBadge}>
                                        <Text style={styles.categoryBadgeText}>
                                            {task.category?.name || "Service"}
                                        </Text>
                                    </View>
                                    <Text style={styles.taskName}>{task.name}</Text>
                                    <Text style={styles.taskDescription} numberOfLines={2}>
                                        {task.description}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Edit Button */}
                <Pressable
                    style={styles.changeButton}
                    onPress={() => router.push("/tasks")}
                >
                    <Ionicons name="options-outline" size={18} color="#143438" />
                    <Text style={styles.changeButtonText}>Change selected services</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAF9",
    },

    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F8FAF9",
    },

    loadingText: {
        marginTop: 12,
        color: "#586E71",
        fontSize: 15,
        fontWeight: "500",
    },

    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },

    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    logoBadge: {
        width: 32,
        height: 32,
        borderRadius: 10,
        overflow: "hidden",
    },

    brandTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#143438",
        letterSpacing: -0.5,
    },

    brandTeal: {
        color: "#52B69A",
    },

    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: "#FEF2F2",
        borderWidth: 1,
        borderColor: "#FEE2E2",
    },

    logoutText: {
        color: "#DC2626",
        fontSize: 12,
        fontWeight: "700",
    },

    content: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 40,
    },

    userSection: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        gap: 12,
    },

    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#143438",
        alignItems: "center",
        justifyContent: "center",
    },

    avatarText: {
        color: "#76C893",
        fontSize: 18,
        fontWeight: "800",
    },

    userInfo: {
        flex: 1,
    },

    greeting: {
        fontSize: 13,
        color: "#586E71",
        fontWeight: "500",
    },

    email: {
        marginTop: 2,
        fontSize: 16,
        fontWeight: "700",
        color: "#143438",
    },

    heroCard: {
        padding: 20,
        borderRadius: 20,
        backgroundColor: "#143438",
        marginBottom: 24,
        shadowColor: "#143438",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
    },

    heroPill: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        backgroundColor: "rgba(82, 182, 154, 0.2)",
        marginBottom: 10,
        gap: 6,
    },

    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#76C893",
    },

    heroPillText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#76C893",
    },

    heroTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: -0.5,
    },

    heroSubtitle: {
        marginTop: 6,
        fontSize: 13,
        lineHeight: 19,
        color: "#CADAD7",
    },

    sectionHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#143438",
    },

    countBadge: {
        backgroundColor: "#E6F4F1",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
    },

    countBadgeText: {
        color: "#143438",
        fontSize: 12,
        fontWeight: "800",
    },

    taskList: {
        gap: 12,
    },

    taskCard: {
        flexDirection: "row",
        padding: 16,
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },

    iconBox: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E8F7F2",
    },

    taskContent: {
        flex: 1,
        marginLeft: 14,
    },

    categoryBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        backgroundColor: "#F0FDF4",
        marginBottom: 4,
    },

    categoryBadgeText: {
        fontSize: 10,
        fontWeight: "700",
        textTransform: "uppercase",
        color: "#059669",
        letterSpacing: 0.5,
    },

    taskName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#143438",
    },

    taskDescription: {
        marginTop: 4,
        fontSize: 13,
        lineHeight: 18,
        color: "#586E71",
    },

    errorCard: {
        alignItems: "center",
        padding: 22,
        borderRadius: 18,
        backgroundColor: "#FEF2F2",
        borderWidth: 1,
        borderColor: "#FECACA",
    },

    errorTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#991B1B",
        marginTop: 8,
    },

    errorText: {
        marginTop: 4,
        color: "#B91C1C",
        textAlign: "center",
        fontSize: 13,
    },

    retryButton: {
        marginTop: 14,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: "#B91C1C",
    },

    retryText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 13,
    },

    emptyCard: {
        alignItems: "center",
        padding: 28,
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
    },

    emptyIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#E8F7F2",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
    },

    emptyTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#143438",
    },

    emptyText: {
        marginTop: 6,
        textAlign: "center",
        lineHeight: 20,
        color: "#586E71",
        fontSize: 14,
    },

    primaryButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 20,
        paddingHorizontal: 22,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: "#143438",
    },

    primaryButtonText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
    },

    changeButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 24,
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
    },

    changeButtonText: {
        color: "#143438",
        fontSize: 14,
        fontWeight: "700",
    },
});