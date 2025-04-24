import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Searchbar, Text, Card, Chip, ActivityIndicator, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { useCampaign } from '../../context/CampaignContext';
import { Campaign } from '../../types';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const CampaignsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { state, fetchCampaigns } = useCampaign();
  const { campaigns, isLoading, error } = state;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (status: string | null) => {
    setFilterStatus(status === filterStatus ? null : status);
  };

  const handleViewCampaign = (campaignId: string) => {
    navigation.navigate('CampaignDetail', { campaignId });
  };

  const getFilteredCampaigns = () => {
    let filteredList = campaigns;

    // 상태 필터링
    if (filterStatus) {
      filteredList = filteredList.filter(campaign => campaign.status === filterStatus);
    }

    // 검색어 필터링
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filteredList = filteredList.filter(
        campaign => 
          campaign.title.toLowerCase().includes(lowerCaseQuery) ||
          campaign.description.toLowerCase().includes(lowerCaseQuery) ||
          campaign.targetAudience.toLowerCase().includes(lowerCaseQuery)
      );
    }

    return filteredList;
  };

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

  const renderItem = ({ item }: { item: Campaign }) => (
    <Card 
      style={styles.card}
      onPress={() => handleViewCampaign(item.id)}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Chip
            mode="outlined"
            textStyle={{ fontSize: 12 }}
            style={{ backgroundColor: getStatusColor(item.status) + '20' }}
          >
            {getStatusText(item.status)}
          </Chip>
        </View>
        <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>
            {new Date(item.startDate).toLocaleDateString()} ~ {new Date(item.endDate).toLocaleDateString()}
          </Text>
          <Text style={styles.audienceText}>
            대상: {item.targetAudience}
          </Text>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => handleViewCampaign(item.id)}>자세히 보기</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="캠페인 검색"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filterStatus === 'active' && styles.activeFilterChip
          ]}
          onPress={() => handleFilterChange('active')}
        >
          <Text style={filterStatus === 'active' ? styles.activeFilterText : styles.filterText}>
            진행 중
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filterStatus === 'draft' && styles.activeFilterChip
          ]}
          onPress={() => handleFilterChange('draft')}
        >
          <Text style={filterStatus === 'draft' ? styles.activeFilterText : styles.filterText}>
            준비 중
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filterStatus === 'closed' && styles.activeFilterChip
          ]}
          onPress={() => handleFilterChange('closed')}
        >
          <Text style={filterStatus === 'closed' ? styles.activeFilterText : styles.filterText}>
            마감됨
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>캠페인 목록을 불러오는 중...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button onPress={fetchCampaigns}>다시 시도</Button>
        </View>
      ) : getFilteredCampaigns().length > 0 ? (
        <FlatList
          data={getFilteredCampaigns()}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>표시할 캠페인이 없습니다.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#6200ee',
  },
  filterText: {
    color: '#555',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  listContainer: {
    paddingBottom: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  cardDescription: {
    color: '#555',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  audienceText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
});

export default CampaignsScreen; 