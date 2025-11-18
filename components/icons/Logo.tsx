
import React from 'react';

const Logo: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 300"
      className={`fill-current ${className || ''}`}
      {...props}
    >
      {/* Top Lintel (Kasagi) */}
      <path d="M15,50 Q150,20 285,50 L290,40 Q150,5 10,40 Z" />
      
      {/* Second Lintel (Nuki) */}
      <rect x="45" y="65" width="210" height="14" rx="1" />
      
      {/* Pillars (Hashira) */}
      <rect x="85" y="55" width="18" height="135" />
      <rect x="197" y="55" width="18" height="135" />
      
      {/* Center Strut (Gakuzuka) */}
      <rect x="146" y="65" width="8" height="25" />

      {/* Kanji '首' (Kubi/Shou - Head/Leader) */}
      <text 
        x="150" 
        y="155" 
        textAnchor="middle" 
        fontSize="60" 
        fontFamily="serif" 
        fontWeight="bold"
      >
        首
      </text>

      {/* Text: meu */}
      <text 
        x="150" 
        y="215" 
        textAnchor="middle" 
        fontSize="24" 
        fontFamily="'Montserrat', sans-serif" 
        fontWeight="400" 
        letterSpacing="0.1em"
      >
        meu
      </text>

      {/* Text: DOJO */}
      <text 
        x="150" 
        y="260" 
        textAnchor="middle" 
        fontSize="54" 
        fontFamily="'Montserrat', sans-serif" 
        fontWeight="800" 
        letterSpacing="0.05em"
      >
        DOJO
      </text>
    </svg>
  );
};

export default Logo;
