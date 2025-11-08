import "./Form.css";
import axios from "axios";
import { StyledForm } from "./StyledForm";
import { useState } from "react";
import { states } from "./states";

const base_url = process.env.REACT_APP_API_BASE_URL;

export function LoginForm() {
  const [ errorMessage, setErrorMessage ] = useState("");

    async function handleLogin(e) {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();

    // Client-side validation
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      const response = await axios.post(`${base_url}/users/login`, {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      window.location.href = "/";
    } catch (error) {
      console.error("Login failed:", error);
      // Show a generic error message
      setErrorMessage("Invalid credentials. Try again.");
    }
  }

  return (
    <StyledForm onSubmit={handleLogin} title="Login">
      {/* == Email == */}
      <label htmlFor="email">
        Email
        <input
          type="email"
          name="email"
          id="email"
          placeholder="example@example.com"
        />
      </label>

      {/* == Password == */}
      <label htmlFor="password">
        Password
        <input type="password" name="password" id="password" />
      </label>

      {/* == Submit == */}
      <button type="submit">Login</button>
      
      {/* Error message */}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

    </StyledForm>
  );
}

export function RegisterForm() {
  async function handleRegister(e) {
    await axios.post(`${base_url}/users/register`, {
      name: e.target.name.value,
      email: e.target.email.value,
      password: e.target.password.value,
      defaultShipToState: e.target.defaultShipToState.value,
    });

    window.location.href = "/";
  }

  return (
    <StyledForm onSubmit={handleRegister} title="Register">
      {/* == Name == */}
      <label htmlFor="name">
        Name
        <input type="text" name="name" id="name" required placeholder="Name" />
      </label>

      {/* == Email == */}
      <label htmlFor="email">
        Email
        <input
          type="email"
          name="email"
          id="email"
          required
          placeholder="example@example.com"
        />
      </label>

      {/* == Password == */}
      <label htmlFor="password">
        Password
        <input
          type="password"
          name="password"
          id="password"
          required
        />
      </label>

      {/* == Default Ship To State == */}
      <label htmlFor="defaultShipToState">
        State:
        <select name="defaultShipToState" id="defaultShipToState">
          <option disabled selected>
            Select a state
          </option>
          {states.map((state) => (
            <option key={state}>{state}</option>
          ))}
        </select>
      </label>

      {/* == Submit == */}
      <button type="submit">Register</button>
    </StyledForm>
  );
}
