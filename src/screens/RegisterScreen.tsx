import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AuthContext } from '../navigation/AuthContext';
import { useGlossary } from '../contexts/GlossaryContext';
import { loginRequest, registerRequest } from '../api/authApi';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showNameFields, setShowNameFields] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');
  const { signIn } = React.useContext(AuthContext);
  const { setUserId } = useGlossary();

  const handleCreateAccountPress = async () => {
    setErrorText('');

    if (!showNameFields) {
      setShowNameFields(true);
      return;
    }

    if (!firstName.trim() || !email.trim() || !password.trim()) {
      setErrorText('Заполните имя, email и пароль.');
      return;
    }

    setIsSubmitting(true);

    try {
      await registerRequest({
        name: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password: password.trim(),
      });
      const user = await loginRequest({
        email: email.trim(),
        password: password.trim(),
      });
      setUserId(user.id);
      signIn();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось создать аккаунт');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackPress = () => {
    setErrorText('');
    setShowNameFields(false);
  };

  const handleLoginPress = async () => {
    if (showNameFields) {
      handleBackPress();
      return;
    }

    setErrorText('');

    if (!email.trim() || !password.trim()) {
      setErrorText('Введите email и пароль для входа.');
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await loginRequest({
        email: email.trim(),
        password: password.trim(),
      });
      setUserId(user.id);
      signIn();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Не удалось выполнить вход');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="book" size={26} color={colors.text.light} />
          </View>
          <Text style={styles.appName}>Грани общества</Text>
          <Text style={styles.subtitle}>Изучай право и экономику через интерактивные тренировки</Text>
        </View>

        <View style={styles.featureCard}>
          <Ionicons name="checkmark-circle" size={20} color={colors.secondary.main} />
          <View style={styles.featureTextWrap}>
            <Text style={styles.featureTitle}>Тесты как в Duolingo</Text>
            <Text style={styles.featureSubtitle}>Короткие игровые сессии каждый день.</Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <Ionicons name="albums" size={20} color={colors.primary.main} />
          <View style={styles.featureTextWrap}>
            <Text style={styles.featureTitle}>Изучение терминов</Text>
            <Text style={styles.featureSubtitle}>Умные карточки для быстрого запоминания.</Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <Ionicons name="trophy" size={20} color={colors.tertiary.main} />
          <View style={styles.featureTextWrap}>
            <Text style={styles.featureTitle}>Рейтинг и задания</Text>
            <Text style={styles.featureSubtitle}>Соревнуйся и выполняй цели.</Text>
          </View>
        </View>

        <View style={styles.form}>
          {showNameFields && (
            <>
              <Text style={styles.label}>Фамилия</Text>
              <TextInput
                style={styles.input}
                placeholder="Иванов"
                placeholderTextColor={colors.neutral.light}
                value={lastName}
                onChangeText={setLastName}
              />

              <Text style={[styles.label, { marginTop: 16 }]}>Имя</Text>
              <TextInput
                style={styles.input}
                placeholder="Иван"
                placeholderTextColor={colors.neutral.light}
                value={firstName}
                onChangeText={setFirstName}
              />
            </>
          )}

          <Text style={styles.label}>Электронная почта</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor={colors.neutral.light}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Пароль</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={colors.neutral.light}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable style={styles.registerButton} onPress={handleCreateAccountPress}>
            {isSubmitting ? (
              <ActivityIndicator color={colors.text.light} />
            ) : (
              <Text style={styles.registerButtonText}>
                {showNameFields ? 'Подтвердить и войти' : 'Создать аккаунт'}
              </Text>
            )}
          </Pressable>

          <Pressable 
            style={showNameFields ? styles.backButton : styles.loginGhostButton}
            onPress={handleLoginPress}
            disabled={isSubmitting}
          >
            <Text style={showNameFields ? styles.backButtonText : styles.loginGhostText}>
              {showNameFields ? 'Назад' : 'Войти'}
            </Text>
          </Pressable>

          {!!errorText && <Text style={styles.errorText}>{errorText}</Text>}
        </View>

        <Text style={styles.termsText}>
          Нажимая кнопку, вы соглашаетесь с Условиями использования и Политикой конфиденциальности.
        </Text>
      </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F0F7F0',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingVertical: 22,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  appName: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 21,
  },
  featureCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    gap: 10,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  form: {
    marginTop: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    backgroundColor: colors.surface,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.surface,
  },
  registerButton: {
    marginTop: 14,
    backgroundColor: colors.primary.main,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.light,
  },
  loginGhostButton: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary.main,
    backgroundColor: '#FFFFFF',
  },
  loginGhostText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary.main,
  },
  backButton: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  errorText: {
    marginTop: 10,
    color: '#B42318',
    fontSize: 13,
    textAlign: 'center',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 16,
  },
});

