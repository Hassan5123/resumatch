import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";

export default function History() {
  const router = useRouter();
  const { id } = router.query;

  const [matches, setMatches] = useState([]);
  const averageScore = matches.length ? (matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length).toFixed(1) : null;
  const [matchDetail, setMatchDetail] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch list or detail depending on query param
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        if (id) {
          // Fetch single match detail
          const res = await api.get(`/match/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMatchDetail(res.data.match);
        } else {
          // Fetch all matches
          const res = await api.get("/match", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMatches(res.data.matches);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  // Handle download resume
  const handleDownloadResume = async () => {
    if (!matchDetail) return;
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/resume/${matchDetail.resume.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: res.headers["content-type"] || "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = matchDetail.resume.originalName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download resume.");
    }
  };

  if (!id) {
    return (
      <div className="container mt-5">
        <div className="card shadow-sm border">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h1 className="h4 fw-semibold mb-0">Your Match History</h1>
              {averageScore !== null && (
                <div className="badge bg-primary fs-6">Avg Score: {averageScore}%</div>
              )}
            </div>
            
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-secondary">Loading matches...</p>
              </div>
            )}
            
            {error && (
              <div className="alert alert-danger" role="alert">{error}</div>
            )}
            
            {!loading && matches.length === 0 && (
              <div className="alert alert-info" role="alert">No matches found.</div>
            )}

            <div className="row g-3">
              {matches.map((m) => (
                <div className="col-md-6" key={m.id}>
                  <div 
                    className="card h-100 shadow-sm hover-card" 
                    onClick={() => router.push({ pathname: "/history", query: { id: m.id } })}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="card-title text-primary fw-bold mb-0">{m.matchScore}%</h5>
                        <small className="text-muted">{new Date(m.createdAt).toLocaleDateString()}</small>
                      </div>
                      <h6 className="card-subtitle mb-2 fw-semibold">{m.resume.originalName}</h6>
                      <p className="card-text text-secondary small text-truncate">{m.jobDescription}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="card shadow-sm border">
        <div className="card-body p-4">
          <button 
            onClick={() => router.push("/history")} 
            className="btn btn-light btn-sm mb-4"
          >
            ← Back to History
          </button>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-secondary">Loading match details...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">{error}</div>
          ) : (
            matchDetail && (
              <>
                <h1 className="text-center mb-4 h4 fw-semibold">Match Details</h1>

                {/* Score Section */}
                <div className="text-center mb-4">
                  <h5 className="text-secondary mb-3">Overall Match Score</h5>
                  <div className="display-4 fw-bold text-primary">{matchDetail.matchScore}%</div>
                </div>

                {/* Summary Section */}
                {matchDetail.summary && (
                  <div className="mb-4">
                    <h5 className="fw-semibold mb-2">Summary</h5>
                    <p className="text-secondary">{matchDetail.summary}</p>
                  </div>
                )}

                {/* Strengths and Improvements */}
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <div className="card h-100 border-0 bg-light">
                      <div className="card-body">
                        <h5 className="card-title fw-semibold mb-3">Strengths</h5>
                        <ul className="list-unstyled">
                          {matchDetail.strengths?.map((s, i) => (
                            <li key={i} className="mb-2">✅ {s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card h-100 border-0 bg-light">
                      <div className="card-body">
                        <h5 className="card-title fw-semibold mb-3">Areas to Improve</h5>
                        <ul className="list-unstyled">
                          {matchDetail.improvements?.map((imp, i) => (
                            <li key={i} className="mb-2">➡️ {imp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Missing Skills */}
                {matchDetail.missingSkills?.length > 0 && (
                  <div className="mb-4">
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <h5 className="card-title fw-semibold mb-3">Missing Skills</h5>
                        <ul className="list-unstyled">
                          {matchDetail.missingSkills.map((skill, i) => (
                            <li key={i} className="mb-2">❌ {skill}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Job Description */}
                <div className="mb-4">
                  <h5 className="fw-semibold mb-2">Job Description</h5>
                  <div className="bg-light p-3 rounded">
                    <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                      {matchDetail.jobDescription}
                    </pre>
                  </div>
                </div>

                {/* Resume */}
                <div className="mb-4">
                  <h5 className="fw-semibold mb-2">Resume</h5>
                  <div className="text-center mt-3">
                    <button 
                      onClick={handleDownloadResume}
                      className="btn btn-outline-primary"
                    >
                      Download Resume
                    </button>
                  </div>
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}