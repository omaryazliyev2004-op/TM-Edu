import axios from "axios";

export const fetchApi = axios.create({
    baseURL:"https://najot-edu.softwareengineer.uz/api/v1/"
})

// Yuklangan fayllar manzili
export const FILES_BASE = "https://najot-edu.softwareengineer.uz/files/";
export const fileUrl = (name) => (name ? `${FILES_BASE}${name}` : null);

// JWT payloadini dekod qilib qaytaradi (topilmasa null)
export function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Joriy foydalanuvchi rolini kichik harfda qaytaradi (masalan "student")
export function getRole(token = localStorage.getItem("token")) {
  if (!token || token === "undefined") return null;
  const data = decodeToken(token);
  const role = data?.role || data?.user?.role;
  return role ? String(role).toLowerCase() : null;
}

// Joriy foydalanuvchi ismini token ichidan qaytaradi
export function getName(token = localStorage.getItem("token")) {
  if (!token || token === "undefined") return null;
  const data = decodeToken(token);
  return data?.full_name || data?.fullName || data?.name || data?.user?.full_name || null;
}

// Joriy foydalanuvchi id'sini token ichidan qaytaradi
export function getUserId(token = localStorage.getItem("token")) {
  if (!token || token === "undefined") return null;
  const data = decodeToken(token);
  return data?.id ?? data?.userId ?? data?.user?.id ?? null;
}

// Rolga mos boshlang'ich sahifa
export function roleHome(role) {
  if (role === "student") return "/student/guruhlarim";
  if (role === "teacher") return "/teacher/guruhlar";
  return "/dashboard";
}
fetchApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});
fetchApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);