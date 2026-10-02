import { useEffect, useMemo, useRef, useState } from "react";
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
import { router } from "expo-router";

import { useAuth } from "@/context/AuthContext";

export default function RegisterScreen() {
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Password strength calculation (0 to 4 bars)
  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.max(1, score);
  }, [password]);

  const strengthColor = useMemo(() => {
    if (passwordStrength <= 1) return "#EF4444";
    if (passwordStrength === 2) return "#F59E0B";
    if (passwordStrength === 3) return "#52B69A";
    return "#10B981";
  }, [passwordStrength]);

  async function handleRegister() {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Missing information", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Weak password", "Password must be at least 8 characters long.");
      return;
    }

    try {
      setIsSubmitting(true);

      await register({
        email: email.trim(),
        password,
        confirmPassword,
      });

      router.push({
        pathname: "/verify-email",
        params: {
          email: email.trim().toLowerCase(),
        },
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to create your account.";

      Alert.alert("Registration failed", message);
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

            {/* Main Form Content */}
            <View style={styles.formWrapper}>
              <Text style={styles.title}>Create your account</Text>
              <Text style={styles.subtitle}>
                Create an account to discover and manage trusted local services.
              </Text>

              <View style={styles.form}>
                {/* Email Field */}
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Enter your email"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                      }, 150);
                    }}
                  />
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#94A3B8"
                    style={styles.inputRightIcon}
                  />
                </View>

                {/* Password Field */}
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Password</Text>
                  <Text style={styles.helperLabel}>Min. 8 characters</Text>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Minimum 8 characters"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollTo({ y: 100, animated: true });
                      }, 150);
                    }}
                  />
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    style={styles.eyeButton}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#94A3B8"
                    />
                  </Pressable>
                </View>

                {/* Password Strength Meter */}
                {password.length > 0 && (
                  <View style={styles.strengthMeter}>
                    {[1, 2, 3, 4].map((seg) => (
                      <View
                        key={seg}
                        style={[
                          styles.strengthBar,
                          {
                            backgroundColor:
                              seg <= passwordStrength ? strengthColor : "#E2E8F0",
                          },
                        ]}
                      />
                    ))}
                  </View>
                )}

                {/* Confirm Password Field */}
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Re-enter your password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                      }, 150);
                    }}
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                    style={styles.eyeButton}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword
                          ? "eye-off-outline"
                          : "eye-outline"
                      }
                      size={20}
                      color="#94A3B8"
                    />
                  </Pressable>
                </View>

                {/* Submit Button */}
                <Pressable
                  style={[
                    styles.button,
                    isSubmitting && styles.buttonDisabled,
                  ]}
                  onPress={handleRegister}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text style={styles.buttonText}>Create Account</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={18}
                        color="#76C893"
                        style={styles.buttonArrow}
                      />
                    </View>
                  )}
                </Pressable>

                {/* Login Redirect */}
                <View style={styles.loginRow}>
                  <Text style={styles.loginText}>
                    Already have an account?
                  </Text>
                  <Pressable onPress={() => router.push("/login")}>
                    <Text style={styles.loginLink}> Log in</Text>
                  </Pressable>
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

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    justifyContent: "center",
  },

  scrollContentWithKeyboard: {
    justifyContent: "flex-start",
    paddingTop: 8,
    paddingBottom: 280,
  },

  topNav: {
    marginBottom: 20,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  brandLogoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#143438",
    alignItems: "center",
    justifyContent: "center",
  },

  brandTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#143438",
    letterSpacing: -0.5,
  },

  brandTeal: {
    color: "#52B69A",
  },

  formWrapper: {
    width: "100%",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
    lineHeight: 34,
  },

  subtitle: {
    marginTop: 6,
    marginBottom: 24,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
  },

  form: {
    width: "100%",
  },

  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  helperLabel: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  inputField: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: "#0F172A",
    paddingVertical: 0,
  },

  inputRightIcon: {
    marginLeft: 8,
  },

  eyeButton: {
    paddingLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  strengthMeter: {
    flexDirection: "row",
    gap: 6,
    marginTop: -8,
    marginBottom: 16,
    paddingHorizontal: 2,
  },

  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },

  button: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#143438",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#143438",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  buttonArrow: {
    marginLeft: 8,
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
  },

  loginText: {
    color: "#64748B",
    fontSize: 14,
  },

  loginLink: {
    color: "#52B69A",
    fontWeight: "700",
    fontSize: 14,
  },
});