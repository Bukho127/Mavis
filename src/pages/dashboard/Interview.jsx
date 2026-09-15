import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Briefcase01Icon,
  Clock01Icon,
  File01Icon,
} from "@hugeicons/core-free-icons";
import CVDropzone from "../dashboard/DragAndDrop";
import JobDescription from "../dashboard/JobDescription";
import DocumentList from "../dashboard/DocumentList";
import CallControls from "../dashboard/CallContols";
import LiveKitAvatar from "./LiveKitAvatar";
import { RoomProvider } from "../../context/RoomContext";
import { useRoom } from "../../context/RoomContext";
import { useAuth } from "../../context/AuthContext";
import TranscriptView from "./TranscriptView";

import {
  decodeUserIdFromToken,
  deleteUserDocument,
  fetchUserProfile,
  uploadUserDocument,
  startInterview,
  endInterview,
} from "../../api";

const JOB_TITLE_OPTIONS = [
  "Junior Frontend Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Software Engineer",
  "UI/UX Designer",
  "Data Analyst",
  "Product Manager",
  "Business Analyst",
  "Project Manager",
];

function Interview() {
  const { token } = useAuth();
  const userId = token ? decodeUserIdFromToken(token) : null;

  const [userName, setUserName] = useState(null);

  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [cvDocument, setCvDocument] = useState(null);
  const [coverLetterDocument, setCoverLetterDocument] = useState(null);

  const [sessionState, setSessionState] = useState("setup");
  const [activeSetupModal, setActiveSetupModal] = useState(null);
  const [draftJobTitle, setDraftJobTitle] = useState("");

  const [liveKitToken, setLiveKitToken] = useState(null);
  const [liveKitServerUrl, setLiveKitServerUrl] = useState(null);
  const [currentInterviewId, setCurrentInterviewId] = useState(null);

  const [startError, setStartError] = useState(null);

  // --------------------------------------------------
  // Fetch user profile
  // --------------------------------------------------

  useEffect(() => {
    if (!token || !userId) return;

    async function fetchProfile() {
      try {
        const data = await fetchUserProfile(userId, token);
        setUserName(data.full_name);
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    }

    fetchProfile();
  }, [token, userId]);

  // --------------------------------------------------
  // Document upload
  // --------------------------------------------------

  const uploadDocument = async (file, documentType, setDocument) => {
    const draftDocument = {
      id: null,
      name: file.name,
      progress: 0,
      status: "uploading",
      type: documentType,
    };

    setDocument(draftDocument);

    try {
      const uploadedDocument = await uploadUserDocument({
        token,
        userId,
        file,
        documentType,

        onProgress: (progress) => {
          setDocument((currentDocument) => ({
            ...currentDocument,
            progress,
          }));
        },
      });

      setDocument({
        ...draftDocument,
        ...uploadedDocument,
        id: uploadedDocument.id || uploadedDocument.document_id,
        name: uploadedDocument.name || uploadedDocument.file_name || file.name,
        progress: 100,
        status: "success",
      });
    } catch (err) {
      setDocument({
        ...draftDocument,
        progress: 0,
        status: "error",
        error: err.message,
      });
    }
  };

  const handleFileSelected = (file) => {
    if (!token || !userId) return;

    if (!cvDocument) {
      uploadDocument(file, "cv", setCvDocument);
    } else if (!coverLetterDocument) {
      uploadDocument(file, "cover_letter", setCoverLetterDocument);
    }
  };

  // --------------------------------------------------
  // Document removal
  // --------------------------------------------------

  const removeDocument = async (document, setDocument) => {
    setDocument(null);

    if (!document?.id || document.status !== "success") {
      return;
    }

    try {
      await deleteUserDocument(document.id, token);
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  // --------------------------------------------------
  // Setup state
  // --------------------------------------------------

  const bothSlotsFull = Boolean(cvDocument) && Boolean(coverLetterDocument);

  const isUploadDisabled =
    bothSlotsFull || !token || !userId || sessionState !== "setup";

  const canSimulate =
    cvDocument?.status === "success" &&
    jobTitle.trim().length > 0 &&
    jobDescription.trim().length > 0 &&
    sessionState === "setup";

  const hasMaterials =
    cvDocument?.status === "success" && jobDescription.trim().length > 0;

  const documentsStatus = cvDocument
    ? coverLetterDocument
      ? "CV and cover letter added"
      : "CV added"
    : "No CV added";

  const materialsStatus = hasMaterials
    ? `${documentsStatus} - job description ready`
    : "Add your CV and paste the job description";

  const openJobTitleModal = () => {
    if (sessionState !== "setup") return;
    setDraftJobTitle(jobTitle);
    setActiveSetupModal("job-title");
  };

  const closeSetupModal = () => {
    setActiveSetupModal(null);
  };

  const handleContinueJobTitle = () => {
    setJobTitle(draftJobTitle);
    closeSetupModal();
  };

  // --------------------------------------------------
  // Start interview
  // --------------------------------------------------

  const handleSimulate = async () => {
    if (!canSimulate) return;

    setSessionState("starting");
    setStartError(null);

    try {
      const result = await startInterview({
        token,
        jobTitle,
        jobDescription,
      });

      const livekit = result?.livekit;
      const interview = result?.interview;

      if (!livekit?.token || !livekit?.url) {
        throw new Error("The server did not return valid LiveKit credentials.");
      }

      setLiveKitToken(livekit.token);
      setLiveKitServerUrl(livekit.url);

      setCurrentInterviewId(interview?._id || null);

      setSessionState("live");
    } catch (err) {
      console.error("Failed to start interview:", err);

      setStartError(
        err.message || "Failed to start interview. Please try again.",
      );

      setSessionState("setup");
    }
  };

  // --------------------------------------------------
  // Cancel setup
  // --------------------------------------------------

  const handleCancelSetup = () => {
    setCvDocument(null);
    setCoverLetterDocument(null);
    setJobTitle("");
    setJobDescription("");
    setDraftJobTitle("");
    setActiveSetupModal(null);
    setStartError(null);
  };

  // --------------------------------------------------
  // End interview
  // --------------------------------------------------

  const handleEndCall = (transcript = []) => {
    const interviewId = currentInterviewId;

    setSessionState("setup");
    setLiveKitToken(null);
    setLiveKitServerUrl(null);
    setCurrentInterviewId(null);

    if (!interviewId) {
      return;
    }

    void (async () => {
    try {
        await endInterview(interviewId, token, transcript);
    } catch (err) {
      console.error("Failed to mark interview as ended:", err);
    }
    })();
  };

  if (sessionState !== "setup") {
    if (sessionState === "starting" || !liveKitToken || !liveKitServerUrl) {
      return (
        <InterviewRoomScreen
          jobTitle={jobTitle}
          sessionState={sessionState}
          onEndCall={handleEndCall}
          hasRoom={false}
        />
      );
    }

    return (
      <RoomProvider token={liveKitToken} serverUrl={liveKitServerUrl}>
        <InterviewRoomScreen
          jobTitle={jobTitle}
          sessionState={sessionState}
          onEndCall={handleEndCall}
          hasRoom
        />
      </RoomProvider>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col p-8">
      <div className="flex min-h-0 flex-1 justify-center overflow-y-auto py-10">
        <div className="w-full max-w-2xl">
          <h3 className="mb-6 text-lg font-semibold text-stone-950">
            Hey {userName || "there"}, ready to get started?
          </h3>

          <div className="flex w-full flex-col gap-4">
            <SetupButton
              icon={Briefcase01Icon}
              title="Job title"
              value={jobTitle || "Select a role"}
              isComplete={jobTitle.trim().length > 0}
              disabled={sessionState !== "setup"}
              onClick={openJobTitleModal}
            />

            <SetupButton
              icon={File01Icon}
              title="CV and job description"
              value={materialsStatus}
              isComplete={hasMaterials}
              disabled={sessionState !== "setup"}
              onClick={() => setActiveSetupModal("materials")}
            />

            {startError && <p className="text-sm text-red-500">{startError}</p>}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelSetup}
                disabled={sessionState !== "setup"}
                className="rounded-md border border-stone-300 px-5 py-2.5 text-sm text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSimulate}
                disabled={!canSimulate}
                className="rounded-md bg-[#4A7FF8] px-5 py-2.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Simulate
              </button>
            </div>
          </div>
        </div>
      </div>
      {activeSetupModal === "job-title" && (
        <SetupModal
          title="Select job title"
          onCancel={closeSetupModal}
          onContinue={handleContinueJobTitle}
          continueDisabled={draftJobTitle.trim().length === 0}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {JOB_TITLE_OPTIONS.map((title) => {
              const isSelected = draftJobTitle === title;

              return (
                <button
                  key={title}
                  type="button"
                  onClick={() => setDraftJobTitle(title)}
                  className={`rounded-lg border px-3 py-3 text-left text-sm font-medium transition-colors ${
                    isSelected
                      ? "border-[#4A7FF8] bg-[#4A7FF8]/5 text-stone-950"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  {title}
                </button>
              );
            })}
          </div>
        </SetupModal>
      )}

      {activeSetupModal === "materials" && (
        <SetupModal
          title="Add CV and job description"
          onCancel={closeSetupModal}
          onContinue={closeSetupModal}
          continueDisabled={!hasMaterials}
        >
          <div className="flex flex-col gap-4">
            <CVDropzone
              onFileSelected={handleFileSelected}
              disabled={isUploadDisabled}
            />

            <DocumentList
              cvDocument={cvDocument}
              coverLetterDocument={coverLetterDocument}
              onRemoveCv={() => removeDocument(cvDocument, setCvDocument)}
              onRemoveCoverLetter={() =>
                removeDocument(coverLetterDocument, setCoverLetterDocument)
              }
            />

            <JobDescription
              value={jobDescription}
              onChange={setJobDescription}
              disabled={sessionState !== "setup"}
            />
          </div>
        </SetupModal>
      )}
    </div>
  );
}

function InterviewRoomScreen({ jobTitle, sessionState, onEndCall, hasRoom }) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-stone-100">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-8 py-6">
        <div className="mb-3 flex shrink-0 items-center justify-between">
          <div>
            <p className="text-xs font-medium text-stone-400">Interview room</p>
            <h3 className="mt-1 text-lg font-semibold text-stone-950">
              {jobTitle}
            </h3>
          </div>
        </div>

        {(sessionState === "starting" || sessionState === "connecting") && (
          <div className="flex min-h-[320px] shrink-0 items-center justify-center">
            <div className="text-center">
              {hasRoom ? (
                <LiveKitAvatar state="idle" size="md" />
              ) : (
                <div className="mx-auto h-28 w-28 rounded-full border border-stone-200 bg-white shadow-sm" />
              )}

              <p className="mt-2 text-sm font-medium text-stone-700">
                {sessionState === "starting"
                  ? "Creating your interview..."
                  : "Preparing your interview..."}
              </p>

              <p className="mt-1 text-sm text-stone-400">
                {sessionState === "starting"
                  ? "Setting up the room details."
                  : "Connecting to the interview room."}
              </p>
            </div>
          </div>
        )}

        {sessionState === "live" && (
          <div className="shrink-0">
            <LiveKitAvatar state="speaking" size="md" />
          </div>
        )}

        {hasRoom && <InterviewStatus sessionState={sessionState} />}

        {hasRoom && (
          <div className="min-h-[220px] min-w-0 flex-1">
            <TranscriptView />
          </div>
        )}
      </div>

      {hasRoom ? (
        <div className="shrink-0 border-t border-stone-300 bg-stone-50">
          <CallControls onEndCall={onEndCall} />
        </div>
      ) : (
        <div className="flex shrink-0 justify-center border-t border-stone-300 bg-stone-50 px-8 py-4">
          <button
            type="button"
            onClick={() => onEndCall([])}
            className="rounded-md border border-stone-300 px-5 py-2.5 text-sm text-stone-700 hover:bg-stone-100"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function SetupButton({ icon, title, value, isComplete, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex w-full items-center gap-3 rounded-lg border border-stone-200 bg-white p-4 text-left transition-colors hover:border-stone-300 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-500 group-hover:text-stone-700">
        <HugeiconsIcon icon={icon} size={20} strokeWidth={1.8} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-stone-950">
          {title}
        </span>
        <span
          className={`mt-1 block truncate text-sm ${
            isComplete ? "text-stone-600" : "text-stone-400"
          }`}
        >
          {value}
        </span>
      </span>

      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
          isComplete ? "bg-[#4A7FF8]" : "bg-stone-300"
        }`}
        aria-hidden="true"
      />
    </button>
  );
}

function SetupModal({ title, children, onCancel, onContinue, continueDisabled }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/35 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-xl">
        <div className="border-b border-stone-200 px-5 py-4">
          <h4 className="text-base font-semibold text-stone-950">{title}</h4>
        </div>

        <div className="min-h-0 overflow-y-auto p-5">{children}</div>

        <div className="flex justify-end gap-3 border-t border-stone-200 bg-stone-50 px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-stone-300 px-5 py-2.5 text-sm text-stone-700 hover:bg-stone-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onContinue}
            disabled={continueDisabled}
            className="rounded-md bg-[#4A7FF8] px-5 py-2.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function InterviewStatus({ sessionState }) {
  const { transcript } = useRoom();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (sessionState !== "live") {
      return undefined;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [sessionState]);

  const displaySeconds = sessionState === "live" ? elapsedSeconds : 0;
  const minutes = String(Math.floor(displaySeconds / 60)).padStart(2, "0");
  const seconds = String(displaySeconds % 60).padStart(2, "0");
  const questionCount =
    transcript.filter((entry) => entry.speaker === "mavis").length + 1;
  const questionProgress = Math.min((questionCount / 10) * 100, 100);

  return (
    <div className="flex shrink-0 items-center justify-between px-6 pb-4 text-xs font-medium text-stone-500">
      <div className="flex items-center gap-2">
        <HugeiconsIcon icon={Clock01Icon} size={16} strokeWidth={1.8} />
        <span className="tabular-nums">{minutes}:{seconds}</span>
      </div>

      <div className="flex items-center gap-3">
        <span>Question {questionCount}</span>
        <div
          className="h-1.5 w-24 overflow-hidden rounded-full bg-stone-200"
          role="progressbar"
          aria-label={`Question progress: ${questionCount} of 10`}
          aria-valuemin="0"
          aria-valuemax="10"
          aria-valuenow={Math.min(questionCount, 10)}
        >
          <div
            className="h-full rounded-full bg-[#172554] transition-[width] duration-500"
            style={{ width: `${questionProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default Interview;
