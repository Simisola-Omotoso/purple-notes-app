let isDragging = false;
let lastDownX = 0;

const sidebarDivider = document.getElementById('sidebar-divider');
const notesDivider = document.getElementById('notes-divider');

sidebarDivider.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastDownX = e.clientX;
});

notesDivider.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastDownX = e.clientX;
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const dx = e.clientX - lastDownX;

    const sidebar = document.querySelector('.sidebar');
    const notesSection = document.querySelector('.notes-section');
    const editor = document.querySelector('.editor');

    if (e.target === sidebarDivider) {
        sidebar.style.width = `${sidebar.offsetWidth + dx}px`;
        notesSection.style.width = `${notesSection.offsetWidth - dx}px`;
    } else if (e.target === notesDivider) {
        notesSection.style.width = `${notesSection.offsetWidth + dx}px`;
        editor.style.width = `${editor.offsetWidth - dx}px`;
    }

    lastDownX = e.clientX;
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});
class NoteManager {
    constructor() {
        this.notes = [];
        this.activeNote = null;
    }

    loadNotes() {
        const savedNotes = JSON.parse(localStorage.getItem('notes'));
        if (savedNotes) {
            this.notes = savedNotes;
        }
    }

    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }

    createNewNote(folderId) {
        const newNote = { id: Date.now(), title: 'New Note', content: '', date: new Date().toLocaleDateString(), folderId };
        this.notes.push(newNote);
        this.saveNotes(); // Save after creating a new note
        return newNote;
    }

    setActiveNote(id) {
        this.activeNote = this.notes.find(note => note.id === id);
        this.saveNotes(); // Save after setting active note
    }

    updateNoteContent(content) {
        if (this.activeNote) {
            this.activeNote.content = content;
            this.activeNote.date = new Date().toLocaleDateString();
            this.saveNotes(); // Save after updating note content
        }
    }

    getNotesByFolder(folderId) {
        return this.notes.filter(note => note.folderId === folderId);
    }
}

class FolderManager {
    constructor() {
        this.folders = [];
        this.activeFolder = null;
    }

    loadFolders() {
        const savedFolders = JSON.parse(localStorage.getItem('folders'));
        if (savedFolders) {
            this.folders = savedFolders;
        }
    }

    saveFolders() {
        localStorage.setItem('folders', JSON.stringify(this.folders));
    }

    createFolder(name) {
        const newFolder = { id: Date.now(), name, active: false };
        this.folders.push(newFolder);
        this.saveFolders(); // Save after creating a new folder
    }

    setActiveFolder(id) {
        this.folders.forEach(folder => folder.active = folder.id === id);
        this.activeFolder = this.folders.find(folder => folder.id === id);
        this.saveFolders(); // Save after setting active folder
    }

    getActiveFolder() {
        return this.activeFolder;
    }
}

class Editor {
    constructor(noteManager) {
        this.noteManager = noteManager;
        this.editorTitle = document.querySelector('.editor-title');
        this.editorContent = document.querySelector('.editor-content');
        this.initializeEventListeners();
        this.initializeToolbarListeners(); // Ensure this is called
    }

    initializeEventListeners() {
        this.editorTitle.addEventListener('input', (e) => {
            if (this.noteManager.activeNote) {
                this.noteManager.activeNote.title = e.target.textContent.trim();
                this.noteManager.saveNotes(); // Save after updating note title
            }
        });

        this.editorContent.addEventListener('input', debounce((e) => {
            this.noteManager.activeNote.content = e.target.innerHTML;
            this.noteManager.saveNotes();
        }, 300));
    }

