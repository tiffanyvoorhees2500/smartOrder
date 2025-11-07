import { useState } from "react";
import "./SlidingButton.css";

/**
 * A custom slide button component that takes a list of options and renders a button with those options.
 *
 * @param {string[]} options - A list of options for the slide button
 * @param {string} name - The name of the input element
 * @param {string} id - The id of the input element
 * @param {string} selected - The default selected element
 *
 * @returns {JSX.Element}
 */
export default function SlidingButton({ options, name, id, selected }) {
  const defaultSelected = options.includes(selected) ? selected : options[0];
  const [active, setActive] = useState(defaultSelected);
  const sliderClass = `slider-${name}`;
  const widthPercentage = 100 / options.length;

  return (
    <div className={`slideButton`}>
      {/* == White toggle slider CSS == */}
      {/* Style tag is needed to make each slider move individually and to dynamically set the width and position based on the number of options */}
      <style>
        {`
					.${sliderClass} {
						width: ${widthPercentage + 2}%;
						left: ${options.indexOf(active) * widthPercentage}%;
						transform:translateX(${
              -(options.indexOf(active) / (options.length - 1)) *
              (options.length * 2)
            }%);
						
					}
				`}
      </style>

      {/* White Toggle Slider */}
      <div className={`slider ${sliderClass}`}></div>

      {/* == Input field that holds the value == */}
      <input type="hidden" name={name} id={id} value={active} />

      {/* Button Options */}
      {options.map((option) => (
        <span
          onClick={() => setActive(option)}
          className={active === option ? "active" : ""}
          key={`${name}-${option}`}
        >
          {option}
        </span>
      ))}
    </div>
  );
}
