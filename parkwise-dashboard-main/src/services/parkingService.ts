import { api } from "./api";

export const parkingService = {
  // Pointing to our new, safe user-facing endpoint
  getSites: async () => {
    try { return (await api.get("/parking/sites")).data; } catch (err) { throw err; }
  },

  getSlots: async (siteId: string) => {
    try { return (await api.get(`/parking/sites/${siteId}/slots`)).data; }
    catch (err) { throw err; }
  },

  bookSlot: async (payload: any) => {
    try {
      const requestBody = {
        siteId: payload.siteId,
        vehicleNo: payload.plate,
        slotId: payload.slotId
      };
      return (await api.post("/parking/check-in", requestBody)).data;
    }
    catch (err) { throw err; }
  },

  getActiveSession: async (userId: string | number) => {
    try { return (await api.get(`/users/${userId}/active-session`)).data; }
    catch (err) { throw err; }
  },
  checkout: async (sessionId: string, paymentType = "Cash") => {
    try { return (await api.post(`/users/sessions/${sessionId}/checkout`, { paymentType })).data; }
    catch (err) { throw err; }
  },
  getHistory: async (userId: string | number) => {
    try { return (await api.get(`/users/${userId}/history`)).data; }
    catch (err) { throw err; }
  },
  getPendingBills: async (userId: string | number) => {
    try { return (await api.get(`/users/${userId}/pending-bills`)).data; }
    catch (err) { throw err; }
  },
  payPendingBill: async (sessionId: string | number, paymentType = "Cash") => {
    try { return (await api.post(`/users/pending-bills/${sessionId}/pay`, { paymentType })).data; }
    catch (err) { throw err; }
  },
  walkinCheckIn: async (payload: { name: string; contact: string; vehicleType: string; plate: string; siteId: string }) => {
    try { return (await api.post("/walkin/check-in", payload)).data; }
    catch (err) { throw err; }
  },
  walkinLookup: async (plate: string) => {
    try { return (await api.get(`/walkin/lookup/${plate}`)).data; }
    catch (err) { throw err; }
  },
  walkinCheckout: async (plate: string) => {
    try { return (await api.post("/walkin/checkout", { plate })).data; }
    catch (err) { throw err; }
  },
  checkWalkinRegistered: async (plate: string) => {
    try { return (await api.get(`/walkin/is-registered/${plate}`)).data; }
    catch (err) { throw err; }
  }
};