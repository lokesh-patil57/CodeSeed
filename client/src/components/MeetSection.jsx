import { FileText, BookOpen, Users } from "lucide-react";

const ICON_MAP = {
  FileText: FileText,
  BookOpen: BookOpen,
  Users: Users,
};

export default function MeetSection({
  section,
  isOpen,
  isDark,
  onToggle,
  showBorder,
}) {
  const IconComponent = ICON_MAP[section.icon];

  return (
    <div
      className={`cursor-pointer py-3 transition-colors ${
        isOpen
          ? isDark
            ? "text-white"
            : "text-gray-900"
          : isDark
          ? "text-neutral-400"
          : "text-neutral-700"
      } ${
        showBorder
          ? isDark
            ? "border-b border-neutral-800 pb-4"
            : "border-b border-neutral-200 pb-4"
          : ""
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {IconComponent && (
            <IconComponent
              size={22}
              className={
                isOpen
                  ? ""
                  : isDark
                  ? "text-neutral-500"
                  : "text-neutral-500"
              }
            />
          )}
          <h3 className="text-lg md:text-xl font-medium">
            {section.title}
          </h3>
        </div>
        <span className="text-xs opacity-60">
          {isOpen ? "−" : "+"}
        </span>
      </div>
      {isOpen && (
        <p
          className={`mt-2 text-base leading-relaxed ${
            isDark ? "text-neutral-400" : "text-neutral-700"
          }`}
        >
          {section.body}
        </p>
      )}
    </div>
  );
}
