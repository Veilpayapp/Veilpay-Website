import React from 'react';

const MeshGrid: React.FC = () => {
  const svgRef = React.useRef<SVGSVGElement>(null);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#000000]">
      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="mesh-square-grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            {/* Horizontal lines */}
            <line
              x1="0"
              y1="0"
              x2="60"
              y2="0"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
            />
            {/* Vertical lines */}
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="60"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
            />
          </pattern>
          <pattern
            id="mesh-dot-grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="10" cy="10" r="1" fill="rgba(255, 255, 255, 0.25)" />
          </pattern>
        </defs>
        {/* Base background */}
        <rect width="100%" height="100%" fill="#000000" />
        {/* Square grid */}
        <rect width="100%" height="100%" fill="url(#mesh-square-grid)" />
        {/* Dot grid overlay */}
        <rect width="100%" height="100%" fill="url(#mesh-dot-grid)" opacity="0.4" />
      </svg>
      {/* Vignette overlay for depth */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </div>
  );
};

export default React.memo(MeshGrid);
