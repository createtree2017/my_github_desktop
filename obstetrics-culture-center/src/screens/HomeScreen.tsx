import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Title, Paragraph, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { useCampaign } from '../context/CampaignContext';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { state: authState } = useAuth();
  const { state: campaignState, fetchCampaigns } = useCampaign();

  const { user } = authState;
  const { campaigns, isLoading } = campaignState;

  // 데이터 로드
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleViewCampaign = (campaignId: string) => {
    navigation.navigate('CampaignDetail', { campaignId });
  };

  const handleCreateCampaign = () => {
    navigation.navigate('CreateCampaign');
  };

  const getActiveCampaigns = () => {
    return campaigns.filter(campaign => campaign.status === 'active');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.headerImage}
        />
        <View style={styles.textContainer}>
          <Text style={styles.headerTitle}>산부인과 문화센터</Text>
          <Text style={styles.headerSubtitle}>
            임산부와 신생아 부모님들을 위한 특별한 프로그램
          </Text>
        </View>
      </View>

      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>
          안녕하세요, {user?.name || '게스트'}님!
        </Text>
        <Text style={styles.welcomeDescription}>
          건강한 임신과 출산을 위한 다양한 프로그램을 경험해보세요.
        </Text>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>진행 중인 캠페인</Text>
        {isLoading ? (
          <Text style={styles.loadingText}>로딩 중...</Text>
        ) : getActiveCampaigns().length > 0 ? (
          getActiveCampaigns().map(campaign => (
            <Card 
              key={campaign.id} 
              style={styles.card}
              onPress={() => handleViewCampaign(campaign.id)}
            >
              <Card.Content>
                <Title>{campaign.title}</Title>
                <Paragraph numberOfLines={2}>{campaign.description}</Paragraph>
                <View style={styles.cardFooter}>
                  <Text style={styles.dateText}>
                    {new Date(campaign.startDate).toLocaleDateString()} ~ {new Date(campaign.endDate).toLocaleDateString()}
                  </Text>
                  <Text style={styles.participantsText}>
                    모집인원: {campaign.maxParticipants}명
                  </Text>
                </View>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => handleViewCampaign(campaign.id)}>자세히 보기</Button>
              </Card.Actions>
            </Card>
          ))
        ) : (
          <Text style={styles.noDataText}>현재 진행 중인 캠페인이 없습니다.</Text>
        )}
      </View>

      {user?.role === 'admin' && (
        <View style={styles.adminContainer}>
          <Text style={styles.adminTitle}>관리자 메뉴</Text>
          <Button 
            mode="contained" 
            onPress={handleCreateCampaign} 
            style={styles.adminButton}
          >
            새 캠페인 만들기
          </Button>
        </View>
      )}

      <View style={styles.aboutContainer}>
        <Text style={styles.aboutTitle}>산부인과 문화센터 소개</Text>
        <Text style={styles.aboutDescription}>
          저희 문화센터는 임산부와 신생아 부모님들을 위한 다양한 교육 및 체험 프로그램을 제공합니다.
          전문 의료진의 지도하에 건강하고 즐거운 프로그램에 참여해보세요.
        </Text>
        <View style={styles.featureRow}>
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>전문 프로그램</Text>
            <Text style={styles.featureDescription}>산부인과 전문의가 진행하는 프로그램</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>맞춤형 교육</Text>
            <Text style={styles.featureDescription}>개인별 맞춤형 교육과 상담</Text>
          </View>
        </View>
        <View style={styles.featureRow}>
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>편안한 환경</Text>
            <Text style={styles.featureDescription}>최신식 시설과 편안한 환경</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>커뮤니티</Text>
            <Text style={styles.featureDescription}>같은 경험을 나누는 커뮤니티</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  headerImage: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  welcomeContainer: {
    backgroundColor: '#e8f5fe',
    padding: 16,
    marginVertical: 8,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c77b0',
  },
  welcomeDescription: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
  sectionContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  participantsText: {
    fontSize: 12,
    color: '#666',
  },
  loadingText: {
    textAlign: 'center',
    padding: 16,
    color: '#666',
  },
  noDataText: {
    textAlign: 'center',
    padding: 16,
    color: '#666',
  },
  adminContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginVertical: 8,
  },
  adminTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  adminButton: {
    marginTop: 8,
  },
  aboutContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginVertical: 8,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  aboutDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  featureItem: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  featureTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
    color: '#444',
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
  },
});

export default HomeScreen; 