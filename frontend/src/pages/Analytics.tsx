"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SearchIcon,
  BarChartIcon,
  Loader2Icon,
  CheckCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateQuestionForm from "./CreateNewQuestionForm";
import { fetchApi } from "@/lib/api";

interface SimilarGroup {
  count: number;
  questions: string[];
  recommendation: { question: string };
}

interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
}

interface Category {
  id: number;
  name: string;
  subcategories: Subcategory[];
}

export default function Analytics() {
  const navigate = useNavigate(); // ✅ for React Router
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [results, setResults] = useState<SimilarGroup[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [prefilledQuestion, setPrefilledQuestion] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchApi("categories")
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const handleClick = async () => {
    setStep(1);
    setResults(null);
    setError(null);

    setTimeout(() => setStep(2), 1500);

    setTimeout(async () => {
      try {
        const data = await fetchApi("bot-history/analyze-similar-questions");
        setResults(data);
        setStep(3);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
        setStep(3);
      }
    }, 3000);
  };

  const openChatbotWithPrefill = (question: string) => {
    setPrefilledQuestion(question);
    setShowForm(true);
  };

  const ProgressMessage = ({ text }: { text: string }) => (
    <div className="flex items-center gap-2 text-blue-600 text-sm">
      <Loader2Icon className="animate-spin h-4 w-4" />
      <span>{text}</span>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChartIcon className="h-6 w-6" />
        <h1 className="text-xl sm:text-2xl font-semibold text-[#2E2E30]">Analytics</h1>
      </div>

      {/* Action button */}
      <div className="flex justify-start">
        <Button
          onClick={handleClick}
          disabled={step > 0 && step < 3}
          className="bg-[#00589A] hover:bg-[#00487A] text-white flex items-center gap-2"
        >
          <SearchIcon className="h-4 w-4" />
          Neue häufig gestellte Fragen finden
        </Button>
      </div>

      {/* Result area */}
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 shadow-sm min-h-[100px] space-y-6">
        {step === 1 && <ProgressMessage text="📥 Unbekannte Fragen werden gesammelt..." />}
        {step === 2 && <ProgressMessage text="🔍 Suche nach häufig gestellten Fragen..." />}

        {step === 3 && error && (
          <p className="text-red-500 text-center">{error}</p>
        )}

        {step === 3 && results && results.length > 0 && (
          <div className="space-y-6">
            {results.map((group, idx) => (
              <div key={idx} className="bg-white rounded-md p-4 shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  Ähnliche Fragen ({group.count}):
                </p>
                <ul className="list-disc list-inside text-sm text-gray-800 mb-4">
                  {group.questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircleIcon className="h-5 w-5" />
                    <p className="text-sm font-medium">
                      Vorschlag: <span className="text-gray-900">{group.recommendation.question}</span>
                    </p>
                  </div>
                  <Button onClick={() => openChatbotWithPrefill(group.recommendation.question)}
                    className="bg-[#00589A] hover:bg-[#00487A] text-white flex items-center gap-1"
                  >
                    Frage hinzufügen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 3 && results?.length === 0 && !error && (
          <p className="text-center text-gray-500">Keine ähnlichen Fragen gefunden.</p>
        )}
      </div>

      {/* Create Question Form Drawer */}
      {showForm && (
        <div style={{ backgroundColor: "#F6FFE0" }} className="fixed inset-0 z-50 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#00589A]">Neue Frage erstellen</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-800"
            >✕</button>
          </div>
          <CreateQuestionForm
            categories={categories}
            onCreated={() => {
              navigate("/admin-panel/questions"); // ✅ React Router redirect
            }}
            onCancel={() => {
              setShowForm(false);
              setPrefilledQuestion(null);
            }}
            prefillQuestion={prefilledQuestion ?? undefined}
          />
        </div>
      )}
    </div>
  );
}
