import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, HelperText, MD3Colors } from 'react-native-paper';
import { DatePickerInput } from 'react-native-paper-dates';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { useCampaign } from '../../context/CampaignContext';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<AppStackParamList, 'CreateCampaign'>;

const CreateCampaignScreen: React.FC<Props> = ({ navigation }) => {
  const { createCampaign } = useCampaign();
  const { state: authState } = useAuth();
  const { user } = authState;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [requiredFields, setRequiredFields] = useState('이름,전화번호,나이');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() + 30))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }

    if (!description.trim()) {
      newErrors.description = '설명을 입력해주세요.';
    }

    if (!targetAudience.trim()) {
      newErrors.targetAudience = '대상을 입력해주세요.';
    }

    if (!maxParticipants.trim()) {
      newErrors.maxParticipants = '최대 참가자 수를 입력해주세요.';
    } else if (isNaN(Number(maxParticipants)) || Number(maxParticipants) <= 0) {
      newErrors.maxParticipants = '최대 참가자 수는 양수여야 합니다.';
    }

    if (!requiredFields.trim()) {
      newErrors.requiredFields = '필수 입력 항목을 입력해주세요.';
    }

    if (!startDate) {
      newErrors.startDate = '시작일을 입력해주세요.';
    }

    if (!endDate) {
      newErrors.endDate = '종료일을 입력해주세요.';
    } else if (startDate && endDate && endDate < startDate) {
      newErrors.endDate = '종료일은 시작일 이후여야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;

    setIsSubmitting(true);

    try {
      const campaign = {
        title,
        description,
        targetAudience,
        maxParticipants: Number(maxParticipants),
        requiredFields: requiredFields.split(',').map(field => field.trim()),
        startDate: startDate as Date,
        endDate: endDate as Date,
        status: 'draft' as 'draft' | 'active' | 'closed' | 'cancelled',
        createdBy: user.id,
      };

      await createCampaign(campaign);
      Alert.alert(
        '캠페인 생성 완료',
        '캠페인이 성공적으로 생성되었습니다.',
        [{ text: '확인', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('오류 발생', '캠페인 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>새 캠페인 만들기</Text>

        <View style={styles.formContainer}>
          <TextInput
            label="캠페인 제목"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            error={!!errors.title}
          />
          {errors.title && <HelperText type="error">{errors.title}</HelperText>}

          <TextInput
            label="캠페인 설명"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
            error={!!errors.description}
          />
          {errors.description && <HelperText type="error">{errors.description}</HelperText>}

          <TextInput
            label="모집 대상"
            value={targetAudience}
            onChangeText={setTargetAudience}
            mode="outlined"
            style={styles.input}
            error={!!errors.targetAudience}
          />
          {errors.targetAudience && <HelperText type="error">{errors.targetAudience}</HelperText>}

          <TextInput
            label="최대 참가자 수"
            value={maxParticipants}
            onChangeText={setMaxParticipants}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            error={!!errors.maxParticipants}
          />
          {errors.maxParticipants && <HelperText type="error">{errors.maxParticipants}</HelperText>}

          <TextInput
            label="필수 입력 항목 (쉼표로 구분)"
            value={requiredFields}
            onChangeText={setRequiredFields}
            mode="outlined"
            style={styles.input}
            error={!!errors.requiredFields}
          />
          {errors.requiredFields ? (
            <HelperText type="error">{errors.requiredFields}</HelperText>
          ) : (
            <HelperText type="info">예: 이름,전화번호,나이</HelperText>
          )}

          <Text style={styles.dateLabel}>모집 기간</Text>
          <View style={styles.dateContainer}>
            <View style={styles.dateInput}>
              <DatePickerInput
                locale="ko"
                label="시작일"
                value={startDate}
                onChange={setStartDate}
                inputMode="start"
                mode="outlined"
                error={!!errors.startDate}
              />
              {errors.startDate && <HelperText type="error">{errors.startDate}</HelperText>}
            </View>

            <View style={styles.dateInput}>
              <DatePickerInput
                locale="ko"
                label="종료일"
                value={endDate}
                onChange={setEndDate}
                inputMode="end"
                mode="outlined"
                error={!!errors.endDate}
              />
              {errors.endDate && <HelperText type="error">{errors.endDate}</HelperText>}
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.button}
          >
            캠페인 생성하기
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  button: {
    marginTop: 16,
    marginBottom: 32,
    paddingVertical: 8,
  },
});

export default CreateCampaignScreen; 