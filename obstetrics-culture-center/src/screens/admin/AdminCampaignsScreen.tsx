import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, RefreshControl } from 'react-native';
import { Text, Card, FAB, Button, Menu, Divider, ActivityIndicator, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { useCampaign } from '../../context/CampaignContext';
import { Campaign } from '../../types';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const AdminCampaignsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { state, fetchCampaigns, deleteCampaign, updateCampaign } = useCampaign();
  
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  
  const { campaigns, isLoading, error } = state;

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCampaigns();
    setRefreshing(false);
  };

  const handleCreateCampaign = () => {
    navigation.navigate('CreateCampaign');
  };

  const handleEditCampaign = (campaignId: string) => {
    setMenuVisible(null);
    navigation.navigate('EditCampaign', { campaignId });
  };

  const handleViewApplications = (campaignId: string) => {
    setMenuVisible(null);
    navigation.navigate('ApplicationsList', { campaignId });
  };

  const handleDeleteCampaign = (campaignId: string) => {
    setMenuVisible(null);
    Alert.alert(
      '캠페인 삭제',
      '정말 이 캠페인을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCampaign(campaignId);
              Alert.alert('삭제 완료', '캠페인이 삭제되었습니다.');
            } catch (error) {
              Alert.alert('오류 발생', '캠페인 삭제 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  const handleUpdateStatus = (campaign: Campaign, newStatus: 'active' | 'closed' | 'cancelled') => {
    setMenuVisible(null);
    Alert.alert(
      '상태 변경',
      `캠페인 상태를 "${getStatusText(newStatus)}"(으)로 변경하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '변경', 
          onPress: async () => {
            try {
              await updateCampaign(campaign.id, { status: newStatus });
              Alert.alert('변경 완료', '캠페인 상태가 변경되었습니다.');
            } catch (error) {
              Alert.alert('오류 발생', '상태 변경 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  const toggleMenu = (campaignId: string | null) => {
    setMenuVisible(campaignId);
  };

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

  const renderCampaignItem = ({ item }: { item: Campaign }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{item.title}</Text>
          <Chip
            mode="outlined"
            textStyle={{ fontSize: 12 }}
            style={{ backgroundColor: getStatusColor(item.status) + '20' }}
          >
            {getStatusText(item.status)}
          </Chip>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>모집 기간:</Text>
          <Text style={styles.infoValue}>
            {new Date(item.startDate).toLocaleDateString()} ~ {new Date(item.endDate).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>모집 대상:</Text>
          <Text style={styles.infoValue}>{item.targetAudience}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>모집 인원:</Text>
          <Text style={styles.infoValue}>{item.maxParticipants}명</Text>
        </View>
      </Card.Content>

      <Card.Actions>
        <Button 
          mode="text" 
          onPress={() => handleViewApplications(item.id)}
        >
          신청자 보기
        </Button>
        <Menu
          visible={menuVisible === item.id}
          onDismiss={() => toggleMenu(null)}
          anchor={
            <Button 
              mode="text" 
              onPress={() => toggleMenu(item.id)}
            >
              관리
            </Button>
          }
        >
          <Menu.Item 
            title="수정하기" 
            onPress={() => handleEditCampaign(item.id)} 
          />
          {item.status === 'draft' && (
            <Menu.Item 
              title="캠페인 시작" 
              onPress={() => handleUpdateStatus(item, 'active')} 
            />
          )}
          {item.status === 'active' && (
            <Menu.Item 
              title="캠페인 마감" 
              onPress={() => handleUpdateStatus(item, 'closed')} 
            />
          )}
          {item.status !== 'cancelled' && (
            <Menu.Item 
              title="캠페인 취소" 
              onPress={() => handleUpdateStatus(item, 'cancelled')} 
            />
          )}
          <Divider />
          <Menu.Item 
            title="삭제하기" 
            onPress={() => handleDeleteCampaign(item.id)} 
          />
        </Menu>
      </Card.Actions>
    </Card>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>캠페인 목록을 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button onPress={fetchCampaigns}>다시 시도</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {campaigns.length === 0 ? (
        <View style={styles.centeredContainer}>
          <Text style={styles.emptyText}>등록된 캠페인이 없습니다.</Text>
          <Button 
            mode="contained" 
            onPress={handleCreateCampaign}
            style={styles.createButton}
          >
            첫 캠페인 만들기
          </Button>
        </View>
      ) : (
        <FlatList
          data={campaigns}
          keyExtractor={(item) => item.id}
          renderItem={renderCampaignItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#6200ee']}
            />
          }
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleCreateCampaign}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
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
    marginBottom: 16,
    textAlign: 'center',
  },
  createButton: {
    borderRadius: 24,
  },
  listContainer: {
    padding: 16,
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  description: {
    color: '#555',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#555',
    width: 80,
  },
  infoValue: {
    flex: 1,
    color: '#333',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});

export default AdminCampaignsScreen; 