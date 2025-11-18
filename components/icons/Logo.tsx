
import React from 'react';

const Logo: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 220"
      className={`fill-current ${className || ''}`}
      {...props}
    >
      {/* Torii Gate Structure */}
      <path 
        d="M20,40 Q100,15 180,40 L185,35 Q100,5 15,35 Z" 
        fill="currentColor"
      />
      <path 
        d="M25,55 Q100,40 175,55 L175,50 Q100,35 25,50 Z" 
        fill="currentColor"
      />
      
      {/* Pillars */}
      <rect x="45" y="45" width="12" height="90" rx="1" fill="currentColor" />
      <rect x="143" y="45" width="12" height="90" rx="1" fill="currentColor" />
      
      {/* Center Support */}
      <rect x="94" y="55" width="12" height="25" fill="currentColor" />

      {/* Kanji '覚' (Perception/Enlightenment) */}
      <text 
        x="100" 
        y="125" 
        textAnchor="middle" 
        fontSize="50" 
        fontFamily="serif" 
        fontWeight="bold" 
        fill="currentColor"
      >
        覚
      </text>

      {/* Text: meu */}
      <text 
        x="100" 
        y="165" 
        textAnchor="middle" 
        fontSize="20" 
        fontFamily="'Montserrat', sans-serif" 
        fontWeight="400" 
        letterSpacing="3" 
        fill="currentColor"
      >
        meu
      </text>

      {/* Text: DOJO */}
      <text 
        x="100" 
        y="205" 
        textAnchor="middle" 
        fontSize="42" 
        fontFamily="'Montserrat', sans-serif" 
        fontWeight="800" 
        letterSpacing="2" 
        fill="currentColor"
      >
        DOJO
      </text>
    </svg>
  );
};

export default Logo;
