import React, { useState, useEffect, useMemo } from "react";
import TimeField from "react-simple-timefield";

const isNotEmpty = (value) => value.trim() !== "";
const isTime = (value) =>
  /^([0-2][0-3]):([0-5][0-9]):([0-5][0-9])$/.test(value);

const isNumber = (value) =>
  /-?\d*\.?\d{1,2}/.test(String(value).toLowerCase()) && value > 0;

const Form = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const options = ["", "pizza", "soup", "sandwich"];
  const defaultValue = { name: "", preparation_time: "00:00:00", type: "" };
  const defaultTypeValues = useMemo(() => {
    return {
      "": {},
      pizza: { no_of_slices: 0, diameter: 0.0 },
      soup: { spiciness_scale: 5 },
      sandwich: { slices_of_bread: 0 },
    };
  }, []);

  const [formData, setFormData] = useState(defaultValue);
  const [dishTypeData, setDishTypeData] = useState(
    defaultTypeValues[formData.type]
  );

  useEffect(() => {
    setDishTypeData(defaultTypeValues[formData.type]);
  }, [formData.type, defaultTypeValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDishTypeChange = (event) => {
    const { name, value } = event.target;
    if (name === "diameter") {
      setDishTypeData((prevState) => ({
        ...prevState,
        [name]: parseFloat(value),
      }));
    } else {
      setDishTypeData((prevState) => ({
        ...prevState,
        [name]: parseInt(value),
      }));
    }
  };

  const reset = () => {
    setFormData(defaultValue);
  };

  const nameIsValid = isNotEmpty(formData.name);
  const typeIsValid = isNotEmpty(formData.type);
  const timeIsValid =
    isNotEmpty(formData.preparation_time) &&
    isTime(formData.preparation_time) &&
    formData.preparation_time !== "00:00:00";

  const formValidation = {
    name: nameIsValid,
    type: typeIsValid,
    preparation_time: timeIsValid,
  };

  if (dishTypeData) {
    for (const key in dishTypeData) {
      formValidation[key] = isNumber(dishTypeData[key]);
    }
  }
  const formIsValid = Object.values(formValidation).every(
    (value) => value === true
  );

  const submitHandler = (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const data = { ...formData, ...dishTypeData };
    console.log("Submit", data);

    const sendData = async (data) => {
      const settings = {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      };
      const response = await fetch(
        `https://frosty-wood-6558.getsandbox.com:443/dishes`,
        settings
      );
      if (!response.ok) throw Error(response.message);
      try {
        const res = await response.json();
        console.log(res);
      } catch (err) {
        console.log(err);
        setErrors(err);
        throw err;
      }
    };

    sendData(data);

    const timer = setTimeout(() => {
      setIsSubmitting(false);
      reset();
    }, 1000);
    return () => clearTimeout(timer);
  };

  return (
    <form onSubmit={submitHandler}>
      <div className="control-group">
        <div className="form-control">
          <label htmlFor="name" className="form-label">
            Dish Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter a dish name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-control">
          <label htmlFor="preparation_type" className="form-label">
            Preparation Time
          </label>
          <TimeField
            id="preparation_time"
            name="preparation_time"
            value={formData.preparation_time}
            onChange={handleChange}
            colon=":"
            className="form-control"
            showSeconds
            required
          />
        </div>
        <div className="form-control">
          <label htmlFor="type" className="form-label">
            Choose dish type:
          </label>
          <select
            onChange={handleChange}
            name="type"
            value={formData.type}
            required
            className="form-control"
          >
            {options.map((type, i) => {
              return (
                <option key={i} value={type}>
                  {type}
                </option>
              );
            })}
          </select>
        </div>
        <div className="form-control">
          {formData.type && (
            <label htmlFor="details" className="form-label">
              Provide additional information:
            </label>
          )}

          {formData.type === "pizza" ? (
            <React.Fragment>
              <input
                type="number"
                id="no_of_slices"
                name="no_of_slices"
                placeholder="Enter number of slices"
                className="form-control"
                value={dishTypeData.no_of_slices || ""}
                onChange={handleDishTypeChange}
                min="1"
                required
              />
              <input
                type="number"
                id="diameter"
                name="diameter"
                step="0.1"
                min="0.00"
                max="100.00"
                presicion={2}
                placeholder="Enter diameter"
                className="form-control"
                value={dishTypeData.diameter || ""}
                onChange={handleDishTypeChange}
                required
              />
            </React.Fragment>
          ) : formData.type === "soup" ? (
            <React.Fragment>
              <input
                id="spiciness_scale"
                name="spiciness_scale"
                type="range"
                className="form-control"
                min="1"
                max="10"
                value={dishTypeData.spiciness_scale || ""}
                onChange={handleDishTypeChange}
                step="1"
                required
              />
              <label>
                Spiceness scale (1-10): {dishTypeData.spiciness_scale}
              </label>
            </React.Fragment>
          ) : formData.type === "sandwich" ? (
            <React.Fragment>
              <input
                type="number"
                id="slices_of_bread"
                name="slices_of_bread"
                min="1"
                placeholder="Enter number of bread slices"
                className="form-control"
                value={dishTypeData.slices_of_bread || ""}
                onChange={handleDishTypeChange}
                required
              />
            </React.Fragment>
          ) : null}
        </div>
      </div>
      <div className="form-actions">
        {isSubmitting && <p className="error-text">Sending form data...</p>}
        {errors.length && (
          <React.Fragment>
          <p className="error-text">Sending data failed!</p>
          <ul>
            {errors.map((error) => (
              <li>{error.join(" ")}</li>
            ))}
          </ul>
          </React.Fragment>
        )}
        <p className="">
          {" "}
          <button disabled={!formIsValid}>Submit</button>
        </p>
      </div>
    </form>
  );
};

export default Form;
