export interface FormState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export const initialFormState: FormState = { ok: false };
