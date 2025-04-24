import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CampaignState, Campaign } from '../types';

// 초기 상태
const initialState: CampaignState = {
  campaigns: [],
  selectedCampaign: null,
  isLoading: false,
  error: null,
};

// 액션 타입
type CampaignAction =
  | { type: 'FETCH_CAMPAIGNS_REQUEST' }
  | { type: 'FETCH_CAMPAIGNS_SUCCESS'; payload: Campaign[] }
  | { type: 'FETCH_CAMPAIGNS_FAILURE'; payload: string }
  | { type: 'FETCH_CAMPAIGN_REQUEST' }
  | { type: 'FETCH_CAMPAIGN_SUCCESS'; payload: Campaign }
  | { type: 'FETCH_CAMPAIGN_FAILURE'; payload: string }
  | { type: 'CREATE_CAMPAIGN_REQUEST' }
  | { type: 'CREATE_CAMPAIGN_SUCCESS'; payload: Campaign }
  | { type: 'CREATE_CAMPAIGN_FAILURE'; payload: string }
  | { type: 'UPDATE_CAMPAIGN_REQUEST' }
  | { type: 'UPDATE_CAMPAIGN_SUCCESS'; payload: Campaign }
  | { type: 'UPDATE_CAMPAIGN_FAILURE'; payload: string }
  | { type: 'DELETE_CAMPAIGN_REQUEST' }
  | { type: 'DELETE_CAMPAIGN_SUCCESS'; payload: string }
  | { type: 'DELETE_CAMPAIGN_FAILURE'; payload: string }
  | { type: 'CLEAR_CAMPAIGN_ERROR' };

// 리듀서
const campaignReducer = (state: CampaignState, action: CampaignAction): CampaignState => {
  switch (action.type) {
    case 'FETCH_CAMPAIGNS_REQUEST':
    case 'FETCH_CAMPAIGN_REQUEST':
    case 'CREATE_CAMPAIGN_REQUEST':
    case 'UPDATE_CAMPAIGN_REQUEST':
    case 'DELETE_CAMPAIGN_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'FETCH_CAMPAIGNS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        campaigns: action.payload,
        error: null,
      };
    case 'FETCH_CAMPAIGN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        selectedCampaign: action.payload,
        error: null,
      };
    case 'CREATE_CAMPAIGN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        campaigns: [...state.campaigns, action.payload],
        selectedCampaign: action.payload,
        error: null,
      };
    case 'UPDATE_CAMPAIGN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        campaigns: state.campaigns.map(campaign =>
          campaign.id === action.payload.id ? action.payload : campaign
        ),
        selectedCampaign: action.payload,
        error: null,
      };
    case 'DELETE_CAMPAIGN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        campaigns: state.campaigns.filter(campaign => campaign.id !== action.payload),
        selectedCampaign: state.selectedCampaign?.id === action.payload ? null : state.selectedCampaign,
        error: null,
      };
    case 'FETCH_CAMPAIGNS_FAILURE':
    case 'FETCH_CAMPAIGN_FAILURE':
    case 'CREATE_CAMPAIGN_FAILURE':
    case 'UPDATE_CAMPAIGN_FAILURE':
    case 'DELETE_CAMPAIGN_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'CLEAR_CAMPAIGN_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// 컨텍스트 생성
interface CampaignContextProps {
  state: CampaignState;
  fetchCampaigns: () => Promise<void>;
  fetchCampaign: (id: string) => Promise<void>;
  createCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt'>) => Promise<void>;
  updateCampaign: (campaign: Partial<Campaign> & { id: string }) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  clearError: () => void;
  getCampaignById: (id: string) => Promise<Campaign | null>;
}

const CampaignContext = createContext<CampaignContextProps | undefined>(undefined);

// 프로바이더 컴포넌트
interface CampaignProviderProps {
  children: ReactNode;
}

