import { api } from "./api";

export const authService = {
  adminLogin: async (username: string, password: string) => {
    try {
      const { data } = await api.post("/admin/login", { username, password });
      return data;
    } catch (err) { throw err; }
  },
  
  // We will build the Java endpoint for this next!
  userLogin: async (cnic: string, password: string) => {
    try {
      const { data } = await api.post("/users/login", { cnic, password });
      return data;
    } catch (err) { throw err; }
  },

  // NEW MAPPED REGISTRATION
  userSignup: async (payload: any) => {
    try {
      // Map React UI state keys to Java Backend expected keys
      const mappedPayload = {
        name: payload.name,
        cnic: payload.cnic,
        contactNo: payload.contact,       // mapped from UI 'contact'
        vehicleType: payload.vehicleType,
        vehicleNo: payload.plate,         // mapped from UI 'plate'
        password: payload.password
      };

      // Point exactly to our UserController @PostMapping
      const { data } = await api.post("/users/register", mappedPayload);
      return data;
    } catch (err) { 
      throw err; 
    }
  },

  walkinRegister: async (payload: Record<string, unknown>) => {
    try {
      const { data } = await api.post("/auth/walkin", payload);
      return data;
    } catch (err) { throw err; }
  },
};