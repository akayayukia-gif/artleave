import type { Metadata } from "next";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "新規登録" };

// SC-02 新規登録
export default function SignupPage() {
  return (
    <>
      <h1 className="mb-6 font-serif text-xl">新規登録</h1>
      <SignupForm />
    </>
  );
}
