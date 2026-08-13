import { useRef, ChangeEvent, KeyboardEvent, FocusEvent } from "react";

type PhoneInputProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void; // <-- real event
  name?: string;
  // ...other props
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>

export default function PhoneInput({ value, onChange, name = "phone", ...props }: PhoneInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    val = val.replace(/[^0-9]/g, "");

    if (!val.startsWith("254")) {
      val = "254" + val;
    }
    val = val.slice(0, 12);

    const newValue = "+" + val;

    // Create a synthetic event with the new value so parent gets it
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value: newValue,
        name: e.target.name
      }
    } as ChangeEvent<HTMLInputElement>;

    onChange(newEvent); // <-- pass event up
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const cursorPos = target.selectionStart ?? 0;
    if ((e.key === "Backspace" && cursorPos <= 4) || 
        (e.key === "Delete" && cursorPos < 4)) {
      e.preventDefault();
    }
    if ((e.key === "ArrowLeft" && cursorPos <= 4) || e.key === "Home") {
      e.preventDefault();
      inputRef.current?.setSelectionRange(4, 4);
    }
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    if ((e.target.selectionStart ?? 0) < 4) {
      inputRef.current?.setSelectionRange(4, 4);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type="tel"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder="+2547XXXXXXXX"
        maxLength={13}
        {...props}
      />
    </div>
  );
}
