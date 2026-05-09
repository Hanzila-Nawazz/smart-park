import { api } from "./api";

export const paymentService = {
  getWallet: async (userId: string | number) => {
    try {
      return (await api.get(`/users/${userId}/wallet`)).data;
    } catch (err) {
      throw err;
    }
  },
  topUp: async (userId: string | number, amount: number, method: string) => {
    try {
      return (await api.post(`/users/${userId}/wallet/topup`, { amount, method })).data;
    } catch (err) {
      throw err;
    }
  },
  payBill: async (billId: string) => {
    try { return (await api.post(`/bills/${billId}/pay`)).data; }
    catch (err) { throw err; }
  },
};
