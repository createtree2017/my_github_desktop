import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, HelperText, ActivityIndicator } from 'react-native-paper';
import { DatePickerInput } from 'react-native-paper-dates';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { useCampaign } from '../../context/CampaignContext';

type Props = NativeStackScreenProps<AppStackParamList, 'EditCampaign'>;

const EditCampaignScreen: React.FC<Props> = ({ route, navigation }) => {
  const { campaignId } = route.params;
  const { getCampaignById, updateCampaign } = useCampaign();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [requiredFields, setRequiredFields] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState<'draft' | 'active' | 'closed' | 'cancelled'>('draft');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const campaign = await getCampaignById(campaignId);
        if (campaign) {
          setTitle(campaign.title);
          setDescription(campaign.description);
          setTargetAudience(campaign.targetAudience);
          setMaxParticipants(campaign.maxParticipants.toString());
          setRequiredFields(campaign.requiredFields.join(','));
          setStartDate(new Date(campaign.startDate));
          setEndDate(new Date(campaign.endDate));
          setStatus(campaign.status);
        } else {
          Alert.alert('오류', '캠페인을 찾을 수 없습니다.');
          navigation.goBack();
        }
      } catch (error) {
        Alert.alert('오류 발생', '캠페인 정보를 불러오는 중 오류가 발생했습니다.');
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId, getCampaignById, navigation]);

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
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const updatedCampaign = {
        id: campaignId,
        title,
        description,
        targetAudience,
        maxParticipants: Number(maxParticipants),
        requiredFields: requiredFields.split(',').map(field => field.trim()),
        startDate: startDate as Date,
        endDate: endDate as Date,
        status,
      };

      await updateCampaign(updatedCampaign);
      Alert.alert(
        '캠페인 수정 완료',
        '캠페인이 성공적으로 수정되었습니다.',
        [{ text: '확인', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('오류 발생', '캠페인 수정 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>캠페인 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>캠페인 수정</Text>

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
                onChange={(date) => setStartDate(date)}
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
                onChange={(date) => setEndDate(date)}
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
            캠페인 수정하기
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
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

export default EditCampaignScreen; 