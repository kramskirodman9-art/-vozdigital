import { createContext, useState, useEffect, useContext } from "react";

const TeacherContext = createContext();

export function useTeacher() {
  return useContext(TeacherContext);
}

const TEACHERS_KEY = "vozdigital_teachers";
const TEACHER_SESSION = "vozdigital_teacher_session";

const DEFAULT_TEACHERS = [
  { id: "default-1", name: "Rodman Kramski", password: "1234", createdAt: "2025-01-01T00:00:00.000Z" },
  { id: "default-2", name: "Mtra. Patricia Vega", password: "1234", createdAt: "2025-01-01T00:00:00.000Z" },
  { id: "default-3", name: "Prof. Alejandro Díaz", password: "1234", createdAt: "2025-01-01T00:00:00.000Z" },
];

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

  useEffect(() => {
    const session = localStorage.getItem(TEACHER_SESSION);
    if (session) {
      try { setTeacher(JSON.parse(session)); } catch { /* empty */ }
    }
    setLoading(false);
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
    return session;
  }

  function logoutTeacher() {
    setTeacher(null);
    localStorage.removeItem(TEACHER_SESSION);
  }

  function isTeacher() {
    return !!teacher;
  }

  const value = { teacher, loading, registerTeacher, loginTeacher, logoutTeacher, isTeacher };

  return <TeacherContext.Provider value={value}>{children}</TeacherContext.Provider>;
}
