import { ApiRequest } from '../services/api';

export const requestOtp = async (phone: number) => {
  return await ApiRequest("POST", "admin/telecall/request-otp", { phone });
};

export const signup = async (userData: {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone: number;
  otp: string;
}) => {
  return await ApiRequest("POST", "admin/telecall/signup", userData);
};

export const login = async (identifier: string, password: string) => {
  return await ApiRequest("POST", "admin/telecall/login", {
    identifier,
    password
  });
};

export const loginWithOtp = async (phone: number, otp: string) => {
  return await ApiRequest("POST", "admin/telecall/verify-login-otp", {
    phone,
    otp
  });
};