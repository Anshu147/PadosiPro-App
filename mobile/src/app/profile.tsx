import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, Rect } from "react-native-svg";
import { router } from "expo-router";

import { getProfile, saveProfile } from "@/api/profile.api";
import { useAuth } from "@/context/AuthContext";

export default function ProfileScreen() {
    const { updateUser, refreshUser } = useAuth();
    const [name, setName] = useState("");
    const [mobile, setMobile] = useState("");
    const [address, setAddress] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    const [nameFocused, setNameFocused] = useState(false);
    const [mobileFocused, setMobileFocused] = useState(false);
    const [addressFocused, setAddressFocused] = useState(false);
    const [businessFocused, setBusinessFocused] = useState(false);

    const scrollViewRef = useRef<ScrollView>(null);
    const animatedTranslateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

        const showSub = Keyboard.addListener(showEvent, (e) => {
            setIsKeyboardVisible(true);
            Animated.timing(animatedTranslateY, {
                toValue: -30,
                duration: Platform.OS === "ios" ? (e.duration || 250) : 250,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        });

        const hideSub = Keyboard.addListener(hideEvent, (e) => {
            setIsKeyboardVisible(false);
            Animated.timing(animatedTranslateY, {
                toValue: 0,
                duration: Platform.OS === "ios" ? (e.duration || 200) : 200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    useEffect(() => {
        let isMounted = true;
        async function fetchExistingProfile() {
            try {
                const res = await getProfile();
                if (res.profile && isMounted) {
                    setName(res.profile.name || "");
                    const mobileNum = res.profile.mobile || "";
                    setMobile(mobileNum.startsWith("+91") ? mobileNum.slice(3) : mobileNum);
                    setAddress(res.profile.address || "");
                    setBusinessName(res.profile.businessName || "");
                }
            } catch {
                // Ignore if not created yet
            }
        }
        fetchExistingProfile();
        return () => {
            isMounted = false;
        };
    }, []);

    async function handleSave() {
        let cleanMobile = mobile.replace(/\s/g, "");
        if (cleanMobile.length === 10 && /^[6-9]\d{9}$/.test(cleanMobile)) {
            cleanMobile = `+91${cleanMobile}`;
        }

        if (!name.trim() || !cleanMobile || !address.trim()) {
            Alert.alert(
                "Missing information",
                "Please fill in your name, mobile number, and address."
            );
            return;
        }

        if (!/^\+91[6-9]\d{9}$/.test(cleanMobile)) {
            Alert.alert(
                "Invalid mobile number",
                "Enter a valid Indian mobile number, for example +919876543210."
            );
            return;
        }

        try {
            setIsSubmitting(true);

            await saveProfile({
                name: name.trim(),
                mobile: cleanMobile,
                address: address.trim(),
                businessName: businessName.trim() || undefined,
            });

            // Update user state immediately so route guard allows navigation to /tasks
            updateUser({ profileCompleted: true });
            refreshUser().catch(() => {});

            router.replace("/tasks");
        } catch (error: any) {
            console.log("PROFILE SAVE ERROR:", error?.response?.data);
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Unable to save your profile.";

            Alert.alert("Unable to save profile", message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={[
                            styles.scrollContent,
                            isKeyboardVisible && styles.scrollContentWithKeyboard,
                        ]}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        automaticallyAdjustKeyboardInsets={true}
                    >
                        <Animated.View
                            style={[
                                styles.formWrapper,
                                { transform: [{ translateY: animatedTranslateY }] },
                            ]}
                        >
                            {/* Brand Header */}
                            <View style={styles.brandRow}>
                                <View style={styles.logoBadge}>
                                    <Svg width={36} height={36} viewBox="0 0 100 100">
                                        <Rect width="100" height="100" rx="24" fill="#143438" />
                                        <Path d="M50 24L26 48L36 58L50 44L64 58L74 48L50 24Z" fill="#52B69A" />
                                        <Path d="M50 48L34 64L42 72L50 64L58 72L66 64L50 48Z" fill="#76C893" />
                                    </Svg>
                                </View>
                                <Text style={styles.brandText}>
                                    Padosi<Text style={styles.brandTeal}>Pro</Text>
                                </Text>
                            </View>

                            {/* Step Badge */}
                            <View style={styles.stepBadge}>
                                <View style={styles.stepDot} />
                                <Text style={styles.stepText}>Step 1 of 2: Profile Details</Text>
                            </View>

                            <Text style={styles.title}>Tell us about you</Text>
                            <Text style={styles.subtitle}>
                                Complete your profile to discover trusted services & verified neighbors around you.
                            </Text>

                            <View style={styles.form}>
                                {/* Field 1: Name */}
                                <Text style={styles.label}>
                                    Name <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={[styles.inputRow, nameFocused && styles.inputFocused]}>
                                    <Ionicons name="person-outline" size={20} color="#586E71" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.innerInput}
                                        placeholder="Enter your full name"
                                        placeholderTextColor="#94A3B8"
                                        value={name}
                                        onChangeText={setName}
                                        onFocus={() => {
                                            setNameFocused(true);
                                            setTimeout(() => {
                                                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                                            }, 150);
                                        }}
                                        onBlur={() => setNameFocused(false)}
                                    />
                                </View>

                                {/* Field 2: Mobile */}
                                <View style={styles.labelRow}>
                                    <Text style={styles.label}>
                                        Mobile Number <Text style={styles.required}>*</Text>
                                    </Text>
                                    <View style={styles.verifiedTag}>
                                        <Text style={styles.verifiedTagText}>Verified via SMS</Text>
                                    </View>
                                </View>
                                <View style={[styles.inputRow, mobileFocused && styles.inputFocused]}>
                                    <Text style={styles.flagPrefix}>🇮🇳 +91</Text>
                                    <View style={styles.prefixDivider} />
                                    <TextInput
                                        style={styles.innerInput}
                                        placeholder="98765 43210"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="phone-pad"
                                        value={mobile}
                                        onChangeText={setMobile}
                                        onFocus={() => {
                                            setMobileFocused(true);
                                            setTimeout(() => {
                                                scrollViewRef.current?.scrollTo({ y: 90, animated: true });
                                            }, 150);
                                        }}
                                        onBlur={() => setMobileFocused(false)}
                                    />
                                </View>
                                <View style={styles.helperRow}>
                                    <Ionicons name="checkmark-circle-outline" size={14} color="#059669" />
                                    <Text style={styles.helper}>
                                        Enter your 10-digit phone number with +91
                                    </Text>
                                </View>

                                {/* Field 3: Address */}
                                <Text style={styles.label}>
                                    Address <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={[styles.textAreaRow, addressFocused && styles.inputFocused]}>
                                    <Ionicons name="location-outline" size={20} color="#586E71" style={styles.textAreaIcon} />
                                    <TextInput
                                        style={styles.textArea}
                                        placeholder="Flat / Villa No., Apartment or Society, Street Name"
                                        placeholderTextColor="#94A3B8"
                                        multiline
                                        textAlignVertical="top"
                                        value={address}
                                        onChangeText={setAddress}
                                        onFocus={() => {
                                            setAddressFocused(true);
                                            setTimeout(() => {
                                                scrollViewRef.current?.scrollTo({ y: 220, animated: true });
                                            }, 150);
                                        }}
                                        onBlur={() => setAddressFocused(false)}
                                    />
                                </View>

                                {/* Field 4: Business Name */}
                                <View style={styles.labelRow}>
                                    <Text style={styles.label}>Business Name</Text>
                                    <Text style={styles.optionalTag}>Optional</Text>
                                </View>
                                <View style={[styles.inputRow, businessFocused && styles.inputFocused]}>
                                    <Ionicons name="business-outline" size={20} color="#586E71" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.innerInput}
                                        placeholder="Enter your business name"
                                        placeholderTextColor="#94A3B8"
                                        value={businessName}
                                        onChangeText={setBusinessName}
                                        onFocus={() => {
                                            setBusinessFocused(true);
                                            setTimeout(() => {
                                                scrollViewRef.current?.scrollToEnd({ animated: true });
                                            }, 150);
                                        }}
                                        onBlur={() => setBusinessFocused(false)}
                                    />
                                </View>
                                <Text style={styles.helper}>
                                    Optional if you don't offer commercial services.
                                </Text>

                                {/* Trust badge */}
                                <View style={styles.trustBadge}>
                                    <Ionicons name="shield-checkmark-outline" size={16} color="#52B69A" />
                                    <Text style={styles.trustText}>
                                        Your exact address is only shared with verified pros.
                                    </Text>
                                </View>

                                {/* Submit CTA */}
                                <Pressable
                                    style={[
                                        styles.button,
                                        isSubmitting && styles.buttonDisabled,
                                    ]}
                                    onPress={handleSave}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <View style={styles.buttonContent}>
                                            <Text style={styles.buttonText}>Save & Continue</Text>
                                            <Ionicons name="arrow-forward" size={18} color="#76C893" />
                                        </View>
                                    )}
                                </Pressable>
                            </View>
                        </Animated.View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F8FAF9",
    },

    keyboardContainer: {
        flex: 1,
    },

    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
    },

    scrollContentWithKeyboard: {
        paddingBottom: 320,
    },

    formWrapper: {
        width: "100%",
    },

    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        gap: 10,
    },

    logoBadge: {
        width: 40,
        height: 40,
        borderRadius: 14,
        overflow: "hidden",
        shadowColor: "#143438",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },

    brandText: {
        fontSize: 24,
        fontWeight: "800",
        color: "#143438",
        letterSpacing: -0.5,
    },

    brandTeal: {
        color: "#52B69A",
    },

    stepBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: "#ECFDF5",
        borderWidth: 1,
        borderColor: "#A7F3D0",
        marginBottom: 12,
        gap: 6,
    },

    stepDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#52B69A",
    },

    stepText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#065F46",
    },

    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#143438",
        letterSpacing: -0.5,
    },

    subtitle: {
        marginTop: 6,
        marginBottom: 22,
        fontSize: 14,
        lineHeight: 20,
        color: "#586E71",
    },

    form: {
        width: "100%",
    },

    labelRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },

    label: {
        marginBottom: 8,
        fontSize: 14,
        fontWeight: "700",
        color: "#143438",
    },

    required: {
        color: "#EF4444",
        fontWeight: "700",
    },

    verifiedTag: {
        backgroundColor: "#F0FDF4",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },

    verifiedTagText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#059669",
    },

    optionalTag: {
        fontSize: 11,
        fontWeight: "500",
        color: "#94A3B8",
    },

    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        height: 54,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 14,
        marginBottom: 8,
    },

    inputFocused: {
        borderColor: "#52B69A",
        backgroundColor: "#FFFFFF",
    },

    inputIcon: {
        marginRight: 10,
    },

    flagPrefix: {
        fontSize: 14,
        fontWeight: "700",
        color: "#143438",
    },

    prefixDivider: {
        width: 1,
        height: 18,
        backgroundColor: "#E2E8F0",
        marginHorizontal: 10,
    },

    innerInput: {
        flex: 1,
        height: "100%",
        fontSize: 15,
        fontWeight: "500",
        color: "#0F1E21",
    },

    textAreaRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        height: 100,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 14,
        paddingTop: 12,
        marginBottom: 16,
    },

    textAreaIcon: {
        marginRight: 10,
        marginTop: 2,
    },

    textArea: {
        flex: 1,
        height: "100%",
        fontSize: 15,
        fontWeight: "500",
        color: "#0F1E21",
        textAlignVertical: "top",
    },

    helperRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        marginBottom: 16,
        marginLeft: 2,
    },

    helper: {
        fontSize: 12,
        color: "#586E71",
        marginBottom: 16,
        marginLeft: 2,
    },

    trustBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginBottom: 18,
        gap: 8,
    },

    trustText: {
        fontSize: 12,
        fontWeight: "500",
        color: "#475569",
        flex: 1,
    },

    button: {
        height: 56,
        borderRadius: 16,
        backgroundColor: "#143438",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#143438",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 4,
    },

    buttonDisabled: {
        opacity: 0.7,
    },

    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },

    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
});