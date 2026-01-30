import { ApiRequest } from "../services/api";

interface GetUsersParams {
  tag?: string;
  status?: string;
  state?: string;
  city?: string;
  assigned_to?: string;
  auto_assign?: boolean;
  current_user?: string;
  limit?: number;
  offset?: number;
}

export const GetUnregisterdUsers = async (params: GetUsersParams = {}) => {
  const {
    tag,
    status,
    state,
    city,
    assigned_to,
    auto_assign,
    current_user,
    limit = 100,
    offset = 0,
  } = params;
  const queryParams = new URLSearchParams();

  if (tag) queryParams.append("tag", tag);
  if (status) queryParams.append("status", status);
  if (state) queryParams.append("state", state);
  if (city) queryParams.append("city", city);
  queryParams.append("assigned_to", assigned_to || "");
  if (auto_assign !== undefined)
    queryParams.append("auto_assign", auto_assign.toString());
  if (current_user) queryParams.append("current_user", current_user);
  queryParams.append("limit", limit.toString());
  queryParams.append("offset", offset.toString());

  const fullUrl = `admin/unregistered-users?${queryParams}`;
  
  console.log("🚀 API Request - GetUnregisterdUsers:");
  console.log("   📋 Parameters:", params);
  console.log("   🔗 Full URL:", fullUrl);
  console.log("   🏷️  State Filter:", state || "NONE");
  console.log("   🏙️  City Filter:", city || "NONE");

  return await ApiRequest("GET", fullUrl);
};

export const updateFeedback = async (
  user_id: number,
  status?: string,
  feedback?: string,
  priority?: string,
  assigned_to?: string
) => {
  return await ApiRequest("PATCH", "admin/update-feedback", {
    user_id,
    status,
    feedback,
    priority,
    assigned_to,
  });
};

export const getUnregisteredUsers = async (
  tag: any,
  status?: string,
  assignedTo?: string,
  state?: string,
  city?: string,
  limit: number = 50,
  autoAssign: boolean = true,
  currentUser?: string,
  offset: number = 0
) => {
  return await GetUnregisterdUsers({
    tag,
    status,
    state,
    city,
    assigned_to: assignedTo,
    auto_assign: autoAssign,
    current_user: currentUser,
    limit,
    offset,
  });
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

export const getStatesAndCities = async () => {
  return await ApiRequest("GET", "admin/states_and_city");
};

export const getEscalatedUsers = async (state?: string, city?: string) => {
  let endpoint = `admin/unregistered-users?tag=&status=Escalate to Sonia&assigned_to=&auto_assign=false&current_user=&limit=1000&offset=0`;
  if (state) endpoint += `&state=${state}`;
  if (city) endpoint += `&city=${city}`;
  
  const response = await ApiRequest("GET", endpoint);
  return response;
};

export const getNotSeriousUsers = async (state?: string, city?: string) => {
  let endpoint = `admin/unregistered-users?tag=&status=Not Serious&assigned_to=&auto_assign=false&current_user=&limit=1000&offset=0`;
  if (state) endpoint += `&state=${state}`;
  if (city) endpoint += `&city=${city}`;

  const response = await ApiRequest("GET", endpoint);
  return response;
};

export const getDeclinedUsers = async (state?: string, city?: string) => {
  let endpoint = `admin/unregistered-users?tag=&status=Declined&assigned_to=&auto_assign=false&current_user=&limit=1000&offset=0`;
  if (state) endpoint += `&state=${state}`;
  if (city) endpoint += `&city=${city}`;

  const response = await ApiRequest("GET", endpoint);
  return response;
};

export const getBusyCallLaterUsers = async (state?: string, city?: string) => {
  let endpoint = `admin/unregistered-users?tag=&status=Busy Call Later&assigned_to=&auto_assign=false&current_user=&limit=1000&offset=0`;
  if (state) endpoint += `&state=${state}`;
  if (city) endpoint += `&city=${city}`;

  const response = await ApiRequest("GET", endpoint);
  return response;
};

export const getInterestedUsers = async (state?: string, city?: string) => {
  let endpoint = `admin/unregistered-users?tag=&status=Interested&assigned_to=&auto_assign=false&current_user=&limit=1000&offset=0`;
  if (state) endpoint += `&state=${state}`;
  if (city) endpoint += `&city=${city}`;

  const response = await ApiRequest("GET", endpoint);
  return response;
};

export const getNotInterestedUsers = async (state?: string, city?: string) => {
  let endpoint = `admin/unregistered-users?tag=&status=Not Interested&assigned_to=&auto_assign=false&current_user=&limit=1000&offset=0`;
  if (state) endpoint += `&state=${state}`;
  if (city) endpoint += `&city=${city}`;

  const response = await ApiRequest("GET", endpoint);
  return response;
};

export const getMarriedEngagedUsers = async (state?: string, city?: string) => {
  let endpoint = `admin/unregistered-users?tag=&status=Married/Engaged&assigned_to=&auto_assign=false&current_user=&limit=1000&offset=0`;
  if (state) endpoint += `&state=${state}`;
  if (city) endpoint += `&city=${city}`;

  const response = await ApiRequest("GET", endpoint);
  return response;
};

export const getCompleteSoonUsers = async (state?: string, city?: string) => {
  let endpoint = `admin/unregistered-users?tag=&status=Complete Soon&assigned_to=&auto_assign=false&current_user=&limit=1000&offset=0`;
  if (state) endpoint += `&state=${state}`;
  if (city) endpoint += `&city=${city}`;

  const response = await ApiRequest("GET", endpoint);
  return response;
};

export const getNeedHelpUsers = async (state?: string, city?: string) => {
  let endpoint = `admin/unregistered-users?tag=&status=Need Help completing&assigned_to=&auto_assign=false&current_user=&limit=1000&offset=0`;
  if (state) endpoint += `&state=${state}`;
  if (city) endpoint += `&city=${city}`;

  const response = await ApiRequest("GET", endpoint);
  return response;
};

export const getInterestedNotRegisteredUsers = async (daysAgo = 2, limit = 1000, offset = 0, state?: string, city?: string) => {
  // Try the original endpoint first
  try {
    let endpoint = `admin/interested-not-registered?days_ago=${daysAgo}&limit=${limit}&offset=${offset}`;
    if (state) endpoint += `&state=${state}`;
    if (city) endpoint += `&city=${city}`;

    const response = await ApiRequest("GET", endpoint);
    console.log('Interested Not Registered Users API Response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.log('Original endpoint failed, trying alternative...');
    // Fallback to similar pattern as other endpoints
    let endpoint = `admin/unregistered-users?tag=&status=Interested&assigned_to=&auto_assign=false&current_user=&limit=${limit}&offset=${offset}&days_ago=${daysAgo}`;
    if (state) endpoint += `&state=${state}`;
    if (city) endpoint += `&city=${city}`;

    const response = await ApiRequest("GET", endpoint);
    console.log('Alternative endpoint response:', JSON.stringify(response, null, 2));
    return response;
  }
};

export const updateUserInstructionAndAssignment = async (
  user_id: number,
  instruction: string,
  assigned_to: string
) => {
  return await ApiRequest("PATCH", "admin/update-user-instruction-assignment", {
    user_id,
    instruction,
    assigned_to,
  });
};

