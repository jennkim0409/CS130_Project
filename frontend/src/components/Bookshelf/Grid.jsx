import React from 'react';

export function Grid({children, columns}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridGap: 10,
        padding: 10,
        backgroundColor: '#855328',
        backgroundImage: 'url(https://i.pinimg.com/736x/2c/67/fb/2c67fb43d38ebe75ef01fd0a3367ba46.jpg)'
      }}
    >
      {children}
    </div>
  );
}
