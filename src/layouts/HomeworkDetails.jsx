import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchApi } from "../api/user.api";
import { useLang } from "../i18n/LanguageContext";

// Tab -> backend status mapping (status values: ACCEPTED, REJECTED, PENDING, CHECKED)
const TABS = [
  { key: "PENDING", label: "Kutayotganlar", badge: true },
  { key: "REJECTED", label: "Qaytarilganlar", badge: true },
  { key: "ACCEPTED", label: "Qabul qilinganlar", badge: true },
  { key: "CHECKED", label: "Bajarilmagan", badge: true },
];

// Flexibly pull the student list out of whatever shape the endpoint returns
function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.students)) return data.students;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function HomeworkDetails() {
  const { t } = useLang();
  const { groupId, homeworkId } = useParams();
  const navigate = useNavigate();
  const [homework, setHomework] = useState(null);
  const [resultsByStatus, setResultsByStatus] = useState({
    PENDING: [],
    REJECTED: [],
    ACCEPTED: [],
    CHECKED: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("PENDING");

  useEffect(() => {
    async function loadHomeworkDetails() {
      try {
        setLoading(true);
        setError(null);

        // GET /api/v1/group/{groupId}/homework/{homeworkId}/results?status=...
        // Bajarilmagan (CHECKED) uchun status yubormaymiz — backend status'siz so'rovda
        // aynan bajarmaganlar ro'yxatini to'g'ri qaytaradi. Qolgan tablar aniq status bilan.
        const base = `group/${groupId}/homework/${homeworkId}/results`;
        const responses = await Promise.all(
          TABS.map((tab) =>
            fetchApi(
              tab.key === "CHECKED" ? base : `${base}?status=${tab.key}`
            ).catch(() => null)
          )
        );

        const byStatus = { PENDING: [], REJECTED: [], ACCEPTED: [], CHECKED: [] };
        let hwInfo = null;

        responses.forEach((res, i) => {
          if (!res || res.status !== 200) return;
          const data = res.data?.data ?? res.data;
          byStatus[TABS[i].key] = extractList(data);

          // Grab homework meta (topic / deadline) from the first usable payload
          if (!hwInfo && data && !Array.isArray(data)) {
            const src = data.homework || data;
            hwInfo = {
              topic: src.topic || src.title || src.homework_title || "Uyga vazifa",
              deadline:
                src.deadline ||
                src.end_time ||
                src.endTime ||
                src.finish_time ||
                src.finishTime ||
                src.tugash_vaqti ||
                null,
            };
          }
        });

        setResultsByStatus(byStatus);

        // /results javobida mavzu/tugash vaqti bo'lmasligi mumkin — guruhning
        // uyga vazifalar ro'yxatidan (homework/{groupId}) shu vazifani topib olamiz.
        if (!hwInfo || !hwInfo.deadline || !hwInfo.topic || hwInfo.topic === "Uyga vazifa") {
          try {
            const hwRes = await fetchApi(`homework/${groupId}`);
            if (hwRes.status === 200) {
              const list = hwRes.data?.data ?? hwRes.data ?? [];
              const hw = (Array.isArray(list) ? list : []).find(
                (h) => String(h.id) === String(homeworkId)
              );
              if (hw) {
                const givenAt = hw.homework?.[0]?.created_at;
                hwInfo = {
                  topic: hw.topic || hwInfo?.topic || "Uyga vazifa",
                  deadline:
                    hw.deadline ||
                    hw.end_time ||
                    hwInfo?.deadline ||
                    (givenAt
                      ? new Date(new Date(givenAt).getTime() + 20 * 60 * 60 * 1000)
                      : null),
                };
              }
            }
          } catch (metaErr) {
            console.error("Homework meta yuklashda xatolik:", metaErr);
          }
        }

        setHomework(hwInfo || { topic: "Uyga vazifa", deadline: null });
      } catch (err) {
        console.error("Error loading homework details:", err);
        setError(
          err.response?.data?.message || t("Ma'lumotlarni yuklashda xatolik yuz berdi")
        );
      } finally {
        setLoading(false);
      }
    }

    if (groupId && homeworkId) {
      loadHomeworkDetails();
    }
  }, [groupId, homeworkId, t]);

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-GB", { month: "short" });
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day} ${month}, ${year} ${hours}:${minutes}`;
  };

  const filteredResults = resultsByStatus[activeTab] || [];

  if (loading) {
    return (
      <div className="p-5 text-center">
        <p>{t("Ma'lumotlar yuklanmoqda...")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xl text-[#222] dark:text-slate-100 cursor-pointer mb-4"
        >
          <i className="fa-solid fa-chevron-left"></i> {t("Orqaga")}
        </button>
        <div className="text-[#e53935] mt-5">{error}</div>
      </div>
    );
  }

  return (
    <div className="py-5">
      <div className="w-full px-5">
        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <button
            className="flex items-center text-lg text-[#1a1a2e] dark:text-slate-100 cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <h1 className="text-[22px] font-bold text-[#1a1a2e] dark:text-slate-100 m-0">
            {homework?.topic || t("Uyga vazifa")}
          </h1>
        </div>

        {/* Card: info + tabs + table */}
        <div className="border border-[#ececf0] dark:border-[#28344a] rounded-[14px] bg-white dark:bg-[#19212f] p-6 shadow-sm dark:shadow-none">
          {/* Info Section */}
          <div className="bg-[#f7f8fa] dark:bg-[#141b27] rounded-[10px] px-6 py-[18px] mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <span className="text-[13px] text-[#8a909c] dark:text-slate-400 mb-2">{t("Mavzu")}</span>
              <span className="text-base font-bold text-[#1a1a2e] dark:text-slate-100">{homework?.topic || "-"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] text-[#8a909c] dark:text-slate-400 mb-2">{t("Tugash vaqti")}</span>
              <span className="text-base font-bold text-[#1a1a2e] dark:text-slate-100">
                {formatDate(homework?.deadline)}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-7 border-b border-[#eceef2] dark:border-[#28344a] overflow-x-auto">
            {TABS.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`-mb-px flex items-center gap-2 py-3 px-0.5 text-sm font-semibold cursor-pointer border-b-2 whitespace-nowrap transition-colors ${
                    active
                      ? "text-[#1a1a2e] dark:text-slate-100 border-[#18a957]"
                      : "text-[#8a909c] dark:text-slate-400 border-transparent hover:text-[#1a1a2e] dark:hover:text-slate-100"
                  }`}
                >
                  {t(tab.label)}
                  {tab.badge && resultsByStatus[tab.key]?.length > 0 && (
                    <span className="bg-[#ffb420] text-[#1a1a2e] rounded-full px-2 py-px text-xs font-bold min-w-5 text-center">
                      {resultsByStatus[tab.key].length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Student List */}
          {filteredResults.length > 0 ? (
            <table className="w-[calc(100%+48px)] -mx-6 border-collapse [&_tbody_tr:last-child_td]:border-b-0">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#8a909c] dark:text-slate-400 border-b border-[#eceef2] dark:border-[#28344a]">
                    {t("O'quvchi ismi")}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#8a909c] dark:text-slate-400 border-b border-[#eceef2] dark:border-[#28344a]">
                    {t("Uyga vazifa jo'natilgan vaqt")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result, index) => {
                  const studentName =
                    result.student_name ||
                    result.full_name ||
                    result.name ||
                    result.first_name ||
                    result.student?.full_name ||
                    result.student ||
                    t("Noma'lum");
                  const submissionDate =
                    result.submitted_at ||
                    result.created_at ||
                    result.submission_date ||
                    result.sent_at;
                  const studentId =
                    result.student_id ||
                    result.student?.id ||
                    result.studentId ||
                    result.id;
                  const activeLabel =
                    TABS.find((t) => t.key === activeTab)?.label || "Kutayotganlar";

                  // Faqat "Kutayotganlar" (PENDING) tabida talabani bosish sahifani ochadi
                  const clickable = activeTab === "PENDING" && !!studentId;

                  const openReview = () => {
                    if (!clickable) return;
                    navigate(
                      `/dashboard/groups/${groupId}/homework/${homeworkId}/student/${studentId}/review`,
                      { state: { statusLabel: activeLabel, topic: homework?.topic } }
                    );
                  };

                  return (
                    <tr
                      key={`${groupId}-${homeworkId}-${activeTab}-${index}`}
                      onClick={clickable ? openReview : undefined}
                      className={`hover:bg-[#f7f8fa] dark:hover:bg-[#222c3d] ${
                        clickable ? "cursor-pointer" : "cursor-default"
                      }`}
                    >
                      <td className="px-6 py-4 border-b border-[#f2f3f6] dark:border-white/5 text-sm text-[#1a1a2e] dark:text-slate-100">
                        {studentName}
                      </td>
                      <td className="px-6 py-4 border-b border-[#f2f3f6] dark:border-white/5 text-sm text-[#1a1a2e] dark:text-slate-100">
                        {formatDate(submissionDate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 px-5 text-[#999] dark:text-slate-400 text-sm">
              {activeTab === "PENDING"
                ? t("Hali hech kim uyga vazifani jo'natmagan")
                : t("Bu kategoriyada ma'lumot yo'q")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
