import { api } from "./api";

export const reportService = {
  getRevenue: async () => {
    try {
      return (await api.get("/reports/revenue", { params: { t: Date.now() } })).data;
    } catch (err) {
      throw err;
    }
  },
  getOccupancy: async () => {
    try {
      return (await api.get("/reports/occupancy", { params: { t: Date.now() } })).data;
    } catch (err) {
      throw err;
    }
  },
  getSiteUtilization: async () => {
    try {
      return (await api.get("/reports/site-utilization", { params: { t: Date.now() } })).data;
    } catch (err) {
      throw err;
    }
  },
  downloadCsv: async () => {
    const response = await api.get("/reports/export/csv", { responseType: "blob" });
    return response.data as Blob;
  },
  downloadPdf: async () => {
    const response = await api.get("/reports/export/pdf", { responseType: "blob" });
    return response.data as Blob;
  },
};
