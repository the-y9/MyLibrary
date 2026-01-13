import { useState } from "react";
import SideBar from "../components/SideBar";
import NavSidebar from "./NavSidebar";
import { Menu } from "lucide-react";
import BookTitleDropdown from "../components/BookTitleDropdown";
import { to24HourFormat } from "../utils/times";

const FORM_ID = process.env.REACT_APP_BS_FORM_ID
const GOOGLE_FORM_URL = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;

const BookSessionPage = () => {
    const [formData, setFormData] = useState({
        email: "",
        bookTitle: "",
        startPage: "",
        endPage: "",
        startHour: "",
        startMinute: "",
        startAmPm: "AM",
        startTime: "",
        endHour: "",
        endMinute: "",
        endAmPm: "AM",
        endTime: "",
        chapter: "",
        chNo: "",
        chName: "",
        type: "",
        notes: "",
      });
      
  const [status, setStatus] = useState(""); // success / error
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [noteOption, setNoteOption] = useState("");
    const [noteText, setNoteText] = useState("");
    
  // Replace these with your actual Google Form entry IDs
  const FIELD_IDS = {
    bookTitle: "entry.1922604194",
    startPage: "entry.256001470",
    endPage: "entry.1571595535",
    startTime: "entry.950741412",
    endTime: "entry.362788696",
    chapter: "entry.84387555",
    type: "entry.1748408352",
    notes: "entry.167198172", // adjust if different
  };

  const handleClear = () => {
    setFormData({
        email: "",
        bookTitle: "",
        startPage: "",
        endPage: "",
        startHour: "",
        startMinute: "",
        startAmPm: "AM",
        startTime: "",
        endHour: "",
        endMinute: "",
        endAmPm: "AM",
        endTime: "",
        chapter: "",
        chNo: "",
        chName: "",
        type: "",
        notes: "",
      });
    setStatus("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
  
      // Auto-compute startTime if any related field changes
      if (["startHour", "startMinute", "startAmPm"].includes(name)) {
        const hour = updated.startHour.padStart(2, "0") || "12";
        const minute = updated.startMinute.padStart(2, "0") || "00";
        const ampm = updated.startAmPm || "AM";
        updated.startTime = to24HourFormat(hour, minute, ampm);
      }
  
      // Auto-compute endTime similarly
      if (["endHour", "endMinute", "endAmPm"].includes(name)) {
        const hour = updated.endHour.padStart(2, "0") || "12";
        const minute = updated.endMinute.padStart(2, "0") || "00";
          const ampm = updated.endAmPm || "AM";
        updated.endTime = to24HourFormat(hour, minute, ampm);
        }
        
        // Auto-comput chapter
        if (["chNo", "chName"].includes(name)) {
            const cno = updated.chNo || "";
            const cname = updated.chName || "";
            updated.chapter = cno && cname ? `${cno} - ${cname}`
                        : cno ? cno
                        : cname ? cname
                        : "";
        }
  
      return updated;
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new URLSearchParams();
    Object.keys(FIELD_IDS).forEach((key) => {
      payload.append(FIELD_IDS[key], formData[key]);
    });

    try {
      await fetch(GOOGLE_FORM_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: payload,
          });
        
        // console.log("Payload as object:", Object.fromEntries(payload.entries()));

      handleClear()
      
      setStatus("success");

      setTimeout(() => setStatus(""), 15000); // hide after 5 seconds
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };



  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} navComponent={NavSidebar} />

      <main className="flex-1 p-4 sm:p-6 space-y-6 w-full">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Book Sessions</h2>
          <button
            className="md:hidden p-2 rounded-lg border text-gray-700 hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
        </div>

        <div className="max-w-2xl mx-auto mt-8 space-y-4">
          {/* Status box */}
          <div
            className={`relative p-4 rounded-md border-l-4 flex items-center transition-all duration-300 min-h-[4rem] ${
              status === "success"
                ? "bg-green-50 border-green-500 dark:bg-green-900 dark:border-green-400 text-green-800 dark:text-green-200"
                : status === "error"
                ? "bg-red-50 border-red-500 dark:bg-red-900 dark:border-red-400 text-red-800 dark:text-red-200"
                : "bg-transparent border-transparent text-transparent"
            }`}
          >
            <span className={`flex-1 transition-opacity duration-500 ${status ? "opacity-100" : "opacity-0"}`}>
              {status === "success"
                ? "Session successfully submitted!"
                : status === "error"
                ? "Oops! Something went wrong. Please try again."
                : ""}
            </span>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <BookTitleDropdown value={formData.bookTitle} onChange={(val) => setFormData({ ...formData, bookTitle: val })} />
                      </div>
                      
                      {/* page numbes */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block font-medium mb-1">Start Page</label>
                <input
                  type="number"
                  name="startPage"
                  value={formData.startPage}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded-md bg-white text-black dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">End Page</label>
                <input
                  type="number"
                  name="endPage"
                  value={formData.endPage}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded-md bg-white text-black dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

                      {/* time */}
            <div className="flex gap-4">
                <div className="flex-1">
                <label className="block font-medium mb-1">Start Time</label>
                <div className="flex gap-2">
                    <input
                    type="number"
                    name="startHour"
                    value={formData.startHour}
                                                    onChange={handleChange}

                    min="1"
                    max="12"
                    placeholder="HH"
                    className="w-16 p-2 border rounded-md dark:bg-gray-800 dark:text-white"
                    />
                    <span>:</span>
                    <input
                    type="number"
                    name="startMinute"
                    value={formData.startMinute}
                    onChange={handleChange}
                    min="0"
                    max="59"
                    placeholder="MM"
                    className="w-16 p-2 border rounded-md dark:bg-gray-800 dark:text-white"
                    />
                    <select
                    name="startAmPm"
                    value={formData.startAmPm}
                    onChange={handleChange}
                    className="p-2 border rounded-md dark:bg-gray-800 dark:text-white"
                    >
                    <option>AM</option>
                    <option>PM</option>
                    </select>
                </div>
                </div>
                
                <div className="flex-1">
                <label className="block font-medium mb-1">End Time</label>
                <div className="flex gap-2">
                <input
                    type="number"
                    name="endHour"
                    value={formData.endHour}
                    onChange={handleChange}
                    min="1"
                    max="12"
                    placeholder="HH"
                    className="w-16 p-2 border rounded-md dark:bg-gray-800 dark:text-white"
                />
                <span>:</span>
                <input
                    type="number"
                    name="endMinute"
                    value={formData.endMinute}
                    onChange={handleChange}
                    min="0"
                    max="59"
                    placeholder="MM"
                    className="w-16 p-2 border rounded-md dark:bg-gray-800 dark:text-white"
                />
                <select
                    name="endAmPm"
                    value={formData.endAmPm}
                    onChange={handleChange}
                    className="p-2 border rounded-md dark:bg-gray-800 dark:text-white"
                >
                    <option>AM</option>
                    <option>PM</option>
                </select>
                </div>
                </div>
            </div>
                      
                      {/* chapter */}
            <div>
              <label className="block font-medium mb-1">Chapter Name / #</label>
                          <div className="flex gap-2">
                          <input type="number"
                name="chNo"
                value={formData.chNo}
                onChange={handleChange}
                className="w-20 p-2 mt-1 border rounded-md bg-white text-black dark:bg-gray-800 dark:text-white"
                              />
              <input type="text" disabled value="—" className="w-8 p-2 mt-1 rounded-md"/>


                          <input
                type="text"
                name="chName"
                value={formData.chName}
                onChange={handleChange}
                className="w-full p-2 mt-1 border rounded-md bg-white text-black dark:bg-gray-800 dark:text-white"
                              />
                          </div>
                          
            </div>

                      {/* Type */}
            <div>
              <label className="block font-medium mb-1">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                placeholder = "Select Type"
                className="w-full p-2 mt-1 border rounded-md bg-white text-black dark:bg-gray-800 dark:text-white"
                          >
                <option>Select</option>
                              
                <option value="Reading">Reading</option>
                <option value="Note-Making">Note-Making</option>
              </select>
            </div>

                      {/* notes */}
                    <div>
                        <label className="block font-medium mb-2">Notes / Highlights</label>

                        <div className="flex flex-wrap gap-2">
                            {["Completed", "Pending", "Topic-Writing", "Other"].map((option) => (
                            <button key={option} type="button" onClick={() => {
                                    setNoteOption(option);

                                    // Clear text when switching option
                                    if (option !== "Topic-Writing" && option !== "Other") {
                                    setNoteText("");
                                    setFormData((prev) => ({ ...prev, notes: option }));
                                    }
                                }}
                                className={`px-3 py-1 rounded border transition ${ noteOption === option
                                    ? "bg-yellow-600 text-white border-yellow-600"
                                    : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-900 "
                                }`}
                                >
                                {option}
                            </button>
                            ))}
                        </div>

                        {/* Textarea appears only for Topic-Writing / Other */}
                        {(noteOption === "Topic-Writing" || noteOption === "Other") && (
                        <textarea
                            className="w-full mt-3 p-2 border rounded-md bg-white dark:bg-gray-800"
                            rows={3}
                            placeholder={`Enter details for ${noteOption.toLowerCase()}...`}
                            value={noteText}
                            onChange={(e) => {
                            const text = e.target.value;
                            setNoteText(text);

                            setFormData((prev) => ({
                                ...prev,
                                notes: `${noteOption}\n${text}`,
                            }));
                            }}
                        />
                        )}
                    </div>



            <div className="flex gap-4 mt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Submit
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Clear
                          </button>
                          
                          <div
            className={`relative p-4 flex items-center transition-all duration-300 min-h-[4rem] ${
              status === "success" ? "text-green-800 dark:text-green-200"
                : status === "error" ? "text-red-800 dark:text-red-200"
                : "text-transparent"
            }`}
          >
            <span className={`flex-1 transition-opacity duration-500 ${status ? "opacity-100" : "opacity-0"}`}>
              {status === "success" ? "✔" : status === "error" ? "✘" : ""}
            </span>
                              
          </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default BookSessionPage;
