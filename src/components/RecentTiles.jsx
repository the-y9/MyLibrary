const DataListCard = ({ title = "Recent Items", items = [], keyField, label, subtitle, value, status }) => {
    return (
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-4">{title}</h3>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item[keyField] ?? index}
              className="flex justify-between items-center border p-3 rounded-lg"
            >
              <div>
                <p className="font-medium">{item[label]  ?? `Item ${item[keyField] ?? index}`}</p>
                <p className="text-sm text-gray-500">
                  {item[subtitle] || ""}
                </p>
                {item[value] && <p className="font-semibold">{item[value]}</p>}
              </div>
              {item[status] && (
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    item[status].toLowerCase() === "completed"
                      ? "bg-green-100 text-green-600"
                      : item[status].toLowerCase() === "pending"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item[status]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Example usage:
//   const Example = () => {
//     const orders = [
//       {
//         id: "#1001",
//         label: "Chapter Name",
//         subtitle: "book 1 · Oct 10, 2025",
//         value: "pages · time spent",
//         status: "Completed",
//       },
//       {
//         id: "#1002",
//         label: "Chapter Name",
//         subtitle: "Book 2 · Oct 12, 2025",
//         value: "pages · time spent",
//         status: "Pending",
//       },
//       {
//         id: "#1003",
//         label: "Chapter Name",
//         subtitle: "Book 3 · Oct 13, 2025",
//         value: "pages · time spent",
//         status: "Completed",
//       },
//     ];
  
//     return <DataListCard title="Recent Sessions" items={orders} />;
//   };
  
  export default DataListCard;
  