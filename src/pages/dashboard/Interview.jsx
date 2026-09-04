import { useEffect, useState } from "react";
import CVDropzone from "../dashboard/DragAndDrop";
import JobDescription from "../dashboard/JobDescription";
import DocumentList from "../dashboard/DocumentList";
import { useAuth } from "../../context/AuthContext";

function decodeUserIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id;
  } catch {
    return null;
  }
}

function Interview() {
  const { token } = useAuth();
  const [userName, setUserName] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [coverLetterFile, setCoverLetterFile] = useState(null);

  useEffect(() => {
    if (!token) return;
    const userId = decodeUserIdFromToken(token);
    if (!userId) return;

    async function fetchProfile() {
      try {
        const res = await fetch(`/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setUserName(data.full_name);
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    }

    fetchProfile();
  }, [token]);

  const handleFileSelected = (file) => {
    if (!cvFile) {
      setCvFile(file);
    } else if (!coverLetterFile) {
      setCoverLetterFile(file);
    }
  };

  const bothSlotsFull = Boolean(cvFile) && Boolean(coverLetterFile);

  return (
    <div className="flex h-full w-full flex-col gap-8 p-8 lg:flex-row">
      <div className="flex-1 py-4">
        <div>
          <h3 className="mb-6 text-lg font-semibold text-stone-950">
            Hey {userName || "there"}, ready to get started?
          </h3>
        </div>
        <div className="flex w-full max-w-lg flex-col gap-6">
          <CVDropzone onFileSelected={handleFileSelected} disabled={bothSlotsFull} />
          <DocumentList
            cvFile={cvFile}
            coverLetterFile={coverLetterFile}
            onRemoveCv={() => setCvFile(null)}
            onRemoveCoverLetter={() => setCoverLetterFile(null)}
          />
          <JobDescription value={jobDescription} onChange={setJobDescription} />
        </div>
      </div>

      <span className="h-px w-full bg-stone-300 lg:-my-8 lg:h-auto lg:w-px lg:origin-center lg:scale-x-50 lg:self-stretch"></span>

      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-lg text-center text-sm text-stone-400">
          {/* Simulate / Cancel buttons + progress bar go here next */}
        </div>
      </div>
    </div>
  );
}

export default Interview;