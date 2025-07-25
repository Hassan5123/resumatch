import { useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import styles from "@/styles/Auth.module.css";

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
      router.push("/dashboard");
    } catch (err) {
      // Show friendly message: either server-provided or fallback
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className={styles.container}>
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" value={form.email} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" value={form.password} onChange={handleChange} />
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
