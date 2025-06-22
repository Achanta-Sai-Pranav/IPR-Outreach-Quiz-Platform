import React from "react";
import { Link } from "react-router-dom";

const Error404 = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-r from-yellow-200 to-orange-300 text-indigo-800">
      <h1 className="text-8xl font-bold mb-4 animate-bounce">Oops!</h1>
      <h2 className="text-4xl mb-8">Page Not Found</h2>
      <p className="text-2xl mb-8 text-center">
        Looks like you've wandered into a magical forest! <br />
        Let's find our way back home.
      </p>
      <Link
        to="/"
        className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-xl hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
      >
        🏠 Go Home
      </Link>
    </div>
  );
};

export default Error404;
