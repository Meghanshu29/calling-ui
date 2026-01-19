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
  status?: string,
  feedback?: string,
  priority?: string
) => {
  return await ApiRequest("PUT", "admin/update-feedback", {
    user_id,
    status,
    feedback,
    priority,
  });
};

export const getUnregisteredUsers = async (
  tag: any,
  status?: string,
  currentUser?: string
) => {
  if(status=="pending"){console.log("Pending Status Payload=>",status,currentUser,tag)}
  return await ApiRequest(
    "GET",
    `admin/unregistered-users?tag=${tag}&status=${status}&assigned_to=${currentUser}&auto_assign=${true}&current_user=${currentUser}&limit=${1}&offset=${0}`
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

export const sendWhatsAppMessage = async (messageData: any) => {
  return await ApiRequest("POST", `admin/send-whatsapp-message`, messageData);
};

export const getEscalatedUsers = async () => {
  const response = await ApiRequest(
    "GET",
    `admin/unregistered-users?tag=&status=Escalate to Sonia&assigned_to=&auto_assign=false&current_user=&limit=1000&offset=0`
  );
  console.log('Escalated Users API Response:', JSON.stringify(response, null, 2));
  return response;
};

export const getNotSeriousUsers = async () => {
  const response = await ApiRequest(
    "GET",
    `admin/unregistered-users?tag=&status=Not Serious&assigned_to=&auto_assign=false&current_user=&limit=1000&offset=0`
  );
  console.log('Not Serious Users API Response:', JSON.stringify(response, null, 2));
  return response;
};

export const getDeclinedUsers = async () => {
  const response = await ApiRequest(
    "GET",
    `admin/unregistered-users?tag=&status=Declined&assigned_to=&auto_assign=false&current_user=&limit=1000&offset=0`
  );
  console.log('Declined Users API Response:', JSON.stringify(response, null, 2));
  return response;
};

export const getBusyCallLaterUsers = async () => {
  const response = await ApiRequest(
    "GET",
    `admin/unregistered-users?tag=&status=Busy Call Later&assigned_to=&auto_assign=false&current_user=&limit=1000&offset=0`
  );
  console.log('Busy Call Later Users API Response:', JSON.stringify(response, null, 2));
  return response;
};

export const getInterestedUsers = async () => {
  const response = await ApiRequest(
    "GET",
    `admin/unregistered-users?tag=&status=Interested&assigned_to=&auto_assign=false&current_user=&limit=1000&offset=0`
  );
  return response;
};

export const getNotInterestedUsers = async () => {
  const response = await ApiRequest(
    "GET",
    `admin/unregistered-users?tag=&status=Not Interested&assigned_to=&auto_assign=false&current_user=&limit=1000&offset=0`
  );
  return response;
};

export const getMarriedEngagedUsers = async () => {
  const response = await ApiRequest(
    "GET",
    `admin/unregistered-users?tag=&status=Married/Engaged&assigned_to=&auto_assign=false&current_user=&limit=1000&offset=0`
  );
  return response;
};

export const getCompleteSoonUsers = async () => {
  const response = await ApiRequest(
    "GET",
    `admin/unregistered-users?tag=&status=Complete Soon&assigned_to=&auto_assign=false&current_user=&limit=1000&offset=0`
  );
  return response;
};

export const getNeedHelpUsers = async () => {
  const response = await ApiRequest(
    "GET",
    `admin/unregistered-users?tag=&status=Need Help completing&assigned_to=&auto_assign=false&current_user=&limit=1000&offset=0`
  );
  return response;
};

export const getInterestedNotRegisteredUsers = async (daysAgo = 2, limit = 1000, offset = 0) => {
  // Try the original endpoint first
  try {
    const response = await ApiRequest(
      "GET",
      `admin/interested-not-registered?days_ago=${daysAgo}&limit=${limit}&offset=${offset}`
    );
    console.log('Interested Not Registered Users API Response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('Original endpoint failed, trying alternative...');
    // Fallback to similar pattern as other endpoints
    const response = await ApiRequest(
      "GET",
      `admin/unregistered-users?tag=&status=Interested&assigned_to=&auto_assign=false&current_user=&limit=${limit}&offset=${offset}&days_ago=${daysAgo}`
    );
    console.log('Alternative endpoint response:', JSON.stringify(response, null, 2));
    return response;
  }
};
