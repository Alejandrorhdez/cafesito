import { useMemo, useReducer } from "react";

const FORM = {
  CHANGE: "FORM_CHANGE",
  BLUR: "FORM_BLUR",
  SET_ERRORS: "FORM_SET_ERRORS",
  MARK_TOUCHED: "FORM_MARK_TOUCHED",
  SUBMIT_START: "FORM_SUBMIT_START",
  SUBMIT_END: "FORM_SUBMIT_END",
  SET_SUBMIT_ERROR: "FORM_SET_SUBMIT_ERROR",
  RESET: "FORM_RESET",
};

function setIn(obj, path, value) {
  const keys = path.split(".");
  const clone = structuredClone(obj);
  let cur = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]]) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
  return clone;
}

function getIn(obj, path) {
  return path.split(".").reduce((acc, k) => (acc ? acc[k] : undefined), obj);
}

function formReducer(state, action) {
  switch (action.type) {
    case FORM.CHANGE: {
      const { name, value } = action.payload;
      return { ...state, values: setIn(state.values, name, value) };
    }
    case FORM.BLUR: {
      const { name } = action.payload;
      return { ...state, touched: setIn(state.touched, name, true) };
    }
    case FORM.SET_ERRORS:
      return { ...state, errors: action.payload };
    case FORM.MARK_TOUCHED:
      return { ...state, touched: action.payload };
    case FORM.SUBMIT_START:
      return { ...state, isSubmitting: true, submitError: "" };
    case FORM.SUBMIT_END:
      return { ...state, isSubmitting: false };
    case FORM.RESET:
      return action.payload;
    case FORM.SET_SUBMIT_ERROR:
      return { ...state, submitError: action.payload };
    default:
      return state;
  }
}

const initTouched = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      v && typeof v === "object" && !Array.isArray(v) ? initTouched(v) : false,
    ]),
  );

export function useFormReducer({ initialValues, validate }) {
  const initialState = useMemo(
    () => ({
      values: initialValues,
      touched: structuredClone(initialValues),
      errors: {},
      isSubmitting: false,
      submitError: "",
    }),
    [initialValues],
  );

  const seed = useMemo(
    () => ({ ...initialState, touched: initTouched(initialValues) }),
    [initialState, initialValues],
  );

  const [state, dispatch] = useReducer(formReducer, seed);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;
    dispatch({ type: FORM.CHANGE, payload: { name, value: finalValue } });
  };

  const onBlur = (e) => {
    const { name } = e.target;
    dispatch({ type: FORM.BLUR, payload: { name } });
  };

  const runValidation = () => {
    const errors = validate(state.values);
    dispatch({ type: FORM.SET_ERRORS, payload: errors });
    return errors;
  };

  const getFieldError = (name) => getIn(state.errors, name);

  const isTouched = (name) => Boolean(getIn(state.touched, name));

  const markAllTouched = () => {
    const mark = (obj) =>
      Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [
          k,
          v && typeof v === "object" && !Array.isArray(v) ? mark(v) : true,
        ]),
      );
    dispatch({ type: FORM.MARK_TOUCHED, payload: mark(state.touched) });
  };

  const handleSubmit = async (onSubmit) => {
    markAllTouched();
    const errors = runValidation();

    if (Object.keys(errors).length === 0) {
      dispatch({ type: FORM.SUBMIT_START });
      try {
        await onSubmit(state.values);
        dispatch({ type: FORM.SUBMIT_END });
      } catch (error) {
        dispatch({ type: FORM.SET_SUBMIT_ERROR, payload: error.message });
        dispatch({ type: FORM.SUBMIT_END });
      }
    }
  };

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    submitError: state.submitError,
    onChange,
    onBlur,
    runValidation,
    getFieldError,
    isTouched,
    markAllTouched,
    handleSubmit,
    setSubmitting: (v) =>
      dispatch({ type: v ? FORM.SUBMIT_START : FORM.SUBMIT_END }),
    setSubmitError: (msg) =>
      dispatch({ type: FORM.SET_SUBMIT_ERROR, payload: msg }),
    reset: () => dispatch({ type: FORM.RESET, payload: seed }),
  };
}
