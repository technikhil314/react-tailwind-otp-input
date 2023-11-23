import ReactDOM from "react-dom/client";
import React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
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
}

export function OtpInput({ length = 6 }: OtpInputPropsType) {
  const [focusOn, setFocusOn] = useState<number>(0);
  const [value, setValue] = useState<string[]>(new Array(6).fill(""));
  const handlePaste = useCallback((event: React.ClipboardEvent) => {
    const data = event.clipboardData.getData("text/plain");
    // Should we show error if user tries to paste
    if (data.length === length && !isNaN(Number(data))) {
      setValue(data.split(""));
      setFocusOn(length - 1);
    }
  }, []);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Prevent tab press from moving focus as for user its one input only
      if (e.key === "Tab") {
        e.preventDefault();
      }
      if (e.key === "ArrowLeft") {
        setFocusOn(focusOn - 1);
        setFocusOn(Math.max(focusOn - 1, 0));
      } else if (e.key === "ArrowRight") {
        setFocusOn(Math.min(focusOn + 1, length - 1));
      } else if (e.key === "Backspace") {
        value[focusOn] = "";
        setFocusOn(Math.max(focusOn - 1, 0));
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
        />
      ))}
    </div>
  );
}

function SingleDigitInput({
  val = "",
  focus = false,
  index,
}: SingleDigitInputPropsType) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (focus) {
      ref.current?.focus();
    }
  }, [focus]);
  return (
    <input
      ref={ref}
      inputMode="numeric"
      value={val}
      required
      type="text"
      maxLength={1}
      data-index={index}
      autoComplete="one-time-code"
      aria-label={`Enter ${index + 1}th digit of OTP`}
      className="w-12 h-16 text-[24px] border-[#929496] text-lg border rounded-sm focus:border-ring focus:shadow-md focus-visible:ring-structure-focus py-3.5 px-4 appearance-none"
    />
  );
}
