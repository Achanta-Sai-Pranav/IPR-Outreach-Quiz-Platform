import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "../axiosConfig.jsx";
import { updateFailure, updateStart, updateSuccess } from "../slices/userSlice";

const DashProfile = () => {
  const { t } = useTranslation("dashboard");
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    dateOfBirth: "",
    schoolName: "",
    standard: "",
    city: "",
    password: "",
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.user.firstName || "",
        middleName: currentUser.user.middleName || "",
        lastName: currentUser.user.lastName || "",
        email: currentUser.user.email || "",
        mobileNumber: currentUser.user.mobileNumber || "",
        dateOfBirth: currentUser.user.dateOfBirth
          ? new Date(currentUser.user.dateOfBirth).toISOString().split("T")[0]
          : "",
        schoolName: currentUser.user.schoolName || "",
        standard: currentUser.user.standard || "",
        city: currentUser.user.city || "",
        password: "",
      });
    }
  }, [currentUser]);

  const cities = [
    "Ahmedabad",
    "Amreli",
    "Anand",
    "Aravalli",
    "Banaskantha",
    "Bharuch",
    "Bhavnagar",
    "Botad",
    "Chhota Udaipur",
    "Dahod",
    "Dang",
    "Devbhoomi Dwarka",
    "Gandhinagar",
    "Gir Somnath",
    "Jamnagar",
    "Junagadh",
    "Kheda",
    "Kutch",
    "Mahisagar",
    "Mehsana",
    "Morbi",
    "Narmada",
    "Navsari",
    "Panchmahal",
    "Patan",
    "Porbandar",
    "Rajkot",
    "Sabarkantha",
    "Surat",
    "Surendranagar",
    "Tapi",
    "Vadodara",
    "Valsad",
  ];

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: id === "standard" ? parseInt(value, 10) : value,
    }));
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateStart());
      const res = await axios.put(
        `/api/user/update/${currentUser.user.id}`,
        formData
      );
      if (res.data.success) {
        dispatch(updateSuccess(res.data));
        toast.success("Profile updated successfully");
      } else {
        dispatch(updateFailure(res.data.message));
        toast.error("Something went wrong, please try again later.");
      }
    } catch (error) {
      dispatch(
        updateFailure(error.response?.data?.message || "Something went wrong")
      );
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex justify-center min-h-[calc(88vh)] items-center bg-white p-8">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-[98rem] min-h-[80vh] w-full border-2">
        <h2 className="text-4xl font-semibold mb-4 text-blue-600">
          {t("updateProfile")}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block mb-1 font-medium">
                {t("firstName")}
              </label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="middleName" className="block mb-1 font-medium">
                {t("middleName")}
              </label>
              <input
                id="middleName"
                type="text"
                value={formData.middleName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block mb-1 font-medium">
                {t("lastName")}
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block mb-1 font-medium">
                {t("email")}
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
            </div>
            <div>
              <label htmlFor="mobileNumber" className="block mb-1 font-medium">
                {t("mobileNumber")}
              </label>
              <input
                id="mobileNumber"
                type="tel"
                value={formData.mobileNumber}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block mb-1 font-medium">
                {t("dateOfBirth")}
              </label>
              <input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="schoolName" className="block mb-1 font-medium">
                {t("schoolName")}
              </label>
              <input
                id="schoolName"
                type="text"
                value={formData.schoolName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="standard" className="block mb-1 font-medium">
                {t("standard")}
              </label>
              <select
                id="standard"
                value={formData.standard}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  {t("selectStandard")}
                </option>
                {[...Array(8)].map((_, index) => (
                  <option key={index + 5} value={index + 5}>
                    {index + 5}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="city" className="block mb-1 font-medium">
                {t("city")}
              </label>
              <select
                id="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t("selectCity")}</option>
                {cities.map((city, index) => (
                  <option key={index} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="password" className="block mb-1 font-medium">
                {t("password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t("enterNewPassword")}
                  className="w-full p-3 border border-gray-300 rounded pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 text-white text-lg font-bold transition-all hover:bg-blue-700 active:scale-[.98]"
          >
            {t("updateProfileButton")}
          </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default DashProfile;
