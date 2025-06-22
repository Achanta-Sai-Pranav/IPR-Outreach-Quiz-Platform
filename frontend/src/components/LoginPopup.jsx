import { Transition } from "@headlessui/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const LoginPopup = ({ show, onClose }) => {
  const { t } = useTranslation("home");

  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/login");
    onClose();
  };

  return (
    <Transition
      show={show}
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
        <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-lg p-4 sm:p-6 w-full max-w-md sm:max-w-lg md:max-w-xl transition-transform transform scale-90 duration-300 ease-in-out">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            {t("pleaseLoginFirst")}
          </h2>
          <p className="mb-4 text-sm sm:text-base">{t("loginNeeded")}</p>
          <div className="flex justify-end space-x-4">
            <button
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-sm sm:text-base rounded-lg hover:bg-gray-400 transition"
              onClick={onClose}
            >
              {t("cancel")}
            </button>
            <button
              className="px-4 sm:px-6 py-2 sm:py-3 bg-orange-500 text-white text-sm sm:text-base rounded-lg hover:bg-orange-600 transition"
              onClick={handleLogin}
            >
              {t("goToLogin")}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  );
};

export default LoginPopup;
