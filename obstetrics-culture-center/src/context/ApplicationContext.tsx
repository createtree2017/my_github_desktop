import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ApplicationState, Application } from '../types';
import { useAuth } from './AuthContext';

// 초기 상태
const initialState: ApplicationState = {
  applications: [],
  userApplications: [],
  isLoading: false,
  error: null,
};

// 액션 타입
type ApplicationAction =
  | { type: 'FETCH_APPLICATIONS_REQUEST' }
  | { type: 'FETCH_APPLICATIONS_SUCCESS'; payload: Application[] }
  | { type: 'FETCH_APPLICATIONS_FAILURE'; payload: string }
  | { type: 'FETCH_USER_APPLICATIONS_REQUEST' }
  | { type: 'FETCH_USER_APPLICATIONS_SUCCESS'; payload: Application[] }
  | { type: 'FETCH_USER_APPLICATIONS_FAILURE'; payload: string }
  | { type: 'CREATE_APPLICATION_REQUEST' }
  | { type: 'CREATE_APPLICATION_SUCCESS'; payload: Application }
  | { type: 'CREATE_APPLICATION_FAILURE'; payload: string }
  | { type: 'UPDATE_APPLICATION_STATUS_REQUEST' }
  | { type: 'UPDATE_APPLICATION_STATUS_SUCCESS'; payload: Application }
  | { type: 'UPDATE_APPLICATION_STATUS_FAILURE'; payload: string }
  | { type: 'CLEAR_APPLICATION_ERROR' };

// 리듀서
const applicationReducer = (state: ApplicationState, action: ApplicationAction): ApplicationState => {
  switch (action.type) {
    case 'FETCH_APPLICATIONS_REQUEST':
    case 'FETCH_USER_APPLICATIONS_REQUEST':
    case 'CREATE_APPLICATION_REQUEST':
    case 'UPDATE_APPLICATION_STATUS_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'FETCH_APPLICATIONS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        applications: action.payload,
        error: null,
      };
    case 'FETCH_USER_APPLICATIONS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        userApplications: action.payload,
        error: null,
      };
    case 'CREATE_APPLICATION_SUCCESS':
      return {
        ...state,
        isLoading: false,
        applications: [...state.applications, action.payload],
        userApplications: [...state.userApplications, action.payload],
        error: null,
      };
    case 'UPDATE_APPLICATION_STATUS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        applications: state.applications.map(app =>
          app.id === action.payload.id ? action.payload : app
        ),
        userApplications: state.userApplications.map(app =>
          app.id === action.payload.id ? action.payload : app
        ),
        error: null,
      };
    case 'FETCH_APPLICATIONS_FAILURE':
    case 'FETCH_USER_APPLICATIONS_FAILURE':
    case 'CREATE_APPLICATION_FAILURE':
    case 'UPDATE_APPLICATION_STATUS_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'CLEAR_APPLICATION_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// 컨텍스트 생성
interface ApplicationContextProps {
  state: ApplicationState;
  fetchApplications: (campaignId?: string) => Promise<void>;
  fetchUserApplications: () => Promise<void>;
  createApplication: (application: Omit<Application, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  updateApplicationStatus: (applicationId: string, status: 'approved' | 'rejected') => Promise<void>;
  clearError: () => void;
  getApplications: (campaignId?: string) => Promise<any[]>;
}

const ApplicationContext = createContext<ApplicationContextProps | undefined>(undefined);

// 프로바이더 컴포넌트
interface ApplicationProviderProps {
  children: ReactNode;
}

export const ApplicationProvider: React.FC<ApplicationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(applicationReducer, initialState);
  const { state: authState } = useAuth();

  // 모든 신청서 가져오기 (관리자 전용)
  const fetchApplications = async (campaignId?: string) => {
    dispatch({ type: 'FETCH_APPLICATIONS_REQUEST' });
    
    try {
      // 여기에 실제 API 호출 로직이 들어갈 예정입니다.
      // 지금은 목업 데이터를 사용합니다.
      const mockApplications: Application[] = [
        {
          id: '1',
          campaignId: '1',
          userId: 'user1',
          status: 'pending',
          fields: {
            '이름': '김지현',
            '나이': '32',
            '임신 기간': '6개월',
            '기존 건강 상태': '양호'
          },
          createdAt: new Date('2023-11-25'),
        },
        {
          id: '2',
          campaignId: '1',
          userId: 'user2',
          status: 'approved',
          fields: {
            '이름': '이수진',
            '나이': '28',
            '임신 기간': '4개월',
            '기존 건강 상태': '경미한 빈혈'
          },
          createdAt: new Date('2023-11-26'),
        },
        {
          id: '3',
          campaignId: '2',
          userId: 'user3',
          status: 'pending',
          fields: {
            '이름': '박민지',
            '아기 나이': '1개월',
            '특별 관심사': '수유 방법'
          },
          createdAt: new Date('2023-11-27'),
        },
      ];
      
      // 특정 캠페인에 대한 신청서만 필터링
      const filteredApplications = campaignId
        ? mockApplications.filter(app => app.campaignId === campaignId)
        : mockApplications;
      
      dispatch({
        type: 'FETCH_APPLICATIONS_SUCCESS',
        payload: filteredApplications,
      });
    } catch (error) {
      dispatch({
        type: 'FETCH_APPLICATIONS_FAILURE',
        payload: '신청서를 가져오는데 실패했습니다.',
      });
    }
  };

