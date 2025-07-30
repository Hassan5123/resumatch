import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import styles from "@/styles/Match.module.css";

export default function Match() {
  const router = useRouter();
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect to login if no auth token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setResumeFile(file || null);
    setError("");
  };

  const handleAnalyze = async () => {
    setError("");

    if (!resumeFile) {
      setError("Please upload your resume.");
      return;
    }
    if (!jobDesc.trim()) {
      setError("Please paste the job description.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);

    setLoading(true);
    try {
      // 1) Upload resume
      const uploadRes = await api.post("/resume/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const resumeId = uploadRes.data?.resume?.id;
      if (!resumeId) {
        throw new Error("Failed to get resume ID from server.");
      }

      // 2) Create match analysis
      const matchRes = await api.post(
        "/match/create",
        {
          resumeId,
          jobDescription: jobDesc,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 3) Persist result and navigate
      localStorage.setItem("matchResult", JSON.stringify(matchRes.data));
      router.push("/results");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Upload Resume</h1>

      <label className={styles.uploadZone}>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          hidden
        />
        <span>
          📄 Attach your Resume
          <br />Supports: PDF, DOCX, DOC
          <br />Max size: 10MB
        </span>
      </label>

      {resumeFile && (
        <p className={styles.currentFile}>Current: {resumeFile.name} ✔</p>
      )}

      <h2>Job Description</h2>
      <textarea
        className={styles.textarea}
        placeholder="Paste the job description here..."
        value={jobDesc}
        onChange={(e) => setJobDesc(e.target.value)}
      />

      {error && <div className={styles.error}>{error}</div>}

      <button
        className={styles.button}
        onClick={handleAnalyze}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Analyze Match"}
      </button>
    </div>
  );
}