import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User } from '../types';

// 초기 상태
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

// 액션 타입
type AuthAction =
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_REQUEST' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'CLEAR_ERROR' };

// 리듀서
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'REGISTER_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// 컨텍스트 생성
interface AuthContextProps {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phoneNumber: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// 프로바이더 컴포넌트
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 로컬 스토리지에서 인증 정보 로드
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userStr = await AsyncStorage.getItem('user');
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token },
          });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.error('Failed to load auth state:', error);
        dispatch({ type: 'LOGOUT' });
      }
    };

    loadAuthState();
  }, []);

  // 로그인 함수
  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_REQUEST' });
    
    try {
      // 여기에 실제 API 호출 로직이 들어갈 예정입니다.
      // 지금은 목업 데이터를 사용합니다.
      const mockUser: User = {
        id: '1',
        email,
        name: '사용자',
        phoneNumber: '010-1234-5678',
        role: email.includes('admin') ? 'admin' : 'user',
        createdAt: new Date(),
      };
      
      const token = 'mock-token-' + Math.random().toString(36).substring(2);
      
      // 로컬 스토리지에 저장
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: mockUser, token },
      });
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.',
      });
    }
  };

  // 회원가입 함수
  const register = async (name: string, email: string, password: string, phoneNumber: string) => {
    dispatch({ type: 'REGISTER_REQUEST' });
    
    try {
      // 여기에 실제 API 호출 로직이 들어갈 예정입니다.
      // 지금은 목업 데이터를 사용합니다.
      const mockUser: User = {
        id: Math.random().toString(36).substring(2),
        email,
        name,
        phoneNumber,
        role: 'user',
        createdAt: new Date(),
      };
      
      const token = 'mock-token-' + Math.random().toString(36).substring(2);
      
      // 로컬 스토리지에 저장
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: { user: mockUser, token },
      });
    } catch (error) {
      dispatch({
        type: 'REGISTER_FAILURE',
        payload: '회원가입에 실패했습니다. 다시 시도해주세요.',
      });
    }
  };

  // 로그아웃 함수
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  // 에러 초기화
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 커스텀 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 