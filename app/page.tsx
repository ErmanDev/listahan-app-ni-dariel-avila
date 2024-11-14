'use client';

import { useState, useEffect } from 'react';
import Editor from '../components/Editor';
import Modal from '../components/Modal';
import { Note } from '../types/note';
import { loadNotes, saveNote, saveNotes, deleteNoteFromStorage } from '../services/localStorage';

interface ModalState {
  isOpen: boolean;
  pendingNote: Note | null;
  type: 'unsaved-changes' | 'delete-note';
}

const highlightSearchMatch = (content: string, searchTerm: string) => {
  if (!searchTerm) return content;

  const searchLower = searchTerm.toLowerCase();
  const index = content.toLowerCase().indexOf(searchLower);
  if (index === -1) return content;

  const snippetStart = Math.max(0, index - 30);
  const snippetEnd = Math.min(content.length, index + searchTerm.length + 30);
  let snippet = content.slice(snippetStart, snippetEnd);

  if (snippetStart > 0) snippet = '...' + snippet;
  if (snippetEnd < content.length) snippet = snippet + '...';

  return snippet;
};

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editedContent, setEditedContent] = useState<string>('');
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    pendingNote: null,
    type: 'unsaved-changes',
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarVisible(!selectedNote);
      } else {
        setIsSidebarVisible(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedNote]);

  useEffect(() => {
    const notes = loadNotes();
    setNotes(notes);
  }, []);

  useEffect(() => {
    if (selectedNote) {
      setEditedContent(selectedNote.content);
      setEditedTitle(selectedNote.title);
    }
  }, [selectedNote?.id]);

  const handleSaveNote = () => {
    if (!selectedNote) return;

    const updatedNote = {
      ...selectedNote,
      content: editedContent,
      title: editedTitle,
      lastSaved: Date.now(),
      lastModified: Date.now(),
    };

    saveNote(updatedNote);
    setNotes(notes.map(note =>
      note.id === updatedNote.id ? updatedNote : note
    ));
    setSelectedNote(updatedNote);
    setHasUnsavedChanges(false);
  };

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      lastModified: Date.now(),
      lastSaved: null,
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

  const updateNote = (content: string) => {
    setEditedContent(content);
    setHasUnsavedChanges(true);
  };

  const updateNoteTitle = (id: string, newTitle: string) => {
    if (selectedNote?.id === id) {
      setEditedTitle(newTitle);
      setHasUnsavedChanges(true);
    }
  };

  const deleteNote = (id: string) => {
    const noteToDelete = notes.find(note => note.id === id);
    if (!noteToDelete) return;

    setModal({
      isOpen: true,
      pendingNote: noteToDelete,
      type: 'delete-note',
    });
  };

  const selectNote = (note: Note) => {
    if (selectedNote?.id === note.id) return;

    if (hasUnsavedChanges) {
      setModal({
        isOpen: true,
        pendingNote: note,
        type: 'unsaved-changes',
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

  const handleModalClose = () => {
    setModal({
      isOpen: false,
      pendingNote: null,
      type: 'unsaved-changes',
    });
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const filteredNotes = notes.filter(note => {
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return true;
    
    const titleMatch = note.title.toLowerCase().includes(searchLower);
    const contentMatch = note.content.toLowerCase().includes(searchLower);
    
    return titleMatch || contentMatch;
  }).sort((a, b) => {
    if (!searchTerm) {
      return (b.lastModified || 0) - (a.lastModified || 0);
    }
    
    const searchLower = searchTerm.toLowerCase().trim();
    const aTitle = a.title.toLowerCase();
    const bTitle = b.title.toLowerCase();
    
    if (aTitle === searchLower && bTitle !== searchLower) return -1;
    if (bTitle === searchLower && aTitle !== searchLower) return 1;
    
    const aTitleIncludes = aTitle.includes(searchLower);
    const bTitleIncludes = bTitle.includes(searchLower);
    if (aTitleIncludes && !bTitleIncludes) return -1;
    if (bTitleIncludes && !aTitleIncludes) return 1;
    
    return (b.lastModified || 0) - (a.lastModified || 0);
  });

  return (
    <div className="flex h-screen bg-zinc-950 relative">
      {/* Mobile Sidebar Toggle */}
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
        <div className="mb-4">
          <button
            onClick={createNewNote}
            className="w-full bg-zinc-800 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            New Note
          </button>
        </div>
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg mb-4 text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-600"
        />
        <div className="overflow-y-auto flex-1">
          {filteredNotes.length > 0 ? (
            filteredNotes.map(note => (
              <div
                key={note.id}
                className={`p-3 cursor-pointer rounded-lg mb-2 ${
                  selectedNote?.id === note.id 
                    ? 'bg-zinc-800 border border-zinc-700' 
                    : 'hover:bg-zinc-800'
                }`}
                onClick={() => selectNote(note)}
              >
                <div className="font-medium w-full bg-transparent border-none p-0 focus:outline-none text-white">
                  {note.title}
                  {searchTerm && note.content.toLowerCase().includes(searchTerm.toLowerCase()) && (
                    <div className="text-sm text-zinc-400 mt-1 line-clamp-2">
                      {highlightSearchMatch(note.content, searchTerm)}
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center mt-2 text-sm text-zinc-400">
                  <span>
                    {note.lastSaved 
                      ? `Saved ${new Date(note.lastSaved).toLocaleString()}`
                      : 'Not saved yet'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="text-zinc-400 hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-zinc-500 mt-4">
              No notes found matching "{searchTerm}"
            </div>
          )}
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
            ? `Are you sure you want to delete "${modal.pendingNote?.title}"? This action cannot be undone.`
            : 'You have unsaved changes in your current note. Do you want to discard them?'
        }
        confirmText={modal.type === 'delete-note' ? 'Delete' : 'Discard Changes'}
        cancelText={modal.type === 'delete-note' ? 'Cancel' : 'Keep Editing'}
      />
    </div>
  );
}
