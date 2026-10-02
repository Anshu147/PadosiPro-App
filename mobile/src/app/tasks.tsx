import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, Rect } from "react-native-svg";
import { router } from "expo-router";

import {
    getTasks,
    saveSelectedTasks,
} from "@/api/tasks.api";
import type { Task } from "@/types/api";

export default function TasksScreen() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    async function loadTasks() {
        try {
            setIsLoading(true);
            setError("");

            const response = await getTasks({
                search: search.trim() || undefined,
            });

            setTasks(response.tasks);
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Unable to load tasks.";

            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadTasks();
    }, []);

    const allCategories = useMemo(() => {
        const unique = Array.from(
            new Set(tasks.map((t) => t.category.name).filter(Boolean))
        );
        return ["All", ...unique];
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        const query = search.trim().toLowerCase();

        return tasks.filter((task) => {
            const matchesCategory =
                selectedCategory === "All" ||
                task.category.name === selectedCategory;

            if (!matchesCategory) {
                return false;
            }

            if (!query) {
                return true;
            }

            return (
                task.name.toLowerCase().includes(query) ||
                task.description.toLowerCase().includes(query) ||
                task.category.name.toLowerCase().includes(query)
            );
        });
    }, [tasks, search, selectedCategory]);

    const groupedTasks = useMemo(() => {
        return filteredTasks.reduce<Record<string, Task[]>>(
            (groups, task) => {
                const category = task.category.name;

                if (!groups[category]) {
                    groups[category] = [];
                }

                groups[category].push(task);

                return groups;
            },
            {}
        );
    }, [filteredTasks]);

    function toggleTask(taskId: string) {
        setSelectedIds((current) =>
            current.includes(taskId)
                ? current.filter((id) => id !== taskId)
                : [...current, taskId]
        );
    }

    async function handleSave() {
        if (selectedIds.length === 0) {
            Alert.alert(
                "Select at least one task",
                "Choose the services you are interested in."
            );
            return;
        }

        try {
            setIsSaving(true);

            await saveSelectedTasks(selectedIds);

            router.replace("/home");
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Unable to save your selected tasks.";

            Alert.alert("Unable to save", message);
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#143438" />
                <Text style={styles.loadingText}>Loading services...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.center}>
                <Text style={styles.errorTitle}>Something went wrong</Text>
                <Text style={styles.errorText}>{error}</Text>

                <Pressable style={styles.retryButton} onPress={loadTasks}>
                    <Text style={styles.retryText}>Try Again</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Brand Bar */}
            <View style={styles.topNav}>
                <View style={styles.brandRow}>
                    <View style={styles.brandLogoIcon}>
                        <Svg width={24} height={24} viewBox="0 0 100 100">
                            <Rect width="100" height="100" rx="24" fill="#143438" />
                            <Path
                                d="M50 24L26 48L36 58L50 44L64 58L74 48L50 24Z"
                                fill="#52B69A"
                            />
                            <Path
                                d="M50 48L34 64L42 72L50 64L58 72L66 64L50 48Z"
                                fill="#76C893"
                            />
                        </Svg>
                    </View>
                    <Text style={styles.brandTitle}>
                        Padosi<Text style={styles.brandTeal}>Pro</Text>
                    </Text>
                </View>
            </View>

            {/* Header / Intro */}
            <View style={styles.header}>
                <Text style={styles.mainTitle}>
                    What services are you interested in?
                </Text>
                <Text style={styles.mainSubtitle}>
                    Select the services you want to discover.
                </Text>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons
                        name="search-outline"
                        size={20}
                        color="#94A3B8"
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search services..."
                        placeholderTextColor="#94A3B8"
                        value={search}
                        onChangeText={setSearch}
                        autoCapitalize="none"
                    />
                    {search.length > 0 && (
                        <Pressable
                            onPress={() => setSearch("")}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons
                                name="close-circle"
                                size={18}
                                color="#94A3B8"
                            />
                        </Pressable>
                    )}
                </View>
            </View>

            {/* Category Filter Chips */}
            {allCategories.length > 2 && (
                <View style={styles.chipsContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipsScroll}
                    >
                        {allCategories.map((cat) => {
                            const isSelected = selectedCategory === cat;
                            return (
                                <Pressable
                                    key={cat}
                                    style={[
                                        styles.chip,
                                        isSelected
                                            ? styles.chipSelected
                                            : styles.chipUnselected,
                                    ]}
                                    onPress={() => setSelectedCategory(cat)}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            isSelected
                                                ? styles.chipTextSelected
                                                : styles.chipTextUnselected,
                                        ]}
                                    >
                                        {cat}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            {/* Services List */}
            <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            >
                {Object.entries(groupedTasks).map(
                    ([category, categoryTasks]) => (
                        <View key={category} style={styles.categoryGroup}>
                            <View style={styles.categoryHeader}>
                                <Text style={styles.categoryTitle}>
                                    {category}
                                </Text>
                                <Text style={styles.categoryCount}>
                                    {categoryTasks.length}{" "}
                                    {categoryTasks.length === 1
                                        ? "service"
                                        : "services"}
                                </Text>
                            </View>

                            {categoryTasks.map((task) => {
                                const selected = selectedIds.includes(task.id);

                                return (
                                    <Pressable
                                        key={task.id}
                                        style={[
                                            styles.taskCard,
                                            selected
                                                ? styles.taskCardSelected
                                                : styles.taskCardUnselected,
                                        ]}
                                        onPress={() => toggleTask(task.id)}
                                    >
                                        <View style={styles.taskContent}>
                                            <View style={styles.taskTitleRow}>
                                                <Text style={styles.taskName}>
                                                    {task.name}
                                                </Text>
                                            </View>

                                            <Text style={styles.taskDescription}>
                                                {task.description}
                                            </Text>
                                        </View>

                                        <View
                                            style={[
                                                styles.checkbox,
                                                selected
                                                    ? styles.checkboxSelected
                                                    : styles.checkboxUnselected,
                                            ]}
                                        >
                                            {selected && (
                                                <Ionicons
                                                    name="checkmark"
                                                    size={16}
                                                    color="#FFFFFF"
                                                />
                                            )}
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>
                    )
                )}

                {filteredTasks.length === 0 && (
                    <View style={styles.empty}>
                        <Ionicons
                            name="search"
                            size={44}
                            color="#CBD5E1"
                        />
                        <Text style={styles.emptyTitle}>
                            No services found
                        </Text>
                        <Text style={styles.emptyText}>
                            Try searching with different keywords or switch category filter.
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Sticky Dock */}
            <View style={styles.footerDock}>
                <View style={styles.dockInner}>
                    <View style={styles.counterRow}>
                        <View style={styles.pulseDot} />
                        <Text style={styles.selectedCountText}>
                            {selectedIds.length} selected
                        </Text>
                    </View>

                    <Pressable
                        style={[
                            styles.continueButton,
                            (isSaving || selectedIds.length === 0) &&
                                styles.continueButtonDisabled,
                        ]}
                        onPress={handleSave}
                        disabled={isSaving || selectedIds.length === 0}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <View style={styles.buttonContent}>
                                <Text style={styles.continueText}>
                                    Continue
                                </Text>
                                <Ionicons
                                    name="arrow-forward"
                                    size={18}
                                    color="#76C893"
                                    style={styles.arrowIcon}
                                />
                            </View>
                        )}
                    </Pressable>
                </View>
            </View>
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
        paddingHorizontal: 24,
        backgroundColor: "#F8FAF9",
    },

    loadingText: {
        marginTop: 12,
        color: "#64748B",
        fontSize: 14,
        fontWeight: "500",
    },

    errorTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#143438",
    },

    errorText: {
        marginTop: 8,
        textAlign: "center",
        color: "#64748B",
        fontSize: 14,
    },

    retryButton: {
        marginTop: 20,
        backgroundColor: "#143438",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },

    retryText: {
        color: "#FFFFFF",
        fontWeight: "700",
    },

    topNav: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 4,
    },

    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    brandLogoIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "#143438",
        alignItems: "center",
        justifyContent: "center",
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

    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 10,
    },

    mainTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#143438",
        letterSpacing: -0.5,
        lineHeight: 30,
    },

    mainSubtitle: {
        marginTop: 6,
        fontSize: 14,
        lineHeight: 20,
        color: "#64748B",
    },

    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        height: 50,
        marginTop: 16,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        shadowColor: "#143438",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },

    searchIcon: {
        marginRight: 10,
    },

    searchInput: {
        flex: 1,
        color: "#0F172A",
        fontSize: 15,
        paddingVertical: 0,
    },

    chipsContainer: {
        paddingBottom: 8,
    },

    chipsScroll: {
        paddingHorizontal: 20,
        gap: 8,
    },

    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
    },

    chipSelected: {
        backgroundColor: "#143438",
        shadowColor: "#143438",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 2,
    },

    chipUnselected: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },

    chipText: {
        fontSize: 13,
        fontWeight: "600",
    },

    chipTextSelected: {
        color: "#FFFFFF",
    },

    chipTextUnselected: {
        color: "#475569",
    },

    list: {
        flex: 1,
    },

    listContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 140,
    },

    categoryGroup: {
        marginTop: 16,
    },

    categoryHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },

    categoryTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#143438",
        letterSpacing: -0.3,
    },

    categoryCount: {
        fontSize: 12,
        fontWeight: "600",
        color: "#52B69A",
    },

    taskCard: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        padding: 16,
        borderWidth: 1.5,
        borderRadius: 16,
        shadowColor: "#143438",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
    },

    taskCardUnselected: {
        borderColor: "#E2E8F0",
        backgroundColor: "#FFFFFF",
    },

    taskCardSelected: {
        borderColor: "#143438",
        backgroundColor: "rgba(82, 182, 154, 0.08)",
    },

    taskContent: {
        flex: 1,
        paddingRight: 12,
    },

    taskTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    taskName: {
        fontSize: 15,
        fontWeight: "700",
        color: "#143438",
    },

    taskDescription: {
        marginTop: 4,
        fontSize: 13,
        lineHeight: 18,
        color: "#64748B",
    },

    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },

    checkboxUnselected: {
        borderColor: "#CBD5E1",
        backgroundColor: "#FFFFFF",
    },

    checkboxSelected: {
        borderColor: "#143438",
        backgroundColor: "#143438",
    },

    empty: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 60,
        paddingHorizontal: 20,
    },

    emptyTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#143438",
        marginTop: 12,
    },

    emptyText: {
        marginTop: 6,
        textAlign: "center",
        fontSize: 13,
        color: "#64748B",
        lineHeight: 18,
    },

    footerDock: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.96)",
        borderTopWidth: 1,
        borderTopColor: "rgba(226, 232, 240, 0.8)",
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
        shadowColor: "#143438",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 8,
    },

    dockInner: {
        alignItems: "center",
    },

    counterRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 10,
    },

    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#52B69A",
    },

    selectedCountText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#475569",
    },

    continueButton: {
        width: "100%",
        height: 52,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#143438",
        shadowColor: "#143438",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
    },

    continueButtonDisabled: {
        opacity: 0.5,
    },

    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },

    continueText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },

    arrowIcon: {
        marginLeft: 8,
    },
});