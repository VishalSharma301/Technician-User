export enum JobStatus {
  PENDING = "pending",
  BOOKED = "booked",
  ASSIGNED = "assigned",
  TECHNICIAN_ASSIGNED = "technician_assigned",
  CONFIRMED_SCHEDULED = "confirmed_scheduled",
  RESCHEDULED = "rescheduled",
  ON_WAY = "on_way",
  ARRIVED = "arrived",
  IN_PROGRESS = "in_progress",
  PARTS_PENDING = "parts_pending",
  AT_WORKSHOP = "at_workshop",
  VERIFICATION_REQUESTED = "verification_requested",
  USER_VERIFIED = "user_verified",
  USER_VERIFICATION_REJECTED = "user_verification_rejected",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}
export type JobActorType = "provider" | "technician" | "user" | "system";
export interface JobStatusChangedBy {
  userType: JobActorType;
  userId: string;
}
export interface JobStatusHistoryItem {
  _id: string;
  status: JobStatus;
  notes?: string;
  timestamp: string; // ISO string
  changedBy: JobStatusChangedBy;
}
export interface Job {
  _id: string;
  status: JobStatus;
  statusHistory: JobStatusHistoryItem[];
}

