import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";

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
    <div className="container mt-3 mt-md-5 px-3">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm border">
            <div className="card-body p-3 p-md-4">
              <h1 className="text-center mb-4 h4 fw-semibold">Upload Resume</h1>

              <label className="border border-2 border-dashed rounded p-3 p-md-5 text-center d-block mb-3 text-secondary" 
                style={{cursor: 'pointer'}}
                onMouseOver={(e) => e.currentTarget.classList.add('bg-light')}
                onMouseOut={(e) => e.currentTarget.classList.remove('bg-light')}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="d-none"
                />
                <div>
                  <div>📄 Attach your Resume</div>
                  <small>Supports: PDF, DOCX, DOC</small>
                  <br />
                  <small>Max size: 10MB</small>
                </div>
              </label>

              {resumeFile && (
                <div className="alert alert-success py-2">
                  <small>Current: {resumeFile.name} ✔</small>
                </div>
              )}

              <h5 className="mt-3 mb-2">Job Description</h5>
              <textarea
                className="form-control mb-3"
                placeholder="Paste the job description here..."
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                rows="6"
              />

              {error && (
                <div className="alert alert-danger py-2 text-center" role="alert">
                  {error}
                </div>
              )}

              <div className="d-grid gap-2 mt-4">
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Uploading...
                    </>
                  ) : (
                    "Analyze Match"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}