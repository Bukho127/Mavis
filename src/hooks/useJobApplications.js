import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createJobApplication,
  deleteJobApplication,
  fetchJobApplications,
  updateJobApplication,
} from "../api";
import { JOB_STATUS_IDS } from "../components/dashboard/job-tracker/jobTrackerConfig";

function normalizeApplication(application) {
  return {
    id:
      application.id ||
      application._id ||
      application.jobApplicationId ||
      application.applicationId,
    company: application.company?.trim() || "Untitled company",
    role: application.role?.trim() || "Untitled role",
    status: JOB_STATUS_IDS.includes(application.status)
      ? application.status
      : "saved",
    location: application.location?.trim() || "",
    jobUrl: application.jobUrl?.trim() || "",
    dateApplied: application.dateApplied || "",
    nextStepDate: application.nextStepDate || "",
    stage: application.stage?.trim() || "",
    notes: application.notes?.trim() || "",
    jobDescription: application.jobDescription?.trim() || "",
    createdAt: application.createdAt || new Date().toISOString(),
    updatedAt: application.updatedAt || new Date().toISOString(),
  };
}

function sortApplications(applications) {
  return [...applications].sort((first, second) => {
    const firstTime = new Date(first.updatedAt || 0).getTime();
    const secondTime = new Date(second.updatedAt || 0).getTime();
    return secondTime - firstTime;
  });
}

export function useJobApplications(token) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadApplications = useCallback(async () => {
    if (!token) {
      setApplications([]);
      setLoading(false);
      setError("Sign in to track job applications.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const nextApplications = await fetchJobApplications(token);
      setApplications(nextApplications.map(normalizeApplication));
    } catch (err) {
      setError(err.message || "Unable to load job applications.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!token) {
        if (isMounted) {
          setApplications([]);
          setLoading(false);
          setError("Sign in to track job applications.");
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }

        const nextApplications = await fetchJobApplications(token);
        if (isMounted) {
          setApplications(nextApplications.map(normalizeApplication));
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load job applications.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const sortedApplications = useMemo(
    () => sortApplications(applications),
    [applications],
  );

  const saveApplication = useCallback(
    async (application) => {
      if (!token) {
        throw new Error("Sign in to save job applications.");
      }

      const persistedApplication = application.id
        ? await updateJobApplication(application.id, token, application)
        : await createJobApplication(token, application);
      const normalized = normalizeApplication(persistedApplication);

      setApplications((currentApplications) => {
        const exists = currentApplications.some(
          (item) => item.id === normalized.id,
        );

        if (!exists) return [normalized, ...currentApplications];

        return currentApplications.map((item) =>
          item.id === normalized.id ? normalized : item,
        );
      });

      return normalized;
    },
    [token],
  );

  const updateApplicationStatus = useCallback(
    async (applicationId, status) => {
      if (!token || !JOB_STATUS_IDS.includes(status)) return null;

      const previousApplications = applications;

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                status,
                updatedAt: new Date().toISOString(),
              }
            : application,
        ),
      );

      try {
        const persistedApplication = await updateJobApplication(
          applicationId,
          token,
          { status },
        );
        const normalized = normalizeApplication(persistedApplication);

        setApplications((currentApplications) =>
          currentApplications.map((application) =>
            application.id === applicationId ? normalized : application,
          ),
        );

        return normalized;
      } catch (err) {
        setApplications(previousApplications);
        setError(err.message || "Unable to update application status.");
        return null;
      }
    },
    [applications, token],
  );

  const removeApplication = useCallback(
    async (applicationId) => {
      if (!token) return;

      await deleteJobApplication(applicationId, token);
      setApplications((currentApplications) =>
        currentApplications.filter((application) => application.id !== applicationId),
      );
    },
    [token],
  );

  return {
    applications: sortedApplications,
    loading,
    error,
    reloadApplications: loadApplications,
    saveApplication,
    updateApplicationStatus,
    deleteApplication: removeApplication,
  };
}
