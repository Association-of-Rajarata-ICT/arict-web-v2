"use client";

import { useEffect, useRef, useState } from "react";
import { OTHER_OPTION, OTHER_TEXT_MAX_LENGTH } from "@/lib/form-options";
import { Field, Input, Select } from "./form";

/** A choice field that submits a separate, bounded value when Other is selected. */
export function SelectWithOther({
  name,
  label,
  options,
  defaultValue = "",
  error,
  otherError,
}: {
  name: string;
  label: string;
  options: readonly string[];
  defaultValue?: string;
  error?: string;
  otherError?: string;
}) {
  const customDefault = defaultValue !== "" && !options.includes(defaultValue);
  const [selected, setSelected] = useState(customDefault ? OTHER_OPTION : defaultValue);
  const [other, setOther] = useState(customDefault ? defaultValue : "");
  const containerRef = useRef<HTMLDivElement>(null);
  const otherName = `${name}Other`;
  const choices = [...new Set(options.filter((option) => option !== OTHER_OPTION)), OTHER_OPTION];

  useEffect(() => {
    const form = containerRef.current?.closest("form");
    const clear = () => {
      setSelected("");
      setOther("");
    };
    form?.addEventListener("reset", clear);
    return () => form?.removeEventListener("reset", clear);
  }, []);

  return (
    <div ref={containerRef} className="space-y-3">
      <Field label={label} name={name} required error={error}>
        <Select name={name} value={selected} onChange={(event) => setSelected(event.target.value)} required error={error}>
          <option value="" disabled>Choose a category</option>
          {choices.map((choice) => <option key={choice} value={choice}>{choice}</option>)}
        </Select>
      </Field>
      {selected === OTHER_OPTION && (
        <Field label="Please specify" name={otherName} required error={otherError}
          hint={`${other.length}/${OTHER_TEXT_MAX_LENGTH} characters`}>
          <Input name={otherName} value={other} onChange={(event) => setOther(event.target.value)}
            required maxLength={OTHER_TEXT_MAX_LENGTH} error={otherError} hasHint placeholder="Enter your category" />
        </Field>
      )}
    </div>
  );
}
