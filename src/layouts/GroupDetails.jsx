import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchApi } from "../api/user.api";
import { useLang } from "../i18n/LanguageContext";

export default function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [homework, setHomework] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [scheduleMonths, setScheduleMonths] = useState([]);
  const [activeScheduleMonth, setActiveScheduleMonth] = useState("");
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [activeTab, setActiveTab] = useState("malumotlar");
  const [activeDarslikTab, setActiveDarslikTab] = useState("uyga");
  const [showMentors, setShowMentors] = useState(true);
  const [showParams, setShowParams] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [lessonMode, setLessonMode] = useState("boshqa");
  const [lessonTopic, setLessonTopic] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [attendance, setAttendance] = useState({});
  const [allStudents, setAllStudents] = useState([]);
  const [allStudentsFetched, setAllStudentsFetched] = useState(false);
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [lessonsList, setLessonsList] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [customVideoName, setCustomVideoName] = useState("");
  // Exam states
  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);
  // Attendance loading state
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const toastTimeoutRef = useRef(null);
  const { t } = useLang();

  const showToast = (message, type = "success") => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ show: true, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2000);
  };

  useEffect(() => {
    async function loadGroup() {
      try {
        const res = await fetchApi(`groups/${id}`);
        if (res.status === 200) {
          setGroup(res.data?.data || res.data);
        }
        console.log(res.data?.data, 2);
      } catch (err) {
        console.error(err);
      }
    }
    loadGroup();
  }, [id]);

  useEffect(() => {
    async function loadSchedule() {
      try {
        const res = await fetchApi(`groups/${id}/schedules`);
        if (res.status === 200) {
          const payload = res.data?.data || res.data;
          const scheduleObject = Array.isArray(payload) ? payload[0] || {} : payload || {};
          const months = Object.keys(scheduleObject).sort((a, b) => Number(a) - Number(b));
          const currentMonthName = new Date().toLocaleString("en-GB", { month: "long" });
          const currentMonthKey = months.find((key) =>
            scheduleObject[key]?.days?.some((day) => day.month === currentMonthName)
          ) || months[0] || "";

          setSchedule(scheduleObject);
          setScheduleMonths(months);
          setActiveScheduleMonth(currentMonthKey);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadSchedule();
  }, [id]);

  useEffect(() => {
    async function loadHomework() {
      try {
        const res = await fetchApi(`homework/${id}`);
        if (res.status === 200) {
          setHomework(res.data?.data || res.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadHomework();
  }, [id]);

  useEffect(() => {
    // Guruh hali yuklanmagan bo'lsa kutamiz
    if (!group) return;
    // Guruh ma'lumotida talabalar bor — barcha talabalarni yuklash shart emas
    if (Array.isArray(group.students) && group.students.length > 0) return;
    // Fallback: faqat guruhda talaba bo'lmasa, hammasini yuklab filtrlash uchun
    async function loadStudents() {
      try {
        const res = await fetchApi(`students`);
        if (res.status === 200) {
          setAllStudents(res.data?.data || res.data || []);
          setAllStudentsFetched(true);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadStudents();
  }, [group]);

  useEffect(() => {
    async function loadVideos() {
      setVideosLoading(true);
      try {
        const res = await fetchApi(`files/${id}`);
        if (res.status === 200) {
          setVideos(res.data?.data || res.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setVideosLoading(false);
      }
    }
    loadVideos();
  }, [id]);

  useEffect(() => {
    async function loadExams() {
      setExamsLoading(true);
      try {
        const res = await fetchApi(`exams/group/${id}`);
        if (res.status === 200) {
          const fetchedExams = res.data?.data || res.data || [];
          if (fetchedExams.length === 0) {
            setExams([
              {
                id: 1,
                title: "React JS asoslari va React Router bilan ishlash",
                totalStudents: 15,
                notSubmitted: 3,
                deadline: "2026-06-15T18:00:00",
                created_at: "2026-05-30T10:00:00",
                lesson: {
                  created_at: "2026-05-28T14:00:00"
                }
              }
            ]);
          } else {
            setExams(fetchedExams);
          }
        }
      } catch (err) {
        console.error("loadExams error, using mock data:", err);
        setExams([
          {
            id: 1,
            title: "React JS asoslari va React Router",
            totalStudents: 15,
            notSubmitted: 3,
            deadline: "2026-06-15T18:00:00",
            created_at: "2026-05-30T10:00:00",
            lesson: {
              created_at: "2026-05-28T14:00:00"
            }
          }
        ]);
      } finally {
        setExamsLoading(false);
      }
    }
    loadExams();
  }, [id]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDropVideo = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetVideoFile(e.dataTransfer.files[0]);
    }
  };

  const handleVideoFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetVideoFile(e.target.files[0]);
    }
  };

  const validateAndSetVideoFile = (file) => {
    const allowedExtensions = [".mp4", ".webm", ".mpeg", ".avi", ".mkv", ".m4v", ".ogm", ".mov"];
    const fileName = file.name.toLowerCase();
    const hasValidExt = allowedExtensions.some(ext => fileName.endsWith(ext));
    if (!hasValidExt) {
      showToast(t("Faqat video fayllarni yuklashingiz mumkin! (.mp4, .webm, etc.)"), "error");
      return;
    }
    setUploadFile(file);
    setCustomVideoName(file.name);
  };

  const handleUploadVideo = async () => {
    if (!uploadFile || !selectedLessonId || !customVideoName.trim()) {
      showToast(t("Iltimos, darsni va video nomini to'ldiring!"), "error");
      return;
    }
    setUploadLoading(true);
    try {
      const formData = new FormData();

      let fileToUpload = uploadFile;
      if (customVideoName.trim() !== uploadFile.name) {
        let finalName = customVideoName.trim();
        const originalExt = uploadFile.name.substring(uploadFile.name.lastIndexOf("."));
        if (!finalName.toLowerCase().endsWith(originalExt.toLowerCase())) {
          finalName += originalExt;
        }
        fileToUpload = new File([uploadFile], finalName, { type: uploadFile.type });
      }

      formData.append("file", fileToUpload);

      const res = await fetchApi.post(
        `files/group/${id}/upload?lessonId=${selectedLessonId}`,
        formData
      );

      if (res.status === 200 || res.status === 201) {
        showToast(t("Video muvaffaqiyatli yuklandi!"), "success");
        setShowUploadModal(false);
        setUploadFile(null);
        setSelectedLessonId("");
        setCustomVideoName("");
        // Reload videos
        const vRes = await fetchApi(`files/${id}`);
        if (vRes.status === 200) {
          setVideos(vRes.data?.data || vRes.data || []);
        }
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || error.response?.data?.error || t("Videoni yuklashda xatolik yuz berdi.");
      showToast(errMsg, "error");
    } finally {
      setUploadLoading(false);
    }
  };

  useEffect(() => {
    if (!showUploadModal) return;

    async function loadLessons() {
      setLessonsLoading(true);
      try {
        const res = await fetchApi(`lessons/my/group/${id}`);
        if (res.status === 200) {
          setLessonsList(res.data?.data || res.data || []);
        }
      } catch (err) {
        console.error("Error loading lessons for dropdown:", err);
      } finally {
        setLessonsLoading(false);
      }
    }
    loadLessons();
  }, [showUploadModal, id]);

  function formatDate(date) {
    if (!date) return "-";

    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-GB", { month: "short" });
    const year = d.getFullYear();

    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${day} ${month}, ${year} ${hours}:${minutes}`;
  }

  const monthNameToIndex = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };
  const today = new Date();

  const currentSchedule = schedule?.[activeScheduleMonth] || {};
  const currentScheduleDays = Array.isArray(currentSchedule.days)
    ? currentSchedule.days
    : [];

  const sortedScheduleKeys = [...scheduleMonths].sort((a, b) => Number(a) - Number(b));
  const scheduleGroups = sortedScheduleKeys.map((key) => ({
    key,
    days: schedule?.[key]?.days || [],
  }));

  const getMonthLabel = (key) => schedule?.[key]?.days?.[0]?.month || key;
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const getDayDate = (day) => {
    if (!day?.month || !day?.day) return null;
    const monthIndex = monthNameToIndex[day.month];
    if (!monthIndex) return null;
    return new Date(today.getFullYear(), monthIndex - 1, Number(day.day));
  };

  const isPastDay = (day) => {
    const date = getDayDate(day);
    if (!date) return false;
    return date.getTime() < todayDate.getTime();
  };

  const isFutureDay = (day) => {
    const date = getDayDate(day);
    if (!date) return false;
    return date.getTime() > todayDate.getTime();
  };

  const selectedDayIsPast = selectedDay && isPastDay(selectedDay);

  const groupStudents = (group?.students && group.students.length > 0)
    ? group.students
    : allStudents.filter((s) => {
        const sGroups = s.groups || [];
        return sGroups.some((g) => {
          const gid = g && typeof g === "object" ? g.id : g;
          return Number(gid) === Number(id);
        });
      });

  // Guruhda talabalar bo'lsa darhol, aks holda barcha talabalar yuklangach tayyor
  const studentsLoaded =
    (Array.isArray(group?.students) && group.students.length > 0) || allStudentsFetched;

  const studentList = studentsLoaded
    ? groupStudents.map((student, index) => ({
        id: student?.id ?? `student-${index}`,
        full_name: student?.full_name || student?.name || student?.title || `Talaba ${index + 1}`,
      }))
    : [
        { id: 1, full_name: "Ali Valiyev" },
        { id: 2, full_name: "Salim Qodirov" },
        { id: 3, full_name: "Bobur" },
        { id: 4, full_name: "Qodir Salimov" },
        { id: 5, full_name: "Salima Qodirova" },
      ];

  const handleSelectDay = (day) => {
    if (isFutureDay(day)) return;
    setSelectedDay(day);
  };

  // Load attendance from API only when a DIFFERENT day is selected
  useEffect(() => {
    if (!selectedDay) return;

    async function loadAttendance() {
      setAttendanceLoading(true);
      try {
        const res = await fetchApi("attendance/all");
        if (res.status === 200) {
          const allRecords = res.data?.data || res.data || [];
          console.log("attendance/all sample:", allRecords[0]);

          const gid = Number(id);
          // Tanlangan kunning sanasi (yil/oy/kun)
          const sel = getDayDate(selectedDay);
          const isSameDay = (recDate) => {
            if (!sel || !recDate) return false;
            const d = new Date(recDate);
            if (isNaN(d.getTime())) return false;
            return (
              d.getFullYear() === sel.getFullYear() &&
              d.getMonth() === sel.getMonth() &&
              d.getDate() === sel.getDate()
            );
          };

          // Faqat shu guruh va AYNAN tanlangan kunning yozuvlaridan map yasaymiz
          const map = {};
          allRecords.forEach((rec) => {
            const recGid = Number(rec.group_id ?? rec.groupId ?? rec.group?.id);
            if (recGid !== gid) return;

            const recDate =
              rec.date ?? rec.created_at ?? rec.createdAt ?? rec.lesson?.created_at;
            if (!isSameDay(recDate)) return;

            const sid = rec.student_id ?? rec.studentId ?? rec.student?.id;
            const present =
              rec.isPresent ??
              rec.is_present ??
              rec.present ??
              (typeof rec.status === "string" &&
                ["present", "keldi", "PRESENT"].includes(rec.status));
            if (sid != null) map[sid] = !!present;
          });
          setAttendance(map);
        }
      } catch (err) {
        console.error("Davomat yuklashda xatolik:", err);
      } finally {
        setAttendanceLoading(false);
      }
    }

    loadAttendance();
  // Faqat kun (oy + kun raqami) o'zgarganda qayta yukla — object reference o'zgarsa ishlamasin
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay?.month, selectedDay?.day, id]);

  const toggleAttendance = (studentId) => {
    setAttendance((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  // Save only attendance (without requiring lesson topic)
  const handleSaveAttendance = async () => {
    try {
      const attendancePromises = studentList.map((student) =>
        fetchApi.post("attendance", {
          group_id: Number(id),
          student_id: student.id,
          isPresent: !!attendance[student.id],
        }).catch((err) => {
          console.error(`O'quvchi ${student.id} davomati saqlashda xatolik:`, err);
        })
      );
      await Promise.all(attendancePromises);
      alert(t("Davomat muvaffaqiyatli saqlandi!"));
    } catch (error) {
      console.error(error);
      alert(t("Davomatni saqlashda xatolik yuz berdi."));
    }
  };

  const handleSaveLesson = async () => {
    if (!lessonTopic.trim()) {
      alert(t("Iltimos, dars mavzusini kiriting!"));
      return;
    }

    try {
      // 1. Save lesson topic
      const payload = {
        group_id: Number(id),
        topic: lessonTopic.trim(),
        description: lessonDescription.trim(),
      };

      const res = await fetchApi.post("lessons", payload);
      if (res.status === 200 || res.status === 201) {
        // 2. POST attendance for each student via POST /api/v1/attendance
        const attendancePromises = studentList.map((student) =>
          fetchApi.post("attendance", {
            group_id: Number(id),
            student_id: student.id,
            isPresent: !!attendance[student.id],
          }).catch((err) => {
            console.error(`O'quvchi ${student.id} davomati saqlashda xatolik:`, err);
          })
        );
        await Promise.all(attendancePromises);

        alert(t("Mavzu va davomat muvaffaqiyatli saqlandi!"));
        setLessonTopic("");
        setLessonDescription("");
      }
    } catch (error) {
      console.error(error);
      const xato = error.response?.data?.message || error.response?.data?.error || t("Mavzuni saqlashda xatolik yuz berdi.");
      alert(xato);
    }
  };

  function moveScheduleMonth(direction) {
    if (!scheduleMonths.length) return;
    const currentIndex = scheduleMonths.indexOf(activeScheduleMonth);
    if (currentIndex === -1) {
      setActiveScheduleMonth(scheduleMonths[0]);
      return;
    }
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= scheduleMonths.length) return;
    setActiveScheduleMonth(scheduleMonths[nextIndex]);
  }

  return (
    <div style={{ padding: "0 10px", width: "100%", boxSizing: "border-box" }}>
      <style>{`
        .gd-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .gd-back {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #444;
          margin-right: 12px;
          display: flex;
          align-items: center;
        }
        .gd-title {
          font-size: 22px;
          font-weight: 700;
          color: #222;
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0;
        }
        .gd-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
          background: rgba(46, 204, 113, 0.15);
          color: #2ecc71;
        }
        .gd-stat-btn {
          border: 1px solid #e0e0e0;
          background: #fff;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #444;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .gd-tabs {
          display: flex;
          gap: 24px;
          border-bottom: 1px solid #e0e0e0;
          margin-bottom: 24px;
        }
        .gd-tab {
          padding: 10px 0;
          border: none;
          background: none;
          font-size: 14px;
          font-weight: 600;
          color: #888;
          cursor: pointer;
          position: relative;
        }
        .gd-tab.active {
          color: #765bcf;
        }
        .gd-tab.active::after {
          content: "";
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background: #765bcf;
        }

        .gd-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
          align-items: start;
        }
        .gd-panel {
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          background: #fff;
          overflow: hidden;
        }
        .gd-panel-header {
          background: #4285f4;
          color: #fff;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .gd-panel-body {
          padding: 16px;
        }

        /* Mentor List */
        .gd-mentor {
          display: flex;
          flex-direction: row;
          gap: 24px;
          flex-wrap: wrap;
        }
        .gd-mentor-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 4px;
        }
        .gd-mentor-img {
          width: 55px;
          height: 55px;
          border-radius: 50%;
          background: #ddd;
          object-fit: cover;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .gd-mentor-role {
          font-size: 11px;
          color: #2ecc71;
          font-weight: 600;
          background: rgba(46, 204, 113, 0.1);
          padding: 2px 8px;
          border-radius: 4px;
          margin-top: 4px;
        }
        .gd-mentor-name {
          font-size: 13px;
          font-weight: 600;
          color: #222;
        }

        /* Params Table */
        .gd-param-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f5f5f5;
          font-size: 13px;
        }
        .gd-param-row:last-child {
          border-bottom: none;
        }
        .gd-param-label {
          color: #666;
        }
        .gd-param-value {
          font-weight: 600;
          color: #222;
        }

        /* Schedule Section */
        .gd-schedule {
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          background: #fff;
          padding: 20px;
          margin-bottom: 24px;
        }
        .gd-schedule-title {
          font-size: 16px;
          font-weight: 700;
          color: #222;
          margin-bottom: 16px;
        }
        .gd-schedule-row {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          margin-bottom: 8px;
          color: #555;
        }
        .gd-schedule-row strong {
          color: #4285f4;
          font-weight: 600;
          min-width: 150px;
        }

        /* Calendar Bottom */
        .gd-calendar-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 24px 0 16px;
          font-size: 14px;
          font-weight: 600;
          flex-wrap: wrap;
        }
        .gd-month-index {
          padding: 8px 14px;
          border-radius: 12px;
          background: #f0f8ff;
          color: #2a6fd5;
          font-weight: 700;
          border: 1px solid rgba(42, 111, 213, 0.14);
        }
        .gd-cal-nav {
          width: 32px;
          height: 32px;
          border: 1px solid #e0e0e0;
          background: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #666;
        }
        .gd-dates {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 10px;
        }
        .gd-date-box {
          min-width: 50px;
          padding-left: 8px;
          padding-right: 8px;
          height: 60px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #fff;
          font-size: 12px;
          color: #666;
          cursor: pointer;
          white-space: nowrap;
        }
        .gd-date-box.active {
          background: white !important;
          border-color: #4285f4 !important;
          color: #4285f4;
          font-weight: 600;
        }
        .gd-date-box.past {
          background: #f5f5f5;
          border-color: #ddd;
          color: #999;
        }
        .gd-date-box.future {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .gd-date-box.future:hover {
          background: #fafafa;
        }
        .gd-date-box.selected {
          border-color: #765bcf;
          background: rgba(118, 91, 207, 0.08);
          color: #333;
        }
        .gd-date-box.selected span {
          color: #765bcf;
        }
        .gd-selected-day-card {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .gd-info-card {
          border: 1px solid #e8eaf0;
          border-radius: 12px;
          background: #fff;
          overflow: hidden;
        }
        .gd-info-card-title {
          font-size: 13px;
          font-weight: 700;
          color: #1a1a2e;
          padding: 14px 18px 12px;
          border-bottom: 1px solid #f0f2f7;
          margin: 0;
        }
        .gd-info-card-body {
          padding: 16px 18px;
        }
        .gd-selected-day-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .gd-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #d5d5d5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #555;
          font-size: 20px;
          flex-shrink: 0;
        }
        .gd-teacher-name {
          font-size: 15px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 2px;
        }
        .gd-teacher-role {
          font-size: 12px;
          color: #888;
          margin: 0;
        }
        .gd-info-cols {
          display: flex;
          gap: 32px;
          margin-left: auto;
        }
        .gd-info-col label {
          display: block;
          font-size: 11px;
          color: #aab0c0;
          font-weight: 600;
          margin-bottom: 3px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .gd-info-col span {
          font-size: 13px;
          color: #1a1a2e;
          font-weight: 600;
        }
        .gd-info-col span.status-blue {
          color: #3b82f6;
          font-weight: 500;
        }
        .gd-info-col span.status-green {
          color: #10b981;
          font-weight: 500;
        }
        .gd-form-card {
          border: 1px solid #e8eaf0;
          border-radius: 12px;
          background: #fff;
          overflow: hidden;
        }
        .gd-form-card-title {
          font-size: 13px;
          font-weight: 700;
          color: #1a1a2e;
          padding: 14px 18px 12px;
          border-bottom: 1px solid #f0f2f7;
          margin: 0;
        }
        .gd-selected-day-form {
          padding: 20px 18px;
          display: grid;
          gap: 18px;
        }
        .gd-radio-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }
        .gd-radio-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: #555;
          font-size: 13px;
        }
        .gd-radio-label input[type="radio"] {
          accent-color: #22c55e;
          width: 16px;
          height: 16px;
        }
        .gd-radio-label.active {
          color: #22c55e;
          font-weight: 600;
        }
        .gd-field-row {
          display: grid;
          gap: 16px;
        }
        .gd-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .gd-field > label {
          color: #e53935;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.2px;
        }
        .gd-field > label.optional {
          color: #666;
          font-weight: 600;
        }
        .gd-input,
        .gd-textarea {
          width: 100%;
          border: 1px solid #e8eaf0;
          border-radius: 8px;
          padding: 11px 14px;
          font-size: 13px;
          color: #333;
          background: #fff;
          resize: vertical;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s;
        }
        .gd-input:focus,
        .gd-textarea:focus {
          border-color: #3b82f6;
        }
        .gd-input::placeholder,
        .gd-textarea::placeholder {
          color: #c0c4cc;
        }
        .gd-textarea {
          min-height: 80px;
        }
        .gd-student-list {
          border-top: 1px solid #f0f0f0;
          padding-top: 16px;
          display: grid;
          gap: 10px;
        }
        .gd-student-list-header,
        .gd-student-item {
          display: grid;
          grid-template-columns: 40px 1fr 80px;
          align-items: center;
          gap: 12px;
          font-size: 13px;
        }
        .gd-student-list-header {
          color: #777;
          padding-bottom: 8px;
          border-bottom: 1px solid #f0f0f0;
        }
        .gd-student-item {
          padding: 10px 0;
          border-bottom: 1px solid #f5f5f5;
        }
        .gd-switch {
          width: 46px;
          height: 26px;
          border-radius: 999px;
          background: #eaeaea;
          border: none;
          position: relative;
          cursor: pointer;
          padding: 3px;
        }
        .gd-switch span {
          display: block;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #fff;
          transition: transform 0.2s ease;
        }
        .gd-switch.on {
          background: #22c55e;
        }
        .gd-switch.on span {
          transform: translateX(20px);
        }
        .gd-action-row {
          display: flex;
          justify-content: flex-end;
        }
        .gd-save-btn {
          background: #22c55e;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 28px;
          cursor: pointer;
          font-weight: 700;
          font-size: 14px;
        }
        .gd-save-btn:hover {
          background: #16a34a;
        }
        .gd-month-heading {
          font-size: 13px;
          font-weight: 700;
          color: #444;
          margin-bottom: 8px;
        }
        .gd-date-box span {
          font-size: 18px;
          font-weight: 700;
          color: #222;
        }
        .gd-date-box.active span {
          color: #4285f4;
        }

        /* Darsliklar Table */
        .gd-table-container {
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 24px;
        }
        .gd-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .gd-table thead {
          background: #f5f5f5;
          border-bottom: 1px solid #e0e0e0;
        }
        .gd-table th {
          padding: 14px 16px;
          text-align: left;
          font-weight: 600;
          color: #666;
          font-size: 12px;
        }
        .gd-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f0f0f0;
          color: #333;
        }
        .gd-table tbody tr:hover {
          background: #f9f9f9;
        }
        .gd-table tbody tr:last-child td {
          border-bottom: none;
        }
        .gd-table-index {
          color: #999;
          font-weight: 500;
        }
        .gd-table-subject {
          font-weight: 600;
          color: #222;
        }
        .gd-table-icon {
          text-align: center;
          color: #999;
        }
        .gd-table-time {
          color: #666;
        }
        .gd-table-date {
          color: #666;
        }
        .gd-tabs-buttons {
          display: flex;
          gap: 8px;
          background: #f5f5f5;
          padding: 8px;
          border-radius: 8px;
          margin-bottom: 24px;
        }
        .gd-tab-btn {
          padding: 8px 14px;
          border: none;
          background: transparent;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #666;
          cursor: pointer;
        }
        .gd-tab-btn.active {
          background: #fff;
          color: #4285f4;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        /* Video Modal */
        .vid-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.82);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.18s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .vid-modal {
          background: #1a1d2e;
          border-radius: 14px;
          overflow: hidden;
          width: min(780px, 95vw);
          box-shadow: 0 24px 80px rgba(0,0,0,0.7);
          animation: slideUp 0.22s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        .vid-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          background: #12151f;
        }
        .vid-modal-title {
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .vid-modal-title i {
          color: #4285f4;
          font-size: 18px;
        }
        .vid-modal-close {
          background: rgba(255,255,255,0.08);
          border: none;
          color: #ccc;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          transition: background 0.15s;
        }
        .vid-modal-close:hover {
          background: rgba(255,255,255,0.18);
          color: #fff;
        }
        .vid-modal-player {
          width: 100%;
          display: block;
          max-height: 430px;
          background: #000;
          outline: none;
        }
        .vid-modal-footer {
          padding: 12px 20px;
          background: #12151f;
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }
        .vid-modal-meta {
          font-size: 13px;
          color: #8899bb;
        }
        .vid-modal-meta span {
          color: #e0e8ff;
          font-weight: 600;
        }
        .vid-name-btn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          text-align: left;
        }
        .vid-name-btn:hover .vid-name-cell {
          color: #4285f4;
          text-decoration: underline;
        }

        /* Upload Modal */
        .up-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(3px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease;
        }
        .up-modal {
          background: #fff;
          border-radius: 12px;
          width: min(680px, 95vw);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          animation: slideUp 0.25s ease;
        }
        .up-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          border-bottom: 1px solid #f1f5f9;
        }
        .up-modal-title {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }
        .up-modal-close {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 18px;
          cursor: pointer;
          transition: color 0.15s;
          padding: 4px;
          display: flex;
          align-items: center;
        }
        .up-modal-close:hover {
          color: #334155;
        }
        .up-modal-body {
          padding: 24px;
        }
        .up-dropzone {
          border: 2px dashed #cbd5e1;
          border-radius: 10px;
          padding: 44px 20px;
          text-align: center;
          cursor: pointer;
          background: #f8fafc;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .up-dropzone.active,
        .up-dropzone:hover {
          border-color: #10b981;
          background: #f0fdf4;
        }
        .up-dropzone-title {
          font-size: 14px;
          font-weight: 700;
          color: #334155;
          margin: 0 0 8px 0;
          line-height: 1.4;
        }
        .up-dropzone-sub {
          font-size: 11px;
          color: #94a3b8;
          max-width: 480px;
          margin: 0;
          line-height: 1.5;
        }
        .up-table-container {
          margin-top: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
        }
        .up-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          text-align: left;
        }
        .up-table th {
          background: #f8fafc;
          padding: 12px 16px;
          font-weight: 600;
          color: #475569;
          border-bottom: 1px solid #e2e8f0;
        }
        .up-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }
        .up-cell-filename {
          font-weight: 500;
          color: #334155;
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .up-select {
          width: 100%;
          height: 38px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 0 10px;
          font-size: 13px;
          color: #334155;
          outline: none;
          background: #fff;
          transition: border-color 0.15s;
        }
        .up-select:focus {
          border-color: #10b981;
        }
        .up-input-text {
          width: 100%;
          height: 38px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 0 12px;
          font-size: 13px;
          color: #334155;
          outline: none;
          background: #fff;
          box-sizing: border-box;
          transition: border-color 0.15s;
        }
        .up-input-text:focus {
          border-color: #10b981;
        }
        .up-file-remove {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 8px;
          font-size: 16px;
          border-radius: 6px;
          transition: background 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .up-file-remove:hover {
          background: #fee2e2;
        }
        .up-modal-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
          padding: 0 24px 24px;
        }
        .up-btn-cancel {
          background: none;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: background 0.15s;
        }
        .up-btn-cancel:hover {
          background: #f1f5f9;
        }
        .up-btn-submit {
          background: #10b981;
          color: #fff;
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .up-btn-submit:hover {
          background: #059669;
        }
        .up-btn-submit:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }
      `}</style>

      {/* Header */}
      <div className="gd-header">
        <div className="gd-title">
          <button className="gd-back" onClick={() => navigate(-1)}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          {group?.course?.name || t("Yuklanmoqda...")}
          <span className="gd-badge">{t("Aktiv")}</span>
        </div>
        <button className="gd-stat-btn">
          <i className="fa-solid fa-chart-simple"></i> {t("Statistika")}
        </button>
      </div>

      {/* Tabs */}
      <div className="gd-tabs text-[#c7d9f6]">
        <button
          className={`gd-tab ${activeTab === "malumotlar" ? "active" : ""}`}
          onClick={() => setActiveTab("malumotlar")}
        >
          {t("Ma'lumotlar")}
        </button>
        <button
          className={`gd-tab ${activeTab === "darsliklar" ? "active" : ""}`}
          onClick={() => setActiveTab("darsliklar")}
        >
          {t("Guruh darsliklari")}
        </button>
        <button
          className={`gd-tab ${activeTab === "davomat" ? "active" : ""}`}
          onClick={() => setActiveTab("davomat")}
        >
          {t("Akademik davomati")}
        </button>
      </div>

      {activeTab === "malumotlar" && (
        <>
          {/* Grid Panels */}
          <div className="gd-grid">
            {/* Mentorlar */}
            <div className="gd-panel">
              <div className="gd-panel-header">
                {t("Guruh mentorlari")}
                {showMentors ? (
                  <i
                    className="fa-solid fa-xmark"
                    style={{ cursor: "pointer", opacity: 0.8 }}
                    onClick={() => setShowMentors(false)}
                  ></i>
                ) : (
                  <i
                    className="fa-solid fa-plus"
                    style={{ cursor: "pointer", opacity: 0.8 }}
                    onClick={() => setShowMentors(true)}
                  ></i>
                )}
              </div>
              {showMentors && (
                <div className="gd-panel-body">
                  <div className="gd-mentor">
                    {group?.teachers?.map((teacher, index) => {
                      return (
                        <div key={index} className="gd-mentor-card">
                          <div
                            className="gd-mentor-img"
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#765bcf", fontSize: 20, overflow: "hidden", position: "relative" }}
                          >
                            {(teacher?.full_name || "?").trim().charAt(0).toUpperCase()}
                            {teacher?.photo && (
                              <img
                                src={`https://najot-edu.softwareengineer.uz/files/${teacher.photo}`}
                                alt=""
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            )}
                          </div>
                          <span className="gd-mentor-role">{t("Teacher")}</span>
                          <span className="gd-mentor-name">
                            {teacher?.full_name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Parametrlar */}
            <div className="gd-panel">
              <div className="gd-panel-header">
                {t("Parametrlar")}
                {showParams ? (
                  <i
                    className="fa-solid fa-xmark"
                    style={{ cursor: "pointer", opacity: 0.8 }}
                    onClick={() => setShowParams(false)}
                  ></i>
                ) : (
                  <i
                    className="fa-solid fa-plus"
                    style={{ cursor: "pointer", opacity: 0.8 }}
                    onClick={() => setShowParams(true)}
                  ></i>
                )}
              </div>
              {showParams && (
                <div className="gd-panel-body" style={{ padding: "0 16px" }}>
                  <div className="gd-param-row">
                    <span className="gd-param-label">{t("Kurs:")}</span>
                    <span className="gd-param-value">{group?.course?.name}</span>
                  </div>
                  <div className="gd-param-row">
                    <span className="gd-param-label">{t("O'rta yosh:")}</span>
                    <span className="gd-param-value">{group?.averageAge}</span>
                  </div>
                  <div className="gd-param-row">
                    <span className="gd-param-label">{t("O'quvchilar sig'imi:")}</span>
                    <span className="gd-param-value">{group?.room_capacity}</span>
                  </div>
                  <div className="gd-param-row">
                    <span className="gd-param-label">{t("Mavjud o'quvchilar:")}</span>
                    <span className="gd-param-value">{group?.student_count}</span>
                  </div>
                  <div className="gd-param-row">
                    <span className="gd-param-label">
                      {t("O'quv oyidagi darslar soni:")}
                    </span>
                    <span className="gd-param-value">20</span>
                  </div>
                  <div className="gd-param-row">
                    <span className="gd-param-label">{t("Kurs davomiyligi (oy):")}</span>
                    <span className="gd-param-value">
                      {group?.course?.duration_month}
                    </span>
                  </div>
                  <div className="gd-param-row">
                    <span className="gd-param-label">{t("Jami darslar soni:")}</span>
                    <span className="gd-param-value">20</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dars jadvali */}
          <div className="gd-schedule">
            <div className="gd-schedule-title">{t("Dars jadvali")}</div>

            <div className="gd-schedule-row">
              <strong>{group?.teachers?.[0]?.full_name || "Mohirbek"}</strong>
              <span>
                {Array.isArray(group?.week_day)
                  ? group.week_day.map((d) => d.slice(0, 2)).join("/")
                  : "Du/Se/Ch/Pa/Ju"}
              </span>
              <span>{group?.start_time || "09:30"} {t("dan - 12:30 gacha")}</span>
              <span>15 Yan, 2026 - 27 Iyun, 2026</span>
              <span>{group?.room?.name || "F2 Autodesk"} // 18</span>
            </div>

            <div className="gd-schedule-row" style={{ opacity: 0.7 }}>
              <strong>+++Yusupova Barchinoy</strong>
              <span>Du/Se/Ch/Pa/Ju</span>
              <span>{t("08:00 dan - 09:30 gacha")}</span>
              <span>15 Yan, 2026 - 27 Iyun, 2026</span>
              <span>F2 Autodesk // 18</span>
            </div>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button
                style={{
                  background: "#fff",
                  border: "1px solid #e0e0e0",
                  padding: "6px 16px",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#666",
                  cursor: "pointer",
                }}
              >
                {t("Yana ko'rsatish")} (9)
              </button>
            </div>

            <div className="gd-calendar-header">
              {!showAllMonths && (
                <div className="gd-month-index">
                  {sortedScheduleKeys.indexOf(activeScheduleMonth) !== -1
                    ? `${sortedScheduleKeys.indexOf(activeScheduleMonth) + 1}${t("-o'quv oyi")}`
                    : t("O'quv oyi")}
                </div>
              )}
              {!showAllMonths && (
                <button className="gd-cal-nav" onClick={() => moveScheduleMonth(-1)}>
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
              )}
              {showAllMonths
                ? t("Barcha oyliklar")
                : `${getMonthLabel(activeScheduleMonth)} ${t("o'quv oyi")}`}
              {!showAllMonths && (
                <button className="gd-cal-nav" onClick={() => moveScheduleMonth(1)}>
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              )}
            </div>

            <div className="gd-dates" style={showAllMonths ? { flexDirection: "column", gap: 12 } : {}}>
              {showAllMonths ? (
                scheduleGroups.length > 0 ? (
                  scheduleGroups.map((group) => (
                    <div key={group.key} style={{ width: "100%" }}>
                      <div className="gd-month-heading">{getMonthLabel(group.key)}</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {group.days.map((d, i) => {
                          const isPast = isPastDay(d);
                          const isFuture = isFutureDay(d);
                          const selected = selectedDay?.month === d.month && selectedDay?.day === d.day;
                          return (
                            <div
                              key={`${group.key}-${i}`}
                              className={`gd-date-box ${d.isCompleted ? "active" : ""} ${isPast ? "past" : ""} ${isFuture ? "future" : ""} ${selected ? "selected" : ""}`}
                              onClick={() => handleSelectDay({ ...d, monthKey: group.key })}
                              style={{ cursor: isFuture ? "not-allowed" : "pointer" }}
                            >
                              {d.month}
                              <span>{d.day}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="gd-date-box active" style={{ minWidth: 120 }}>
                    <span>{t("Malumot yo'q")}</span>
                  </div>
                )
              ) : currentScheduleDays.length > 0 ? (
                currentScheduleDays.map((d, i) => {
                  const isPast = isPastDay(d);
                  const isFuture = isFutureDay(d);
                  const selected = selectedDay?.month === d.month && selectedDay?.day === d.day;
                  return (
                    <div
                      key={`${activeScheduleMonth}-${i}`}
                      className={`gd-date-box ${d.isCompleted ? "active" : ""} ${isPast ? "past" : ""} ${isFuture ? "future" : ""} ${selected ? "selected" : ""}`}
                      onClick={() => handleSelectDay({ ...d, monthKey: activeScheduleMonth })}
                      style={{ cursor: isFuture ? "not-allowed" : "pointer" }}
                    >
                      {d.month}
                      <span>{d.day}</span>
                    </div>
                  );
                })
              ) : (
                <div className="gd-date-box active" style={{ minWidth: 120 }}>
                  <span>Malumot yo'q</span>
                </div>
              )}
            </div>

            {selectedDay && (
              <div className="gd-selected-day-card">
                {/* Ma'lumot card */}
                <div className="gd-info-card">
                  <p className="gd-info-card-title">{t("Ma'lumot")}</p>
                  <div className="gd-info-card-body">
                    <div className="gd-selected-day-row">
                      <div className="gd-avatar" style={{ overflow: "hidden" }}>
                        {group?.teachers?.[0]?.photo ? (
                          <img
                            src={`https://najot-edu.softwareengineer.uz/files/${group.teachers[0].photo}`}
                            alt="teacher"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          group?.teachers?.[0]?.full_name?.[0] || "M"
                        )}
                      </div>
                      <div>
                        <p className="gd-teacher-name">{group?.teachers?.[0]?.full_name || "Mohirbek"}</p>
                        <p className="gd-teacher-role">{t("Teacher")}</p>
                      </div>
                      <div className="gd-info-cols">
                        <div className="gd-info-col">
                          <label>{t("Dars kuni")}</label>
                          <span>
                            {today.getFullYear()} M{String(today.getMonth() + 1).padStart(2, "0")} {String(selectedDay.day).padStart(2, "0")}
                          </span>
                        </div>
                        <div className="gd-info-col">
                          <label>{t("Holat")}</label>
                          <span className={selectedDay?.isCompleted ? "status-green" : "status-blue"}>
                            {selectedDay?.isCompleted ? t("Dars o'tilgan") : t("Dars o'tilmagan")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Yo'qlama va mavzu kiritish card */}
                <div className="gd-form-card">
                  <p className="gd-form-card-title">{t("Yo'qlama va mavzu kiritish")}</p>
                  <div className="gd-selected-day-form">
                    <div className="gd-radio-row">
                      <label className={`gd-radio-label ${lessonMode === "plan" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="lessonMode"
                          checked={lessonMode === "plan"}
                          onChange={() => setLessonMode("plan")}
                          disabled={selectedDayIsPast || selectedDay?.isCompleted}
                        />
                        {t("O'quv reja bo'yicha")}
                      </label>
                      <label className={`gd-radio-label ${lessonMode === "boshqa" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="lessonMode"
                          checked={lessonMode === "boshqa"}
                          onChange={() => setLessonMode("boshqa")}
                          disabled={selectedDayIsPast || selectedDay?.isCompleted}
                        />
                        {t("Boshqa")}
                      </label>
                    </div>
                    <div className="gd-field-row">
                      <div className="gd-field">
                        <label>* {t("Mavzu")}</label>
                        <input
                          className="gd-input"
                          value={lessonTopic}
                          onChange={(e) => setLessonTopic(e.target.value)}
                          placeholder={selectedDay?.isCompleted ? t("Mavzu kiritib bo'lingan") : t("Mavzuni kiriting...")}
                          disabled={selectedDayIsPast || selectedDay?.isCompleted}
                        />
                      </div>
                      <div className="gd-field">
                        <label className="optional">{t("Tavsif (ixtiyoriy)")}</label>
                        <textarea
                          className="gd-textarea"
                          value={lessonDescription}
                          onChange={(e) => setLessonDescription(e.target.value)}
                          placeholder={selectedDay?.isCompleted ? t("Tavsif kiritib bo'lingan") : t("Dars haqida qo'shimcha ma'lumot...")}
                          disabled={selectedDayIsPast || selectedDay?.isCompleted}
                        />
                      </div>
                    </div>
                    <div className="gd-student-list">
                      <div className="gd-student-list-header">
                        <span>#</span>
                        <span>{t("O'quvchi ismi")}</span>
                        <span>{t("Keldi")}</span>
                      </div>
                      {attendanceLoading ? (
                        <div style={{ textAlign: "center", padding: "20px", color: "#888", fontSize: "14px" }}>
                          <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }}></i>
                          {t("Davomat yuklanmoqda...")}
                        </div>
                      ) : studentList.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "20px", color: "#888", fontSize: "14px" }}>
                          {t("Guruhda o'quvchilar yo'q")}
                        </div>
                      ) : (
                        studentList.map((student, idx) => (
                          <div key={student.id} className="gd-student-item">
                            <span>{idx + 1}</span>
                            <span>{student.full_name}</span>
                            <button
                              type="button"
                              className={`gd-switch ${attendance[student.id] ? "on" : ""}`}
                              onClick={() => toggleAttendance(student.id)}
                              disabled={selectedDayIsPast}
                            >
                              <span />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="gd-action-row" style={{ display: "flex", gap: "10px" }}>
                      {/* Always allow saving attendance even for completed days */}
                      <button
                        className="gd-save-btn"
                        type="button"
                        disabled={selectedDayIsPast}
                        onClick={handleSaveAttendance}
                        style={{
                          background: selectedDayIsPast ? "#ccc" : "#3b82f6",
                          cursor: selectedDayIsPast ? "not-allowed" : "pointer"
                        }}
                      >
                        {t("Davomatni saqlash")}
                      </button>
                      <button
                        className="gd-save-btn"
                        type="button"
                        disabled={selectedDayIsPast || selectedDay?.isCompleted}
                        onClick={handleSaveLesson}
                        style={{
                          background: (selectedDayIsPast || selectedDay?.isCompleted) ? "#ccc" : "",
                          cursor: (selectedDayIsPast || selectedDay?.isCompleted) ? "not-allowed" : "pointer"
                        }}
                      >
                        {selectedDay?.isCompleted ? t("Dars o'tilgan") : t("Saqlash")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <button
                style={{
                  background: "#f5f5f5",
                  border: "none",
                  padding: "8px 20px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#444",
                  cursor: "pointer",
                }}
                onClick={() => setShowAllMonths((prev) => !prev)}
              >
                {showAllMonths ? t("Yopish") : t("Barchasini ko'rish")}
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === "darsliklar" && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#222",
                margin: 0,
              }}
            >
              {t("Guruh darsliklari")}
            </h3>
            <button
              onClick={() => {
                if (activeDarslikTab === "video") {
                  setShowUploadModal(true);
                } else if (activeDarslikTab === "imtihon") {
                  navigate(`/dashboard/groups/${id}/exam/create`);
                } else {
                  navigate(`/dashboard/groups/${id}/homework/create`);
                }
              }}
              style={{
                background: "#2ecc71",
                border: "none",
                color: "#fff",
                padding: "8px 20px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {activeDarslikTab === "imtihon" ? t("Yangi imtihon") : t("Qo'shish")}
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="gd-tabs-buttons">
            <button
              className={`gd-tab-btn ${activeDarslikTab === "uyga" ? "active" : ""}`}
              onClick={() => setActiveDarslikTab("uyga")}
            >
              {t("Uyg'a vazifa")}
            </button>
            <button
              className={`gd-tab-btn ${activeDarslikTab === "video" ? "active" : ""}`}
              onClick={() => setActiveDarslikTab("video")}
            >
              {t("Videolar")}
            </button>
            <button
              className={`gd-tab-btn ${activeDarslikTab === "imtihon" ? "active" : ""}`}
              onClick={() => setActiveDarslikTab("imtihon")}
            >
              {t("Imtihonlar")}
            </button>
            <button
              className={`gd-tab-btn ${activeDarslikTab === "jurnal" ? "active" : ""}`}
              onClick={() => setActiveDarslikTab("jurnal")}
            >
              {t("Jurnal")}
            </button>
          </div>

          {/* Uyg'a vazifa Table */}
          {activeDarslikTab === "uyga" && (
            <div className="gd-table-container">
              <table className="gd-table">
                <thead>
                  <tr>
                    <th style={{ width: "5%" }}>#</th>
                    <th style={{ width: "25%" }}>{t("Mavzu")}</th>
                    <th style={{ width: "8%", textAlign: "center" }}>
                      <i className="fa-solid fa-user"></i>
                    </th>
                    <th style={{ width: "8%", textAlign: "center" }}>
                      <i className="fa-solid fa-clock"></i>
                    </th>
                    <th style={{ width: "8%", textAlign: "center" }}>
                      <i className="fa-solid fa-check"></i>
                    </th>
                    <th style={{ width: "15%" }}>{t("Berilan vaqt")}</th>
                    <th style={{ width: "15%" }}>{t("Tugash vaqti")}</th>
                    <th style={{ width: "12%" }}>{t("Dars sanasi")}</th>
                    <th style={{ width: "4%", textAlign: "center" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {homework.map((hw) => {
                    return (
                      <tr key={hw.id}>
                        <td className="gd-table-index">{hw.id}</td>
                        <td
                          className="gd-table-subject"
                          onClick={() => navigate(`/dashboard/groups/${id}/homework/${hw.id}`)}
                          style={{ cursor: "pointer" }}
                        >
                          {hw.homeworkPending > 0 ? (
                            <span
                              style={{
                                display: "inline-block",
                                width: "100%",
                                background: "#f0795a",
                                color: "#fff",
                                fontWeight: 600,
                                padding: "8px 14px",
                                borderRadius: 8,
                              }}
                            >
                              {hw.topic}
                            </span>
                          ) : (
                            <span style={{ color: "#765bcf" }}>{hw.topic}</span>
                          )}
                        </td>
                        <td style={{ textAlign: "center", color: "#666" }}>
                          {hw.existStudentsIngroup}
                        </td>
                        <td style={{ textAlign: "center", color: "#666" }}>
                          {hw.homeworkPending}
                        </td>
                        <td style={{ textAlign: "center", color: "#666" }}>
                          {hw.homeworkAccept}
                        </td>
                        <td className="gd-table-time">
                          {formatDate(hw.homework?.[0]?.created_at)}
                        </td>
                        <td className="gd-table-time">
                          {formatDate(
                            hw.homework?.[0]?.created_at
                              ? new Date(
                                  new Date(
                                    hw.homework[0].created_at,
                                  ).getTime() +
                                    20 * 60 * 60 * 1000,
                                )
                              : null,
                          )}
                        </td>
                        <td className="gd-table-date">
                          {formatDate(hw.created_at)}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            color: "#999",
                            cursor: "pointer",
                          }}
                        >
                          <i className="fa-solid fa-ellipsis-vertical"></i>
                        </td>
                      </tr>
                    );
                  })}
                  {homework.data?.data?.length === 0 && (
                    <tr>
                      <td
                        colSpan="9"
                        style={{ textAlign: "center", color: "#999" }}
                      >
                        {t("Ma'lumot yo'q")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Videolar Table */}
          {activeDarslikTab === "video" && (
            <div className="gd-table-container">
              <style>{`
                .vid-status-badge {
                  display: inline-block;
                  padding: 3px 12px;
                  border-radius: 20px;
                  font-size: 12px;
                  font-weight: 600;
                  background: rgba(46, 204, 113, 0.13);
                  color: #2ecc71;
                }
                .vid-play-icon {
                  color: #4285f4;
                  font-size: 18px;
                  margin-right: 8px;
                  vertical-align: middle;
                }
                .vid-name-cell {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  font-weight: 600;
                  color: #222;
                }
              `}</style>
              <table className="gd-table">
                <thead>
                  <tr>
                    <th style={{ width: "4%" }}>#</th>
                    <th style={{ width: "22%" }}>{t("Video nomi")}</th>
                    <th style={{ width: "20%" }}>{t("Dars nomi")}</th>
                    <th style={{ width: "10%" }}>{t("Status")}</th>
                    <th style={{ width: "15%" }}>{t("Dars sanasi")}</th>
                    <th style={{ width: "10%" }}>{t("Hajmi")}</th>
                    <th style={{ width: "15%" }}>{t("Qo'shilgan vaqti")}</th>
                    <th style={{ width: "4%", textAlign: "center" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {videosLoading ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", padding: "24px", color: "#888" }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }}></i>
                        {t("Yuklanmoqda...")}
                      </td>
                    </tr>
                  ) : videos.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", padding: "24px", color: "#aaa" }}>
                        {t("Videolar mavjud emas")}
                      </td>
                    </tr>
                  ) : (
                    videos.map((vid, idx) => {
                      const darsSanasi = vid.lesson?.created_at
                        ? new Date(vid.lesson.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                        : "-";
                      const qoshilgan = vid.created_at
                        ? new Date(vid.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                        : "-";
                      const hajmi = vid.size_mb ? `${Number(vid.size_mb).toFixed(2)} MB` : "-";
                      return (
                        <tr key={vid.id}>
                          <td className="gd-table-index">{idx + 1}</td>
                          <td>
                            <button
                              className="vid-name-btn"
                              onClick={() => setSelectedVideo(vid)}
                            >
                              <div className="vid-name-cell">
                                <i className="fa-regular fa-circle-play vid-play-icon"></i>
                                {vid.originalname || vid.video_url || "Video"}
                              </div>
                            </button>
                          </td>
                          <td style={{ color: "#444" }}>{vid.lesson?.topic || "-"}</td>
                          <td>
                            <span className="vid-status-badge">{t("Tayyor")}</span>
                          </td>
                          <td className="gd-table-date">{darsSanasi}</td>
                          <td style={{ color: "#666" }}>{hajmi}</td>
                          <td className="gd-table-time">{qoshilgan}</td>
                          <td style={{ textAlign: "center", color: "#999", cursor: "pointer" }}>
                            <i className="fa-solid fa-ellipsis-vertical"></i>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Imtihonlar Table */}
          {activeDarslikTab === "imtihon" && (
            <div className="gd-table-container">
              <style>{`
                .exam-status-faol {
                  display: inline-block;
                  padding: 3px 14px;
                  border-radius: 20px;
                  font-size: 12px;
                  font-weight: 600;
                  border: 1.5px solid #2ecc71;
                  color: #2ecc71;
                  background: transparent;
                }
                .exam-status-tugagan {
                  display: inline-block;
                  padding: 3px 14px;
                  border-radius: 20px;
                  font-size: 12px;
                  font-weight: 600;
                  border: 1.5px solid #aaa;
                  color: #666;
                  background: transparent;
                }
                .exam-mavzu-link {
                  color: #3b82f6;
                  text-decoration: none;
                  font-weight: 500;
                  cursor: pointer;
                  background: none;
                  border: none;
                  padding: 0;
                  font-size: 13px;
                  font-family: inherit;
                }
                .exam-mavzu-link:hover {
                  text-decoration: underline;
                }
              `}</style>
              <table className="gd-table">
                <thead>
                  <tr>
                    <th style={{ width: "5%" }}>#</th>
                    <th style={{ width: "20%" }}>{t("Mavzu")}</th>
                    <th style={{ width: "7%", textAlign: "center" }}>
                      <i className="fa-solid fa-user"></i>
                    </th>
                    <th style={{ width: "7%", textAlign: "center" }}>
                      <i className="fa-solid fa-xmark" style={{ color: "#ef4444" }}></i>
                    </th>
                    <th style={{ width: "10%" }}>{t("Status")}</th>
                    <th style={{ width: "15%" }}>{t("Dars vaqti")}</th>
                    <th style={{ width: "15%" }}>{t("Berilgan vaqt")}</th>
                    <th style={{ width: "17%" }}>{t("E'lon qilingan vaqti")}</th>
                    <th style={{ width: "4%", textAlign: "center" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {examsLoading ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: "center", padding: "24px", color: "#888" }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }}></i>
                        {t("Yuklanmoqda...")}
                      </td>
                    </tr>
                  ) : exams.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: "center", padding: "24px", color: "#aaa" }}>
                        {t("Imtihonlar mavjud emas")}
                      </td>
                    </tr>
                  ) : (
                    exams.map((ex, idx) => {
                      const now = new Date();
                      const deadline = ex.deadline ? new Date(ex.deadline) : null;
                      const isFaol = deadline ? deadline > now : true;
                      const darsVaqti = ex.lesson?.created_at
                        ? new Date(ex.lesson.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "-";
                      const berilganVaqt = ex.created_at
                        ? new Date(ex.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "-";
                      const elonVaqt = ex.deadline
                        ? new Date(ex.deadline).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "-";
                      return (
                        <tr key={ex.id}>
                          <td className="gd-table-index">{ex.id || (idx + 1)}</td>
                          <td>
                            <button
                              className="exam-mavzu-link"
                              onClick={() => navigate(`/dashboard/groups/${id}/exams/${ex.id}`)}
                            >
                              {ex.title || ex.topic || "Examination"}
                            </button>
                          </td>
                          <td style={{ textAlign: "center", color: "#666" }}>
                            {ex.totalStudents ?? ex.existStudentsIngroup ?? "-"}
                          </td>
                          <td style={{ textAlign: "center", color: "#666" }}>
                            {ex.notSubmitted ?? 0}
                          </td>
                          <td>
                            <span className={isFaol ? "exam-status-faol" : "exam-status-tugagan"}>
                              {isFaol ? t("Faol") : t("Tugagan")}
                            </span>
                          </td>
                          <td className="gd-table-time">{darsVaqti}</td>
                          <td className="gd-table-time">{berilganVaqt}</td>
                          <td className="gd-table-time">{elonVaqt}</td>
                          <td style={{ textAlign: "center", color: "#999", cursor: "pointer" }}>
                            <i className="fa-solid fa-ellipsis-vertical"></i>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Jurnal Table */}
          {activeDarslikTab === "jurnal" && (
            <div className="gd-table-container">
              <table className="gd-table">
                <thead>
                  <tr>
                    <th style={{ width: "5%" }}>#</th>
                    <th style={{ width: "30%" }}>{t("Mavzu")}</th>
                    <th style={{ width: "8%", textAlign: "center" }}>
                      <i className="fa-solid fa-user"></i>
                    </th>
                    <th style={{ width: "8%", textAlign: "center" }}>
                      <i className="fa-solid fa-clock"></i>
                    </th>
                    <th style={{ width: "8%", textAlign: "center" }}>
                      <i className="fa-solid fa-check"></i>
                    </th>
                    <th style={{ width: "15%" }}>{t("Berilan vaqt")}</th>
                    <th style={{ width: "15%" }}>{t("Tugash vaqti")}</th>
                    <th style={{ width: "11%" }}>{t("Dars sanasi")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="gd-table-index">1</td>
                    <td className="gd-table-subject">{t("Dars 1 - Davomat")}</td>
                    <td style={{ textAlign: "center", color: "#666" }}>5</td>
                    <td style={{ textAlign: "center", color: "#666" }}>0</td>
                    <td style={{ textAlign: "center", color: "#666" }}>5</td>
                    <td className="gd-table-time">09:00</td>
                    <td className="gd-table-time">10:30</td>
                    <td className="gd-table-date">5 May, 2026</td>
                    <td
                      style={{
                        textAlign: "center",
                        color: "#999",
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </td>
                  </tr>
                  <tr>
                    <td className="gd-table-index">2</td>
                    <td className="gd-table-subject">{t("Dars 2 - Davomat")}</td>
                    <td style={{ textAlign: "center", color: "#666" }}>5</td>
                    <td style={{ textAlign: "center", color: "#666" }}>0</td>
                    <td style={{ textAlign: "center", color: "#666" }}>4</td>
                    <td className="gd-table-time">10:45</td>
                    <td className="gd-table-time">12:15</td>
                    <td className="gd-table-date">7 May, 2026</td>
                    <td
                      style={{
                        textAlign: "center",
                        color: "#999",
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </td>
                  </tr>
                  <tr>
                    <td className="gd-table-index">3</td>
                    <td className="gd-table-subject">{t("Dars 3 - Davomat")}</td>
                    <td style={{ textAlign: "center", color: "#666" }}>4</td>
                    <td style={{ textAlign: "center", color: "#666" }}>1</td>
                    <td style={{ textAlign: "center", color: "#666" }}>3</td>
                    <td className="gd-table-time">09:00</td>
                    <td className="gd-table-time">10:30</td>
                    <td className="gd-table-date">12 May, 2026</td>
                    <td
                      style={{
                        textAlign: "center",
                        color: "#999",
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </td>
                  </tr>
                  <tr>
                    <td className="gd-table-index">4</td>
                    <td className="gd-table-subject">{t("Dars 4 - Davomat")}</td>
                    <td style={{ textAlign: "center", color: "#666" }}>5</td>
                    <td style={{ textAlign: "center", color: "#666" }}>0</td>
                    <td style={{ textAlign: "center", color: "#666" }}>5</td>
                    <td className="gd-table-time">10:45</td>
                    <td className="gd-table-time">12:15</td>
                    <td className="gd-table-date">14 May, 2026</td>
                    <td
                      style={{
                        textAlign: "center",
                        color: "#999",
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === "davomat" && (
        <>
          <div className="gd-table-container">
            <table className="gd-table">
              <thead>
                <tr>
                  <th style={{ width: "5%" }}>#</th>
                  <th style={{ width: "25%" }}>{t("Dars mavzusi")}</th>
                  <th style={{ width: "8%", textAlign: "center" }}>
                    <i className="fa-solid fa-user"></i>
                  </th>
                  <th style={{ width: "8%", textAlign: "center" }}>
                    <i className="fa-solid fa-clock"></i>
                  </th>
                  <th style={{ width: "8%", textAlign: "center" }}>
                    <i className="fa-solid fa-check"></i>
                  </th>
                  <th style={{ width: "15%" }}>{t("Dars vaqti")}</th>
                  <th style={{ width: "15%" }}>{t("Tugash vaqti")}</th>
                  <th style={{ width: "12%" }}>{t("Dars sanasi")}</th>
                  <th style={{ width: "4%", textAlign: "center" }}></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="gd-table-index">1</td>
                  <td className="gd-table-subject">{t("1-dars: Kirish")}</td>
                  <td style={{ textAlign: "center", color: "#666" }}>5</td>
                  <td style={{ textAlign: "center", color: "#666" }}>0</td>
                  <td style={{ textAlign: "center", color: "#666" }}>5</td>
                  <td className="gd-table-time">09:00</td>
                  <td className="gd-table-time">10:30</td>
                  <td className="gd-table-date">5 May, 2026</td>
                  <td
                    style={{
                      textAlign: "center",
                      color: "#999",
                      cursor: "pointer",
                    }}
                  >
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                  </td>
                </tr>
                <tr>
                  <td className="gd-table-index">2</td>
                  <td className="gd-table-subject">{t("2-dars: Asoslar")}</td>
                  <td style={{ textAlign: "center", color: "#666" }}>5</td>
                  <td style={{ textAlign: "center", color: "#666" }}>0</td>
                  <td style={{ textAlign: "center", color: "#666" }}>4</td>
                  <td className="gd-table-time">10:45</td>
                  <td className="gd-table-time">12:15</td>
                  <td className="gd-table-date">7 May, 2026</td>
                  <td
                    style={{
                      textAlign: "center",
                      color: "#999",
                      cursor: "pointer",
                    }}
                  >
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                  </td>
                </tr>
                <tr>
                  <td className="gd-table-index">3</td>
                  <td className="gd-table-subject">{t("3-dars: Amaliyot")}</td>
                  <td style={{ textAlign: "center", color: "#666" }}>4</td>
                  <td style={{ textAlign: "center", color: "#666" }}>1</td>
                  <td style={{ textAlign: "center", color: "#666" }}>3</td>
                  <td className="gd-table-time">09:00</td>
                  <td className="gd-table-time">10:30</td>
                  <td className="gd-table-date">12 May, 2026</td>
                  <td
                    style={{
                      textAlign: "center",
                      color: "#999",
                      cursor: "pointer",
                    }}
                  >
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                  </td>
                </tr>
                <tr>
                  <td className="gd-table-index">4</td>
                  <td className="gd-table-subject">{t("4-dars: Takrorlash")}</td>
                  <td style={{ textAlign: "center", color: "#666" }}>5</td>
                  <td style={{ textAlign: "center", color: "#666" }}>0</td>
                  <td style={{ textAlign: "center", color: "#666" }}>5</td>
                  <td className="gd-table-time">10:45</td>
                  <td className="gd-table-time">12:15</td>
                  <td className="gd-table-date">14 May, 2026</td>
                  <td
                    style={{
                      textAlign: "center",
                      color: "#999",
                      cursor: "pointer",
                    }}
                  >
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                  </td>
                </tr>
                <tr>
                  <td className="gd-table-index">5</td>
                  <td className="gd-table-subject">{t("5-dars: Imtihon")}</td>
                  <td style={{ textAlign: "center", color: "#666" }}>5</td>
                  <td style={{ textAlign: "center", color: "#666" }}>0</td>
                  <td style={{ textAlign: "center", color: "#666" }}>5</td>
                  <td className="gd-table-time">09:00</td>
                  <td className="gd-table-time">10:30</td>
                  <td className="gd-table-date">19 May, 2026</td>
                  <td
                    style={{
                      textAlign: "center",
                      color: "#999",
                      cursor: "pointer",
                    }}
                  >
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="vid-modal-overlay"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="vid-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="vid-modal-header">
              <div className="vid-modal-title">
                <i className="fa-regular fa-circle-play"></i>
                {selectedVideo.originalname || selectedVideo.video_url}
              </div>
              <button
                className="vid-modal-close"
                onClick={() => setSelectedVideo(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <video
              className="vid-modal-player"
              controls
              autoPlay
              src={`https://najot-edu.softwareengineer.uz/files/files/${selectedVideo.video_url}`}
            />
            <div className="vid-modal-footer">
              <div className="vid-modal-meta">
                {t("Fayl:")} <span>{selectedVideo.originalname || "-"}</span>
              </div>
              <div className="vid-modal-meta">
                {t("Hajmi:")} <span>{selectedVideo.size_mb ? `${Number(selectedVideo.size_mb).toFixed(2)} MB` : "-"}</span>
              </div>
              <div className="vid-modal-meta">
                {t("Dars:")} <span>{selectedVideo.lesson?.topic || "-"}</span>
              </div>
              <div className="vid-modal-meta">
                {t("Sana:")} <span>
                  {selectedVideo.created_at
                    ? new Date(selectedVideo.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Upload Modal */}
      {showUploadModal && (
        <div
          className="up-modal-overlay"
          onClick={() => {
            if (!uploadLoading) {
              setShowUploadModal(false);
              setUploadFile(null);
            }
          }}
        >
          <div
            className="up-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="up-modal-header">
              <h3 className="up-modal-title">{t("Qo'shish")}</h3>
              <button
                className="up-modal-close"
                onClick={() => {
                  if (!uploadLoading) {
                    setShowUploadModal(false);
                    setUploadFile(null);
                  }
                }}
                disabled={uploadLoading}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="up-modal-body">
              <div
                className={`up-dropzone ${isDragActive ? "active" : ""}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDropVideo}
                onClick={() => document.getElementById("video-file-input").click()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="56"
                  height="56"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginBottom: "16px" }}
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M12 8v8" />
                  <path d="M8 12h8" />
                </svg>
                <p className="up-dropzone-title">
                  {t("Videofaylni yuklash uchun ushbu hudud ustiga bosing yoki faylni shu yerga olib keling")}
                </p>
                <p className="up-dropzone-sub">
                  {t("Videofayl: .mp4, .webm, .mpeg, .avi, .mkv, .m4v, .ogm, .mov formatlaridan birida bo'lishi kerak")}
                </p>
                <input
                  id="video-file-input"
                  type="file"
                  accept="video/*"
                  style={{ display: "none" }}
                  onChange={handleVideoFileInput}
                />
              </div>

              {uploadFile && (
                <div className="up-table-container">
                  <table className="up-table">
                    <thead>
                      <tr>
                        <th style={{ width: "30%" }}>{t("File name")}</th>
                        <th style={{ width: "35%" }}><span style={{ color: "#ef4444" }}>*</span> {t("Dars")}</th>
                        <th style={{ width: "25%" }}><span style={{ color: "#ef4444" }}>*</span> {t("Video nomi")}</th>
                        <th style={{ width: "10%", textAlign: "center" }}>{t("Actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="up-cell-filename" title={uploadFile.name}>
                          {uploadFile.name}
                        </td>
                        <td>
                          <select
                            className="up-select"
                            value={selectedLessonId}
                            onChange={(e) => setSelectedLessonId(e.target.value)}
                            disabled={uploadLoading}
                          >
                            <option value="">{t("Darsni tanlang")}</option>
                            {lessonsList.map((les) => (
                              <option key={les.id} value={les.id}>
                                {les.topic}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="up-input-text"
                            value={customVideoName}
                            onChange={(e) => setCustomVideoName(e.target.value)}
                            disabled={uploadLoading}
                          />
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            className="up-file-remove"
                            onClick={() => {
                              setUploadFile(null);
                              setSelectedLessonId("");
                              setCustomVideoName("");
                            }}
                            disabled={uploadLoading}
                            style={{ margin: "0 auto" }}
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="up-modal-footer">
              <button
                className="up-btn-cancel"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setSelectedLessonId("");
                  setCustomVideoName("");
                }}
                disabled={uploadLoading}
              >
                {t("Bekor qilish")}
              </button>
              {uploadFile && (
                <button
                  className="up-btn-submit"
                  onClick={handleUploadVideo}
                  disabled={uploadLoading || !selectedLessonId || !customVideoName.trim()}
                  style={{
                    background: uploadLoading || !selectedLessonId || !customVideoName.trim() ? "#cbd5e1" : "#10b981",
                  }}
                >
                  {uploadLoading ? t("Yuklanmoqda...") : t("Fayllarni yuklash")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
