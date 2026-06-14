import "./Input.css";

export default function Input({
  id,
  label,
  name,
  value,
  type = "text",
  placeholder = "",
  onChange,
  onBlur,
  onFocus,
  onInput,
  onInvalid,
  error,
  showError,
  autoComplete,
  required,
  minLength,
  ...rest
}) {
  const errorId = `${id}-error`;
  const invalid = Boolean(showError && error);
  const className = "";

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`formInput ${invalid ? "isInvalid" : ""}`}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onInput={onInput}
        onInvalid={onInvalid}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        aria-invalid={invalid ? "true" : "false"}
        aria-describedby={invalid ? errorId : undefined}
        {...rest}
      />
      {invalid ? (
        <p className="formError" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
