import React, { useState } from "react";
import { saveShippingAddress } from "./services/shippingService";
import { useCart } from "./cartContext";

// Declaring outside component to avoid recreation on each render
const emptyAddress = {
  city: "",
  country: "",
};

const STATUS = {
  IDLE: "IDLE",
  SUBMITTED: "SUBMITTED",
  SUBMITTING: "SUBMITTING",
  COMPLETED: "COMPLETED",
};

export default function Checkout() {
    const {dispatch} = useCart();
  const [address, setAddress] = useState(emptyAddress);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [saveError, setSaveError] = useState(null);
  const [touched, setTouched] = useState({});

  // derived state
  const errors = getErrors(address);
  const isValid = Object.keys(errors).length == 0;

  function handleChange(e) {
    e.persist();
    setAddress((currAddress) => {
      return {
        ...currAddress,
        [e.target.id]: e.target.value,
      };
    });
  }

  function handleBlur(event) {
    setTouched((curr) => {
        return {
            ...curr,
            [event.target.id]: true
        };
    });
  }

  function getErrors(address) {
    // this is a derived state
    const result = {};
    if (!address.city) result.city = "City is required";
    if (!address.country) result.country = "Country is required";
    return result;
  }

  async function handleSubmit(event) {
    // TODO
    event.preventDefault();
    setStatus(STATUS.SUBMITTING);
    if (!isValid) {
        setStatus(STATUS.SUBMITTED);
        return;
    };
    try {
      await saveShippingAddress(address);
      dispatch({type: "empty"});
      setStatus(STATUS.COMPLETED);
    } catch (e) {
      setSaveError(e);
    }
  }

  if (saveError) throw saveError;
  if (status === STATUS.COMPLETED) return <h1>Thanks for shopping!</h1>;

  return (
    <>
      <h1>Shipping Info</h1>
      {!isValid && status === STATUS.SUBMITTED && (
        <div role="alert">
          <p>Please fix the following errors</p>
          <ul>
            {Object.keys(errors).map((key) => {
              return <li key={key}>{errors[key]}</li>;
            })}
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="city">City</label>
          <br />
          <input
            id="city"
            type="text"
            value={address.city}
            onBlur={handleBlur}
            onChange={handleChange}
          />
          <p role="alert">
            {(touched.city || status === STATUS.SUBMITTED) && errors.city}
          </p>
        </div>

        <div>
          <label htmlFor="country">Country</label>
          <br />
          <select
            id="country"
            value={address.country}
            onBlur={handleBlur}
            onChange={handleChange}
          >
            <option value="">Select Country</option>
            <option value="China">China</option>
            <option value="India">India</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="USA">USA</option>
          </select>
          {(touched.country || status === STATUS.SUBMITTED) && errors.country}
        </div>

        <div>
          <input
            type="submit"
            className="btn btn-primary"
            value="Save Shipping Info"
            disabled={status === STATUS.SUBMITTING}
          />
        </div>
      </form>
    </>
  );
}
