import { Navigate } from "@tanstack/react-router";
import React from "react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // 1. Check for auth data
  const rawAuth = localStorage.getItem("spms-auth");

  // 2. Kick to the correct admin login page
  if (!rawAuth) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const parsed = JSON.parse(rawAuth);
    const token = parsed?.state?.token;

    if (!token) {
      return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
  } catch (error) {
    return <Navigate to="/admin/login" replace />;
  }
};