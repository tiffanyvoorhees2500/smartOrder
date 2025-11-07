import "./Form.css";
import axios from "axios";
import { StyledForm } from "./StyledForm";
import { states } from "./states";
import SlidingButton from "../Buttons/SlidingButton";

const base_url = process.env.REACT_APP_API_BASE_URL;

export function LoginForm() {
  async function handleLogin(e) {
    await axios.post(`${base_url}/users/login`, {
      email: e.target.email.value,
      password: e.target.password.value,
    });

    window.location.href = "/";
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
          minLength={8}
          pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}"
          title="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
        />
      </label>

      {/* == Submit == */}
      <button type="submit">Login</button>
    </StyledForm>
  );
}

export function RegisterForm() {
  async function handleRegister(e) {
    await axios.post(`${base_url}/users/register`, {
      name: e.target.name.value,
      email: e.target.email.value,
      password: e.target.password.value,
      pricingType: e.target.pricingType.value,
      discountType: e.target.discountType.value,
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
          minLength={8}
          pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}"
          title="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
        />
      </label>

      {/* == Pricing Type == */}
      <label htmlFor="pricingType">
        Pricing Type:
        <SlidingButton
          options={["Retail", "Wholesale"]}
          selected="Retail"
          name="pricingType"
          id="pricingType"
        />
      </label>

      {/* == Discount Type == */}
      <label htmlFor="discountType">
        Discount Type:
        <SlidingButton
          options={["Individual", "Group"]}
          selected="Individual"
          name="discountType"
          id="discountType"
        />
      </label>

      {/* == Default Ship To State == */}
      <label htmlFor="defaultShipToState">
        State:
        <select
          name="defaultShipToState"
          id="defaultShipToState"
          defaultValue={""}
          required
        >
          <option disabled value="">
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
