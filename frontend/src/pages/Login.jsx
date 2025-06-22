import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import login from "../assets/Login.svg";
import axios from "../axiosConfig.jsx";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../slices/userSlice.js";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation("auth");

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value.trim() }));
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      const errorMsg = t("validation.fillAllFields");
      toast.error(errorMsg);
      return dispatch(signInFailure(errorMsg));
    }
    if (!validateEmail(formData.email)) {
      const errorMsg = t("validation.invalidEmail");
      toast.error(errorMsg);
      return dispatch(signInFailure(errorMsg));
    }
    if (formData.password.length < 6) {
      const errorMsg = t("validation.passwordLength");
      toast.error(errorMsg);
      return dispatch(signInFailure(errorMsg));
    }
    try {
      dispatch(signInStart());
      const response = await axios.post("auth/login", formData, {
        headers: { "Content-Type": "application/json" },
      });
      const { token, ...userData } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        dispatch(signInSuccess(userData));
        navigate("/");
      } else {
        const errorMsg = t("validation.genericError");
        toast.error(errorMsg);
        dispatch(signInFailure(errorMsg));
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || t("validation.genericError");
      toast.error(errorMsg);
      dispatch(signInFailure(errorMsg));
    }
  };

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen lg:flex-row">
      <div className="hidden lg:flex flex-col w-1/2">
        <div className="flex-grow flex items-center justify-center ml-36">
          <img src={login} alt="Feature image" className="h-auto w-auto" />
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 pt-16 pb-14">
        <div className="bg-white px-4 lg:px-8 py-8 rounded-2xl shadow-md border-2 border-orange-200 w-full max-w-md">
          <h1 className="text-2xl lg:text-3xl font-bold text-center mb-6 text-orange-500">
            {t("login.title")}
          </h1>
          <p className="text-gray-500 text-center mb-6">
            {t("login.subtitle")}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block mb-1 font-medium">
                {t("login.email")}
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="johndoe@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-1 font-medium">
                {t("login.password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full p-3 border border-gray-300 rounded pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter your Password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? (
                    <RiEyeOffLine size={20} />
                  ) : (
                    <RiEyeLine size={20} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-orange-500 text-white text-lg font-bold transition-all hover:bg-orange-600 active:scale-[.98] disabled:bg-orange-300"
              disabled={loading}
            >
              {loading ? "Loading..." : t("login.loginButton")}
            </button>
          </form>
          <div className="flex items-center justify-center mt-6">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="mx-2 text-gray-500">{t("login.or")}</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>
          <p className="text-center mt-6">
            {t("login.noAccount")}{" "}
            <Link to="/sign-up" className="text-orange-500 hover:underline">
              {t("login.signUpNow")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
