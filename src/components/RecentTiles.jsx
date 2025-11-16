const DataListCard = ({
  title = "Recent Items",
  items = [],
  keyField,
  label,
  subtitle,
  value,
  status
}) => {
  return (
    <div className="bg-card p-4 rounded-xl shadow">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => {
          const rawStatus = item[status] || "";
          const stext = rawStatus.trim().toLowerCase();

          const isCompleted = stext === "completed";
          const isPending = stext === "pending";

          // 🎯 Normalize ANY topic writing pattern:
          // topicwriting, topic-writing, topic writing, topic   writing, etc.
          const topicRegex = /^topic[-\s]?writing\b/i;
          const isTopicWriting = topicRegex.test(rawStatus);

          // ✨ Extract everything AFTER "topic-writing"
          let topicExtra = "";
          if (isTopicWriting) {
            topicExtra = rawStatus.replace(topicRegex, "").trim();
          }

          return (
            <div
              key={item[keyField] ?? index}
              className="flex justify-between items-center border p-3 rounded-lg"
            >
              <div>
                <p className="font-medium">
                  {item[label] ?? `Item ${item[keyField] ?? index}`}
                </p>

                {/* ✨ Show extra text of topic-writing under the value */}
                {isTopicWriting && topicExtra && (
                  <p className="font-semibold text-sm text-foreground">{topicExtra}</p>
                )}

                <p className="text-sm text-gray-500">{item[subtitle] || ""}</p>

                {item[value] && (
                  <p className="font-semibold">{item[value]}</p>
                )}
              </div>

              {/* RIGHT BADGE SECTION */}
              {(isCompleted || isPending || isTopicWriting) && (
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    isCompleted
                      ? "bg-green-100 text-green-600"
                      : isPending
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-cyan-100 text-cyan-600" // topic-writing
                  }`}
                >
                  {isTopicWriting ? "Topic Writing" : rawStatus}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DataListCard;
