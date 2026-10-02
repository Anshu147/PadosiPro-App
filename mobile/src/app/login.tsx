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

import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const scrollViewRef = useRef<ScrollView>(null);
    const animatedTranslateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

        const showSub = Keyboard.addListener(showEvent, (e) => {
            setIsKeyboardVisible(true);
            Animated.timing(animatedTranslateY, {
                toValue: -40,
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

    async function handleLogin() {
        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedEmail || !password) {
            Alert.alert("Missing information", "Please enter your email and password.");
            return;
        }

        try {
            setIsSubmitting(true);

            const loggedInUser = await login(
                email.trim(),
                password
            );

            if (loggedInUser.profileCompleted) {
                router.replace("/home");
            } else {
                router.replace("/profile");
            }
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Unable to log in.";

            Alert.alert("Login failed", message);
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

                            <Text style={styles.title}>Welcome back</Text>
                            <Text style={styles.subtitle}>
                                Log in to continue to your PadosiPro account.
                            </Text>

                            <View style={styles.form}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        emailFocused && styles.inputFocused,
                                    ]}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    value={email}
                                    onChangeText={setEmail}
                                    onFocus={() => {
                                        setEmailFocused(true);
                                        setTimeout(() => {
                                            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                                        }, 150);
                                    }}
                                    onBlur={() => setEmailFocused(false)}
                                />

                                <Text style={styles.label}>Password</Text>
                                <View
                                    style={[
                                        styles.passwordContainer,
                                        passwordFocused && styles.inputFocused,
                                    ]}
                                >
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Enter your password"
                                        placeholderTextColor="#94A3B8"
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        value={password}
                                        onChangeText={setPassword}
                                        onFocus={() => {
                                            setPasswordFocused(true);
                                            setTimeout(() => {
                                                scrollViewRef.current?.scrollToEnd({ animated: true });
                                            }, 150);
                                        }}
                                        onBlur={() => setPasswordFocused(false)}
                                    />

                                    <Pressable
                                        onPress={() => setShowPassword((prev) => !prev)}
                                        style={styles.eyeButton}
                                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                        accessibilityRole="button"
                                        accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                                    >
                                        <Ionicons
                                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color="#64748B"
                                        />
                                    </Pressable>
                                </View>

                                <Pressable
                                    style={[
                                        styles.button,
                                        isSubmitting && styles.buttonDisabled,
                                    ]}
                                    onPress={handleLogin}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <View style={styles.buttonContent}>
                                            <Text style={styles.buttonText}>Log In</Text>
                                            <Ionicons name="arrow-forward" size={18} color="#76C893" />
                                        </View>
                                    )}
                                </Pressable>

                                <View style={styles.registerRow}>
                                    <Text style={styles.registerText}>
                                        Don't have an account?
                                    </Text>
                                    <Pressable onPress={() => router.replace("/register")}>
                                        <Text style={styles.registerLink}> Create one</Text>
                                    </Pressable>
                                </View>
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
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 32,
    },

    scrollContentWithKeyboard: {
        justifyContent: "flex-start",
        paddingTop: 16,
        paddingBottom: 280,
    },

    formWrapper: {
        width: "100%",
    },

    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 28,
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

    title: {
        fontSize: 30,
        fontWeight: "800",
        color: "#143438",
        letterSpacing: -0.5,
    },

    subtitle: {
        marginTop: 8,
        marginBottom: 26,
        fontSize: 15,
        lineHeight: 22,
        color: "#586E71",
    },

    form: {
        width: "100%",
    },

    label: {
        marginBottom: 8,
        fontSize: 14,
        fontWeight: "700",
        color: "#143438",
    },

    input: {
        height: 54,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        marginBottom: 18,
        fontSize: 15,
        fontWeight: "500",
        color: "#0F1E21",
    },

    inputFocused: {
        borderColor: "#52B69A",
        backgroundColor: "#FFFFFF",
    },

    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        height: 54,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        marginBottom: 22,
    },

    passwordInput: {
        flex: 1,
        height: "100%",
        fontSize: 15,
        fontWeight: "500",
        color: "#0F1E21",
        paddingVertical: 0,
    },

    eyeButton: {
        paddingLeft: 8,
        justifyContent: "center",
        alignItems: "center",
    },

    button: {
        height: 56,
        borderRadius: 16,
        backgroundColor: "#143438",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 6,
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

    registerRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 24,
    },

    registerText: {
        color: "#586E71",
        fontSize: 14,
        fontWeight: "500",
    },

    registerLink: {
        color: "#52B69A",
        fontWeight: "700",
        fontSize: 14,
    },
});