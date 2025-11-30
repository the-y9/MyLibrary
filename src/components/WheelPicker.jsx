import  { useState, useEffect, useRef, useCallback } from "react";

// --- Utility Functions ---
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const mod = (n, m) => ((n % m) + m) % m;

// --- WheelPicker Component ---
const WheelPicker = ({
  items = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0")),
  visibleItems = 5, // Best if odd, but math handles even now
  highlightColor = "#6366f1", // Indigo-500
  highlightBackground = "#e0e7ff", // Indigo-100
  onSelect = () => {},
  initialValue = "00"
}) => {
  // We triple the items to create the illusion of infinity
  const LOOP_ITEMS = [...items, ...items, ...items];
  const BASE_LENGTH = items.length;
  
  // Find the index of the initial value in the middle set
  const initialIndexInBase = items.indexOf(initialValue);
  const START_INDEX = BASE_LENGTH + (initialIndexInBase !== -1 ? initialIndexInBase : 0);

  const [selectedIndex, setSelectedIndex] = useState(START_INDEX);
  const [itemWidth, setItemWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const scrollRef = useRef(null);
  const containerRef = useRef(null);
  const observerRef = useRef(null);

  // 1. Precise Sizing Logic
  // We use ResizeObserver to get exact sub-pixel measurements of the inner container
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // Use contentBoxSize or contentRect to ignore borders/padding for calculation
        const width = entry.contentRect.width;
        setContainerWidth(width);
        setItemWidth(width / visibleItems);
      }
    });

    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [visibleItems]);

  // 2. Padding Calculation
  // This ensures the selected item is ALWAYS dead center, regardless of item count
  const paddingWidth = containerWidth / 2 - itemWidth / 2;

  // 3. Initial Scroll Positioning
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || itemWidth === 0) return;
    
    // Immediate scroll without animation for setup
    container.scrollLeft = START_INDEX * itemWidth;
  }, [itemWidth, START_INDEX]);

  // 4. Scroll Handler with Infinite Logic
  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container || itemWidth === 0) return;

    const currentScroll = container.scrollLeft;
    const index = Math.round(currentScroll / itemWidth);
    
    setSelectedIndex(index);

    // Infinite Scroll Jumping
    // If we scroll too far left (into the first set), jump to middle set
    if (index < BASE_LENGTH * 0.5) {
      const adjustment = BASE_LENGTH * itemWidth;
      container.scrollLeft = currentScroll + adjustment;
    } 
    // If we scroll too far right (into the third set), jump back to middle set
    else if (index >= BASE_LENGTH * 2.5) {
      const adjustment = BASE_LENGTH * itemWidth;
      container.scrollLeft = currentScroll - adjustment;
    }
  }, [BASE_LENGTH, itemWidth]);

  // 5. Snapping Logic
  const snapToItem = useCallback((targetIndex) => {
    const container = scrollRef.current;
    if (!container || itemWidth === 0) return;

    const finalIndex = targetIndex !== undefined ? targetIndex : selectedIndex;
    
    container.scrollTo({
      left: finalIndex * itemWidth,
      behavior: "smooth",
    });

    // Notify parent of actual value
    const actualValue = LOOP_ITEMS[finalIndex];
    if(actualValue) onSelect(actualValue);

  }, [selectedIndex, itemWidth, LOOP_ITEMS, onSelect]);

  // Handle Drag State
  const handleDragEnd = () => {
    setIsDragging(false);
    snapToItem();
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Outer Frame */}
      <div 
        className="relative h-10 bg-card border border-gray-200 rounded-xl overflow-hidden shadow-sm select-none"
        // This ref is observed by ResizeObserver
        ref={containerRef} 
      >
        
        {/* CENTER HIGHLIGHT (Absolute) */}
        {/* We place this behind the text but above the background */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none z-0"
          style={{
            width: itemWidth,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: highlightBackground,
            borderLeft: `2px solid ${highlightColor}`,
            borderRight: `2px solid ${highlightColor}`,
          }}
        />

        {/* FADE MASKS (Optional: Adds 3D depth) */}
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* SCROLL CONTAINER */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={handleDragEnd}
          onMouseLeave={() => {
            if (isDragging) handleDragEnd();
          }}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={handleDragEnd}
          className="flex h-full items-center overflow-x-auto no-scrollbar snap-x snap-mandatory z-20 relative"
          style={{ 
            cursor: isDragging ? "grabbing" : "grab",
            // Smooth scrolling on iOS
            WebkitOverflowScrolling: "touch" 
          }}
        >
          {/* Left Padding Spacer */}
          <div style={{ width: paddingWidth, flexShrink: 0 }} />

          {/* Items */}
          {LOOP_ITEMS.map((item, index) => {
            // Visual Math for opacity/scale
            const distance = Math.abs(index - selectedIndex);
            const isSelected = index === selectedIndex;
            
            // Calculate opacity/scale based on distance from center
            const opacity = clamp(1 - distance * 0.4, 0.3, 1);
            const scale = clamp(1 - distance * 0.15, 0.75, 1);

            return (
              <div
                key={`${item}-${index}`}
                onClick={() => {
                   // Allow clicking side items to snap to them
                   snapToItem(index);
                }}
                className="flex-shrink-0 flex items-center justify-center  font-bold text-slate-800 transition-transform duration-75 snap-center"
                style={{
                  width: itemWidth,
                  height: "100%",
                  opacity,
                  transform: `scale(${scale})`,
                    color: isSelected ? highlightColor : "#6B7280",
                  fontSize: isSelected ? "1rem" : "0.75rem"
                }}
              >
                <span className="text-center justify-center text-grey-500">{item}</span>
              </div>
            );
          })}

          {/* Right Padding Spacer */}
          <div style={{ width: paddingWidth, flexShrink: 0 }} />
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};



export default WheelPicker;