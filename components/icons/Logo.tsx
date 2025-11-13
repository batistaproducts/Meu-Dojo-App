import React from 'react';

const Logo: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 285 80" // Width:(4*60)+(3*15)=285, Height:15(MEU)+5(space)+60(JOJO)=80
      className={`dark:invert ${className || ''}`}
      {...props}
    >
      <g fill="currentColor" id="meu">
        {/* M */}
        <rect x="0" y="0" width="3" height="15" />
        <rect x="0" y="0" width="13" height="3" />
        <rect x="5" y="0" width="3" height="15" />
        <rect x="10" y="0" width="3" height="15" />
        {/* E */}
        <rect x="18" y="0" width="3" height="15" />
        <rect x="18" y="0" width="10" height="3" />
        <rect x="18" y="6" width="8" height="3" />
        <rect x="18" y="12" width="10" height="3" />
        {/* U */}
        <rect x="32" y="0" width="3" height="15" />
        <rect x="32" y="12" width="10" height="3" />
        <rect x="39" y="0" width="3" height="15" />
      </g>
      
      <g transform="translate(0, 20)" fill="currentColor" id="jojo">
        {/* J1 @ x=0 */}
        <rect x="0" y="15" width="15" height="45" /> {/* Left bar (lower part) */}
        <rect x="0" y="45" width="60" height="15" /> {/* Bottom bar */}
        <rect x="45" y="0" width="15" height="60" /> {/* Right bar */}
        
        {/* O1 @ x=75 */}
        <rect x="75" y="0" width="60" height="15" /> {/* Top */}
        <rect x="75" y="0" width="15" height="60" /> {/* Left */}
        <rect x="120" y="0" width="15" height="60" /> {/* Right */}
        <rect x="75" y="45" width="60" height="15" /> {/* Bottom */}
        
        {/* J2 @ x=150 */}
        <rect x="150" y="0" width="15" height="60" /> {/* Main vertical bar */}
        <rect x="150" y="45" width="60" height="15" /> {/* Bottom horizontal bar */}
        <rect x="195" y="0" width="15" height="15" /> {/* Top-right small bar */}

        {/* O2 @ x=225 */}
        <rect x="225" y="0" width="60" height="15" /> {/* Top */}
        <rect x="225" y="0" width="15" height="60" /> {/* Left */}
        <rect x="270" y="0" width="15" height="60" /> {/* Right */}
        <rect x="225" y="45" width="60" height="15" /> {/* Bottom */}
      </g>
    </svg>
  );
};

export default Logo;
