import { sendTestEmail } from "./emailTestService";

(async () => {
  const result = await sendTestEmail("user@example.com", "I need help with the chatbot!");
  console.log("✅ Preview it at:", result.previewUrl);
})();