function normalizeToParagraph(text) {
  return text
    .split("\n")
    .map((line) =>
      line
        .trim()
        //I am using regex to remove bullet points, dashes, asterisks,
        // and numbers followed by a period or parenthesis at the start of the line
        .replace(/^[\u2022\-\*\u2013]\s*/, "")
        .replace(/^\d+[\.\)]\s*/, ""),
    )
    .filter(Boolean)
    .join(" ") // join everything into one flowing paragraph
    .replace(/\s{2,}/g, " ") // collapse any accidental double spaces
    .trim();
}

function JobDescription({ value, onChange, maxLength = 10000 }) {
  const remaining = maxLength - value.length;

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const normalized = normalizeToParagraph(pastedText);

    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.slice(0, start) + normalized + value.slice(end);

    onChange(newValue.slice(0, maxLength));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="job-description"
          className="text-sm font-semibold text-stone-950"
        >
          Job Description
        </label>
        <span
          className={`text-xs ${
            remaining <= 0 ? "text-red-500" : "text-stone-400"
          }`}
        >
          {value.length}/{maxLength}
        </span>
      </div>

      <textarea
        id="job-description"
        value={value}
        required
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        onPaste={handlePaste}
        placeholder="Paste the job description you're preparing for..."
        rows={8}
        className="h-[150px] w-full resize-none rounded-lg border border-stone-300 bg-white p-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#4A7FF8] focus:outline-none"
      />
    </div>
  );
}

export default JobDescription;
