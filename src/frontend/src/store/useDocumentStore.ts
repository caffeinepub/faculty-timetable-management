import { useLocalStorage } from "../hooks/useLocalStorage";
import type { TeacherDocument } from "../types/models";

export function useDocumentStore() {
  const [documents, setDocuments] = useLocalStorage<TeacherDocument[]>(
    "ftms_documents",
    [],
  );

  const getDocumentsByTeacher = (teacherId: string) =>
    documents.filter((d) => d.teacherId === teacherId);

  const addDocument = (doc: Omit<TeacherDocument, "id" | "uploadedAt">) => {
    const newDoc: TeacherDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    setDocuments((prev) => [...prev, newDoc]);
    return newDoc;
  };

  const updateDocumentStatus = (
    id: string,
    status: TeacherDocument["status"],
    adminComment?: string,
  ) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status, adminComment: adminComment ?? d.adminComment }
          : d,
      ),
    );
  };

  return {
    documents,
    getDocumentsByTeacher,
    addDocument,
    updateDocumentStatus,
  };
}
