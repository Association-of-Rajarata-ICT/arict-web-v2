/** Clears editable fields while preserving hidden record IDs and form tokens. */
export function clearForm(form: HTMLFormElement) {
  // Notify stateful controls (image uploads, title/slug fields) before clearing.
  form.reset();

  for (const control of Array.from(form.elements)) {
    if (control instanceof HTMLInputElement) {
      if (["hidden", "submit", "button", "reset", "image"].includes(control.type)) continue;
      if (control.type === "checkbox" || control.type === "radio") control.checked = false;
      else control.value = "";
    } else if (control instanceof HTMLTextAreaElement) {
      control.value = "";
    } else if (control instanceof HTMLSelectElement) {
      control.value = "";
    }
  }
}
