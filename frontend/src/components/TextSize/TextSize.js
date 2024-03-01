import React, { useEffect, useState, useRef } from 'react';

function TextSize({ quote, color }) {
  const quote_ref = useRef(null);
  const [fontSize, setFontSize] = useState(10);

  const adjustTextSize = () => {
    if (!quote_ref.current) return;

    const grandparentWidth = quote_ref.current.parentElement.parentElement.offsetWidth;
    const grandparentHeight = 300; // fixed size of pin

    let minFontSize = 5;
    let maxFontSize = 100;
    let currentFontSize = minFontSize;
    let found = false;


    // essentially using binary search to figure out font that would show all text
    while ((minFontSize <= maxFontSize) && !found) {
      currentFontSize = Math.floor((minFontSize + maxFontSize) / 2);
      quote_ref.current.style.fontSize = `${currentFontSize}px`;

      if (quote_ref.current.scrollWidth <= grandparentWidth && quote_ref.current.scrollHeight <= grandparentHeight) {
        minFontSize = currentFontSize + 1;
      } 
      else {
        maxFontSize = currentFontSize - 1;
      }

      if ((minFontSize > maxFontSize) && quote_ref.current.scrollHeight <= grandparentHeight) {
        found = true;
        setFontSize(currentFontSize);
      }
      // if binary search couldn't get height to be smaller than 300, then subtract by 2
      else {
        setFontSize(currentFontSize-2);
      }
    }
  };

  // text size changes on mount
  useEffect(() => {
    adjustTextSize();
  }, [quote]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div ref={quote_ref} style={{ fontSize: `${fontSize}px`, color: color}}>
        {quote}
      </div>
    </div>
  );
}

export default TextSize;
