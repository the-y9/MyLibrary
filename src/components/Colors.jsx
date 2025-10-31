function getDistinctColors(count) {
    const colors = [];
    const goldenRatioConjugate = 0.618033988749895; // avoids clustering similar hues
    let h = Math.random(); // start at random hue
  
    for (let i = 0; i < count; i++) {
      h += goldenRatioConjugate;
      h %= 1; // keep in [0,1]
      const hue = Math.round(h * 360);
      colors.push(`hsl(${hue}, 70%, 50%)`);
    }
  
    return colors;
  }
  
  const COLORS = getDistinctColors(20);
  export default COLORS;
  