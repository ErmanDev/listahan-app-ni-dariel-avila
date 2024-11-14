import { Note } from '../types/note';

const NOTES_KEY = 'notes';

export const loadNotes = async (): Promise<Note[]> => {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const savedNotes = localStorage.getItem(NOTES_KEY);
    if (!savedNotes) {
      return [];
    }

    const parsedNotes = JSON.parse(savedNotes);
    if (!Array.isArray(parsedNotes)) {
      console.warn('Stored notes are not in array format');
      return [];
    }

    // Validate the structure of each note
    const validNotes = parsedNotes.filter((note): note is Note => {
      return (
        typeof note === 'object' &&
        note !== null &&
        typeof note.id === 'string' &&
        typeof note.title === 'string' &&
        typeof note.content === 'string' &&
        typeof note.lastModified === 'number' &&
        (note.lastSaved === null || typeof note.lastSaved === 'number')
      );
    });

    if (validNotes.length !== parsedNotes.length) {
      console.warn('Some notes were invalid and filtered out');
    }

    return validNotes;
  } catch (error) {
    console.error('Error loading notes:', error);
    localStorage.setItem(NOTES_KEY, '[]');
    return [];
  }
};

export const saveNote = async (note: Note): Promise<void> => {
  try {
    const notes = await loadNotes();
    const updatedNotes = notes.map(n => n.id === note.id ? note : n);
    localStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
  } catch (error) {
    console.error('Error saving note:', error);
    throw error;
  }
};

export const saveNotes = async (notes: Note[]): Promise<void> => {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving notes:', error);
    throw error;
  }
};

export const deleteNoteFromStorage = async (id: string): Promise<void> => {
  try {
    const notes = await loadNotes();
    const updatedNotes = notes.filter(note => note.id !== id);
    localStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};
