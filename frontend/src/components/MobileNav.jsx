import { Button, Modal } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaBars, FaChevronDown, FaTimes, FaUser } from "react-icons/fa";
import { IoLanguage } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.jpg";
import { signInSuccess } from "../slices/userSlice";

const useOutsideClick = (callback) => {
  const ref = useRef();

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [callback]);

  return ref;
};

const MobileNav = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showSignoutModal, setShowSignoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation("nav");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentUser } = useSelector((state) => state.user);

  const handleDropdownToggle = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  const dropdownRef = useOutsideClick(closeDropdown);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    closeDropdown();
    setMobileMenuOpen(false);
  };

  const handleSignout = async () => {
    try {
      const response = await fetch("/api/user/signout", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        dispatch(signInSuccess(null));
        navigate("/");
      } else {
        console.error("Signout failed");
      }
    } catch (error) {
      console.error("Error during signout:", error);
    }
    setShowSignoutModal(false);
    setMobileMenuOpen(false);
    closeDropdown();
  };

  return (
    <nav className="bg-white bg-opacity-90 backdrop-blur-md shadow-lg w-full">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-4">
            <img
              src={Logo}
              alt="IPR Logo"
              className="h-16 w-16 sm:h-18 sm:w-20"
            />
            <div>
              <div>
                <p className="text-[#23559f] font-normal text-xl sm:text-3xl ">
                  Institute for{" "}
                  <span className="font-black">Plasma Research</span>
                </p>
              </div>
            </div>
          </Link>

          <div className="ml-auto">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-800 hover:text-orange-500 transition duration-300 ml-4"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4" ref={dropdownRef}>
            <div className="space-y-4">
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle("language")}
                  className="flex items-center w-full text-gray-800 hover:text-orange-500 text-base font-medium transition duration-300"
                >
                  <IoLanguage className="mr-2 text-xl" />
                  <span>{t("language")}</span>
                  <FaChevronDown
                    className={`ml-auto w-4 h-4 transition-transform ${
                      openDropdown === "language" ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>
                {openDropdown === "language" && (
                  <div className="mt-2 bg-white rounded-md shadow-lg py-1">
                    {["en", "gu", "hi"].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => changeLanguage(lang)}
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-100 transition duration-300 ${
                          i18n.language === lang
                            ? "bg-orange-200 text-orange-600 font-semibold"
                            : ""
                        }`}
                      >
                        {t(
                          lang === "en"
                            ? "english"
                            : lang === "gu"
                            ? "gujarati"
                            : "hindi"
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => handleDropdownToggle("user")}
                    className="flex items-center w-full text-gray-800 hover:text-orange-500 text-base font-medium transition duration-300"
                  >
                    <FaUser className="mr-2 text-xl" />
                    <span>
                      {t("welcome")},{" "}
                      <span className="text-orange-500">
                        {currentUser.user.firstName}
                      </span>
                    </span>
                    <FaChevronDown
                      className={`ml-auto w-4 h-4 transition-transform ${
                        openDropdown === "user" ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>
                  {openDropdown === "user" && (
                    <div className="mt-2 bg-white rounded-md shadow-lg py-1">
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-100 transition duration-300"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t("accountSettings")}
                      </Link>
                      <button
                        onClick={() => setShowSignoutModal(true)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-100 transition duration-300"
                      >
                        {t("logout")}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/sign-up"
                  className="block text-center bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-base font-medium transition duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("signup")}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <Modal show={showSignoutModal} onClose={() => setShowSignoutModal(false)}>
        <Modal.Header>{t("logout")}</Modal.Header>
        <Modal.Body>
          <p className="text-sm leading-relaxed text-gray-500">
            {t("signOutConfirmation")}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button className="bg-orange-500 text-sm" onClick={handleSignout}>
            {t("yesSignOut")}
          </Button>
          <Button
            color="gray"
            className="text-sm"
            onClick={() => setShowSignoutModal(false)}
          >
            {t("cancel")}
          </Button>
        </Modal.Footer>
      </Modal>
    </nav>
  );
};

export default MobileNav;
