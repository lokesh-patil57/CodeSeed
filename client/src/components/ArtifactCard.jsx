import React from "react";
import { ChevronRight, Code2, Eye } from "lucide-react";

const ArtifactCard = ({
  title,
  type = "Interactive Artifact",
  version = "v1",
  codeBlocks,
  language,
  isDark,
  onClick,
  isSelected,
}) => {
  const bgColor = isDark ? "bg-[#141413] hover:bg-[#1a1a18]" : "bg-gray-50 hover:bg-gray-100";
  const borderColor = isDark ? "border-white/10" : "border-black/10";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-white/60" : "text-gray-600";
  const accentColor = isDark ? "text-orange-400" : "text-orange-600";

  const handleClick = () => {
    onClick?.({
      title,
      type,
      version,
      codeBlocks,
      language,
    });
  };

  return (
    <button
      onClick={handleClick}
      className={`
        w-full rounded-xl border transition-all duration-200
        overflow-hidden group cursor-pointer
        ${borderColor}
        ${bgColor}
        ${isSelected ? (isDark ? "ring-2 ring-orange-400/50" : "ring-2 ring-orange-600/50") : ""}
      `}
    >
      <div className="p-4 space-y-3">
        {/* Header with icon and title */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={`p-2 rounded-lg shrink-0 ${
                isDark ? "bg-white/5" : "bg-black/5"
              }`}
            >
              <Code2 size={16} className={accentColor} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h3 className={`font-semibold text-sm truncate ${textPrimary}`}>
                {title}
              </h3>
              <p className={`text-xs ${textSecondary} mt-0.5`}>{type}</p>
            </div>
          </div>
          <div
            className={`
              p-1.5 rounded-lg shrink-0 opacity-0 
              group-hover:opacity-100 transition-opacity
              ${isDark ? "bg-white/5" : "bg-black/5"}
            `}
          >
            <ChevronRight size={14} className={accentColor} />
          </div>
        </div>

        {/* Version badge */}
        <div className="flex items-center gap-2 pt-1">
          <span
            className={`
              inline-block px-2 py-1 rounded-md text-xs font-medium
              ${isDark ? "bg-orange-500/15 text-orange-300" : "bg-orange-100 text-orange-700"}
            `}
          >
            {version}
          </span>
          {codeBlocks?.length > 1 && (
            <span
              className={`
                inline-block px-2 py-1 rounded-md text-xs
                ${isDark ? "bg-white/5 text-white/60" : "bg-black/5 text-gray-600"}
              `}
            >
              {codeBlocks.length} files
            </span>
          )}
        </div>

        {/* Footer info */}
        <div
          className={`
            text-xs flex items-center gap-1.5 pt-1
            ${isDark ? "text-white/50" : "text-gray-500"}
          `}
        >
          <Eye size={12} />
          <span>Click to preview</span>
        </div>
      </div>
    </button>
  );
};

export default ArtifactCard;
