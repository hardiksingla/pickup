import React, { useState } from 'react';
import axios, { formToJSON } from "axios";
import { API_URL } from "../config.js";

function Login() {
  // State for phoneNumber and password
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  useState(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      const respone = await axios.post(`${API_URL}/api/v1/user/checkToken`, { token });
      if (respone.data.statusNum == 1) {
        window.location.href = "/";
      }
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Logging in with phone number:", phoneNumber, "and password:", password ,`${API_URL}/api/v1/user/login`)
    try {
      const response = await axios.post(`${API_URL}/api/v1/user/login`, { phoneNumber, password });

      console.log("Login successful, token:", response.data.token);
      localStorage.setItem("token", response.data.token);
      window.location.href = "/";
    } catch (error) {
      console.error("Login failed:", error);
      // Handle login failure (e.g., showing an error message)
    }
  };

  // Handlers for form inputs
  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email-address"
                name="phoneNumber"
                type="text" // Changed type to text for phoneNumber
                autoComplete="phoneNumber"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
              />
            </div>
          </div>

          <div>
            <button
              onClick={handleSubmit}
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
