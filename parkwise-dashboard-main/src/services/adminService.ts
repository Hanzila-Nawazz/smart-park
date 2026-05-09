import { api } from "./api";

export const adminService = {
  
  // 1. Get All Sites (Strict Database Call)
  getSites: async () => { 
    const response = await api.get("/admin/sites");
    return response.data;
  },

  // 2. Add New Site (Strict Database Call)
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

  // 3. Dashboard Overview (Strict Database Call)
  getOverview: async () => {
    const response = await api.get("/admin/overview", { params: { t: Date.now() } });
    return response.data;
  },

  getSettings: async () => {
    const response = await api.get("/admin/settings", { params: { t: Date.now() } });
    return response.data;
  },

  updateSettings: async (payload: { username: string; email: string; currentPassword: string; newPassword?: string }) => {
    const response = await api.put("/admin/settings", payload);
    return response.data;
  },

  // 4. NEW: Fetch live slot data from Java backend
  getLiveSiteStatus: async (siteId: string) => {
    const response = await api.get(`/admin/sites/${siteId}/live`);
    return response.data;
  },

  // --- Stripped Fallbacks ---
  deleteSite: async (id: string) => { 
    const response = await api.delete(`/admin/sites/${id}`);
    return response.data;
  },
  getUsers: async () => { 
    const response = await api.get("/admin/users");
    return response.data;
  },
  getRecords: async () => { 
    const response = await api.get("/admin/records");
    return response.data;
  },
  searchVehicleHistory: async (plate: string) => {
    const response = await api.get(`/admin/search-vehicle-history/${plate}`);
    return response.data;
  }
};