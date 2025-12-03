// ============================
// Job API Types
// ============================

export interface JobsApiResponse {
  data: Job[];
}

export interface Job {
  _id: string;
  id: string;
  title: string;
  category: JobCategory;
  subcategories: string[];
  benefits: string[];
  compensationType: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  postedAt: string;
  daysRemaining: number;
  isExpired: boolean;
  jobType: string;
  provider: JobProvider;
  interviewProcess: string[];
  requirements: JobRequirements;
  salaryRange: SalaryRange;
  pendingApplications: number;
  shortlistedApplications: number;
  specificLocation: string;
  zipcode: string;
  stats: JobStats;
  status: string;
  urgency: string;
  workLocation: string;
  positions: number;
}

// ----------------------------
// Nested Types
// ----------------------------

export interface JobCategory {
  _id: string;
  name: string;
  icon: string;
}

export interface JobProvider {
  _id: string;
  id: string;
  name: string;
  companyName: string;
  fullAddress: string;
  rating: number;
  totalReviews: number;
}

export interface JobRequirements {
  education: string;
  minExperience: number;
  requiredSkills: string[];
}

export interface SalaryRange {
  currency: string;
  min: number;
  max: number;
}

export interface JobStats {
  hired: number;
  shortlisted: number;
  totalApplications: number;
  totalViews: number;
}
