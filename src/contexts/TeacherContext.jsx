import { createContext, useState, useEffect, useContext, useCallback } from "react";

const TeacherContext = createContext();

export function useTeacher() {
  return useContext(TeacherContext);
}

const TEACHERS_KEY = "vozdigital_teachers";
const TEACHER_SESSION = "vozdigital_teacher_session";
const TEACHER_MESSAGES_KEY = "vozdigital_teacher_messages";
const TEACHER_RESPONSES_KEY = "vozdigital_teacher_responses";
const TEACHER_DOCS_KEY = "vozdigital_teacher_docs";
const TEACHER_CHAT_KEY = "vozdigital_teacher_chat";

const DEFAULT_TEACHERS = [
  { id: "default-1", name: "Rodman Kramski", password: "1234", createdAt: "2025-01-01T00:00:00.000Z" },
  { id: "default-2", name: "Mtra. Patricia Vega", password: "1234", createdAt: "2025-01-01T00:00:00.000Z" },
  { id: "default-3", name: "Prof. Alejandro Díaz", password: "1234", createdAt: "2025-01-01T00:00:00.000Z" },
];

const DEFAULT_MESSAGES = [
  { id: "tm1", teacherId: "default-2", teacher: "Mtra. Patricia Vega", text: "Recordatorio: El proyecto de ciencias se entrega el viernes 12 de septiembre.", priority: "normal", createdAt: "2026-09-01" },
  { id: "tm2", teacherId: "default-3", teacher: "Prof. Alejandro Díaz", text: "Reunión de padres de familia el próximo lunes a las 5pm.", priority: "urgente", createdAt: "2026-09-03" },
];

const DEFAULT_STUDENT_MESSAGES = [
  { id: "sm1", student: "Ana López", folio: "1001", teacherId: "default-2", teacher: "Mtra. Patricia Vega", text: "¿La tarea de matemáticas es solo del libro o también hay que hacer la hoja?", createdAt: "2026-09-05T10:30:00", read: false },
  { id: "sm2", student: "Carlos Ruiz", folio: "1002", teacherId: "default-3", teacher: "Prof. Alejandro Díaz", text: "Profesor, ¿puedo entregar el trabajo tarde? Tuve una emergencia.", createdAt: "2026-09-05T11:15:00", read: false },
  { id: "sm3", student: "María García", folio: "1003", teacherId: "default-2", teacher: "Mtra. Patricia Vega", text: "¿Cuándo es el examen de ciencias?", createdAt: "2026-09-06T09:00:00", read: true },
];

const DEFAULT_DOCS = [
  { id: "doc1", teacherId: "default-2", teacher: "Mtra. Patricia Vega", name: "Guía de Ciencias - Sep 2026", type: "guia", description: "Capítulo 3: El sistema solar", url: "#", createdAt: "2026-09-01" },
  { id: "doc2", teacherId: "default-3", teacher: "Prof. Alejandro Díaz", name: "Calendario de actividades", type: "aviso", description: "Actividades del mes de septiembre", url: "#", createdAt: "2026-09-02" },
];

const DEFAULT_CHAT = [
  { id: "ch1", sender: "Ana López", senderType: "student", teacherId: "default-2", text: "Hola maestra, ¿puedo preguntar algo?", createdAt: "2026-09-06T14:00:00" },
  { id: "ch2", sender: "Mtra. Patricia Vega", senderType: "teacher", teacherId: "default-2", text: "Hola Ana, ¡claro! Pregunta lo que necesites.", createdAt: "2026-09-06T14:02:00" },
];

function getStore(key, defaults) {
  try {
    const stored = JSON.parse(localStorage.getItem(key)) || [];
    return stored.length > 0 ? stored : defaults;
  } catch { return defaults; }
}

function setStore(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getTeachers() {
  try {
    const stored = JSON.parse(localStorage.getItem(TEACHERS_KEY)) || [];
    const allNames = new Set(stored.map(t => t.name));
    const defaultsToAdd = DEFAULT_TEACHERS.filter(t => !allNames.has(t.name));
    if (defaultsToAdd.length > 0) {
      const merged = [...stored, ...defaultsToAdd];
      localStorage.setItem(TEACHERS_KEY, JSON.stringify(merged));
      return merged;
    }
    return stored;
  } catch { return [...DEFAULT_TEACHERS]; }
}

function saveTeachers(teachers) {
  localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachers));
}

