import { Button } from "../../../atoms";
import "./SummarySection.css";

const SummarySection = ({
  title,
  selected,
  summaryContent,
  isExpanded,
  onToggle,
  children,
}) => {
  const handleToggle = (e) => {
    // Evitar toggle si se hace click en el botón
    if (e.target.tagName === "BUTTON" || e.target.closest("button")) {
      return;
    }
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <div
      className={`summary-section ${isExpanded ? "expanded" : ""}`}
      data-testid="summary-section"
    >
      <div
        className="summary-header"
        onClick={handleToggle}
        data-testid="summary-header"
      >
        <div className="summary-title">
          <h3>{title}</h3>
          {!isExpanded && selected && (
            <div className="summary-content">
              {summaryContent}
              <Button
                variant="text"
                size="small"
                onClick={onToggle}
                data-testid="change-btn"
              >
                Cambiar
              </Button>
            </div>
          )}
        </div>
        {!isExpanded && selected && <div className="summary-badge">✓</div>}
      </div>

      {isExpanded && <div className="summary-expanded-content">{children}</div>}
    </div>
  );
};

export default SummarySection;
