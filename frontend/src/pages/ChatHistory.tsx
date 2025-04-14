"use client";

import * as React from "react";
import { BookOpenIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ChatHistoryItem {
  id: number;
  question: string;
  answer: string;
  date: string;
  status: boolean;
  embedding: null | unknown;
  hasEmbedding: boolean;
}

export function ChatHistory() {
  const [history, setHistory] = React.useState<ChatHistoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await fetch("http://localhost:3000/bot-history");
        if (!response.ok) {
          throw new Error("Failed to fetch chat history");
        }
        const data = await response.json();
        setHistory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const isActuallyAnswered = (item: ChatHistoryItem) => {
    if (!item.answer) return false;
    return item.status && !item.answer.toLowerCase().includes("ich kenne die antwort");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center mb-4 sm:mb-6">
        <BookOpenIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
        <h1 className="text-xl sm:text-2xl font-semibold">Chat History</h1>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-4">
        {history.length > 0 ? (
          history.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium">ID: {item.id}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${isActuallyAnswered(item) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {isActuallyAnswered(item) ? 'Answered' : 'Not Answered'}
                </span>
              </div>
              <div className="mb-2">
                <p className="font-medium text-sm text-gray-500">Question:</p>
                <p className="text-sm line-clamp-3">{item.question}</p>
              </div>
              <div className="mb-2">
                <p className="font-medium text-sm text-gray-500">Answer:</p>
                <p className="text-sm whitespace-pre-line">{item.answer}</p>
              </div>
              <div>
                <p className="font-medium text-sm text-gray-500">Date:</p>
                <p className="text-sm">{formatDate(item.date)}</p>
              </div>
            </div>
          ))
        ) : (
          !loading && (
            <div className="text-center py-6 text-gray-500">
              No chat history available
            </div>
          )
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-b border-gray-200">
              <TableHead className="w-[80px] border-r border-gray-200">ID</TableHead>
              <TableHead className="max-w-[150px] border-r border-gray-200">Question</TableHead>
              <TableHead className="min-w-[300px] border-r border-gray-200">Answer</TableHead>
              <TableHead className="w-[180px] border-r border-gray-200">Date</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item, index) => (
              <TableRow
                key={item.id}
                className={`
                  ${index === history.length - 1 ? 'border-b border-gray-200' : 'border-b border-gray-200'}
                  hover:bg-gray-50
                `}
              >
                <TableCell className="font-medium border-r border-gray-200">{item.id}</TableCell>
                <TableCell className="border-r border-gray-200 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap hover:whitespace-normal hover:max-w-none hover:z-10 hover:bg-white hover:absolute hover:shadow-lg hover:border hover:border-gray-200">
                  {item.question}
                </TableCell>
                <TableCell className="whitespace-pre-line border-r border-gray-200">{item.answer}</TableCell>
                <TableCell className="border-r border-gray-200">{formatDate(item.date)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${isActuallyAnswered(item) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {isActuallyAnswered(item) ? 'Answered' : 'Not Answered'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {history.length === 0 && !loading && (
          <div className="text-center py-10 text-gray-500 border-t border-gray-200">
            No chat history available
          </div>
        )}
      </div>
    </div>
  );
}
