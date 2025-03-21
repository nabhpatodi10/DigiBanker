import React, { useState } from "react";
import axios from "axios";
import { TypeAnimation } from "react-type-animation";
 // Make sure to create this CSS file

const Signup = ({ history }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    phone: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:5000/signup", form);
      alert(response.data.message);
      history.push("/login");
    } catch (err) {
      console.error("Signup Error:", err.response ? err.response.data : err.message);
      alert("Signup failed: " + (err.response?.data?.error || "Unknown error"));
    }
  };

  return (
<div className="min-h-screen bg-white flex w-full">
      {/* Left side - Loan Manager Header */}
      <div className="hidden md:flex md:w-1/2 bg-stone-100 flex-col justify-center items-center">
        <div className="px-12">
          <h1 className="text-6xl font-bold text-gray-800 mb-6">Loan Manager</h1>
          <div className="text-xl text-gray-600 max-w-md h-24">
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
          <img src="https://illustrations.popsy.co/amber/finance-growth.svg" alt="Money" className=" h-[50vh] " />
         
       

        </div>
      </div>
      
      {/* Right side - Signup Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center py-12 px-6 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Create Account
          </h2>
          <p className="text-sm text-gray-600 mb-8">
            Join our smart loan platform today
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  placeholder="John Doe"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  placeholder="you@example.com"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  placeholder="••••••••"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <div className="mt-1">
                <select
                  id="gender"
                  name="gender"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  onChange={handleChange}
                  defaultValue=""
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  placeholder="+91 9999999999"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Create Account
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-sm text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <a href="login" className="font-medium text-gray-800 hover:text-gray-700">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;