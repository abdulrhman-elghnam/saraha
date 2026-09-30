"use client";

import { GoogleAuthForm } from "@/components/google-auth-form";
import axios from "axios";

export default function Page() {
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const response = await axios.post(
      "http://localhost:9090/user/upload-avatar",
      formData
    );

    console.log(response.data);
  }

  return (
<>
<form onSubmit={handleSubmit}>
      <input
        type="file"
        name="file"
        accept="image/*"
      />

      <button type="submit">
        Upload
      </button>
    </form>
    <GoogleAuthForm/>
</>
  );
}