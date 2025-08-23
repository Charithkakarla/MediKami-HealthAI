const ShinyText = ({ text, disabled = false, speed = 5, className = '', color = '#fbbf24' }) => {
  const animationDuration = `${speed}s`;

  return (
    <div
      className={`shiny-text-container inline-block ${disabled ? '' : 'animate-shine'} ${className}`}
      style={{
        '--animation-duration': animationDuration,
        fontWeight: '600',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        color: color,
        position: 'relative',
      }}
    >
      {text}
    </div>
  );
};

export default ShinyText; 