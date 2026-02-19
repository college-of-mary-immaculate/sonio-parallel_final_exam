import { SendIcon } from "./BallotIcons";

export default function BallotSubmitBar({ castCount, posCount, submitting, onSubmit }) {
  return (
    <div className="bp-submit-bar">
      <span className="bp-submit-summary">
        {castCount === 0 ? (
          "No selections yet — you can still submit a blank ballot."
        ) : (
          <>
            <strong>{castCount}</strong> vote{castCount !== 1 ? "s" : ""} across{" "}
            <strong>{posCount}</strong> position{posCount !== 1 ? "s" : ""}
          </>
        )}
      </span>

      <button
        className="bp-submit-btn"
        onClick={onSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <>
            <div
              className="bp-spinner"
              style={{ width: 16, height: 16, borderWidth: "1.5px" }}
            />
            Submitting…
          </>
        ) : (
          <>
            <SendIcon />
            Submit Ballot
          </>
        )}
      </button>
    </div>
  );
}