import ReactDOM from "react-dom/client";
import React, { ChangeEvent } from "react";
import { useState, useCallback, useLayoutEffect, useRef } from "react";
import { MouseEvent } from "react";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <OtpInput />
  </React.StrictMode>
);

interface OtpInputPropsType {
  length?: number;
  isAlphaNumeric?: boolean;
}

interface SingleDigitInputPropsType {
  val: string;
  focus: boolean;
  index: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function OtpInput({ length = 6 }: OtpInputPropsType) {
  const [focusOn, setFocusOn] = useState<number>(0);
  const [value, setValue] = useState<string[]>(new Array(6).fill(""));
  const handlePaste = useCallback((event: React.ClipboardEvent) => {
    const data = event.clipboardData.getData("text/plain");
    // Should we show error if user tries to paste alphabets
    if (data.length === length && !isNaN(Number(data))) {
      setValue(data.split(""));
      setFocusOn(length - 1);
    }
  }, []);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      debugger;
      if (e.key === "ArrowLeft") {
        setFocusOn(focusOn - 1);
        setFocusOn(Math.max(focusOn - 1, 0));
      } else if (e.key === "ArrowRight") {
        setFocusOn(Math.min(focusOn + 1, length - 1));
      } else if (!isNaN(Number(e.key))) {
        value[focusOn] = e.key;
        setFocusOn(Math.min(focusOn + 1, length - 1));
      }
      setValue([...value]);
    },
    [length, focusOn]
  );
  const moveFocusOnClick = useCallback((e: MouseEvent<HTMLInputElement>) => {
    if (e.target instanceof HTMLInputElement && e.target.dataset?.index) {
      setFocusOn(parseInt(e.target.dataset?.index, 10));
    }
  }, []);
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    // using this instead of handelling backspace in on handlekeydown
    // android does not send correct keycode for backspace
    // and this will work for both delete and backspace too
    if (e.target.value === "") {
      value[focusOn] = "";
      setFocusOn(Math.max(focusOn - 1, 0));
      setValue([...value]);
    }
  };
  return (
    <div
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      onClick={moveFocusOnClick}
      className="inline-flex justify-between gap-4"
    >
      <input
        type="hidden"
        autoComplete="off"
        value={value.filter(Boolean).join("")}
      />
      {new Array(length).fill(0).map((x, i) => (
        <SingleDigitInput
          val={value[i] || ""}
          key={i}
          index={i}
          focus={focusOn === i}
          onChange={onChange}
        />
      ))}
    </div>
  );
}

function SingleDigitInput({
  val = "",
  focus = false,
  index,
  onChange,
}: SingleDigitInputPropsType) {
  const ref = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    if (ref.current && focus) {
      ref.current.focus();
      // need this to make sure the cursor always stays at the end of text
      // so its easy for user to delete content using backspace
      const val = ref.current.value;
      ref.current.value = "";
      requestAnimationFrame(() => {
        // Typescript makes it mandatory to have following if check
        if (ref.current) {
          ref.current.value = val;
        }
      });
    }
  }, [focus]);
  return (
    <input
      ref={ref}
      inputMode="numeric"
      value={val}
      // need this to make sure that its a controlled input
      onChange={onChange}
      required
      type="text"
      // need this to remove the keyboard arrows that ios keyboard shows
      // need to keep it zero for first input box so its keyboard focusable
      tabIndex={index !== 0 ? -1 : 0}
      maxLength={1}
      data-index={index}
      autoComplete="one-time-code"
      aria-label={`Enter ${index + 1}th digit of OTP`}
      className="w-12 h-16 text-[24px] border-[#929496] text-lg border rounded-sm focus:border-ring focus:shadow-md focus-visible:ring-structure-focus py-3.5 px-4 appearance-none"
    />
  );
}
