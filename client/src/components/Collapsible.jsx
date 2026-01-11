import { useEffect, useState, useRef } from "react";

export default function Collapsible({ isOpen, children }) {
  const innerRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState("0px");

  useEffect(() => {
    if (!innerRef.current) return;
    setMaxHeight(isOpen ? `${innerRef.current.scrollHeight}px` : "0px");
  }, [isOpen, children]);

  return (
    <div
      style={{
        maxHeight,
        overflow: "hidden",
        transition: "max-height 500ms cubic-bezier(.2,.8,.2,1)",
      }}
    >
      <div ref={innerRef} className="pt-2">
        {children}
      </div>
    </div>
  );
}
