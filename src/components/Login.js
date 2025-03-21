import React, { useState, useEffect } from "react";
import axios from "axios";
import { TypeAnimation } from "react-type-animation";
import { Moon, Sun } from "lucide-react";

const Login = ({ history }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [darkMode, setDarkMode] = useState(false);
  
  // Theme toggle effect - this applies the dark class to the document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending login request:", form);
      const response = await axios.post("http://127.0.0.1:5000/login", form, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Login Response:", response.data);
      alert(response.data.message);
      window.location.href = "/camera";
    } catch (err) {
      console.error("Login Error:", err.response ? err.response.data : err.message);
      alert("Login failed: " + (err.response?.data?.error || "Unknown error"));
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row h-screen transition-colors duration-300">
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-200 dark:bg-gray-800 transition-all duration-300"
        aria-label="Toggle theme"
      >
        {darkMode ? (
          <Sun size={20} className="text-yellow-400" />
        ) : (
          <Moon size={20} className="text-gray-700" />
        )}
      </button>

      {/* Left Section - Welcome/Illustration */}
      <div className="hidden md:flex md:w-1/2 bg-stone-100 dark:bg-gray-900 flex-col justify-center items-center transition-colors duration-300">
        <div className="px-12">
          <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-100 mb-6 transition-colors duration-300">
            Loan Manager
          </h1>
          <div className="text-xl text-gray-600 dark:text-gray-300 max-w-md h-24 transition-colors duration-300">
            <TypeAnimation
              sequence={[
                'Easy Apply to Multiple loans',
                1000,
                'Video based solution to loan applications.',
                1000,
                'Multilingual solution to loan application.',
                1000,
                'Secure and transparent loan management system.',
                1000,
              ]}
              wrapper="p"
              speed={50}
              style={{ fontSize: '1.25rem', display: 'inline-block', height: '3em' }}
              repeat={Infinity}
            />
          </div>
          <div className="relative w-full h-64 md:h-96 mt-6">
            <img 
              src="https://illustrations.popsy.co/amber/finance-growth.svg" 
              alt="Money" 
              className="h-full object-contain transition-all duration-500 transform hover:scale-105" 
            />
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center py-12 px-6 sm:px-12 bg-white dark:bg-black transition-colors duration-300">
        <div className="mx-auto w-full max-w-sm">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 transition-colors duration-300">
            Login to your account
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-800 dark:text-white sm:text-sm transition-colors duration-300"
                  placeholder="you@example.com"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-800 dark:text-white sm:text-sm transition-colors duration-300"
                  placeholder="••••••••"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 text-gray-800 dark:text-gray-600 focus:ring-gray-500 border-gray-300 dark:border-gray-700 rounded transition-colors duration-300"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-gray-800 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-400 transition-colors duration-300">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-300"
              >
                Login
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700 transition-colors duration-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-black text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <span className="sr-only">Sign in with Google</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <span className="sr-only">Sign in with Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <span className="sr-only">Sign in with Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm text-center">
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                Don't have an account?{" "}
                <a href="/" className="font-medium text-gray-800 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-400 transition-colors duration-300">
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;