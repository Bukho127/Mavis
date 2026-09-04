import { useState, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CloudDownloadIcon } from "@hugeicons/core-free-icons";

function CVDropzone({ onFileSelected, disabled = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
    e.target.value = ""; // allow re-selecting the same filename later
  };

  const handleClick = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`flex min-h-[220px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
        disabled
          ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
          : "cursor-pointer border-gray-300 bg-gray-50 hover:bg-gray-100"
      } ${isDragging && !disabled ? "border-[#4A7FF8] bg-[#4A7FF8]/5" : ""}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        required
        accept=".pdf,.doc,.docx"
        onChange={handleFileInputChange}
        disabled={disabled}
        className="hidden"
      />
      <HugeiconsIcon 
      icon={CloudDownloadIcon}
       size={28} 
       className="mb-3 text-gray-400" 
       />
      <p className="text-sm font-medium text-gray-600">
        {disabled ? "Maximum 2 documents reached" : "Click to upload or Drag & Drop"}
      </p>
      <p className="mt-1 text-xs text-gray-400"> PDF, DOCX up to 5MB</p>
    </div>
  );
}

export default CVDropzone;