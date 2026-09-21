const badWords = [
  "puto", "puta", "mierda", "pendejo", "pendeja", "pendejada",
  "cabron", "cabrona", "cabrones", "chinga", "chingar", "chingado",
  "chingada", "chingados", "maldito", "maldita", "malditos", "malditas",
  "perra", "perro", "perras", "perros", "estupido", "estupida",
  "estupidos", "estupidas", "imbecil", "imbéciles", "idiota",
  "idiotas", "basura", "culero", "culera", "culos", "culo",
  "mamada", "mamado", "estúpido", "estúpida",
  "joder", "jodido", "jodida", "carajo", "coño", "cojones",
  "verga", "pinche", "chaparro", "chaparra",
  "naco", "naca", "nacos", "nacas", "ratero", "ratera",
  "huevon", "huevona", "huevón", "pelotudo", "pelotuda",
  "boludo", "boluda", "sapo", "maricón", "maricon",
  "marica", "loco", "loca", "locos", "locas", "tonto", "tonta",
  "tontos", "tontas", "feo", "fea", "feos", "feas"
];

export function containsBadWords(text) {
  if (!text) return false;
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");

  for (const word of badWords) {
    const normalizedWord = word
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "");
    if (normalized.includes(normalizedWord)) {
      return true;
    }
  }
  return false;
}
