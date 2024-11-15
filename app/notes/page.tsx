'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { deleteNoteFromStorage, loadNotes, saveNotes } from '../../services/localStorage';
import { Note } from '../../types/note';

// Dynamic import of components
const Editor = dynamic(() => import('../../components/Editor'), { ssr: false });
const Modal = dynamic(() => import('../../components/Modal'), { ssr: false });

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
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    pendingNote: null,
    type: 'unsaved-changes'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load notes on initial render
  useEffect(() => {
    const loadInitialNotes = async () => {
      try {
        const savedNotes = await loadNotes();
        setNotes(savedNotes);
      } catch (error) {
        console.error('Error loading notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialNotes();
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

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const createNewNote = async () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      lastModified: Date.now(),
      lastSaved: Date.now(),
    };
    
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    await saveNotes(updatedNotes);
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

  const updateNoteTitle = (newTitle: string) => {
    setEditedTitle(newTitle);
    setHasUnsavedChanges(true);
  };

  const handleSaveNote = async () => {
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

    try {
      await saveNotes(updatedNotes);
      setNotes(updatedNotes);
      setSelectedNote(updatedNote);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving note:', error);
    }
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

  const handleModalConfirm = async () => {
    if (!modal.pendingNote) return;

    if (modal.type === 'delete-note') {
      try {
        await deleteNoteFromStorage(modal.pendingNote.id);
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
      } catch (error) {
        console.error('Error deleting note:', error);
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

  const filteredNotes = notes.filter(note => {
    const searchLower = searchQuery.toLowerCase();
    const titleIncludes = note.title.toLowerCase().includes(searchLower);
    const contentIncludes = note.content.toLowerCase().includes(searchLower);
    return titleIncludes || contentIncludes;
  }).sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="text-xl">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Sidebar */}
      <div className={`${
        isSidebarVisible ? 'w-full md:w-80' : 'w-0'
      } bg-zinc-900 border-r border-zinc-800 transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-xl font-semibold text-white">Listahan</h1>
            <button
              onClick={createNewNote}
              className="ml-auto px-3 py-1.5 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors text-sm"
            >
              Create
            </button>
          </div>
          <input
            type="text"
            placeholder="Search listahan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-600"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredNotes.length === 0 ? (
            <div className="p-4 text-zinc-400 text-center">
              {searchQuery ? 'No listahan found' : 'No listahan yet'}
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {filteredNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => selectNote(note)}
                  className={`w-full p-4 text-left hover:bg-zinc-800 transition-colors ${
                    selectedNote?.id === note.id ? 'bg-zinc-800' : ''
                  }`}
                >
                  <h3 className="font-medium text-white truncate">{note.title}</h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    {new Date(note.lastModified).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {selectedNote ? (
          <>
            <div className="flex items-center gap-4 p-4 border-b border-zinc-800 bg-zinc-900">
              <button
                onClick={toggleSidebar}
                className="md:hidden p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => updateNoteTitle(e.target.value)}
                className="flex-1 bg-transparent text-xl font-semibold text-white focus:outline-none"
                placeholder="Note title"
              />
              <div className="flex items-center gap-2 ml-[-100px] md:ml-0">
                <button
                  onClick={handleSaveNote}
                  disabled={!hasUnsavedChanges}
                  className={`px-3 py-1.5 rounded-lg transition-colors text-sm ${
                    hasUnsavedChanges
                      ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                      : 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  {hasUnsavedChanges ? 'Save' : 'Saved'}
                </button>
                <button
                  onClick={() => deleteNote(selectedNote)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-zinc-950">
              <Editor
                content={editedContent}
                onChange={updateNote}
                placeholder="Start writing..."
                className="min-h-full"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <h2 className="text-xl font-semibold text-white mb-2">No listahan selected</h2>
            <p className="text-zinc-400 mb-4">Select a listahan from the sidebar or create a new one</p>
            <button
              onClick={createNewNote}
              className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Create New Listahan
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal.isOpen && (
        <Modal
          isOpen={modal.isOpen}
          title={
            modal.type === 'delete-note'
              ? 'Delete Note'
              : 'Unsaved Changes'
          }
          message={
            modal.type === 'delete-note'
              ? 'Are you sure you want to delete this note? This action cannot be undone.'
              : 'You have unsaved changes. Do you want to discard them?'
          }
          confirmText={
            modal.type === 'delete-note'
              ? 'Delete'
              : 'Discard'
          }
          cancelText="Cancel"
          onConfirm={handleModalConfirm}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
