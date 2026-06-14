import "./ErrorMessage.css";

export default function ErrorMessage({ children, ...rest }) {
  return (
    <div className="error-message" {...rest}>
      {children}
    </div>
  );
}
