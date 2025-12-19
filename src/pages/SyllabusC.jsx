import React, { useState } from "react";

// Colors for gradient
const green = "#008104ff";
const red = "#b10c00ff";

// Function to generate color based on progress % (0=red, 100=green)
const getProgressColor = (percent) => {
  if (percent === 100) return green;
  if (percent === 0) return red;

  // gradient from red → yellow → green
  if (percent <= 50) {
    const ggreen = Math.round((percent / 50) * 255);
    return `rgb(244, ${ggreen}, 54)`;
  } else {
    const gred = Math.round(244 - ((percent - 50) / 50) * 244);
    return `rgb(${gred}, 255, 54)`;
  }
};

// Calculate readable text color based on background brightness
const getTextColor = (bgColor) => {
  const rgb = bgColor.match(/\d+/g); // extract numbers
  if (!rgb) return "#fff";
  const brightness =
    parseInt(rgb[0]) * 299 +
    parseInt(rgb[1]) * 587 +
    parseInt(rgb[2]) * 114;
  return brightness / 1000 > 125 ? "#374151" : "#fff";
};

// Recursive collapsible item with progress
const CollapsibleItem = ({ label, children, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Count completed vs total
  const countStatus = (items) => {
    let completed = 0;
    let total = 0;
    items.forEach((item) => {
      if (item.children) {
        const [c, t] = countStatus(item.children);
        completed += c;
        total += t;
      } else {
        total += 1;
        if (item.status === "✔") completed += 1;
      }
    });
    return [completed, total];
  };

  let completed = 0;
  let total = 0;
  if (items) [completed, total] = countStatus(items);

  const progress = total > 0 ? Math.round((completed / total) * 100) : null;
  const bgColor = progress !== null ? getProgressColor(progress) : "#f0f0f0";
  const textColor = getTextColor(bgColor);

  return (
    <div className="ml-2 mt-2">
      <div
        className="cursor-pointer font-bold px-2 py-1 rounded flex justify-between items-center transition-colors duration-300"
        style={{ backgroundColor: bgColor, color: textColor }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{isOpen ? "▼ " : "▶ "} {label}</span>
        {progress !== null && <span className="text-sm">{progress}%</span>}
      </div>
      {isOpen && <div className="ml-4">{children}</div>}
    </div>
  );
};

// Main collapsible component
const SyllabusCollapsible = ({ data }) => {
  // Group flat data into hierarchy
  const groupData = (data) => {
    const stages = {};
    data.forEach((row) => {
      const { stage, paper, section, subject, topic, status, revision, pyqs, notes } = row;
      if (!stages[stage]) stages[stage] = {};
      if (!stages[stage][paper]) stages[stage][paper] = {};
      if (!stages[stage][paper][section]) stages[stage][paper][section] = {};
      if (!stages[stage][paper][section][subject])
        stages[stage][paper][section][subject] = [];
      stages[stage][paper][section][subject].push({ topic, status, revision, pyqs, notes });
    });
    return stages;
  };

  // Build tree for recursive rendering
  const buildTree = (grouped) =>
    Object.entries(grouped).map(([stageName, papers]) => ({
      label: `${stageName}`,
      children: Object.entries(papers).map(([paperName, sections]) => ({
        label: `${paperName}`,
        children: Object.entries(sections).map(([sectionName, subjects]) => ({
          label: `${sectionName}`,
          children: Object.entries(subjects).map(([subjectName, topics]) => ({
            label: `${subjectName}`,
            children: topics.map((t) => ({ ...t })),
          })),
        })),
      })),
    }));

  const grouped = groupData(data);
  const tree = buildTree(grouped);

  // Recursive render
  const renderTree = (nodes) =>
    nodes.map((node, idx) => (
      <CollapsibleItem key={idx} label={node.label} items={node.children}>
        {node.children
          ? node.children[0] && node.children[0].topic
            ? node.children.map((t, i) => {
                const bg = t.status === "✔" ? green : red;
                return (
                  <div
                    key={i}
                    className="p-2 mt-1 rounded"
                    style={{ backgroundColor: bg, color: getTextColor(bg) }}
                  >
                    <strong>{t.topic}</strong> | Revision: {t.revision} | PYQs: {t.pyqs} | Notes: <em>{t.notes}</em>
                  </div>
                );
              })
            : renderTree(node.children)
          : null}
      </CollapsibleItem>
    ));

  return <div className="p-5">{renderTree(tree)}</div>;
};

export default SyllabusCollapsible;
