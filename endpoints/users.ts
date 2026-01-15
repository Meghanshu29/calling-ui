import { ApiRequest } from "../services/api";

interface GetUsersParams {
  status?: string;
  assigned_to?: string;
  auto_assign?: boolean;
  current_user?: string;
  limit?: number;
  offset?: number;
}

export const GetUnregisterdUsers = async (params: GetUsersParams = {}) => {
  const {
    status,
    assigned_to,
    auto_assign,
    current_user,
    limit = 100,
    offset = 0,
  } = params;
  const queryParams = new URLSearchParams();

  if (status) queryParams.append("status", status);
  if (assigned_to) queryParams.append("assigned_to", assigned_to);
  if (auto_assign !== undefined)
    queryParams.append("auto_assign", auto_assign.toString());
  if (current_user) queryParams.append("current_user", current_user);
  queryParams.append("limit", limit.toString());
  queryParams.append("offset", offset.toString());

  return await ApiRequest("GET", `admin/unregistered-users?${queryParams}`);
};

export const updateFeedback = async (
  user_id: number,
  status: string,
  feedback: string
) => {
  return await ApiRequest("PUT", "admin/update-feedback", {
    user_id,
    status,
    feedback,
  });
};

export const getUnregisteredUsers = async (
  tag: any,
  status?: string,
  assignedTo = "",
  currentUser?: string
) => {
  return await ApiRequest(
    "GET",
    `admin/unregistered-users?tag=${tag}&status=${status}&assigned_to=${assignedTo}&auto_assign=${true}&current_user=${currentUser}&limit=${1}&offset=${0}`
  );
};

export const getMatchedUsers = async (
  status?: string,
  assignedTo?: string,
  currentUser?: string
) => {
  return await ApiRequest(
    "GET",
    `admin/matched-profiles-users?status=${status}&assigned_to=${assignedTo}&auto_assign=${true}&current_user=${currentUser}&limit=${1}&offset=${0}`
  );
};
