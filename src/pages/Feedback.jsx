import { useState } from "react";

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/1yWP2ChQiXsd9beEIpmzS6S_KudyeePZdcrLvXDLA-h8/formResponse";

const FeedbackPage = () => {
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState(""); // success or error

  // Replace these with your actual field IDs from Google Form
  const FIELD_IDS = {
    feedback: "entry.895061267",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build the payload
    const payload = new URLSearchParams({
      [FIELD_IDS.feedback]: feedback,
    });

    try {
      await fetch(GOOGLE_FORM_URL, {
        method: "POST",
        mode: "no-cors", // required for Google Forms
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: payload,
      });

      // Reset form and show success
      setFeedback("");
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: "1rem" }}>
      <h2>Share Your UI Feedback / Ideas</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Feedback <span style={{ color: "red" }}>*</span>
            <textArea
              type="text"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
                          required
                          rows={4}
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
            />
          </label>
        </div>


        <button
          type="submit"
          style={{ padding: "0.75rem 1.5rem", backgroundColor: "#4CAF50",
            color: "white", border: "none", cursor: "pointer", }} > Submit Feedback </button>
      </form>

      {status === "success" && (
        <p style={{ color: "green", marginTop: "1rem" }}>
          Thank you! Your feedback has been submitted.
        </p>
      )}
      {status === "error" && (
        <p style={{ color: "red", marginTop: "1rem" }}>
          Oops! Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
};

export default FeedbackPage;
