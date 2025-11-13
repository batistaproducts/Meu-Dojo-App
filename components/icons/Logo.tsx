import React from 'react';

const Logo: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 285 80"
      className={`dark:invert ${className || ''}`}
      {...props}
    >
      <g fill="currentColor">
        {/* MEU group - positioned over the first J */}
        <g id="meu" transform="translate(7.5, 0)">
          {/* M */}
          <rect x="0" y="0" width="3" height="15" />
          <rect x="12" y="0" width="3" height="15" />
          <rect x="0" y="0" width="15" height="3" />
          <rect x="3" y="3" width="3" height="3" />
          <rect x="6" y="6" width="3" height="3" />
          <rect x="9" y="3" width="3" height="3" />
          {/* E */}
          <rect x="18" y="0" width="3" height="15" />
          <rect x="18" y="0" width="12" height="3" />
          <rect x="18" y="6" width="9" height="3" />
          <rect x="18" y="12" width="12" height="3" />
          {/* U */}
          <rect x="33" y="0" width="3" height="15" />
          <rect x="42" y="0" width="3" height="15" />
          <rect x="33" y="12" width="12" height="3" />
        </g>
        
        <g id="jojo" transform="translate(0, 20)">
          {/* J at x=0 */}
          <g id="J1">
            <rect x="45" y="0" width="15" height="20" />
            <rect x="0" y="45" width="60" height="60" />
            <rect x="0" y="45" width="60" height="30" />
            <rect x="0" y="45" width="60" height="30" />
            <rect x="0" y="15" width="15" height="30" />
          </g>
          
          {/* O at x=75 */}
          <g id="O1" transform="translate(75, 0)">
            <rect x="0" y="0" width="15" height="60" />
            <rect x="45" y="0" width="15" height="60" />
            <rect x="0" y="0" width="60" height="15" />
            <rect x="0" y="45" width="60" height="15" />
          </g>
          
          {/* J at x=150 */}
          <g id="J2" transform="translate(150, 0)">
            <rect x="45" y="0" width="15" height="60" />
            <rect x="0" y="45" width="60" height="15" />
            <rect x="0" y="15" width="15" height="30" />
          </g>
          
          {/* O at x=225 */}
          <g id="O2" transform="translate(225, 0)">
            <rect x="0" y="0" width="15" height="60" />
            <rect x="45" y="0" width="15" height="60" />
            <rect x="0" y="0" width="60" height="15" />
            <rect x="0" y="45" width="60" height="15" />
          </g>

        </g>
      </g>
    </svg>
  );
};

export default Logo;
