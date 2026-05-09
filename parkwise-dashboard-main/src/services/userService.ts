import { api } from "./api";

export const userService = {
  getDashboardStats: async (userId: string | number) => {
    try {
      const { data } = await api.get(`/users/${userId}/dashboard`);
      return data;
    } catch (err) {
      throw err;
    }
  }
  ,
  updateUser: async (userId: string | number, payload: any) => {
    try {
      const { data } = await api.put(`/users/${userId}`, payload);
      return data;
    } catch (err) {
      throw err;
    }
  },
  changePassword: async (userId: string | number, currentPassword: string, newPassword: string) => {
    try {
      const { data } = await api.post(`/users/${userId}/password`, { currentPassword, newPassword });
      return data;
    } catch (err) {
      throw err;
    }
  }
};