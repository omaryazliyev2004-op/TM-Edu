import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import ErrorIcon from "@mui/icons-material/Error"
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  function Navigate() {
    if (login == 1 && password == 1) {
      navigate("/dashboard");
    } else {
      setShowAlert(true);

      setTimeout(() => {
        setShowAlert(false);
      }, 2500);
    }
  }
  return (
  
    <div className="bg-[#F5F3FF] relative">
      <div className="absolute top-4 right-10">
        {showAlert && (
          <Alert
            icon={<ErrorIcon fontSize="inherit" />}
            severity="error"
            sx={{ mt: 2 }}
          >
            Login yoki Parol hato
          </Alert>
        )}
      </div>
      <section className="w-[90%] h-screen m-auto py-10 flex">
        <div className="w-[50%]">
          <img
            src="/study.svg"
            className=" h-full bg-[#EEE8FF] rounded-l-[20px]"
            alt=""
          />
        </div>
        <div className="w-[50%] bg-white rounded-r-[20px] h-full flex flex-col items-center pt-20 gap-2">
          <h2 className="text-center w-90 text-[#4338CA] text-[16px] font-semibold">
            MUHAMMAD AL-XORAZMIY NOMIDAGI TOSHKENT AXBOROT TEXNOLOGIYALARI
            UNIVERSITETI
          </h2>
          <img src="/logo.png" className="w-48 h-40" alt="" />
          <h2 className="font-medium text-[28px] tracking-[0.5px]">
            LEARNING <span className="text-[#7C4DFF]">MANAGEMENT SYSTEM</span>
          </h2>
          <form className="flex flex-col gap-2 mt-3">
            <h2>Login</h2>
            <div className="relative mb-5">
              <input
                onChange={(e) => setLogin(e.target.value)}
                type="text"
                placeholder="Loginni kiriting"
                className="loginput outline-0 w-140 h-14 border-2 border-[#E9E5FF] rounded-xl pl-12 text-[14px] font-medium  "
              />
              <PersonIcon
                sx={{
                  position: "absolute",
                  top: "16px",
                  left: "12px",
                  backgroundColor: "#EEE8FF",
                  width: "26px",
                  height: "26px",
                  borderRadius: "6px",
                  color: "#7C4DFF",
                  padding: "4px",
                }}
              />
            </div>
            <h2>Parol</h2>
            <div className="relative mb-5">
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Parolni kiriting"
                className="loginput outline-0 w-140 h-14 border-2 border-[#E9E5FF] rounded-xl pl-12 text-[14px] font-medium"
              />
              <LockIcon
                sx={{
                  position: "absolute",
                  top: "16px",
                  left: "12px",
                  backgroundColor: "#EEE8FF",
                  width: "26px",
                  height: "26px",
                  borderRadius: "6px",
                  color: "#7C4DFF",
                  padding: "4px",
                }}
              />
            </div>
            <input
              onClick={(e) => {
                e.preventDefault();
                Navigate("/Dashboard");
              }}
              type="submit"
              className="outline-0 w-140 h-14 text-white bg-[#7C4DFF] rounded-xl  text-[14px] font-medium"
            />
          </form>
          <hr className="w-140 h-0.5 text-[#00000011] bg-[#00000011] mt-14" />
          <h2 className="text-[#555555b2]">
            Copyright © 2021 of Tashkent University of Information Technologies
          </h2>
        </div>
      </section>
    </div>
  );
}
