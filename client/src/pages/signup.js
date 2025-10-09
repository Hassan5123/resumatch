import { useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";

export default function SignUp() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Submit form -> POST new user details to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/user/register", form);
      // store token and redirect
      // Persist JWT token so the user stays logged in across refreshes
      localStorage.setItem("token", data.token);
      router.push("/match");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="container mt-3 mt-md-5 px-3">
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">
          <div className="card shadow-sm border">
            <div className="card-body p-3 p-md-4">
              <h1 className="text-center mb-4 h4 fw-semibold">Create an Account</h1>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="firstName" className="form-label">First Name</label>
                  <input 
                    className="form-control" 
                    id="firstName" 
                    name="firstName" 
                    value={form.firstName} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="lastName" className="form-label">Last Name</label>
                  <input 
                    className="form-control" 
                    id="lastName" 
                    name="lastName" 
                    value={form.lastName} 
                    onChange={handleChange} 
                  />
                </div>
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
                  <button type="submit" className="btn btn-primary">Sign Up Now</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
