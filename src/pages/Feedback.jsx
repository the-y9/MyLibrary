import { useState } from "react";
import SideBar from '../components/SideBar';
import NavSidebar from "./NavSidebar";
import { Menu } from 'lucide-react';

const FORM_ID = process.env.REACT_APP_FB_FORM_ID
const GOOGLE_FORM_URL = `https://docs.google.com/forms/d/${FORM_ID}/formResponse`;

const FeedbackPage = () => {
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState(""); // success or error
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Replace these with your actual field IDs from Google Form
  const FIELD_IDS = {
    feedback: "entry.895061267",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return; // extra safety
    setIsSubmitting(true);

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
      setIsSubmitting(false); // re-enable after success

    } catch (err) {
      console.error(err);
      setStatus("error");
      setIsSubmitting(false); // re-enable after success

    }
  };

  return (<>
    
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
         <SideBar sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                  navComponent={NavSidebar} />
    
          {/* Main content */}
          <main className="flex-1 p-4 sm:p-6 space-y-6 w-full">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">Feedback / Ideas</h2>
                
    
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="md:hidden p-2 rounded-lg border text-gray-700 hover:bg-gray-100"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu size={22} />
                </button>
              </div>
            </div>
            <div className="max-w-2xl mx-auto mt-8 space-y-4">
           

  {/* Feedback form */}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>
            Feedback <span style={{ color: "red" }}>*</span>
            <textarea
              type="text"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
              rows={5}
              className="w-full p-2 mt-1 border rounded-md bg-white text-black dark:bg-gray-800 dark:text-white"
              placeholder="Enter your feedback here..."
            />
          </label>
        </div>
        <div className="flex justify-start gap-4">
            <button className={`bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 
                  ${isSubmitting ? "opacity-50 cursor-not-allowed hover:bg-green-600" : ""}`}
            type="submit"
            disabled={isSubmitting}
            aria-disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
            </button>
        
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
             type="reset" >
              Clear
              </button>
            </div>
            

        </form>

        {/* Status box */}
        <div className={`relative p-4 rounded-md border-l-4 flex items-center transition-all duration-300 min-h-[3rem] ${
            status === "success"
              ? "bg-green-50 border-green-500 dark:bg-green-900 dark:border-green-400 text-green-800 dark:text-green-200"
              : status === "error"
              ? "bg-red-50 border-red-500 dark:bg-red-900 dark:border-red-400 text-red-800 dark:text-red-200"
              : "bg-transparent border-transparent text-transparent"
          }`}
        >
          {/* Message */}
          <span className="flex-1">
            {status === "success" &&
              "Thank you! Your feedback has been submitted."}
            {status === "error" &&
              "Oops! Something went wrong. Please try again."}
          </span>

          {/* Dismiss button */}
          {status && (
            <button
              type="button"
              className="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 font-bold"
              onClick={() => setStatus("")}
            >
              ×
            </button>
          )}
          </div>
          
    </div>
      </main>
    </div>
    </>);
};

export default FeedbackPage;
