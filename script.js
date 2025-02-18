// FolderManager Class
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

    setActiveFolder(folderId) {
        this.folders.forEach(folder => folder.active = folder.id === folderId);
        this.activeFolder = this.folders.find(folder => folder.id === folderId);
        this.saveFolders(); // Save after setting active folder
    }

    getActiveFolder() {
        return this.activeFolder;
    }
}

// NoteManager Class
class NoteManager {
    constructor() {
        this.notes = [];
        this.activeNote = null;
    }

    loadNotes() {
        const savedNotes = JSON.parse(localStorage.getItem('notes'));
        if (savedNotes) {
            this.notes = savedNotes;
            this.activeNote = this.notes.find(n => n.id === Number(localStorage.getItem('activeNoteId')));
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

    setActiveNote(noteId) {
        this.activeNote = this.notes.find(note => note.id === noteId);
        localStorage.setItem('activeNoteId', noteId);
        this.saveNotes();
        renderNotesList(noteManager);
    }

    getNotesByFolder(folderId) {
        return this.notes.filter(note => note.folderId === folderId);
    }
}

// Editor Class
class Editor {
    constructor(noteManager) {
        this.noteManager = noteManager;
        this.editorTitle = document.querySelector('.editor-title');
        this.editorContent = document.querySelector('.editor-content');
        this.initializeEventListeners();
        this.initializeToolbarListeners();
    }

    initializeEventListeners() {
        this.editorTitle.addEventListener('input', (e) => {
            if (this.noteManager.activeNote) {
                this.noteManager.activeNote.title = e.target.textContent.trim();
                this.noteManager.saveNotes(); // Save after title change
            }
        });

        this.editorContent.addEventListener('input', debounce((e) => {
            this.noteManager.activeNote.content = e.target.innerHTML; // Save content
            this.noteManager.saveNotes(); // Save after content change
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
}

// Initialize Managers and Editor
const folderManager = new FolderManager();
folderManager.loadFolders();

const noteManager = new NoteManager();
noteManager.loadNotes();

const editor = new Editor(noteManager);

// Event Listeners for Folders and Notes
document.addEventListener('DOMContentLoaded', () => {
    folderManager.loadFolders(); // Load folders from localStorage
    noteManager.loadNotes(); // Load notes from localStorage
    renderFoldersList(folderManager);
    renderNotesList(noteManager);
    initializeEventListeners(); // Ensure this is called after rendering
});

// Function to initialize event listeners for folders and notes
function initializeEventListeners() {
    // Event listener for folder clicks
    document.querySelector('.folder-list').addEventListener('click', (e) => {
        const folderItem = e.target.closest('.folder-item');
        if (folderItem) {
            const folderId = Number(folderItem.dataset.id);
            folderManager.setActiveFolder(folderId);
            renderFoldersList(folderManager);
            renderNotesList(noteManager);

            editor.editorTitle.textContent = '';
            editor.editorContent.innerHTML = '';
            noteManager.activeNote = null;
        }
    });

    // Event listener for note clicks
    document.querySelector('.note-list').addEventListener('click', (e) => {
        const noteItem = e.target.closest('.note-item');
        if (noteItem) {
            const noteId = Number(noteItem.dataset.id);
            noteManager.setActiveNote(noteId); // Set the active note
            editor.editorTitle.textContent = noteManager.activeNote.title; // Update editor title
            editor.editorContent.innerHTML = noteManager.activeNote.content; // Update editor content
        }
    });
}

// Function to render folders
function renderFoldersList(folderManager) {
    const folderList = document.querySelector('.folder-list');
    folderList.innerHTML = folderManager.folders.map(folder => `
        <li class="folder-item ${folder.active ? 'active' : ''}" data-id="${folder.id}">
            <i class="far fa-folder"></i> ${folder.name}
        </li>
    `).join('');
}

// Function to render notes
function renderNotesList(noteManager) {
    const noteList = document.querySelector('.note-list');
    const activeFolder = folderManager.folders.find(folder => folder.active);
    const filteredNotes = noteManager.getNotesByFolder(activeFolder?.id);
    
    noteList.innerHTML = filteredNotes.map(note => `
        <li class="note-item ${note.id === noteManager.activeNote?.id ? 'active' : ''}" data-id="${note.id}">
            <div class="note-title">${note.title}</div>
            <div class="note-date">${note.date}</div>
        </li>
    `).join('');
}

// Event Listeners for Adding Folders and Notes
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
        editor.editorTitle.textContent = newNote.title; // Set the title in the editor
        editor.editorContent.innerHTML = newNote.content; // Set the content in the editor
    } else {
        alert('Please select a folder to add a note.'); // Alert if no folder is selected
    }
});

// Adjustable Dividers
let isDragging = false;
let lastDownX = 0;

const sidebarDivider = document.getElementById('sidebar-divider');
const notesDivider = document.getElementById('notes-divider');

const sidebar = document.querySelector('.sidebar');
const notesSection = document.querySelector('.notes-section');
const editorSection = document.querySelector('.editor');

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

    if (e.target === sidebarDivider) {
        const newSidebarWidth = sidebar.offsetWidth + dx;
        const newNotesWidth = notesSection.offsetWidth - dx;

        // Check for minimum widths
        if (newSidebarWidth >= 100 && newNotesWidth >= 100) {
            sidebar.style.width = `${newSidebarWidth}px`;
            notesSection.style.width = `${newNotesWidth}px`;
        }
    } else if (e.target === notesDivider) {
        const newNotesWidth = notesSection.offsetWidth + dx;
        const newEditorWidth = editorSection.offsetWidth - dx;

        // Check for minimum widths
        if (newNotesWidth >= 100 && newEditorWidth >= 200) {
            notesSection.style.width = `${newNotesWidth}px`;
            editorSection.style.width = `${newEditorWidth}px`;
        }
    }

    lastDownX = e.clientX;
});

document.addEventListener('mouseup', () => {
    isDragging = false; // Stop dragging
});