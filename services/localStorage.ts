interface Note {
  id: string;
  title: string;
  content: string;
  lastModified: number;
  lastSaved: number | null;
}

const NOTES_KEY = 'notes';

export const loadNotes = (): Note[] => {
  if (typeof window === 'undefined') return [];
  
  const savedNotes = localStorage.getItem(NOTES_KEY);
  if (!savedNotes) return [];

  try {
    return JSON.parse(savedNotes);
  } catch (error) {
    console.error('Error loading notes:', error);
    localStorage.setItem(NOTES_KEY, '[]');
    return [];
  }
};

export const saveNote = (note: Note): void => {
  const notes = loadNotes();
  const updatedNotes = notes.map(n => n.id === note.id ? note : n);
  localStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
};

export const saveNotes = (notes: Note[]): void => {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
};

export const deleteNoteFromStorage = (id: string): void => {
  const notes = loadNotes();
  const updatedNotes = notes.filter(note => note.id !== id);
  localStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
};
