
  
import { useContext, useState } from "react";
import { SyllabusDataProvider, SyllabusDataContext } from "../context/SyllabusDataContext";
import SideBar from "../components/SideBar";
import NavSidebar from "./NavSidebar";
import { Menu } from "lucide-react";
import SyllabusTable from "./SyllabusTable";
import SyllabusCollapsible from "./SyllabusC"

function Syllabus() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [interval, setInterval] = useState("daily");

  const dateForm = undefined; // optional locale

  return (
    <SyllabusDataProvider>
      <SyllabusPage
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        interval={interval}
        dateForm={dateForm}
        setInterval={setInterval}
      />
    </SyllabusDataProvider>
  );
}

const SyllabusPage = ({sidebarOpen, setSidebarOpen}) => {
    const { syllabus, refresh, setRefresh } = useContext(SyllabusDataContext);
    const [sectionFilter, setsectionFilter] = useState("");
    
//   console.log(syllabus);

  if (!syllabus) return <h2>Loading syllabus...</h2>;

  const { headers, rows } = syllabus;

    return (
    <div className="flex min-h-screen bg-background">
      <SideBar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navComponent={NavSidebar}
            />
            <main className="flex-1 p-4 sm:p-6 space-y-6 w-full">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Syllabus Tracker</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="md:hidden p-2 rounded-lg border text-gray-700 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
                            <Menu size={22} />
                      </button>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700" onClick={() => setRefresh(c => c + 1)}>
                        {refresh === 0 ? "Refresh Data" : `Refreshed ${refresh} time${refresh === 1 ? '' : 's'}`}
                       </button>
                      
                    </div>
                </div>
                {/* <SyllabusTable headers={headers} rows={rows} /> */}
                <SyllabusCollapsible data={rows.map((r) => ({
          stage: r.data[0],
          paper: r.data[1],
          section: r.data[2],
          subject: r.data[3],
          topic: r.data[4],
          status: r.data[5],
          revision: r.data[6],
          pyqs: r.data[7],
          notes: r.data[8]
        }))} />

            </main>
        </div>
    );
};

export default Syllabus;