export default function Sidebar({
    sidebarOpen,
    setSidebarOpen,
    title = "Library",
    navComponent: NavComponent,
    footerContent = "⚙️ Settings",
    width = "w-64",
    bgColor = "bg-white",
    borderColor = "border-r",
    textColor = "text-green-700",
    footerTextColor = "text-gray-500",
  }) {
    return (
      <>
        {/* Sidebar */}
        <aside
          className={`fixed md:static top-0 left-0 h-full ${width} ${bgColor} ${borderColor} p-4 flex flex-col justify-between transition-transform duration-300 z-40 ${
            sidebarOpen ? 'translate-x-0' : `-translate-x-full md:translate-x-0`
          }`}
        >
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className={`text-xl font-semibold ${textColor}`}>{title}</h1>
              <button
                className="md:hidden text-gray-600"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                {/* Simple SVG X icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {NavComponent && <NavComponent />}
          </div>
          {/* <div className={`text-sm mt-6 md:mt-0 ${footerTextColor}`}>{footerContent}</div> */}
        </aside>
  
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </>
    );
  }
  