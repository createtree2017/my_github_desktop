import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const { register, state, clearError } = useAuth();
  const { isLoading, error } = state;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }
    
    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요.';
    }
    
    if (!password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = '전화번호를 입력해주세요.';
    } else if (!/^\d{3}-\d{3,4}-\d{4}$/.test(phoneNumber)) {
      newErrors.phoneNumber = '올바른 전화번호 형식(010-1234-5678)으로 입력해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (validate()) {
      await register(name, email, password, phoneNumber);
    }
  };

  const navigateToLogin = () => {
    clearError();
    navigation.navigate('Login');
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const toggleConfirmSecureEntry = () => {
    setConfirmSecureTextEntry(!confirmSecureTextEntry);
  };

  const formatPhoneNumber = (text: string) => {
    // 숫자만 추출
    const numbers = text.replace(/[^\d]/g, '');
    
    // 전화번호 형식으로 포맷팅
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneNumberChange = (text: string) => {
    setPhoneNumber(formatPhoneNumber(text));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>회원가입</Text>
          <Text style={styles.subtitle}>산부인과 문화센터에 오신 것을 환영합니다</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            label="이름"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            error={!!errors.name}
          />
          {errors.name ? (
            <HelperText type="error" visible={!!errors.name}>
              {errors.name}
            </HelperText>
          ) : null}

          <TextInput
            label="이메일"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            error={!!errors.email}
          />
          {errors.email ? (
            <HelperText type="error" visible={!!errors.email}>
              {errors.email}
            </HelperText>
          ) : null}

          <TextInput
            label="비밀번호"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={secureTextEntry}
            style={styles.input}
            error={!!errors.password}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? 'eye' : 'eye-off'}
                onPress={toggleSecureEntry}
              />
            }
          />
          {errors.password ? (
            <HelperText type="error" visible={!!errors.password}>
              {errors.password}
            </HelperText>
          ) : null}

          <TextInput
            label="비밀번호 확인"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry={confirmSecureTextEntry}
            style={styles.input}
            error={!!errors.confirmPassword}
            right={
              <TextInput.Icon
                icon={confirmSecureTextEntry ? 'eye' : 'eye-off'}
                onPress={toggleConfirmSecureEntry}
              />
            }
          />
          {errors.confirmPassword ? (
            <HelperText type="error" visible={!!errors.confirmPassword}>
              {errors.confirmPassword}
            </HelperText>
          ) : null}

          <TextInput
            label="전화번호"
            value={phoneNumber}
            onChangeText={handlePhoneNumberChange}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            error={!!errors.phoneNumber}
            placeholder="010-1234-5678"
          />
          {errors.phoneNumber ? (
            <HelperText type="error" visible={!!errors.phoneNumber}>
              {errors.phoneNumber}
            </HelperText>
          ) : null}

          {error ? (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
          >
            회원가입
          </Button>

          <View style={styles.loginContainer}>
            <Text variant="bodyMedium">이미 계정이 있으신가요?</Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginText} variant="bodyMedium">
                로그인
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  headerContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  loginText: {
    marginLeft: 8,
    color: '#6200ee',
    fontWeight: 'bold',
  },
});

export default RegisterScreen; 