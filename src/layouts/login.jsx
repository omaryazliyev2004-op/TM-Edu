import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import ErrorIcon from "@mui/icons-material/Error"
import { useState, useEffect } from "react";
import { fetchApi, getRole, roleHome } from "../api/user.api";
export default function Login() {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  // Parolni unutdingizmi modali — bosqichlar: "phone" -> "otp" -> "password" -> "done"
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState("phone");
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotPassword2, setForgotPassword2] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [smsToastOpen, setSmsToastOpen] = useState(false);
  const [successToastOpen, setSuccessToastOpen] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccessOpen, setLoginSuccessOpen] = useState(false);

  const closeForgot = () => {
    setForgotOpen(false);
    setForgotStep("phone");
    setForgotPhone("");
    setForgotOtp("");
    setForgotPassword("");
    setForgotPassword2("");
    setForgotError("");
    setForgotLoading(false);
    setSmsToastOpen(false);
  };

  // 1-bosqich: telefon raqamga kod yuborish
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);
    try {
      // POST /api/v1/auth/send-otp  body: { phone }
      await fetchApi.post("auth/send-otp", { phone: forgotPhone });

      setSmsToastOpen(true);
      setOtpTimer(60);
      setTimeout(() => setSmsToastOpen(false), 2000);
      setForgotStep("otp");
    } catch (error) {
      setForgotError(
        error.response?.data?.message || "Kod yuborishda xatolik yuz berdi"
      );
      console.log(error);
    } finally {
      setForgotLoading(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  // 2-bosqich: kelgan kodni tasdiqlash
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);
    try {
      // POST /api/v1/auth/verify-otp  body: { phone, otp }
      await fetchApi.post("auth/verify-otp", {
        phone: forgotPhone,
        otp: forgotOtp,
      });
      setForgotStep("password");
    } catch (error) {
      setForgotError(
        error.response?.data?.message || "Kod noto'g'ri yoki muddati o'tgan"
      );
      console.log(error);
    } finally {
      setForgotLoading(false);
    }
  };

  // 3-bosqich: yangi parol o'rnatish
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    if (forgotPassword !== forgotPassword2) {
      setForgotError("Parollar mos kelmadi");
      return;
    }
    setForgotLoading(true);
    try {
      // PUT /api/v1/auth/change-password  body: { phone, password }
      await fetchApi.put("auth/change-password", {
        phone: forgotPhone,
        password: forgotPassword,
      });
      closeForgot();
      setSuccessToastOpen(true);
      setTimeout(() => setSuccessToastOpen(false), 3000);
    } catch (error) {
      setForgotError(
        error.response?.data?.message || "Parolni o'zgartirishda xatolik yuz berdi"
      );
      console.log(error);
    } finally {
      setForgotLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined") {
      navigate(roleHome(getRole(token)));
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchApi.post("auth/login", {
        phone: login,
        password: password
      });
      const token = res.data?.data?.accessToken || res.data?.accessToken;
      if (token) {
        localStorage.setItem("token", token);
        setLoginSuccessOpen(true);
        setTimeout(() => {
          navigate(roleHome(getRole(token)));
        }, 1200);
      } else {
        throw new Error("No token received");
      }
    } catch (error) {
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2500);
      console.log(error);
    }
  };
  return (

    <div className="min-h-screen flex w-full font-sans bg-white relative overflow-x-hidden">
      {showAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 bg-[#dc2626] border border-[#b91c1c] text-white rounded-2xl px-6 py-4 shadow-xl text-[16px] font-semibold min-w-[300px] justify-center">
          <i className="fa-solid fa-circle-exclamation text-[20px]"></i>
          {"Login yoki Parol hato"}
        </div>
      )}

      {loginSuccessOpen && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 bg-[#2E8738] text-white rounded-2xl px-6 py-4 shadow-[0_12px_30px_rgba(46,135,56,0.35)] text-[16px] font-semibold min-w-[300px] justify-center">
          <i className="fa-solid fa-circle-check text-[20px]"></i>
          {"Siz muvaffaqiyatli kirdingiz!"}
        </div>
      )}

      {successToastOpen && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 bg-[#2E8738] text-white rounded-2xl px-6 py-4 shadow-[0_12px_30px_rgba(46,135,56,0.35)] text-[16px] font-semibold min-w-[360px]">
          <i className="fa-solid fa-circle-check text-[20px]"></i>
          <span className="flex-1">{"Parolingiz muvaffaqiyatli o'zgartirildi!"}</span>
          <button
            type="button"
            onClick={() => setSuccessToastOpen(false)}
            className="w-7 h-7 bg-transparent border-0 text-white text-[18px] cursor-pointer flex items-center justify-center opacity-80 hover:opacity-100 ml-2"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      {/* Left side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#243464] items-center justify-center overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] rounded-full bg-white/[0.03] blur-[2px]"></div>
        <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] rounded-full bg-white/[0.03] blur-[2px]"></div>
        <img
          src="/study.svg"
          className="max-h-[70%] max-w-[80%] object-contain relative z-10"
          alt=""
        />
      </div>

      {/* Right side */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center py-6 px-4 sm:px-12 lg:px-24 relative">
        <div className="w-full max-w-[400px] flex flex-col items-center mt-auto pt-12">
          <h2 className="text-center text-[#243464] text-[11px] sm:text-[12px] font-bold tracking-[0.5px] leading-relaxed mb-6 uppercase">
            MUHAMMAD AL-XORAZMIY NOMIDAGI<br />TOSHKENT AXBOROT TEXNOLOGIYALARI<br />UNIVERSITETI
          </h2>
          <img src="/logo.png" className="w-16 h-16 sm:w-20 sm:h-20 mb-6 object-contain" alt="" />
          <h2 className="font-bold text-[14px] sm:text-[16px] tracking-[1.5px] text-center text-[#243464] uppercase mb-12">
            LEARNING MANAGEMENT SYSTEM
          </h2>

          <style>{`
            .pwd-input::placeholder { letter-spacing: normal; }
          `}</style>
          <form onSubmit={handleLogin} className="flex flex-col w-full">
            <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2 text-left">{"Login"}</label>
            <div className="relative mb-6">
              <input
                onChange={(e) => setLogin(e.target.value)}
                type="text"
                placeholder="+9989xxxxxxxx"
                className="w-full h-[52px] bg-[#edf0f7] rounded-[14px] px-5 text-[15px] font-medium text-[#64748b] placeholder-[#9CA3AF] border border-[#d8dde8] focus:border-[#8b9fd4] focus:outline-none focus:bg-[#edf2fc] transition-all"
              />
            </div>

            <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2 text-left">{"Parol"}</label>
            <div className="relative mb-3">
              <input
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="password"
                className="pwd-input w-full h-[52px] bg-[#edf0f7] rounded-[14px] px-5 pr-12 text-[15px] font-medium text-[#64748b] placeholder-[#9CA3AF] border border-[#d8dde8] focus:border-[#8b9fd4] focus:outline-none focus:bg-[#edf2fc] transition-all"
                style={{ letterSpacing: showPassword ? "normal" : "3px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] flex items-center bg-transparent border-0 cursor-pointer p-0"
                tabIndex={-1}
              >
                {showPassword ? (
                  <VisibilityIcon sx={{ fontSize: 20 }} />
                ) : (
                  <VisibilityOffIcon sx={{ fontSize: 20 }} />
                )}
              </button>
            </div>

            <div className="flex justify-end mb-8">
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-[#243464] text-[12px] font-bold hover:underline bg-transparent border-0 p-0 cursor-pointer"
              >
                {"Parolni unutdingizmi?"}
              </button>
            </div>

            <button
              type="submit"
              className="outline-0 w-full h-[52px] text-white bg-[#243464] hover:bg-[#1a254a] transition-colors rounded-[12px] text-[15px] font-medium cursor-pointer shadow-[0_10px_15px_-3px_rgba(36,52,100,0.2)]"
            >
              {"Kirish"}
            </button>
          </form>
        </div>

        <div className="mt-auto pt-16 pb-4">
          <h2 className="text-[#9CA3AF] text-center text-[11px]">
            © 2021 Tashkent University of Information Technologies
          </h2>
        </div>
      </div>

      {/* Parolni unutdingizmi modali */}
      {forgotOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-[6px] p-4"
          onClick={closeForgot}
        >
          {smsToastOpen && (
            <div
              className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 bg-[#2E8738] text-white rounded-2xl px-6 py-4 shadow-[0_12px_30px_rgba(46,135,56,0.35)] text-[16px] font-semibold min-w-[320px]"
              onClick={(e) => e.stopPropagation()}
            >
              <i className="fa-solid fa-check text-[20px]"></i>
              <span className="flex-1">{"SMS kod yuborildi!"}</span>
              <button
                type="button"
                onClick={() => setSmsToastOpen(false)}
                className="w-7 h-7 bg-transparent border-0 text-white text-[18px] cursor-pointer flex items-center justify-center opacity-80 hover:opacity-100 ml-2"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          )}
          <div
            className="w-full max-w-[400px] bg-white rounded-[20px] shadow-[0_20px_60px_rgba(15,23,42,0.16)] p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeForgot}
              className="absolute top-6 right-6 w-7 h-7 rounded-lg text-[#98A1B2] hover:bg-[#F4F6FA] hover:text-[#243464] cursor-pointer flex items-center justify-center bg-transparent border-0 text-[18px]"
              aria-label={"Yopish"}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="flex items-center gap-4 mb-7">
              <div className="w-[46px] h-[46px] rounded-full bg-[#F4F4F7] text-[#243464] flex items-center justify-center text-[20px] shrink-0">
                <i className={`fa-solid ${forgotStep === "otp"
                  ? "fa-shield-halved"
                  : forgotStep === "password"
                    ? "fa-key"
                    : forgotStep === "done"
                      ? "fa-check"
                      : "fa-phone"
                  }`}></i>
              </div>
              <div>
                <h2 className="text-[20px] leading-tight font-extrabold text-[#243464] m-0">
                  {forgotStep === "otp" ? "Kodni tasdiqlash" : "Parolni tiklash"}
                </h2>
                <p className="text-[13px] font-semibold text-[#9AA3B2] mt-1 mb-0">
                  {forgotStep === "phone" && "Telefon raqamingizni kiriting"}
                  {forgotStep === "otp" && "SMS orqali kelgan kodni kiriting"}
                  {forgotStep === "password" && "Yangi parolingizni kiriting"}
                  {forgotStep === "done" && "Muvaffaqiyatli"}
                </p>
              </div>
            </div>

            {/* 1-bosqich: telefon raqam */}
            {forgotStep === "phone" && (
              <form onSubmit={handleSendOtp} className="flex flex-col">
                <p className="hidden">
                  {"Telefon raqamingizni kiriting — tasdiqlash kodi yuboriladi."}
                </p>
                <label className="text-[12px] font-extrabold text-[#6F7788] uppercase tracking-wide mb-2">
                  {"Telefon raqam"}
                </label>
                <div className="relative mb-5">
                  <input
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value)}
                    type="text"
                    placeholder="+998"
                    className="outline-0 w-full h-[48px] border border-[#243464] focus:border-[#243464] rounded-[12px] px-4 text-[15px] font-medium text-[#1F2D5A] placeholder-[#1F2D5A] shadow-[0_0_0_3px_rgba(36,52,100,0.06)]"
                  />
                </div>
                {forgotError && (
                  <p className="text-[#e53935] text-[12px] font-medium mb-2 text-center">
                    {forgotError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={forgotLoading || !forgotPhone.trim()}
                  className="outline-0 w-full h-[48px] text-white bg-[#243464] hover:bg-[#1c2a53] transition-colors rounded-[12px] text-[15px] font-extrabold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {forgotLoading ? "Yuborilmoqda..." : "Kodni yuborish"}
                </button>
              </form>
            )}

            {/* 2-bosqich: OTP kodni tasdiqlash */}
            {forgotStep === "otp" && (
              <form onSubmit={handleVerifyOtp} className="flex flex-col">
                <p className="hidden">
                  {"Raqamga yuborilgan tasdiqlash kodini kiriting"}
                  <span className="block font-semibold text-[#1a1a2e] mt-1">
                    {forgotPhone}
                  </span>
                </p>
                <label className="text-[12px] font-extrabold text-[#6F7788] uppercase tracking-wide mb-2">
                  {"SMS kod"}
                </label>
                <div className="relative mb-5">
                  <input
                    value={forgotOtp}
                    onChange={(e) =>
                      setForgotOtp(e.target.value.replace(/\D/g, ""))
                    }
                    type="text"
                    inputMode="numeric"
                    placeholder="K o d . . ."
                    className="outline-0 w-full h-[52px] border border-[#DDE2EA] focus:border-[#243464] rounded-[12px] px-4 text-center tracking-[8px] text-[20px] font-extrabold text-[#8B94A8] placeholder-[#8B94A8] bg-white"
                  />
                </div>
                {forgotError && (
                  <p className="text-[#e53935] text-[12px] font-medium mb-2 text-center">
                    {forgotError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={forgotLoading || !forgotOtp.trim()}
                  className="outline-0 w-full h-[48px] text-white bg-[#243464] hover:bg-[#1c2a53] transition-colors rounded-[12px] text-[15px] font-extrabold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {forgotLoading ? "Tekshirilmoqda..." : "Tasdiqlash"}
                </button>
                <div className="text-center text-[13px] font-semibold text-[#717B90] mt-4 mb-0">
                  {otpTimer > 0 ? (
                    <span>
                      {"Qayta yuborish"}: <span className="text-[#243464] font-extrabold">
                        {String(Math.floor(otpTimer / 60)).padStart(2, "0")}:{String(otpTimer % 60).padStart(2, "0")}
                      </span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await fetchApi.post("auth/send-otp", { phone: forgotPhone });
                          setSmsToastOpen(true);
                          setOtpTimer(60);
                          setTimeout(() => setSmsToastOpen(false), 2000);
                        } catch (e) {
                          setForgotError(e.response?.data?.message || "Kod yuborishda xatolik yuz berdi");
                        }
                      }}
                      className="text-[#243464] font-extrabold underline bg-transparent border-0 cursor-pointer text-[13px] hover:text-[#1c2a53]"
                    >
                      {"Qayta yuborish"}
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* 3-bosqich: yangi parol o'rnatish */}
            {forgotStep === "password" && (
              <form onSubmit={handleChangePassword} className="flex flex-col mt-2">
                <label className="text-[12px] font-extrabold text-[#6F7788] uppercase tracking-wide mb-2 mt-4">
                  {"YANGI PAROL"}
                </label>
                <div className="relative mb-5">
                  <input
                    value={forgotPassword}
                    onChange={(e) => setForgotPassword(e.target.value)}
                    type="password"
                    placeholder={"Yangi parol"}
                    className="outline-0 w-full h-[48px] border border-[#DDE2EA] focus:border-[#243464] rounded-[12px] px-4 text-[15px] font-medium text-[#1F2D5A] placeholder-[#9AA3B2]"
                  />
                </div>

                <label className="text-[12px] font-extrabold text-[#6F7788] uppercase tracking-wide mb-2">
                  {"PAROLNI TASDIQLANG"}
                </label>
                <div className="relative mb-7">
                  <input
                    value={forgotPassword2}
                    onChange={(e) => setForgotPassword2(e.target.value)}
                    type="password"
                    placeholder={"Yangi parolni takrorlang"}
                    className="outline-0 w-full h-[48px] border border-[#DDE2EA] focus:border-[#243464] rounded-[12px] px-4 text-[15px] font-medium text-[#1F2D5A] placeholder-[#9AA3B2]"
                  />
                </div>
                {forgotError && (
                  <p className="text-[#e53935] text-[13px] font-medium mb-2 text-center">
                    {forgotError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={
                    forgotLoading || !forgotPassword.trim() || !forgotPassword2.trim()
                  }
                  className="outline-0 w-full h-[54px] text-white bg-[#243464] hover:bg-[#1c2a53] transition-colors rounded-[16px] text-[16px] font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {forgotLoading ? "Saqlanmoqda..." : "Saqlash va Kirish"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
