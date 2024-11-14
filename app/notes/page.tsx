'use client';

import { useState, useEffect } from 'react';
import Editor from '../../components/Editor';
import Modal from '../../components/Modal';
import { Note } from '../../types/note';
import { loadNotes, saveNote, saveNotes, deleteNoteFromStorage } from '../../services/localStorage';

interface ModalState {
  isOpen: boolean;
  pendingNote: Note | null;
  type: 'unsaved-changes' | 'delete-note';
}

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    pendingNote: null,
    type: 'unsaved-changes'
  });

  // Load notes on initial render
  useEffect(() => {
    const savedNotes = loadNotes();
    setNotes(savedNotes);
  }, []);

  // Handle window resize for sidebar visibility
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarVisible(!selectedNote);
      } else {
        setIsSidebarVisible(true);
      }
    };

    handleResize(); // Call on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedNote]);

  useEffect(() => {
    if (!selectedNote && window.innerWidth < 768) {
      setIsSidebarVisible(true);
    }
  }, [selectedNote]);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      lastModified: Date.now(),
      lastSaved: Date.now(),
    };
    
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    setSelectedNote(newNote);
    setEditedContent('');
    setEditedTitle('Untitled Note');
    setHasUnsavedChanges(false);
    if (window.innerWidth < 768) {
      setIsSidebarVisible(false);
    }
  };

  const selectNote = (note: Note) => {
    if (selectedNote && hasUnsavedChanges) {
      setModal({
        isOpen: true,
        pendingNote: note,
        type: 'unsaved-changes'
      });
      return;
    }

    setSelectedNote(note);
    setEditedContent(note.content);
    setEditedTitle(note.title);
    setHasUnsavedChanges(false);
    if (window.innerWidth < 768) {
      setIsSidebarVisible(false);
    }
  };

  const updateNote = (newContent: string) => {
    setEditedContent(newContent);
    setHasUnsavedChanges(true);
  };

  const updateNoteTitle = (id: string, newTitle: string) => {
    setEditedTitle(newTitle);
    setHasUnsavedChanges(true);
  };

  const handleSaveNote = () => {
    if (!selectedNote) return;

    const updatedNote = {
      ...selectedNote,
      content: editedContent,
      title: editedTitle,
      lastSaved: Date.now(),
      lastModified: Date.now(),
    };

    const updatedNotes = notes.map(note =>
      note.id === updatedNote.id ? updatedNote : note
    );

    saveNotes(updatedNotes); // Save all notes to localStorage
    setNotes(updatedNotes);
    setSelectedNote(updatedNote);
    setHasUnsavedChanges(false);
  };

  const deleteNote = (noteToDelete: Note) => {
    setModal({
      isOpen: true,
      pendingNote: noteToDelete,
      type: 'delete-note'
    });
  };

  const handleModalClose = () => {
    setModal({
      isOpen: false,
      pendingNote: null,
      type: 'unsaved-changes'
    });
  };

  const handleModalConfirm = () => {
    if (!modal.pendingNote) return;

    if (modal.type === 'delete-note') {
      deleteNoteFromStorage(modal.pendingNote.id);
      setNotes(notes.filter(note => note.id !== modal.pendingNote?.id));
      if (selectedNote?.id === modal.pendingNote.id) {
        setSelectedNote(null);
        setEditedContent('');
        setEditedTitle('');
        setHasUnsavedChanges(false);
        if (window.innerWidth < 768) {
          setIsSidebarVisible(true);
        }
      }
    } else if (modal.type === 'unsaved-changes') {
      // Discard current changes and switch to the new note
      setSelectedNote(modal.pendingNote);
      setEditedContent(modal.pendingNote.content);
      setEditedTitle(modal.pendingNote.title);
      setHasUnsavedChanges(false);
      if (window.innerWidth < 768) {
        setIsSidebarVisible(false);
      }
    }

    setModal({
      isOpen: false,
      pendingNote: null,
      type: 'unsaved-changes',
    });
  };

  const filteredNotes = notes.filter(note => {
    const searchLower = searchQuery.toLowerCase();
    const titleIncludes = note.title.toLowerCase().includes(searchLower);
    const contentIncludes = note.content.toLowerCase().includes(searchLower);
    return titleIncludes || contentIncludes;
  }).sort((a, b) => {
    const searchLower = searchQuery.toLowerCase();
    const aTitleIncludes = a.title.toLowerCase().includes(searchLower);
    const bTitleIncludes = b.title.toLowerCase().includes(searchLower);
    
    if (aTitleIncludes && !bTitleIncludes) return -1;
    if (bTitleIncludes && !aTitleIncludes) return 1;
    
    return (b.lastModified || 0) - (a.lastModified || 0);
  });

  return (
    <div className="flex h-screen bg-zinc-950 relative">
      {/* Mobile Sidebar Toggle - Only show when note is selected */}
      {selectedNote && window.innerWidth < 768 && (
        <button
          onClick={toggleSidebar}
          className="md:hidden fixed top-4 left-2 z-50 p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      )}

      {/* Sidebar */}
      <div className={`${
        isSidebarVisible ? 'translate-x-0' : '-translate-x-full'
      } transform transition-transform duration-300 fixed md:relative md:translate-x-0 z-40 w-full md:w-72 h-full bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col`}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white ml-10 md:ml-0">Notes</h1>
          <button
            onClick={createNewNote}
            className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                selectedNote?.id === note.id
                  ? 'bg-zinc-800 text-white'
                  : 'hover:bg-zinc-800/50 text-zinc-400 hover:text-white'
              }`}
              onClick={() => selectNote(note)}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{note.title}</div>
                <div className="text-xs text-zinc-500 truncate">
                  {note.lastModified
                    ? new Date(note.lastModified).toLocaleDateString()
                    : 'No date'}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-700 rounded transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 bg-zinc-900 overflow-y-auto transition-all duration-300 ${
        isEditorExpanded ? 'p-0' : 'p-4 md:p-8'
      }`}>
        {selectedNote ? (
          <div className={`space-y-4 ${isEditorExpanded ? '' : 'max-w-4xl mx-auto ml-10'}`}>
            <div className={`flex items-center justify-between ${
              isEditorExpanded ? 'hidden' : 'block'
            }`}>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => updateNoteTitle(selectedNote.id, e.target.value)}
                className="text-xl md:text-2xl font-bold bg-transparent border-none p-0 focus:outline-none text-white w-full"
                placeholder="Note Title"
              />
              <button
                onClick={handleSaveNote}
                disabled={!hasUnsavedChanges}
                className={`ml-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-colors min-w-fit text-sm md:text-base ${
                  hasUnsavedChanges
                    ? 'bg-zinc-700 hover:bg-zinc-600 text-white'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
              </button>
            </div>
            <div className={`text-xs md:text-sm text-zinc-400 ${
              isEditorExpanded ? 'hidden' : 'block'
            }`}>
              {selectedNote.lastSaved 
                ? `Last saved: ${new Date(selectedNote.lastSaved).toLocaleString()}`
                : 'Not saved yet'}
            </div>
            <Editor
              key={selectedNote.id}
              content={editedContent}
              onChange={updateNote}
              onExpandChange={setIsEditorExpanded}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-500">
            Select a note or create a new one
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        title={modal.type === 'delete-note' ? 'Delete Note' : 'Unsaved Changes'}
        message={
          modal.type === 'delete-note'
            ? 'Are you sure you want to delete this note? This action cannot be undone.'
            : 'You have unsaved changes. Do you want to discard them?'
        }
        confirmText={modal.type === 'delete-note' ? 'Delete' : 'Discard'}
        cancelText="Cancel"
      />
    </div>
  );
}
