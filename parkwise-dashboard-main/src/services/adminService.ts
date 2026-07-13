import { api } from "./api";

export const adminService = {
  
  getSites: async () => { 
    const response = await api.get("/admin/sites");
    return response.data;
  },

  saveSite: async (s: any) => { 
    const payload = {
      siteId: s.id || s.siteId,
      location: s.location || s.name || "Default Location",
      capacity: parseInt(s.totalSlots || s.capacity || 0),
      rate: parseFloat(s.hourlyRate || s.rate || 0)
    };
    
    const response = await api.post("/admin/add-site", payload);
    return { success: true, message: response.data }; 
  },

  updateSite: async (id: string, s: any) => {
    const payload = {
      capacity: parseInt(s.totalSlots || s.capacity || 0),
      location: s.location || s.name || "",
      rate: parseFloat(s.hourlyRate || s.rate || 0),
      operational: s.status === "Active",
    };
    const response = await api.put(`/admin/sites/${id}`, payload);
    return response.data;
  },

  getOverview: async () => {
    const response = await api.get("/admin/overview", { params: { t: Date.now() } });
    return response.data;
  },

  getSettings: async () => {
    const response = await api.get("/admin/settings", { params: { t: Date.now() } });
    return response.data;
  },

  updateSettings: async (payload: any) => {
    const response = await api.put("/admin/settings", payload);
    return response.data;
  },

  getLiveSiteStatus: async (siteId: string) => {
    const response = await api.get(`/admin/sites/${siteId}/live`);
    return response.data;
  },

  deleteSite: async (id: string) => { 
    const response = await api.delete(`/admin/sites/${id}`);
    return response.data;
  },

  getUsers: async () => { 
    const response = await api.get("/admin/users");
    return response.data;
  },

  // This is the clean version of the paginated call. 
  // By using 'any' for the parameters, we bypass strict type errors.
  getRecords: async (page: number = 0, size: number = 25, search: string = "", siteId: string = "all", status: string = "all") => { 
    const params: any = {
      page,
      size,
      search,
      siteId,
      status,
      t: Date.now()
    };
    const response = await api.get("/admin/records", { params });
    return response.data; 
  },

  searchVehicleHistory: async (plate: string) => {
    const response = await api.get(`/admin/search-vehicle-history/${plate}`);
    return response.data;
  },

  getVehicleRequests: async () => {
    const response = await api.get("/admin/vehicle-requests");
    return response.data;
  },

  approveVehicleRequest: async (id: number | string) => {
    const response = await api.post(`/admin/vehicle-requests/${id}/approve`);
    return response.data;
  },

  rejectVehicleRequest: async (id: number | string) => {
    const response = await api.post(`/admin/vehicle-requests/${id}/reject`);
    return response.data;
  },

  suspendUser: async (id: number | string) => {
    const response = await api.post(`/admin/users/${id}/suspend`);
    return response.data;
  },

  revokeSuspension: async (id: number | string) => {
    const response = await api.post(`/admin/users/${id}/revoke-suspension`);
    return response.data;
  },

  getComplaints: async () => {
    const response = await api.get("/admin/complaints");
    return response.data;
  },

  resolveComplaint: async (id: number | string, status: string, adminResponse?: string) => {
    const response = await api.post(`/admin/complaints/${id}/resolve`, { status, adminResponse });
    return response.data;
  }
};