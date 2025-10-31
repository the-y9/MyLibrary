const GenericStatsCards = ({ stats = [] }) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-xl shadow flex flex-col justify-between"
          >
            <p className="text-sm text-gray-500">{item.label}</p>
            <h3 className="text-2xl font-bold">{item.value}</h3>
  
            {item.change && (
              <p
                className={`text-sm ${
                  item.change.startsWith("-")
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {item.change}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  export default GenericStatsCards;
  