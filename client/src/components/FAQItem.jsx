import Collapsible from "./Collapsible";

export default function FAQItem({ item, isOpen, isDark, onToggle }) {
  return (
    <div className="border-b border-neutral-800 pb-4">
      <button
        type="button"
        className="w-full flex items-center justify-between text-left"
        onClick={onToggle}
      >
        <span className="text-lg md:text-2xl font-normal">
          {item.question}
        </span>
        <span className="text-xl md:text-2xl px-2">
          {isOpen ? "−" : "+"}
        </span>
      </button>
      <Collapsible isOpen={isOpen}>
        <p
          className={`mt-2 text-sm md:text-base leading-relaxed ${
            isDark ? "text-neutral-400" : "text-neutral-700"
          }`}
        >
          {item.answer}
        </p>
      </Collapsible>
    </div>
  );
}
