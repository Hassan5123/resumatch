import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Results() {
  const router = useRouter();
  const [data, setData] = useState(null);

  // Protect route & load data on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const stored = localStorage.getItem("matchResult");
    if (!stored) {
      // If user lands here directly w/out data, go back to match page
      router.replace("/match");
      return;
    }
    try {
      setData(JSON.parse(stored));
    } catch (err) {
      console.error("Failed to parse matchResult", err);
      router.replace("/match");
    }
  }, [router]);

  if (!data) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-secondary">Loading results…</p>
        </div>
      </div>
    );
  }

  const { match, metadata } = data;
  return (
    <div className="container-fluid my-4" style={{ maxWidth: "950px" }}>
      <div className="row justify-content-center">
        <div className="col-12">
          <div className="card shadow-sm border">
            <div className="card-body p-2">
              <h1 className="text-center mb-2 h5 fw-semibold">Match Analysis Results</h1>
              
              {/* Score Section */}
              <div className="text-center mb-3">
                <h5 className="text-secondary mb-3">Overall Match Score</h5>
                <div className="display-4 fw-bold text-primary">{match.matchScore}%</div>
              </div>

              {/* Summary Section */}
              {match.summary && (
                <div className="mb-3">
                  <h5 className="fw-semibold mb-2 fs-6">Summary</h5>
                  <p className="text-secondary small">{match.summary}</p>
                </div>
              )}

              {/* Strengths and Improvements */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <div className="card h-100 border-0 bg-light">
                    <div className="card-body py-2 px-3">
                      <h5 className="card-title fw-semibold mb-2 fs-6">Strengths</h5>
                      <ul className="list-unstyled">
                        {match.strengths?.map((s, i) => (
                          <li key={i} className="mb-1 small">✅ {s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card h-100 border-0 bg-light">
                    <div className="card-body py-2 px-3">
                      <h5 className="card-title fw-semibold mb-2 fs-6">Areas to Improve</h5>
                      <ul className="list-unstyled">
                        {match.improvements?.map((imp, i) => (
                          <li key={i} className="mb-1 small">➡️ {imp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Missing Skills */}
              {match.missingSkills?.length > 0 && (
                <div className="mb-3">
                  <div className="card border-0 bg-light">
                    <div className="card-body py-2 px-3">
                      <h5 className="card-title fw-semibold mb-2 fs-6">Missing Skills</h5>
                      <ul className="list-unstyled">
                        {match.missingSkills.map((skill, i) => (
                          <li key={i} className="mb-1 small">❌ {skill}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="d-grid mt-3">
                <button onClick={() => router.push("/match")} className="btn btn-outline-primary btn-sm">
                  New Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
