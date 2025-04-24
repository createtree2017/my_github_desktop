import { NavigatorScreenParams } from '@react-navigation/native';

// 인증 스택 네비게이션 타입
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// 메인 탭 네비게이션 타입
export type MainTabParamList = {
  Home: undefined;
  Campaigns: undefined;
  AdminCampaigns: undefined;
  MyApplications: undefined;
  Profile: undefined;
};

// 앱 스택 네비게이션 타입
export type AppStackParamList = {
  MainTab: NavigatorScreenParams<MainTabParamList>;
  CampaignDetail: { campaignId: string };
  CreateCampaign: undefined;
  EditCampaign: { campaignId: string };
  ApplicationsList: { campaignId: string };
  ApplicationDetail: { applicationId: string };
}; 