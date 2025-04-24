import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Divider, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { useApplication } from '../../context/ApplicationContext';
import { useCampaign } from '../../context/CampaignContext';

type Props = NativeStackScreenProps<AppStackParamList, 'ApplicationDetail'>;

const ApplicationDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { applicationId } = route.params;
  const { state: applicationState, updateApplicationStatus } = useApplication();
  const { state: campaignState } = useCampaign();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [campaign, setCampaign] = useState<any>(null);
  
  useEffect(() => {
    // 실제 구현에서는 API로 상세 정보를 가져옵니다.
    // 이 예제에서는 상태에서 찾아 사용합니다.
    const findApplication = applicationState.applications.find(app => app.id === applicationId);
    
    if (findApplication) {
      setApplication(findApplication);
      
      // 캠페인 정보 찾기
      const findCampaign = campaignState.campaigns.find(camp => camp.id === findApplication.campaignId);
      if (findCampaign) {
        setCampaign(findCampaign);
      }
    }
    
    setIsLoading(false);
  }, [applicationId, applicationState.applications, campaignState.campaigns]);
  
  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await updateApplicationStatus(applicationId, 'approved');
      Alert.alert('성공', '신청서가 승인되었습니다.');
      // 상태 업데이트
      setApplication({
        ...application,
        status: 'approved'
      });
    } catch (error) {
      Alert.alert('오류 발생', '승인 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await updateApplicationStatus(applicationId, 'rejected');
      Alert.alert('성공', '신청서가 거절되었습니다.');
      // 상태 업데이트
      setApplication({
        ...application,
        status: 'rejected'
      });
    } catch (error) {
      Alert.alert('오류 발생', '거절 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#2e7d32';
      case 'rejected':
        return '#c62828';
      default:
        return '#f57c00';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '승인됨';
      case 'rejected':
        return '거절됨';
      default:
        return '대기중';
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>신청서 정보를 불러오는 중...</Text>
      </View>
    );
  }
  
  if (!application) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>신청서를 찾을 수 없습니다.</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          돌아가기
        </Button>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>신청서 상세 정보</Text>
            <Chip
              textStyle={{ color: 'white' }}
              style={[styles.statusChip, { backgroundColor: getStatusColor(application.status) }]}
            >
              {getStatusText(application.status)}
            </Chip>
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>캠페인 정보</Text>
          <Text style={styles.campaignTitle}>
            {campaign ? campaign.title : application.campaignTitle || '알 수 없음'}
          </Text>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>신청자 정보</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>이름:</Text>
            <Text style={styles.infoValue}>
              {application.fields?.['이름'] || application.userName || '정보 없음'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>연락처:</Text>
            <Text style={styles.infoValue}>
              {application.fields?.['전화번호'] || application.phoneNumber || '정보 없음'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>신청일:</Text>
            <Text style={styles.infoValue}>
              {new Date(application.createdAt).toLocaleDateString('ko-KR')}
            </Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>신청서 내용</Text>
          {application.fields ? (
            Object.entries(application.fields).map(([key, value]) => 
              key !== '이름' && key !== '전화번호' ? (
                <View style={styles.infoRow} key={key}>
                  <Text style={styles.infoLabel}>{key}:</Text>
                  <Text style={styles.infoValue}>{value as string}</Text>
                </View>
              ) : null
            )
          ) : application.answers ? (
            Object.entries(application.answers).map(([key, value]) => (
              <View style={styles.infoRow} key={key}>
                <Text style={styles.infoLabel}>{key}:</Text>
                <Text style={styles.infoValue}>{value as string}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>신청서 내용이 없습니다.</Text>
          )}
        </Card.Content>
      </Card>
      
      {application.status === 'pending' && (
        <View style={styles.actionContainer}>
          <Button
            mode="contained"
            onPress={handleApprove}
            disabled={isProcessing}
            loading={isProcessing}
            style={[styles.actionButton, styles.approveButton]}
          >
            승인하기
          </Button>
          <Button
            mode="contained"
            onPress={handleReject}
            disabled={isProcessing}
            loading={isProcessing}
            style={[styles.actionButton, styles.rejectButton]}
          >
            거절하기
          </Button>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statusChip: {
    height: 28,
  },
  divider: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  campaignTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 80,
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
  },
  noDataText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#757575',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  approveButton: {
    backgroundColor: '#2e7d32',
  },
  rejectButton: {
    backgroundColor: '#c62828',
  },
  button: {
    marginTop: 16,
  },
});

export default ApplicationDetailScreen; 