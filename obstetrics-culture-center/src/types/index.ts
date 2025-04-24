export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  phoneNumber: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  maxParticipants: number;
  startDate: Date;
  endDate: Date;
  targetAudience: string;
  requiredFields: string[];
  status: 'draft' | 'active' | 'closed' | 'cancelled';
  createdAt: Date;
  createdBy: string;
}

export interface Application {
  id: string;
  campaignId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  fields: Record<string, string>;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface CampaignState {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  isLoading: boolean;
  error: string | null;
}

export interface ApplicationState {
  applications: Application[];
  userApplications: Application[];
  isLoading: boolean;
  error: string | null;
} 