    initializeToolbarListeners() {
        document.querySelector('.toolbar-button.bold').addEventListener('click', () => {
            document.execCommand('bold');
            this.editorContent.focus(); // Focus back to the editor
        });

        document.querySelector('.toolbar-button.italic').addEventListener('click', () => {
            document.execCommand('italic');
            this.editorContent.focus(); // Focus back to the editor
        });

        document.querySelector('.toolbar-button.underline').addEventListener('click', () => {
            document.execCommand('underline');
            this.editorContent.focus(); // Focus back to the editor
        });

        document.querySelector('.toolbar-button.strike').addEventListener('click', () => {
            document.execCommand('strikeThrough');
            this.editorContent.focus(); // Focus back to the editor
        });

        document.querySelector('.toolbar-button.insert-link').addEventListener('click', () => {
            const url = prompt('Enter the link URL:');
            if (url) {
                document.execCommand('createLink', false, url);
                this.editorContent.focus(); // Focus back to the editor
            }
        });

        document.querySelector('.toolbar-button.unordered-list').addEventListener('click', () => {
            document.execCommand('insertUnorderedList');
            this.editorContent.focus(); // Focus back to the editor
        });

        document.querySelector('.toolbar-button.ordered-list').addEventListener('click', () => {
            document.execCommand('insertOrderedList');
            this.editorContent.focus(); // Focus back to the editor
        });
    }

    saveContent(content) {
        this.noteManager.updateNoteContent(content);
        localStorage.setItem('editorContent', content);
    }
}

// Utility function for debouncing input events
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Rendering Functions
function renderFoldersList(folderManager) {
    const folderList = document.querySelector('.folder-list');
    folderList.innerHTML = folderManager.folders.map(folder => `
        <li class="folder-item ${folder.active ? 'active' : ''}" data-id="${folder.id}">
            <i class="far fa-folder"></i> ${folder.name}
        </li>
    `).join('');
}

function renderNotesList(noteManager) {
    const noteList = document.querySelector('.note-list');
    const activeFolder = folderManager.getActiveFolder();
    const filteredNotes = noteManager.getNotesByFolder(activeFolder?.id);
    
    noteList.innerHTML = filteredNotes.map(note => `
        <li class="note-item ${note === noteManager.activeNote ? 'active' : ''}" data-id="${note.id}">
            <div class="note-title">${note.title}</div>
            <div class="note-date">${note.date}</div>
        </li>
    `).join('');
}

// App Initialization
const folderManager = new FolderManager();
folderManager.loadFolders();

const noteManager = new NoteManager();
noteManager.loadNotes();

const editor = new Editor(noteManager); // Ensure this is created after noteManager

document.addEventListener('DOMContentLoaded', () => {
    folderManager.loadFolders();
    noteManager.loadNotes();
    renderFoldersList(folderManager);
    renderNotesList(noteManager);
    initializeEventListeners(); // Ensure this is called after rendering
});

// Event Listeners
function initializeEventListeners() {
    document.querySelector('.folder-list').addEventListener('click', (e) => {
        const folderItem = e.target.closest('.folder-item');
        if (folderItem) {
            const folderId = Number(folderItem.dataset.id);
            folderManager.setActiveFolder(folderId);
            renderFoldersList(folderManager);
            renderNotesList(noteManager); // Render notes for the active folder
        }
    });

    document.querySelector('.note-list').addEventListener('click', (e) => {
        const noteItem = e.target.closest('.note-item');
        if (noteItem) {
            const noteId = Number(noteItem.dataset.id);
            noteManager.setActiveNote(noteId);
            updateEditor(noteManager.activeNote); // Update the editor with the active note's content
            renderNotesList(noteManager); // Highlight the active note
        }
    });

    document.querySelector('.add-folder').addEventListener('click', () => {
        const folderName = prompt('Enter folder name:');
        if (folderName) {
            folderManager.createFolder(folderName);
            renderFoldersList(folderManager);
        }
    });

    document.querySelector('.add-note').addEventListener('click', () => {
        const activeFolder = folderManager.getActiveFolder();
        if (activeFolder) {
            const newNote = noteManager.createNewNote(activeFolder.id);
            renderNotesList(noteManager);
            updateEditor(newNote); // Update the editor with the new note's content
        }
    });
}

// Function to update the editor with the active note's content
function updateEditor(note) {
    document.querySelector('.editor-title').textContent = note.title;
    document.querySelector('.editor-content').innerHTML = note.content; // Use innerHTML to preserve formatting
}
