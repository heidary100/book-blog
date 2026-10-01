import { notFound } from "next/navigation";
import KeystaticApp from "./keystatic";

// Keystatic runs in local storage mode: it edits files on disk, which only
// works on a development machine. Keep it out of deployed builds entirely.
export default function KeystaticLayout() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <KeystaticApp />;
}
