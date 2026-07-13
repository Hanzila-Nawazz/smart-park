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
    },
    submitVehicleChangeRequest: async (userId: string | number, payload: { newPlate: string; newType: string }) => {
      try {
        const { data } = await api.post(`/users/${userId}/vehicle-requests`, payload);
        return data;
      } catch (err) {
        throw err;
      }
    },
    getMyVehicleRequests: async (userId: string | number) => {
      try {
        const { data } = await api.get(`/users/${userId}/vehicle-requests`);
        return data;
      } catch (err) {
        throw err;
      }
    },
    getComplaints: async (userId: string | number) => {
      try {
        const { data } = await api.get(`/users/${userId}/complaints`);
        return data;
      } catch (err) {
        throw err;
      }
    },
    submitComplaint: async (userId: string | number, payload: { subject: string; description: string }) => {
      try {
        const { data } = await api.post(`/users/${userId}/complaints`, payload);
        return data;
      } catch (err) {
        throw err;
      }
    },
    respondToComplaint: async (userId: string | number, complaintId: string | number, satisfied: boolean) => {
      try {
        const { data } = await api.post(`/users/${userId}/complaints/${complaintId}/feedback`, { satisfied });
        return data;
      } catch (err) {
        throw err;
      }
    }
};