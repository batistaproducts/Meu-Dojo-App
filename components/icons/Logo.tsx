
import React from 'react';

const Logo: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 300"
      className={`fill-current ${className || ''}`}
      {...props}
    >
      {/* Top Lintel (Kasagi) - Curved */}
      <path d="M20,60 Q150,30 280,60 L285,50 Q150,15 15,50 Z" />
      
      {/* Second Lintel (Nuki) - Straight with extensions */}
      <rect x="40" y="85" width="220" height="15" rx="2" />
      
      {/* Pillars (Hashira) - Slightly angled or straight */}
      <rect x="75" y="70" width="20" height="140" />
      <rect x="205" y="70" width="20" height="140" />
      
      {/* Center Strut (Gakuzuka) */}
      <rect x="145" y="85" width="10" height="30" />

      {/* Kanji '首' (Kubi/Shou) centered in the gate */}
      <text 
        x="150" 
        y="175" 
        textAnchor="middle" 
        fontSize="75" 
        fontFamily="serif" 
        fontWeight="bold"
      >
        首
      </text>

      {/* Text: meu */}
      <text 
        x="150" 
        y="235" 
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
        y="280" 
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