  // 사용자 자신의 신청서 가져오기
  const fetchUserApplications = async () => {
    dispatch({ type: 'FETCH_USER_APPLICATIONS_REQUEST' });
    
    try {
      // 현재 로그인한 사용자 확인
      if (!authState.user) {
        throw new Error('로그인이 필요합니다.');
      }
      
      // 여기에 실제 API 호출 로직이 들어갈 예정입니다.
      // 지금은 목업 데이터를 사용합니다.
      const mockUserApplications: Application[] = [
        {
          id: '4',
          campaignId: '1',
          userId: authState.user.id,
          status: 'pending',
          fields: {
            '이름': authState.user.name,
            '나이': '30',
            '임신 기간': '5개월',
            '기존 건강 상태': '양호'
          },
          createdAt: new Date('2023-11-28'),
        },
      ];
      
      dispatch({
        type: 'FETCH_USER_APPLICATIONS_SUCCESS',
        payload: mockUserApplications,
      });
    } catch (error) {
      dispatch({
        type: 'FETCH_USER_APPLICATIONS_FAILURE',
        payload: '신청서를 가져오는데 실패했습니다.',
      });
    }
  };

  // 신청서 생성
  const createApplication = async (application: Omit<Application, 'id' | 'status' | 'createdAt'>) => {
    dispatch({ type: 'CREATE_APPLICATION_REQUEST' });
    
    try {
      // 현재 로그인한 사용자 확인
      if (!authState.user) {
        throw new Error('로그인이 필요합니다.');
      }
      
      // 여기에 실제 API 호출 로직이 들어갈 예정입니다.
      // 지금은 목업 데이터를 사용합니다.
      const newApplication: Application = {
        ...application,
        id: Math.random().toString(36).substring(2),
        status: 'pending',
        createdAt: new Date(),
      };
      
      dispatch({
        type: 'CREATE_APPLICATION_SUCCESS',
        payload: newApplication,
      });
    } catch (error) {
      dispatch({
        type: 'CREATE_APPLICATION_FAILURE',
        payload: '신청서 제출에 실패했습니다.',
      });
    }
  };

  // 신청서 상태 업데이트 (관리자 전용)
  const updateApplicationStatus = async (applicationId: string, status: 'approved' | 'rejected') => {
    dispatch({ type: 'UPDATE_APPLICATION_STATUS_REQUEST' });
    
    try {
      // 관리자 권한 확인
      if (!authState.user || authState.user.role !== 'admin') {
        throw new Error('관리자 권한이 필요합니다.');
      }
      
      // 여기에 실제 API 호출 로직이 들어갈 예정입니다.
      // 현재 상태에서 찾아서 업데이트
      const existingApplication = state.applications.find(app => app.id === applicationId);
      
      if (!existingApplication) {
        throw new Error('신청서를 찾을 수 없습니다.');
      }
      
      const updatedApplication: Application = {
        ...existingApplication,
        status,
      };
      
      dispatch({
        type: 'UPDATE_APPLICATION_STATUS_SUCCESS',
        payload: updatedApplication,
      });
    } catch (error) {
      dispatch({
        type: 'UPDATE_APPLICATION_STATUS_FAILURE',
        payload: '신청서 상태 업데이트에 실패했습니다.',
      });
    }
  };

  // 목 데이터를 반환하는 getApplications 함수 추가
  const getApplications = async (campaignId?: string) => {
    // 관리자 권한 확인
    if (!authState.user) {
      throw new Error('로그인이 필요합니다.');
    }
    
    // 목업 데이터
    const mockApplications = [
      {
        id: '1',
        campaignId: '1',
        campaignTitle: '임산부 건강 관리 프로그램',
        userName: '김지현',
        phoneNumber: '010-1234-5678',
        status: 'pending',
        createdAt: new Date('2023-11-25'),
        answers: {
          '이름': '김지현',
          '나이': '32',
          '임신 기간': '6개월',
          '기존 건강 상태': '양호'
        }
      },
      {
        id: '2',
        campaignId: '1',
        campaignTitle: '임산부 건강 관리 프로그램',
        userName: '이수진',
        phoneNumber: '010-2345-6789',
        status: 'approved',
        createdAt: new Date('2023-11-26'),
        answers: {
          '이름': '이수진',
          '나이': '28',
          '임신 기간': '4개월',
          '기존 건강 상태': '경미한 빈혈'
        }
      },
      {
        id: '3',
        campaignId: '2',
        campaignTitle: '신생아 케어 프로그램',
        userName: '박민지',
        phoneNumber: '010-3456-7890',
        status: 'rejected',
        createdAt: new Date('2023-11-27'),
        answers: {
          '이름': '박민지',
          '아기 나이': '1개월',
          '특별 관심사': '수유 방법'
        }
      },
      {
        id: '4',
        campaignId: '2',
        campaignTitle: '신생아 케어 프로그램',
        userName: '정다영',
        phoneNumber: '010-4567-8901',
        status: 'pending',
        createdAt: new Date('2023-11-28'),
        answers: {
          '이름': '정다영',
          '아기 나이': '2개월',
          '특별 관심사': '아기 수면'
        }
      }
    ];
    
    // 특정 캠페인에 대한 신청서만 필터링
    const filteredApplications = campaignId
      ? mockApplications.filter(app => app.campaignId === campaignId)
      : mockApplications;
    
    return filteredApplications;
  };

  // 에러 초기화
  const clearError = () => {
    dispatch({ type: 'CLEAR_APPLICATION_ERROR' });
  };

  return (
    <ApplicationContext.Provider
      value={{
        state,
        fetchApplications,
        fetchUserApplications,
        createApplication,
        updateApplicationStatus,
        getApplications,
        clearError,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

// 커스텀 훅
export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplication must be used within an ApplicationProvider');
  }
  return context;
}; 