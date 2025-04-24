import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';

// 스크린 타입
import { AuthStackParamList, MainTabParamList, AppStackParamList } from './types';

// 스크린 임포트 (나중에 실제 파일 생성 후 주석 해제)
// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import CampaignsScreen from '../screens/campaigns/CampaignsScreen';
import CampaignDetailScreen from '../screens/campaigns/CampaignDetailScreen';
import MyApplicationsScreen from '../screens/applications/MyApplicationsScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Admin Screens
import AdminCampaignsScreen from '../screens/admin/AdminCampaignsScreen';
import CreateCampaignScreen from '../screens/admin/CreateCampaignScreen';
import EditCampaignScreen from '../screens/admin/EditCampaignScreen';
import ApplicationDetailScreen from '../screens/admin/ApplicationDetailScreen';
import ApplicationsListScreen from '../screens/admin/ApplicationsListScreen';

// 스택 네비게이터
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// 인증 네비게이션
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

// 메인 탭 네비게이션
const MainTabNavigator = () => {
  const { state } = useAuth();
  const isAdmin = state.user?.role === 'admin';

  return (
    <MainTab.Navigator>
      <MainTab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: '홈',
        }}
      />
      <MainTab.Screen 
        name="Campaigns" 
        component={CampaignsScreen} 
        options={{ 
          title: '캠페인 목록',
        }}
      />
      {isAdmin ? (
        <MainTab.Screen 
          name="AdminCampaigns" 
          component={AdminCampaignsScreen} 
          options={{ 
            title: '관리자 캠페인',
          }}
        />
      ) : (
        <MainTab.Screen 
          name="MyApplications" 
          component={MyApplicationsScreen} 
          options={{ 
            title: '내 신청 내역',
          }}
        />
      )}
      <MainTab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: '프로필',
        }}
      />
    </MainTab.Navigator>
  );
};

// 앱 네비게이션
const AppNavigator = () => {
  const { state } = useAuth();
  const isAdmin = state.user?.role === 'admin';

  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <AppStack.Screen 
        name="MainTab" 
        component={MainTabNavigator} 
        options={{ 
          headerShown: false,
        }}
      />
      <AppStack.Screen 
        name="CampaignDetail" 
        component={CampaignDetailScreen} 
        options={{ 
          title: '캠페인 상세',
        }}
      />
      
      {isAdmin && (
        <>
          <AppStack.Screen 
            name="CreateCampaign" 
            component={CreateCampaignScreen} 
            options={{ 
              title: '캠페인 생성',
            }}
          />
          <AppStack.Screen 
            name="EditCampaign" 
            component={EditCampaignScreen} 
            options={{ 
              title: '캠페인 수정',
            }}
          />
          <AppStack.Screen 
            name="ApplicationsList" 
            component={ApplicationsListScreen} 
            options={{ 
              title: '신청 목록',
            }}
          />
          <AppStack.Screen 
            name="ApplicationDetail" 
            component={ApplicationDetailScreen} 
            options={{ 
              title: '신청서 상세',
            }}
          />
        </>
      )}
    </AppStack.Navigator>
  );
};

// 루트 네비게이션
export const AppNavigationContainer = () => {
  const { state } = useAuth();
  const { isAuthenticated, isLoading } = state;

  // 로딩 중인 경우
  if (isLoading) {
    return null; // 로딩 스크린을 추가할 수 있음
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}; 