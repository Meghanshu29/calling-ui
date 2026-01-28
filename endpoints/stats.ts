import { ApiRequest } from '../services/api';

export interface AssignmentStats {
  assigned_to: string;
  total: number;
  interested: number;
  not_interested: number;
  escalate_to_sonia: number;
  declined: number;
  busy_call_later: number;
  married_engaged: number;
  complete_soon: number;
  need_help_completing: number;
  not_serious: number;
  pending: number;
  no_status: number;
}

export interface AssignmentStatsResponse {
  success: boolean;
  message: string;
  data: AssignmentStats[];
}

export const getAssignmentStats = async (period: string = 'all'): Promise<AssignmentStatsResponse> => {
  const endpoint = `admin/assignment-stats?period=${period}`;
  return await ApiRequest("GET", endpoint);
};

export const getCallingDetails = async (username: string, period: string = 'all', status?: string) => {
  let endpoint = `admin/customer-support/calling-details?username=${username}&time_period=${period}`;
  if (status) {
    endpoint += `&status=${status}`;
  }
  return await ApiRequest("GET", endpoint);
};