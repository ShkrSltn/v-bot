import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TrashIcon } from "lucide-react"
import { fetchApi } from "@/lib/api"

interface DocumentLink {
  id: number
  url: string
  faq_item_id: number
}

interface Subcategory {
  id: number
  name: string
  categoryId: number
}

interface Category {
  id: number
  name: string
  subcategories: Subcategory[]
}

interface Props {
  categories: Category[]
  onCreated: () => void
  onCancel: () => void
  prefillQuestion?: string
}

export default function CreateQuestionForm({ categories, onCreated, onCancel, prefillQuestion }: Props) {
  const [newQuestion, setNewQuestion] = useState(prefillQuestion || "")
  const [newAnswer, setNewAnswer] = useState("")
  const [newCategoryId, setNewCategoryId] = useState<number | null>(null)
  const [newSubcategoryId, setNewSubcategoryId] = useState<number | null>(null)
  const [newDocuments, setNewDocuments] = useState<DocumentLink[]>([])

  useEffect(() => {
    setNewQuestion(prefillQuestion || "")
  }, [prefillQuestion])

  const handleCreate = async () => {
    if (!newQuestion || !newAnswer || !newSubcategoryId) return

    const newFaqItem = await fetchApi("faq-items", {
      method: "POST",
      body: JSON.stringify({
        question: newQuestion,
        answer: newAnswer,
        subcategory_id: newSubcategoryId,
      }),
    })

    await Promise.all(
      newDocuments.map((doc) =>
        fetchApi("documents", {
          method: "POST",
          body: JSON.stringify({
            url: doc.url,
            faq_item_id: parseInt(newFaqItem.id),
          }),
        })
      )
    )

    onCreated()
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Frage</label>
        <Input
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Geben Sie die Frage ein"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Antwort</label>
        <textarea
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
          rows={4}
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          placeholder="Geben Sie die Antwort ein"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Kategorie</label>
          <select
            value={newCategoryId ?? ""}
            onChange={(e) => {
              const id = Number(e.target.value)
              setNewCategoryId(id)
              const firstSub = categories.find(c => c.id === id)?.subcategories[0]
              setNewSubcategoryId(firstSub?.id ?? null)
            }}
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
          >
            <option value="" disabled>Wähle Kategorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Unterkategorie</label>
          <select
            value={newSubcategoryId ?? ""}
            onChange={(e) => setNewSubcategoryId(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
            disabled={!newCategoryId}
          >
            <option value="" disabled>Wähle Unterkategorie</option>
            {categories
              .find((c) => c.id === newCategoryId)
              ?.subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
          </select>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <h4 className="font-semibold text-[#00589A]">Dokumente</h4>

        {newDocuments.length === 0 && (
          <p className="text-sm text-gray-500 italic">Keine Dokumente vorhanden</p>
        )}

        {newDocuments.map((doc, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={doc.url}
              onChange={(e) => {
                const updated = [...newDocuments]
                updated[index] = { ...doc, url: e.target.value }
                setNewDocuments(updated)
              }}
              className="text-sm flex-1"
              placeholder="https://..."
            />
            <button
              type="button"
              onClick={() => {
                const updated = [...newDocuments]
                updated.splice(index, 1)
                setNewDocuments(updated)
              }}
              className="text-[#00589A] hover:text-[#003760]"
              aria-label="Dokument entfernen"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="bg-[#00589A] hover:bg-[#00487A] text-white"
          onClick={() =>
            setNewDocuments((prev) => [
              ...prev,
              { id: Date.now(), url: "", faq_item_id: 0 },
            ])
          }
        >
          + Dokument hinzufügen
        </Button>
      </div>

      <div className="pt-6 flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Abbrechen
        </Button>
        <Button
          onClick={handleCreate}
          className="bg-[#00589A] hover:bg-[#00487A] text-white"
          disabled={!newQuestion || !newAnswer || !newSubcategoryId}
        >
          Speichern
        </Button>
      </div>
    </div>
  )
}
