import { useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Submit form -> POST credentials to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/user/login", form);
      localStorage.setItem("token", data.token);
      // On success, store token then navigate to protected Dashboard
      router.push("/match");
    } catch (err) {
      // Show friendly message: either server-provided or fallback
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">
          <div className="card shadow-sm border">
            <div className="card-body p-4">
              <h1 className="text-center mb-4 h4 fw-semibold">Log In</h1>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    id="email" 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="password" 
                    name="password" 
                    value={form.password} 
                    onChange={handleChange} 
                  />
                </div>
                {error && <div className="alert alert-danger py-2 text-center" role="alert">{error}</div>}
                <div className="d-grid gap-2 mt-4">
                  <button type="submit" className="btn btn-primary">
                    Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}