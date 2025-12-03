import React from "react";

const SYMBOLS = [
  "</>",
  "}{",
  "[]",
  '"',
  "'",
  ";",
  ":",
  ",",
  ".",
  "?",
  "-",
  "()",
  "*",
  "&",
  "^",
  "%",
  "$",
  "#",
  "@",
  "!",
  "~",
  "`",
  "+",
  "=",
  "<",
  ">",
  "/",
  "\\",
];

const COLORS = [
  "#00CED1",
  "#FFD700",
  "#FF69B4",
  "#7FFF00",
  "#FF6347",
  "#9D4EDD",
  "#06FFA5",
  "#FF1493",
  "#00FF7F",
];

const CodeSymbolsAnimation = ({ isDark }) => {
  const items = React.useMemo(
    () =>
      Array.from({ length: 50 }).map((_, i) => {
        const randomSymbol =
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const randomLeft = Math.random() * 100;
        const randomDelay = Math.random() * 5;
        const randomDuration = 8 + Math.random() * 7;
        const randomRotation = -30 + Math.random() * 60;
        const randomTopOffset = Math.random() * 10;

        return {
          id: i,
          symbol: randomSymbol,
          color: randomColor,
          left: `${randomLeft}%`,
          delay: `${randomDelay}s`,
          duration: `${randomDuration}s`,
          rotation: `rotate(${randomRotation}deg)`,
          top: `-${randomTopOffset}%`,
        };
      }),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute animate-symbol-fall"
          style={{
            left: item.left,
            top: item.top,
            animationDelay: item.delay,
            animationDuration: item.duration,
          }}
        >
          <div
            className="font-mono font-bold text-xl"
            style={{
              color: item.color,
              opacity: isDark ? 0.9 : 0.7,
              transform: item.rotation,
              textShadow: isDark
                ? "0 0 15px currentColor"
                : "0 0 8px currentColor",
            }}
          >
            {item.symbol}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CodeSymbolsAnimation;


