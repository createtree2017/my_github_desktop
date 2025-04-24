import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Divider, Button, ActivityIndicator, Chip, TextInput } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { useCampaign } from '../../context/CampaignContext';
import { useAuth } from '../../context/AuthContext';
import { useApplication } from '../../context/ApplicationContext';
import { Campaign, Application } from '../../types';

type Props = NativeStackScreenProps<AppStackParamList, 'CampaignDetail'>;

const CampaignDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { campaignId } = route.params;
  const { state: campaignState, fetchCampaign } = useCampaign();
  const { state: authState } = useAuth();
  const { state: applicationState, createApplication, fetchUserApplications } = useApplication();
  
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { selectedCampaign, isLoading, error } = campaignState;
  const { user } = authState;
  const { userApplications } = applicationState;

  useEffect(() => {
    fetchCampaign(campaignId);
    if (user) {
      fetchUserApplications();
    }
  }, [campaignId, user]);

  // 현재 사용자가 이 캠페인에 이미 신청했는지 확인
  const hasApplied = userApplications.some(app => app.campaignId === campaignId);

  // 상태 텍스트와 색상
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '진행 중';
      case 'draft':
        return '준비 중';
      case 'closed':
        return '마감됨';
      case 'cancelled':
        return '취소됨';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'draft':
        return 'blue';
      case 'closed':
        return 'grey';
      case 'cancelled':
        return 'red';
      default:
        return 'grey';
    }
  };

  // 폼 필드 변경 처리
  const handleFieldChange = (field: string, value: string) => {
    setFormValues({
      ...formValues,
      [field]: value,
    });
    
    // 에러 메시지 제거
    if (formErrors[field]) {
      const newErrors = { ...formErrors };
      delete newErrors[field];
      setFormErrors(newErrors);
    }
  };

  // 폼 유효성 검사
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!selectedCampaign) return false;
    
    selectedCampaign.requiredFields.forEach(field => {
      if (!formValues[field] || formValues[field].trim() === '') {
        errors[field] = `${field}을(를) 입력해주세요.`;
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 신청 제출 처리
  const handleSubmit = async () => {
    if (!validateForm() || !user || !selectedCampaign) return;
    
    setIsSubmitting(true);
    
    try {
      await createApplication({
        campaignId: selectedCampaign.id,
        userId: user.id,
        fields: formValues,
      });
      
      Alert.alert(
        '신청 완료',
        '캠페인 신청이 완료되었습니다. 승인 결과는 추후 알려드립니다.',
        [{ text: '확인', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('오류 발생', '신청 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 관리자 기능: 신청자 목록 보기
  const handleViewApplications = () => {
    navigation.navigate('ApplicationsList', { campaignId });
  };

  // 관리자 기능: 캠페인 수정
  const handleEditCampaign = () => {
    navigation.navigate('EditCampaign', { campaignId });
  };

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>캠페인 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button onPress={() => fetchCampaign(campaignId)}>다시 시도</Button>
      </View>
    );
  }

  if (!selectedCampaign) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>캠페인 정보를 찾을 수 없습니다.</Text>
        <Button onPress={() => navigation.goBack()}>돌아가기</Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{selectedCampaign.title}</Text>
            <Chip
              mode="outlined"
              textStyle={{ fontSize: 12 }}
              style={{ backgroundColor: getStatusColor(selectedCampaign.status) + '20' }}
            >
              {getStatusText(selectedCampaign.status)}
            </Chip>
          </View>
          <Text style={styles.description}>{selectedCampaign.description}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>캠페인 정보</Text>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>모집 대상</Text>
            <Text style={styles.infoValue}>{selectedCampaign.targetAudience}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>모집 기간</Text>
            <Text style={styles.infoValue}>
              {new Date(selectedCampaign.startDate).toLocaleDateString()} ~ {new Date(selectedCampaign.endDate).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>모집 인원</Text>
            <Text style={styles.infoValue}>{selectedCampaign.maxParticipants}명</Text>
          </View>
        </Card.Content>
      </Card>

      {/* 관리자 기능 */}
      {user?.role === 'admin' && (
        <Card style={styles.adminCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>관리자 메뉴</Text>
            <Divider style={styles.divider} />
            <View style={styles.adminButtons}>
              <Button 
                mode="contained" 
                onPress={handleViewApplications}
                style={styles.adminButton}
              >
                신청자 목록 보기
              </Button>
              <Button 
                mode="outlined" 
                onPress={handleEditCampaign}
                style={styles.adminButton}
              >
                캠페인 수정
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* 신청 양식 (관리자가 아니고, 진행 중인 캠페인인 경우) */}
      {user?.role !== 'admin' && selectedCampaign.status === 'active' && (
        <Card style={styles.formCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>
              {hasApplied ? '신청 완료' : '신청 양식'}
            </Text>
            <Divider style={styles.divider} />
            
            {hasApplied ? (
              <View style={styles.appliedContainer}>
                <Text style={styles.appliedText}>
                  이미 이 캠페인에 신청하셨습니다.
                </Text>
                <Text style={styles.appliedSubtext}>
                  신청 내역은 '내 신청 내역' 메뉴에서 확인하실 수 있습니다.
                </Text>
              </View>
            ) : (
              <>
                {selectedCampaign.requiredFields.map(field => (
                  <View key={field} style={styles.formField}>
                    <TextInput
                      label={field}
                      value={formValues[field] || ''}
                      onChangeText={(value) => handleFieldChange(field, value)}
                      mode="outlined"
                      error={!!formErrors[field]}
                    />
                    {formErrors[field] && (
                      <Text style={styles.errorText}>{formErrors[field]}</Text>
                    )}
                  </View>
                ))}
                
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={styles.submitButton}
                >
                  신청하기
                </Button>
              </>
            )}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  infoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    width: 100,
    fontWeight: 'bold',
    color: '#555',
  },
  infoValue: {
    flex: 1,
    color: '#333',
  },
  adminCard: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#f9f0ff',
  },
  adminButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  adminButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  formCard: {
    marginBottom: 16,
    elevation: 2,
  },
  formField: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  appliedContainer: {
    alignItems: 'center',
    padding: 16,
  },
  appliedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 8,
  },
  appliedSubtext: {
    color: '#666',
  },
});

export default CampaignDetailScreen; 