export const CampaignProvider: React.FC<CampaignProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(campaignReducer, initialState);

  // 모든 캠페인 가져오기
  const fetchCampaigns = async () => {
    dispatch({ type: 'FETCH_CAMPAIGNS_REQUEST' });
    
    try {
      // 여기에 실제 API 호출 로직이 들어갈 예정입니다.
      // 지금은 목업 데이터를 사용합니다.
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          title: '임산부 요가 클래스',
          description: '임산부를 위한 편안한 요가 클래스입니다. 임신 중 건강 관리와 스트레스 완화에 도움을 줍니다.',
          maxParticipants: 15,
          startDate: new Date('2023-12-01'),
          endDate: new Date('2023-12-31'),
          targetAudience: '임산부',
          requiredFields: ['이름', '나이', '임신 기간', '기존 건강 상태'],
          status: 'active',
          createdAt: new Date('2023-11-15'),
          createdBy: 'admin',
        },
        {
          id: '2',
          title: '신생아 돌봄 교실',
          description: '신생아 돌봄에 관한 모든 것을 배울 수 있는 교실입니다. 수유, 기저귀 교체, 목욕 등의 방법을 배워봅니다.',
          maxParticipants: 20,
          startDate: new Date('2024-01-10'),
          endDate: new Date('2024-01-30'),
          targetAudience: '신생아 부모',
          requiredFields: ['이름', '아기 나이', '특별 관심사'],
          status: 'draft',
          createdAt: new Date('2023-11-20'),
          createdBy: 'admin',
        },
      ];
      
      dispatch({
        type: 'FETCH_CAMPAIGNS_SUCCESS',
        payload: mockCampaigns,
      });
    } catch (error) {
      dispatch({
        type: 'FETCH_CAMPAIGNS_FAILURE',
        payload: '캠페인을 가져오는데 실패했습니다.',
      });
    }
  };

  // 단일 캠페인 가져오기
  const fetchCampaign = async (id: string) => {
    dispatch({ type: 'FETCH_CAMPAIGN_REQUEST' });
    
    try {
      // 여기에 실제 API 호출 로직이 들어갈 예정입니다.
      // 지금은 목업 데이터를 사용합니다.
      const mockCampaign: Campaign = {
        id,
        title: id === '1' ? '임산부 요가 클래스' : '신생아 돌봄 교실',
        description: id === '1' 
          ? '임산부를 위한 편안한 요가 클래스입니다. 임신 중 건강 관리와 스트레스 완화에 도움을 줍니다.' 
          : '신생아 돌봄에 관한 모든 것을 배울 수 있는 교실입니다. 수유, 기저귀 교체, 목욕 등의 방법을 배워봅니다.',
        maxParticipants: id === '1' ? 15 : 20,
        startDate: id === '1' ? new Date('2023-12-01') : new Date('2024-01-10'),
        endDate: id === '1' ? new Date('2023-12-31') : new Date('2024-01-30'),
        targetAudience: id === '1' ? '임산부' : '신생아 부모',
        requiredFields: id === '1' 
          ? ['이름', '나이', '임신 기간', '기존 건강 상태'] 
          : ['이름', '아기 나이', '특별 관심사'],
        status: id === '1' ? 'active' : 'draft',
        createdAt: id === '1' ? new Date('2023-11-15') : new Date('2023-11-20'),
        createdBy: 'admin',
      };
      
      dispatch({
        type: 'FETCH_CAMPAIGN_SUCCESS',
        payload: mockCampaign,
      });
    } catch (error) {
      dispatch({
        type: 'FETCH_CAMPAIGN_FAILURE',
        payload: '캠페인을 가져오는데 실패했습니다.',
      });
    }
  };

  // 캠페인 생성
  const createCampaign = async (campaign: Omit<Campaign, 'id' | 'createdAt'>) => {
    dispatch({ type: 'CREATE_CAMPAIGN_REQUEST' });
    
    try {
      // 여기에 실제 API 호출 로직이 들어갈 예정입니다.
      // 지금은 목업 데이터를 사용합니다.
      const newCampaign: Campaign = {
        ...campaign,
        id: Math.random().toString(36).substring(2),
        createdAt: new Date(),
      };
      
      dispatch({
        type: 'CREATE_CAMPAIGN_SUCCESS',
        payload: newCampaign,
      });
    } catch (error) {
      dispatch({
        type: 'CREATE_CAMPAIGN_FAILURE',
        payload: '캠페인 생성에 실패했습니다.',
      });
    }
  };

  // 캠페인 업데이트
  const updateCampaign = async (campaign: Partial<Campaign> & { id: string }) => {
    dispatch({ type: 'UPDATE_CAMPAIGN_REQUEST' });
    
    try {
      // 여기에 실제 API 호출 로직이 들어갈 예정입니다.
      // 현재 상태에서 찾아서 업데이트
      const existingCampaign = state.campaigns.find(c => c.id === campaign.id);
      
      if (!existingCampaign) {
        throw new Error('캠페인을 찾을 수 없습니다.');
      }
      
      const updatedCampaign: Campaign = {
        ...existingCampaign,
        ...campaign,
      };
      
      dispatch({
        type: 'UPDATE_CAMPAIGN_SUCCESS',
        payload: updatedCampaign,
      });
    } catch (error) {
      dispatch({
        type: 'UPDATE_CAMPAIGN_FAILURE',
        payload: '캠페인 업데이트에 실패했습니다.',
      });
    }
  };

  // 캠페인 삭제
  const deleteCampaign = async (id: string) => {
    dispatch({ type: 'DELETE_CAMPAIGN_REQUEST' });
    
    try {
      // 여기에 실제 API 호출 로직이 들어갈 예정입니다.
      
      dispatch({
        type: 'DELETE_CAMPAIGN_SUCCESS',
        payload: id,
      });
    } catch (error) {
      dispatch({
        type: 'DELETE_CAMPAIGN_FAILURE',
        payload: '캠페인 삭제에 실패했습니다.',
      });
    }
  };

  // 에러 초기화
  const clearError = () => {
    dispatch({ type: 'CLEAR_CAMPAIGN_ERROR' });
  };

  // 캠페인 ID로 조회
  const getCampaignById = async (id: string): Promise<Campaign | null> => {
    try {
      // 현재 상태에서 찾아보기
      const existingCampaign = state.campaigns.find(c => c.id === id);
      
      if (existingCampaign) {
        return existingCampaign;
      }
      
      // 상태에 없으면 목업 데이터 반환
      const mockCampaign: Campaign = {
        id,
        title: id === '1' ? '임산부 요가 클래스' : '신생아 돌봄 교실',
        description: id === '1' 
          ? '임산부를 위한 편안한 요가 클래스입니다. 임신 중 건강 관리와 스트레스 완화에 도움을 줍니다.' 
          : '신생아 돌봄에 관한 모든 것을 배울 수 있는 교실입니다. 수유, 기저귀 교체, 목욕 등의 방법을 배워봅니다.',
        maxParticipants: id === '1' ? 15 : 20,
        startDate: id === '1' ? new Date('2023-12-01') : new Date('2024-01-10'),
        endDate: id === '1' ? new Date('2023-12-31') : new Date('2024-01-30'),
        targetAudience: id === '1' ? '임산부' : '신생아 부모',
        requiredFields: id === '1' 
          ? ['이름', '나이', '임신 기간', '기존 건강 상태'] 
          : ['이름', '아기 나이', '특별 관심사'],
        status: id === '1' ? 'active' : 'draft',
        createdAt: id === '1' ? new Date('2023-11-15') : new Date('2023-11-20'),
        createdBy: 'admin',
      };
      
      return mockCampaign;
    } catch (error) {
      console.error('캠페인 조회 오류:', error);
      return null;
    }
  };

  return (
    <CampaignContext.Provider
      value={{
        state,
        fetchCampaigns,
        fetchCampaign,
        createCampaign,
        updateCampaign,
        deleteCampaign,
        clearError,
        getCampaignById,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};

// 커스텀 훅
export const useCampaign = () => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
}; 