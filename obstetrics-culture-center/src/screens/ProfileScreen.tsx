import React from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Avatar, Text, List, Divider, Button } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const { state, logout } = useAuth();
  const { user } = state;

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '확인', onPress: logout }
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>로그인 정보를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  // 사용자 이니셜 생성
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // 역할 표시 텍스트
  const getRoleText = (role: string) => {
    return role === 'admin' ? '관리자' : '일반 사용자';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={getInitials(user.name)} 
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userRole}>{getRoleText(user.role)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>개인 정보</Text>
        <List.Item
          title="이메일"
          description={user.email}
          left={props => <List.Icon {...props} icon="email" />}
        />
        <Divider />
        <List.Item
          title="전화번호"
          description={user.phoneNumber}
          left={props => <List.Icon {...props} icon="phone" />}
        />
        <Divider />
        <List.Item
          title="가입 일자"
          description={new Date(user.createdAt).toLocaleDateString()}
          left={props => <List.Icon {...props} icon="calendar" />}
        />
      </View>

      {user.role === 'admin' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>관리자 메뉴</Text>
          <List.Item
            title="캠페인 관리"
            description="캠페인을 생성, 수정, 삭제합니다."
            left={props => <List.Icon {...props} icon="calendar-edit" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="신청서 관리"
            description="캠페인 신청서를 확인하고 관리합니다."
            left={props => <List.Icon {...props} icon="file-document-edit" />}
            onPress={() => {}}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>계정 설정</Text>
        <List.Item
          title="비밀번호 변경"
          left={props => <List.Icon {...props} icon="lock" />}
          onPress={() => {}}
        />
        <Divider />
        <List.Item
          title="개인정보 수정"
          left={props => <List.Icon {...props} icon="account-edit" />}
          onPress={() => {}}
        />
        <Divider />
        <List.Item
          title="알림 설정"
          left={props => <List.Icon {...props} icon="bell" />}
          onPress={() => {}}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>앱 정보</Text>
        <List.Item
          title="이용약관"
          left={props => <List.Icon {...props} icon="file-document" />}
          onPress={() => {}}
        />
        <Divider />
        <List.Item
          title="개인정보 처리방침"
          left={props => <List.Icon {...props} icon="shield-account" />}
          onPress={() => {}}
        />
        <Divider />
        <List.Item
          title="버전 정보"
          description="1.0.0"
          left={props => <List.Icon {...props} icon="information" />}
        />
      </View>

      <Button 
        mode="outlined" 
        onPress={handleLogout} 
        style={styles.logoutButton}
        color="#f44336"
      >
        로그아웃
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  avatar: {
    backgroundColor: '#6200ee',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userRole: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginTop: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logoutButton: {
    margin: 20,
    borderColor: '#f44336',
  },
});

export default ProfileScreen; 