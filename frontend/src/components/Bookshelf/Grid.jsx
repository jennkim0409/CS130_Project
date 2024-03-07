import React from "react";
import { useDroppable } from "@dnd-kit/core";

export function Grid({children, title, columns}) {
  const { setNodeRef } = useDroppable({
    id: title
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column', // Stack elements vertically
        alignItems: 'center', // Center children horizontally
      }}
    >
      <h3
        style={{
          width: '70%', // Set width to 80% of the container
          textAlign: 'left', // Left-align the text
        }}
      >
        {title}
      </h3>
      <div
        style={{
          display: 'flex',
          alignItems: 'center', // Center vertically
          justifyContent: 'center', // Center horizontally
        }}
      >
        <div
          ref={setNodeRef}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridGap: 10,
            padding: 10,
            backgroundColor: '#F3EDDC',
            // inner shadow
            WebkitBoxShadow: 'inset 0px 5px 5px 0px rgba(0,0,0,0.25)',
            MozBoxShadow: 'inset 0px 5px 5px 0px rgba(0,0,0,0.25)',
            boxShadow: 'inset 0px 5px 5px 0px rgba(0,0,0,0.25)',
            // rounded corners
            WebkitBorderRadius: '5px',
            MozBorderRadius: '5px',
            borderRadius: '5px',
            height: '14.75vw',
            width: '75vw'
          }}
        >
          {children}
        </div>
      </div>
      <br/>
    </div>
  );
}