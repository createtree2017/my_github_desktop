import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Divider, Button, ActivityIndicator, Searchbar, Chip } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { useApplication } from '../../context/ApplicationContext';

type Props = NativeStackScreenProps<AppStackParamList, 'ApplicationsList'>;

type Application = {
  id: string;
  campaignId: string;
  campaignTitle: string;
  userName: string;
  phoneNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  answers: Record<string, string>;
};

const ApplicationsListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { campaignId } = route.params || {};
  const { getApplications } = useApplication();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  useEffect(() => {
    fetchApplications();
  }, [campaignId]);
  
  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      let fetchedApplications;
      if (campaignId) {
        fetchedApplications = await getApplications(campaignId);
      } else {
        fetchedApplications = await getApplications();
      }
      setApplications(fetchedApplications);
      setFilteredApplications(fetchedApplications);
    } catch (error) {
      Alert.alert('오류 발생', '신청서를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, applications]);
  
  const applyFilters = () => {
    let result = [...applications];
    
    // 검색어 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        app => 
          app.userName.toLowerCase().includes(query) ||
          app.phoneNumber.includes(query) ||
          app.campaignTitle.toLowerCase().includes(query)
      );
    }
    
    // 상태 필터링
    if (statusFilter) {
      result = result.filter(app => app.status === statusFilter);
    }
    
    setFilteredApplications(result);
  };
  
  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter(null);
  };
  
  const handleViewDetails = (applicationId: string) => {
    navigation.navigate('ApplicationDetail', { applicationId });
  };
  
  const handleRefresh = () => {
    fetchApplications();
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
  
  const renderItem = ({ item }: { item: Application }) => (
    <Card
      style={styles.card}
      onPress={() => handleViewDetails(item.id)}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Chip
            textStyle={{ color: 'white' }}
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
          >
            {getStatusText(item.status)}
          </Chip>
        </View>
        
        <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
        <Divider style={styles.divider} />
        
        <Text style={styles.campaignTitle}>
          캠페인: {item.campaignTitle}
        </Text>
        
        <Text style={styles.date}>
          신청일: {new Date(item.createdAt).toLocaleDateString('ko-KR')}
        </Text>
      </Card.Content>
    </Card>
  );
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>신청서를 불러오는 중...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {campaignId ? '캠페인 신청서 목록' : '모든 신청서'}
        </Text>
        <Button mode="outlined" onPress={handleRefresh} icon="refresh">
          새로고침
        </Button>
      </View>
      
      <Searchbar
        placeholder="이름, 전화번호, 캠페인 검색"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>상태 필터:</Text>
        <View style={styles.filterChips}>
          <TouchableOpacity
            onPress={() => setStatusFilter(statusFilter === 'pending' ? null : 'pending')}
          >
            <Chip
              selected={statusFilter === 'pending'}
              style={[styles.filterChip, statusFilter === 'pending' && { backgroundColor: '#f57c00' }]}
              textStyle={statusFilter === 'pending' ? styles.selectedFilterText : {}}
            >
              대기중
            </Chip>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setStatusFilter(statusFilter === 'approved' ? null : 'approved')}
          >
            <Chip
              selected={statusFilter === 'approved'}
              style={[styles.filterChip, statusFilter === 'approved' && { backgroundColor: '#2e7d32' }]}
              textStyle={statusFilter === 'approved' ? styles.selectedFilterText : {}}
            >
              승인됨
            </Chip>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setStatusFilter(statusFilter === 'rejected' ? null : 'rejected')}
          >
            <Chip
              selected={statusFilter === 'rejected'}
              style={[styles.filterChip, statusFilter === 'rejected' && { backgroundColor: '#c62828' }]}
              textStyle={statusFilter === 'rejected' ? styles.selectedFilterText : {}}
            >
              거절됨
            </Chip>
          </TouchableOpacity>
          
          {(statusFilter || searchQuery) && (
            <Button compact mode="text" onPress={clearFilters}>
              필터 초기화
            </Button>
          )}
        </View>
      </View>
      
      {filteredApplications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery || statusFilter
              ? '필터에 맞는 신청서가 없습니다.'
              : '신청서가 없습니다.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredApplications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  searchbar: {
    marginBottom: 12,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  selectedFilterText: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
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
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusChip: {
    height: 28,
  },
  phoneNumber: {
    fontSize: 16,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
  },
  campaignTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#757575',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
  },
});

export default ApplicationsListScreen; 