export function TeacherProvider({ children }) {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentMessages, setStudentMessages] = useState([]);
  const [responses, setResponses] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [myMessages, setMyMessages] = useState([]);

  useEffect(() => {
    const session = localStorage.getItem(TEACHER_SESSION);
    if (session) {
      try {
        const t = JSON.parse(session);
        setTeacher(t);
        loadTeacherData(t.id);
      } catch { /* empty */ }
    }
    setLoading(false);
  }, [loadTeacherData]);

  const loadTeacherData = useCallback((teacherId) => {
    const allStudentMsgs = getStore(TEACHER_MESSAGES_KEY, DEFAULT_STUDENT_MESSAGES);
    setStudentMessages(allStudentMsgs.filter(m => m.teacherId === teacherId));

    const allResponses = getStore(TEACHER_RESPONSES_KEY, []);
    setResponses(allResponses);

    const allDocs = getStore(TEACHER_DOCS_KEY, DEFAULT_DOCS);
    setDocuments(allDocs.filter(d => d.teacherId === teacherId));

    const allChat = getStore(TEACHER_CHAT_KEY, DEFAULT_CHAT);
    setChatMessages(allChat.filter(c => c.teacherId === teacherId));

    const allMyMsgs = getStore(TEACHER_MESSAGES_KEY, DEFAULT_MESSAGES);
    setMyMessages(allMyMsgs.filter(m => m.teacherId === teacherId));
  }, []);

  function registerTeacher(name, password) {
    const teachers = getTeachers();
    if (teachers.find((t) => t.name === name)) {
      throw new Error("Ya existe un maestro con ese nombre");
    }
    const newTeacher = {
      id: Date.now().toString(),
      name,
      password,
      createdAt: new Date().toISOString(),
    };
    teachers.push(newTeacher);
    saveTeachers(teachers);
    return newTeacher;
  }

  function loginTeacher(name, password) {
    const teachers = getTeachers();
    const found = teachers.find((t) => t.name === name && t.password === password);
    if (!found) {
      throw new Error("Nombre o contraseña incorrectos");
    }
    const session = { id: found.id, name: found.name };
    setTeacher(session);
    localStorage.setItem(TEACHER_SESSION, JSON.stringify(session));
    loadTeacherData(found.id);
    return session;
  }

  function logoutTeacher() {
    setTeacher(null);
    setStudentMessages([]);
    setResponses([]);
    setDocuments([]);
    setChatMessages([]);
    setMyMessages([]);
    localStorage.removeItem(TEACHER_SESSION);
  }

  // ---- Avisos del maestro ----
  function addMessage(text, priority = "normal") {
    if (!teacher) return;
    const allMsgs = getStore(TEACHER_MESSAGES_KEY, DEFAULT_MESSAGES);
    const newMsg = {
      id: Date.now().toString(),
      teacherId: teacher.id,
      teacher: teacher.name,
      text,
      priority,
      createdAt: new Date().toISOString(),
    };
    allMsgs.unshift(newMsg);
    setStore(TEACHER_MESSAGES_KEY, allMsgs);
    setMyMessages(prev => [newMsg, ...prev]);
    return newMsg;
  }

  function deleteMessage(id) {
    const allMsgs = getStore(TEACHER_MESSAGES_KEY, DEFAULT_MESSAGES).filter(m => m.id !== id);
    setStore(TEACHER_MESSAGES_KEY, allMsgs);
    setMyMessages(prev => prev.filter(m => m.id !== id));
  }

  // ---- Respuestas a alumnos ----
  function replyToStudent(messageId, replyText) {
    if (!teacher) return;
    const allResponses = getStore(TEACHER_RESPONSES_KEY, []);
    const newResponse = {
      id: Date.now().toString(),
      messageId,
      teacherId: teacher.id,
      teacher: teacher.name,
      text: replyText,
      createdAt: new Date().toISOString(),
    };
    allResponses.push(newResponse);
    setStore(TEACHER_RESPONSES_KEY, allResponses);
    setResponses(prev => [...prev, newResponse]);

    // Marcar como leído
    const allStudentMsgs = getStore(TEACHER_MESSAGES_KEY, DEFAULT_STUDENT_MESSAGES);
    const updated = allStudentMsgs.map(m => m.id === messageId ? { ...m, read: true } : m);
    setStore(TEACHER_MESSAGES_KEY, updated);
    setStudentMessages(updated.filter(m => m.teacherId === teacher.id));

    return newResponse;
  }

  function getResponsesForMessage(messageId) {
    return responses.filter(r => r.messageId === messageId);
  }

  // ---- Documentos ----
  function addDocument(name, type, description, url = "#") {
    if (!teacher) return;
    const allDocs = getStore(TEACHER_DOCS_KEY, DEFAULT_DOCS);
    const newDoc = {
      id: Date.now().toString(),
      teacherId: teacher.id,
      teacher: teacher.name,
      name,
      type,
      description,
      url,
      createdAt: new Date().toISOString(),
    };
    allDocs.unshift(newDoc);
    setStore(TEACHER_DOCS_KEY, allDocs);
    setDocuments(prev => [newDoc, ...prev]);
    return newDoc;
  }

  function deleteDocument(id) {
    const allDocs = getStore(TEACHER_DOCS_KEY, DEFAULT_DOCS).filter(d => d.id !== id);
    setStore(TEACHER_DOCS_KEY, allDocs);
    setDocuments(prev => prev.filter(d => d.id !== id));
  }

  // ---- Chat ----
  function sendChatMessage(text, senderType = "teacher") {
    if (!teacher) return;
    const allChat = getStore(TEACHER_CHAT_KEY, DEFAULT_CHAT);
    const newMsg = {
      id: Date.now().toString(),
      sender: teacher.name,
      senderType,
      teacherId: teacher.id,
      text,
      createdAt: new Date().toISOString(),
    };
    allChat.push(newMsg);
    setStore(TEACHER_CHAT_KEY, allChat);
    setChatMessages(prev => [...prev, newMsg]);
    return newMsg;
  }

  // ---- Estadísticas ----
  function getStats() {
    const unread = studentMessages.filter(m => !m.read).length;
    const total = studentMessages.length;
    const totalDocs = documents.length;
    const totalChats = chatMessages.length;
    return { unread, total, totalDocs, totalChats };
  }

  const value = {
    teacher,
    loading,
    studentMessages,
    responses,
    documents,
    chatMessages,
    myMessages,
    registerTeacher,
    loginTeacher,
    logoutTeacher,
    addMessage,
    deleteMessage,
    replyToStudent,
    getResponsesForMessage,
    addDocument,
    deleteDocument,
    sendChatMessage,
    getStats,
  };

  return <TeacherContext.Provider value={value}>{children}</TeacherContext.Provider>;
}
