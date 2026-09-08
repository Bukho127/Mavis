import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon } from "@hugeicons/core-free-icons";
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

function Interview() {
  const { token } = useAuth();
  const userId = token ? decodeUserIdFromToken(token) : null;

  const [userName, setUserName] = useState(null);

  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [cvDocument, setCvDocument] = useState(null);
  const [coverLetterDocument, setCoverLetterDocument] = useState(null);

  const [sessionState, setSessionState] = useState("setup");

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

  // --------------------------------------------------
  // Start interview
  // --------------------------------------------------

  const handleSimulate = async () => {
    if (!canSimulate) return;

    setSessionState("connecting");
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
    setStartError(null);
  };

  // --------------------------------------------------
  // End interview
  // --------------------------------------------------

  const handleEndCall = async () => {
    try {
      if (currentInterviewId) {
        await endInterview(currentInterviewId, token);
      }
    } catch (err) {
      console.error("Failed to mark interview as ended:", err);
    } finally {
      setSessionState("setup");

      setLiveKitToken(null);
      setLiveKitServerUrl(null);
      setCurrentInterviewId(null);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col p-8 pb-0">
      <div className="flex min-h-0 flex-1 gap-8 lg:flex-row">
    

        <div className="min-h-0 flex-1 overflow-y-auto py-4 pb-8">
          <h3 className="mb-6 text-lg font-semibold text-stone-950">
            Hey {userName || "there"}, ready to get started?
          </h3>

          <div className="flex w-full max-w-lg flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="job-title"
                className="text-sm font-semibold text-stone-950"
              >
                Job Title
              </label>
              <input
                id="job-title"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                disabled={sessionState !== "setup"}
                placeholder="e.g. Junior Frontend Developer"
                className="w-full rounded-lg border border-stone-300 bg-white p-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#4A7FF8] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

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
                {sessionState === "connecting" ? "Connecting..." : "Simulate"}
              </button>
            </div>
          </div>
        </div>

        <span className="hidden w-px scale-x-50 bg-stone-300 lg:block" />

        <div className="flex min-h-0 flex-1 flex-col">
          <RoomProvider token={liveKitToken} serverUrl={liveKitServerUrl}>
            {/* =================================================
        INTERVIEW CONTENT
    ================================================== */}

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              {sessionState === "setup" && (
                <div className="shrink-0">
                  <LiveKitAvatar state="idle" size="md" />
                </div>
              )}

              {sessionState === "connecting" && (
                <div className="flex min-h-[220px] shrink-0 items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm font-medium text-stone-700">
                      Preparing your interview...
                    </p>

                    <p className="mt-1 text-sm text-stone-400">
                      Connecting to the interview room.
                    </p>
                  </div>
                </div>
              )}

              {sessionState === "live" && (
                <div className="shrink-0">
                  <LiveKitAvatar state="speaking" size="md" />
                </div>
              )}

              <InterviewStatus sessionState={sessionState} />

              <div className="min-h-[220px] min-w-0 flex-1">
                <TranscriptView />
              </div>
            </div>

            <div className="shrink-0 border-t border-stone-300 bg-stone-50">
              <CallControls onEndCall={handleEndCall} />
            </div>
          </RoomProvider>
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
      setElapsedSeconds(0);
      return undefined;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [sessionState]);

  const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
  const seconds = String(elapsedSeconds % 60).padStart(2, "0");
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