import { useEffect, useState } from "react"
import { PencilIcon, TrashIcon, PlusIcon } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import "@/styles/Questions.css"
import CreateQuestionForm from "./CreateNewQuestionForm"

interface DocumentLink {
  id: number
  url: string
  faq_item_id: number
}

interface FaqItem {
  id: string
  question: string
  answer: string
  subcategory_id: number
  documents?: DocumentLink[]
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

export default function Questions() {
  const [categories, setCategories] = useState<Category[]>([])
  const [faqItems, setFaqItems] = useState<FaqItem[]>([])
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editedQuestion, setEditedQuestion] = useState<string>("")
  const [editedAnswer, setEditedAnswer] = useState<string>("")
  const [editedDocs, setEditedDocs] = useState<DocumentLink[]>([])
  const [editedCategoryId, setEditedCategoryId] = useState<number | null>(null)
  const [editedSubcategoryId, setEditedSubcategoryId] = useState<number | null>(null)
  const [openItems, setOpenItems] = useState<string[]>([])
  const [deletedDocIds, setDeletedDocIds] = useState<number[]>([])
  const [showNewQuestionSlider, setShowNewQuestionSlider] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, faqRes] = await Promise.all([
        fetch("http://localhost:3000/categories"),
        fetch("http://localhost:3000/faq-items"),
      ])
      const [catData, faqData] = await Promise.all([
        catRes.json(),
        faqRes.json(),
      ])

      setCategories(catData)
      setFaqItems(faqData)
    }

    fetchData()
  }, [])

  const resetEditState = () => {
    setEditingItem(null)
    setEditedQuestion("")
    setEditedAnswer("")
    setEditedDocs([])
    setEditedCategoryId(null)
    setEditedSubcategoryId(null)
    setDeletedDocIds([])
  }

  const handleEdit = (
    id: string,
    question: string,
    answer: string,
    docs?: DocumentLink[],
    subcategory_id?: number
  ) => {
    setEditingItem(id)
    setEditedQuestion(question)
    setEditedAnswer(answer)
    setEditedDocs(docs || [])
    setEditedSubcategoryId(subcategory_id || null)

    const sub = categories.flatMap(cat => cat.subcategories).find(s => s.id === subcategory_id)
    setEditedCategoryId(sub ? sub.categoryId : null)

    setOpenItems(prev => [...new Set([...prev, id.toString()])])
  }

  const handleSave = async (id: string) => {
    await fetch(`http://localhost:3000/faq-items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: editedQuestion,
        answer: editedAnswer,
        subcategory_id: editedSubcategoryId,
      }),
    })

    await Promise.all(
      editedDocs.map(async (doc) => {
        const isUnsaved = !doc.id || doc.id > 1_000_000_000_000
        if (isUnsaved) {
          return fetch("http://localhost:3000/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: doc.url,
              faq_item_id: parseInt(id),
            }),
          })
        } else {
          return fetch(`http://localhost:3000/documents/${doc.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: doc.url }),
          })
        }
      })
    )

    await Promise.all(
      deletedDocIds.map((id) =>
        fetch(`http://localhost:3000/documents/${id}`, {
          method: "DELETE",
        })
      )
    )

    const refreshedFaqItems = await fetch("http://localhost:3000/faq-items").then(res => res.json())
    setFaqItems(refreshedFaqItems)
    setOpenItems(prev => prev.filter(openId => openId !== id.toString()))
    resetEditState()
  }

  const handleQuestionDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      await fetch(`http://localhost:3000/faq-items/${id}`, {
        method: "DELETE",
      });

      const itemToDelete = faqItems.find(item => item.id === id);
      if (itemToDelete?.documents && itemToDelete.documents.length > 0) {
        await Promise.all(
          itemToDelete.documents.map(doc =>
            fetch(`http://localhost:3000/documents/${doc.id}`, {
              method: "DELETE",
            })
          )
        );
      }

      setFaqItems(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-10 p-4 relative">
      <div className="flex justify-end mb-6">
        <Button
          onClick={() => setShowNewQuestionSlider(true)}
          className="bg-[#00589A] hover:bg-[#00487A] text-white flex items-center gap-2 cursor-pointer"
        >
          <PlusIcon className="h-4 w-4" />
          Neue Frage hinzufügen
        </Button>
      </div>

      {showNewQuestionSlider && (
        <div
          style={{ backgroundColor: "#F6FFE0" }}
          className={`fixed inset-y-0 slider shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
            showNewQuestionSlider ? "translate-x-0" : "translate-x-full"
          } ${typeof window !== "undefined" && window.innerWidth < 640 ? "left-0 right-0" : "left-64 right-0"}`}
        >
          <div className="h-full overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#00589A]">Neue Frage erstellen</h2>
              <button
                onClick={() => setShowNewQuestionSlider(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <CreateQuestionForm
              categories={categories}
              onCreated={async () => {
                const refreshedFaqItems = await fetch("http://localhost:3000/faq-items").then(res => res.json())
                setFaqItems(refreshedFaqItems)
                setShowNewQuestionSlider(false)
              }}
              onCancel={() => setShowNewQuestionSlider(false)}
            />
          </div>
        </div>
      )}

      {categories.map((category) => (
        <div key={category.id}>
          <h2 className="text-xl font-semibold text-[#00589A] mb-2">
            {category.name}
          </h2>

          {category.subcategories.map((sub) => {
            const subFaqs = faqItems.filter((faq) => faq.subcategory_id === sub.id)
            if (subFaqs.length === 0) return null

            return (
              <div key={sub.id} className="mb-4">
                <h3 className="text-lg font-medium mb-2 pl-2 text-gray-800">
                  {sub.name}
                </h3>

                <Accordion
                  type="multiple"
                  value={openItems}
                  onValueChange={(newOpenItems) => {
                    if (editingItem && !newOpenItems.includes(editingItem.toString())) {
                      resetEditState()
                    }
                    setOpenItems(newOpenItems)
                  }}
                  className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {subFaqs.map((faq) => {
                    const faqIdStr = faq.id.toString()
                    return (
                      <AccordionItem
                        key={faq.id}
                        value={faqIdStr}
                        className="pl-3 pr-3 border-b hover:bg-[#f0f8ff] transition-colors"
                        style={{ borderBottomColor: "#cbd5e1" }}
                      >
                        <AccordionTrigger className="flex items-center gap-2 cursor-pointer">
                          <span className="flex-1 text-left text-gray-900 cursor-pointer">
                            {faq.question}
                          </span>
                          <div className="flex gap-2 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuestionDelete(faq.id);
                              }}
                              className="text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                              aria-label="Delete question"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(
                                  faq.id,
                                  faq.question,
                                  faq.answer,
                                  faq.documents,
                                  faq.subcategory_id
                                );
                              }}
                              className="text-[#00589A] hover:text-[#00395f] transition-colors cursor-pointer"
                              aria-label="Edit question"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-gray-600">
                          {editingItem === faq.id ? (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium">Frage</label>
                                <input
                                  type="text"
                                  value={editedQuestion}
                                  onChange={(e) => setEditedQuestion(e.target.value)}
                                  className="w-full border border-gray-300 rounded px-2 py-1"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium">Antwort</label>
                                <textarea
                                  value={editedAnswer}
                                  onChange={(e) => setEditedAnswer(e.target.value)}
                                  className="w-full border border-gray-300 rounded px-2 py-1"
                                  rows={4}
                                />
                              </div>

                              <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                  <label className="block text-sm font-medium">Kategorie</label>
                                  <select
                                    value={editedCategoryId ?? ""}
                                    onChange={(e) => {
                                      const newCatId = Number(e.target.value)
                                      setEditedCategoryId(newCatId)
                                      const firstSub = categories.find(c => c.id === newCatId)?.subcategories[0]
                                      setEditedSubcategoryId(firstSub?.id ?? null)
                                    }}
                                    className="w-full border border-gray-300 rounded px-2 py-1"
                                  >
                                    <option value="">Wähle Kategorie</option>
                                    {categories.map(cat => (
                                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                  </select>
                                </div>

                                <div className="flex-1">
                                  <label className="block text-sm font-medium">Unterkategorie</label>
                                  <select
                                    value={editedSubcategoryId ?? ""}
                                    onChange={(e) => setEditedSubcategoryId(Number(e.target.value))}
                                    className="w-full border border-gray-300 rounded px-2 py-1"
                                  >
                                    <option value="">Wähle Unterkategorie</option>
                                    {categories.find(cat => cat.id === editedCategoryId)?.subcategories.map(sub => (
                                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-semibold text-[#00589A]">Dokumente</h4>
                                {editedDocs.map((doc, index) => (
                                  <div key={doc.id ?? `new-${index}`} className="flex items-center gap-2">
                                    <input
                                      value={doc.url}
                                      onChange={(e) => {
                                        const updated = [...editedDocs]
                                        updated[index] = { ...doc, url: e.target.value }
                                        setEditedDocs(updated)
                                      }}
                                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                                      placeholder="https://..."
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (doc.id && doc.id <= 1_000_000_000_000) {
                                          setDeletedDocIds(prev => [...prev, doc.id])
                                        }
                                        const updated = [...editedDocs]
                                        updated.splice(index, 1)
                                        setEditedDocs(updated)
                                      }}
                                      className="text-[#00589A] hover:text-[#00395f]"
                                      title="Dokument entfernen"
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}

                                <Button
                                  type="button"
                                  variant="outline"
                                  className="mt-2 bg-[#00589A] hover:bg-[#00487A] text-white"
                                  onClick={() =>
                                    setEditedDocs(prev => [
                                      ...prev,
                                      {
                                        id: Date.now(),
                                        url: "",
                                        faq_item_id: parseInt(editingItem ?? "0"),
                                      },
                                    ])
                                  }
                                >
                                  + Dokument hinzufügen
                                </Button>
                              </div>

                              <div className="pt-4 flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setOpenItems(prev => prev.filter(openId => openId !== faq.id.toString()))
                                    resetEditState()
                                  }}
                                >
                                  Abbrechen
                                </Button>
                                <Button
                                  onClick={() => handleSave(faq.id)}
                                  className="bg-[#00589A] hover:bg-[#00487A] text-white"
                                >
                                  Speichern
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p>{faq.answer}</p>
                              {faq.documents && faq.documents.length > 0 && (
                                <div className="mt-2">
                                  <h4 className="font-semibold text-[#00589A]">Dokumente</h4>
                                  <ul className="list-disc list-inside text-blue-600 underline">
                                    {faq.documents.map((doc) => (
                                      <li key={doc.id}>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                          {doc.url}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
