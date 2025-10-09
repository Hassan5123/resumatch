// (Landing Page) This file maps to the URL '/'
import Head from "next/head";
import Link from "next/link";

export default function Landing() {
  return (
    <>
      <Head>
        <title>ResuMatch | AI Resume Matcher</title>
        <meta name="description" content="AI powered resume to job match analysis" />
      </Head>

      {/* ----- Hero Section ----- */}
      <section className="text-center py-4 py-md-5 px-3 px-md-4" style={{ background: '#f8fbff' }}>
        <div className="container">
          <h1 className="display-6 display-md-5 fw-bold mb-3 text-dark">
            Get Your Dream Job with <span className="text-primary">AI</span>
          </h1>
          <p className="fs-6 fs-md-5 text-secondary mb-4">
            Upload resume, paste job description, get instant matching insights
          </p>
          <Link href="/signup" className="btn btn-primary px-4 py-2">
            Get Started - Free →
          </Link>
        </div>
      </section>

      {/* ----- Feature cards ----- */}
      <section className="container py-4 py-md-5 px-3">
        <div className="row justify-content-center g-3 g-md-4">
          <div className="col-md-4">
            <div className="card h-100 text-center shadow-sm border">
              <div className="card-body p-4">
                <div className="fs-1 mb-3">⬆️</div>
                <h3 className="card-title h5 fw-semibold">Upload Resume</h3>
                <p className="card-text text-secondary">
                  Securely upload your resume in PDF or DOCX for instant analysis
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 text-center shadow-sm border">
              <div className="card-body p-4">
                <div className="fs-1 mb-3">🤖</div>
                <h3 className="card-title h5 fw-semibold">AI Match Analysis</h3>
                <p className="card-text text-secondary">
                  Our advanced AI analyzes job requirements and matches them with your skills
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 text-center shadow-sm border">
              <div className="card-body p-4">
                <div className="fs-1 mb-3">📊</div>
                <h3 className="card-title h5 fw-semibold">Get Insights</h3>
                <p className="card-text text-secondary">
                  Receive detailed insights and recommendations to improve your application
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}