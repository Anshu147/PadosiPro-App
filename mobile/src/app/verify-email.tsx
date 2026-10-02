import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
import { router, useLocalSearchParams } from "expo-router";

import { useAuth } from "@/context/AuthContext";

export default function VerifyEmailScreen() {
    const { email } = useLocalSearchParams<{ email: string }>();
    const { verify, resend } = useAuth();

    const [otp, setOtp] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(30);

    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (resendCountdown <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setResendCountdown((previous) => previous - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [resendCountdown]);

    async function handleVerify() {
        if (otp.length !== 6) {
            Alert.alert("Invalid OTP", "Please enter the 6-digit OTP.");
            return;
        }

        if (!email) {
            Alert.alert(
                "Verification error",
                "Email address is missing. Please register again."
            );
            return;
        }

        try {
            setIsVerifying(true);

            await verify(email, otp);

            Alert.alert(
                "Email verified",
                "Your email has been verified successfully.",
                [
                    {
                        text: "Continue",
                        onPress: () => {
                            router.replace("/login");
                        },
                    },
                ]
            );
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Unable to verify your email.";

            Alert.alert("Verification failed", message);
        } finally {
            setIsVerifying(false);
        }
    }

    async function handleResend() {
        if (!email || resendCountdown > 0) {
            return;
        }

        try {
            setIsResending(true);

            await resend(email);

            setOtp("");
            setResendCountdown(30);

            Alert.alert(
                "OTP sent",
                "A new verification code has been sent to your email."
            );
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Unable to resend the OTP.";

            Alert.alert("Resend failed", message);
        } finally {
            setIsResending(false);
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.content}>
                            {/* Navigation Bar */}
                            <View style={styles.navBar}>
                                <Pressable
                                    onPress={() => router.back()}
                                    style={styles.backButton}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="arrow-back" size={20} color="#143438" />
                                </Pressable>

                                <View style={styles.brandRow}>
                                    <View style={styles.logoBadge}>
                                        <Svg width={30} height={30} viewBox="0 0 100 100">
                                            <Rect width="100" height="100" rx="24" fill="#143438" />
                                            <Path d="M50 24L26 48L36 58L50 44L64 58L74 48L50 24Z" fill="#52B69A" />
                                            <Path d="M50 48L34 64L42 72L50 64L58 72L66 64L50 48Z" fill="#76C893" />
                                        </Svg>
                                    </View>
                                    <Text style={styles.brandText}>
                                        Padosi<Text style={styles.brandTeal}>Pro</Text>
                                    </Text>
                                </View>

                                <View style={{ width: 40 }} />
                            </View>

                            {/* Security Step Badge */}
                            <View style={styles.stepBadge}>
                                <View style={styles.stepDot} />
                                <Text style={styles.stepText}>SECURITY STEP</Text>
                            </View>

                            <Text style={styles.title}>Verify your email</Text>

                            <Text style={styles.subtitle}>
                                We sent a 6-digit verification code to
                            </Text>

                            <View style={styles.emailChipRow}>
                                <Text style={styles.emailChipText}>{email || "your email"}</Text>
                                <Pressable onPress={() => router.replace("/register")}>
                                    <Text style={styles.changeLink}>Change</Text>
                                </Pressable>
                            </View>

                            <View style={styles.expiryRow}>
                                <Ionicons name="time-outline" size={16} color="#64748B" />
                                <Text style={styles.expiry}>
                                    The code expires in <Text style={styles.expiryBold}>10 minutes</Text>.
                                </Text>
                            </View>

                            {/* OTP Box Container */}
                            <View style={styles.form}>
                                <View style={styles.otpHeaderRow}>
                                    <Text style={styles.label}>Verification Code</Text>
                                    <Text style={styles.digitHint}>6 digits</Text>
                                </View>

                                {/* 6 visual digit boxes */}
                                <Pressable
                                    onPress={() => inputRef.current?.focus()}
                                    style={styles.otpBoxesRow}
                                >
                                    {[0, 1, 2, 3, 4, 5].map((index) => {
                                        const char = otp[index] || "";
                                        const isCurrent = otp.length === index;
                                        return (
                                            <View
                                                key={index}
                                                style={[
                                                    styles.otpBox,
                                                    isCurrent && styles.otpBoxActive,
                                                    char ? styles.otpBoxFilled : null,
                                                ]}
                                            >
                                                <Text style={styles.otpChar}>
                                                    {char || (isCurrent ? "•" : "")}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </Pressable>

                                {/* Hidden Master Input */}
                                <TextInput
                                    ref={inputRef}
                                    style={styles.hiddenInput}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    value={otp}
                                    onChangeText={(val) => setOtp(val.replace(/[^0-9]/g, ""))}
                                    autoFocus
                                />

                                <Pressable
                                    style={[
                                        styles.button,
                                        isVerifying && styles.buttonDisabled,
                                    ]}
                                    onPress={handleVerify}
                                    disabled={isVerifying}
                                >
                                    {isVerifying ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <View style={styles.buttonContent}>
                                            <Text style={styles.buttonText}>Verify Email</Text>
                                            <Ionicons name="arrow-forward" size={18} color="#76C893" />
                                        </View>
                                    )}
                                </Pressable>

                                {/* Resend Section */}
                                <View style={styles.resendContainer}>
                                    {resendCountdown > 0 ? (
                                        <View style={styles.countdownRow}>
                                            <Ionicons name="sync-outline" size={16} color="#64748B" />
                                            <Text style={styles.resendDisabled}>
                                                Resend code in <Text style={styles.countdownBold}>{resendCountdown}s</Text>
                                            </Text>
                                        </View>
                                    ) : (
                                        <Pressable
                                            onPress={handleResend}
                                            disabled={isResending}
                                        >
                                            {isResending ? (
                                                <ActivityIndicator color="#52B69A" />
                                            ) : (
                                                <Text style={styles.resendLink}>
                                                    Resend verification code
                                                </Text>
                                            )}
                                        </Pressable>
                                    )}
                                    <Text style={styles.spamNote}>
                                        Did not receive the email? Check your Spam or Promotions folder.
                                    </Text>
                                </View>

                                {/* Footer link */}
                                <Pressable onPress={() => router.replace("/login")} style={styles.loginRow}>
                                    <Text style={styles.loginPrompt}>
                                        Already verified? <Text style={styles.loginLink}>Log in</Text>
                                    </Text>
                                    <Ionicons name="chevron-forward" size={16} color="#52B69A" />
                                </Pressable>

                                {/* Resident Security Badge */}
                                <View style={styles.trustBadge}>
                                    <Ionicons name="shield-checkmark" size={15} color="#76C893" />
                                    <Text style={styles.trustText}>
                                        Protected by PadosiPro Resident Security
                                    </Text>
                                </View>
                            </View>
                        </View>
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

    container: {
        flex: 1,
    },

    scrollContent: {
        flexGrow: 1,
    },

    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 24,
    },

    navBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
    },

    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#EDF2F4",
        alignItems: "center",
        justifyContent: "center",
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

    brandText: {
        fontSize: 20,
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
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: "#E6F4F1",
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
        fontSize: 11,
        fontWeight: "800",
        color: "#143438",
        letterSpacing: 0.8,
    },

    title: {
        fontSize: 30,
        fontWeight: "800",
        color: "#143438",
        letterSpacing: -0.5,
    },

    subtitle: {
        marginTop: 8,
        fontSize: 15,
        color: "#586E71",
    },

    emailChipRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 6,
        flexWrap: "wrap",
    },

    emailChipText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#143438",
        backgroundColor: "#EDF2F4",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },

    changeLink: {
        fontSize: 13,
        fontWeight: "700",
        color: "#52B69A",
    },

    expiryRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 10,
        marginBottom: 28,
    },

    expiry: {
        fontSize: 13,
        color: "#64748B",
    },

    expiryBold: {
        fontWeight: "600",
        color: "#143438",
    },

    form: {
        width: "100%",
    },

    otpHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },

    label: {
        fontSize: 12,
        fontWeight: "800",
        color: "#64748B",
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },

    digitHint: {
        fontSize: 12,
        fontWeight: "500",
        color: "#94A3B8",
    },

    otpBoxesRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
    },

    otpBox: {
        width: 48,
        height: 56,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#E2E8F0",
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },

    otpBoxActive: {
        borderColor: "#52B69A",
        backgroundColor: "#FFFFFF",
    },

    otpBoxFilled: {
        borderColor: "#CBD5E1",
        backgroundColor: "#F8FAF9",
    },

    otpChar: {
        fontSize: 24,
        fontWeight: "800",
        color: "#143438",
    },

    hiddenInput: {
        position: "absolute",
        width: 1,
        height: 1,
        opacity: 0,
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

    resendContainer: {
        alignItems: "center",
        marginTop: 22,
        marginBottom: 20,
    },

    countdownRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    resendDisabled: {
        color: "#64748B",
        fontSize: 14,
        fontWeight: "500",
    },

    countdownBold: {
        fontWeight: "800",
        color: "#143438",
    },

    resendLink: {
        color: "#52B69A",
        fontSize: 14,
        fontWeight: "700",
    },

    spamNote: {
        fontSize: 12,
        color: "#94A3B8",
        marginTop: 8,
        textAlign: "center",
    },

    loginRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        marginBottom: 24,
    },

    loginPrompt: {
        fontSize: 14,
        fontWeight: "600",
        color: "#143438",
    },

    loginLink: {
        color: "#52B69A",
        fontWeight: "800",
    },

    trustBadge: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingTop: 8,
    },

    trustText: {
        fontSize: 12,
        fontWeight: "500",
        color: "#94A3B8",
    },
});