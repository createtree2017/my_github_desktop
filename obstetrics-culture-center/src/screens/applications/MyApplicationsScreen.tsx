import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Chip, Divider, ActivityIndicator, Button } from 'react-native-paper';
import { useApplication } from '../../context/ApplicationContext';
import { useCampaign } from '../../context/CampaignContext';
import { Application, Campaign } from '../../types';

const MyApplicationsScreen = () => {
  const { state: applicationState, fetchUserApplications } = useApplication();
  const { state: campaignState, fetchCampaigns } = useCampaign();
  const [refreshing, setRefreshing] = useState(false);

  const { userApplications, isLoading, error } = applicationState;
  const { campaigns } = campaignState;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await fetchUserApplications();
    await fetchCampaigns();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // 신청서 상태 표시 텍스트와 색상
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '검토중';
      case 'approved':
        return '승인됨';
      case 'rejected':
        return '거절됨';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'grey';
    }
  };

  // 캠페인 정보 찾기
  const getCampaignDetails = (campaignId: string) => {
    return campaigns.find(campaign => campaign.id === campaignId);
  };

  const renderApplicationItem = ({ item }: { item: Application }) => {
    const campaign = getCampaignDetails(item.campaignId);
    
    if (!campaign) {
      return null; // 캠페인 정보가 없으면 표시하지 않음
    }

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.campaignTitle}>{campaign.title}</Text>
            <Chip
              mode="outlined"
              textStyle={{ fontSize: 12 }}
              style={{ backgroundColor: getStatusColor(item.status) + '20' }}
            >
              {getStatusText(item.status)}
            </Chip>
          </View>
          
          <Text style={styles.dateText}>
            신청일: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>신청 정보</Text>
          
          {Object.entries(item.fields).map(([key, value]) => (
            <View key={key} style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{key}</Text>
              <Text style={styles.fieldValue}>{value}</Text>
            </View>
          ))}
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>캠페인 정보</Text>
          
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>모집 대상</Text>
            <Text style={styles.fieldValue}>{campaign.targetAudience}</Text>
          </View>
          
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>모집 기간</Text>
            <Text style={styles.fieldValue}>
              {new Date(campaign.startDate).toLocaleDateString()} ~ {new Date(campaign.endDate).toLocaleDateString()}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>신청 내역을 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button onPress={loadData}>다시 시도</Button>
      </View>
    );
  }

  if (userApplications.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.emptyText}>신청 내역이 없습니다.</Text>
        <Text style={styles.emptySubtext}>캠페인에 참여하고 신청해보세요!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={userApplications}
        keyExtractor={(item) => item.id}
        renderItem={renderApplicationItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6200ee']}
          />
        }
      />
    </View>
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
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#888',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  campaignTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  divider: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  fieldLabel: {
    width: 100,
    fontWeight: 'bold',
    color: '#555',
  },
  fieldValue: {
    flex: 1,
    color: '#333',
  },
});

export default MyApplicationsScreen; 