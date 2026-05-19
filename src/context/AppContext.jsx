import { createContext, useContext, useState, useEffect } from "react";
import { fetchApi } from "../api/user.api";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [stats, setStats] = useState({
    talabalar: 0,
    oqituvchilar: 0,
    guruhlar: 0,
    xonalar: 0,
    kurslar: 0,
  });

  const fetchStats = async () => {
    const token = localStorage.getItem("token");
    if (!token) return; // Ma'lumotlarni so'rashdan oldin token borligini tekshirish

    try {
      const [studentsRes, teachersRes, groupsRes, roomsRes, coursesRes] = await Promise.all([
        fetchApi("students").catch(() => null),
        fetchApi("teachers").catch(() => null),
        fetchApi("groups/all").catch(() => null),
        fetchApi("rooms").catch(() => null),
        fetchApi("courses").catch(() => null),
      ]);

      const getCount = (res) => res?.data?.data?.length || res?.data?.length || 0;

      setStats({
        talabalar: getCount(studentsRes),
        oqituvchilar: getCount(teachersRes),
        guruhlar: getCount(groupsRes),
        xonalar: getCount(roomsRes),
        kurslar: getCount(coursesRes),
      });
    } catch (error) {
      console.error("Xatolik stats yuklashda:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <AppContext.Provider value={{ stats, fetchStats }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
