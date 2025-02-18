class NoteManager {
    constructor() {
        this.notes = [];
        this.activeNote = null;
    }

    loadNotes() {
        this.notes = [
            { id: 1, title: 'Meeting Notes', content: '', date: '2/15/2025', folderId: 1 },
            { id: 2, title: 'Project Ideas', content: '', date: '2/15/2025', folderId: 1 },
            { id: 3, title: 'Shopping List', content: '', date: '2/15/2025', folderId: 1 },
            { id: 4, title: 'Travel Plans', content: '', date: '2/15/2025', folderId: 1 }
        ];
        this.activeNote = this.notes[0];
    }

    createNewNote(folderId) {
        const newNote = {
            id: this.notes.length + 1,
            title: 'Untitled',
            content: '',
            date: new Date().toLocaleDateString(),
            folderId: folderId
        };
        this.notes.unshift(newNote);
        this.setActiveNote(newNote.id);
        renderNotesList(this);
        return newNote;
    }

    setActiveNote(noteId) {
        this.activeNote = this.notes.find(note => note.id === noteId);
    }

    updateNoteContent(content) {
        if (this.activeNote) {
            this.activeNote.content = content;
            this.activeNote.date = new Date().toLocaleDateString();
        }
    }

    getNotesByFolder(folderId) {
        return this.notes.filter(note => note.folderId === folderId);
    }
}

class FolderManager {
    constructor() {
        this.folders = [];
    }

    loadFolders() {
        this.folders = [
            { id: 1, name: 'Personal', active: true },
            { id: 2, name: 'Work', active: false },
            { id: 3, name: 'Projects', active: false },
            { id: 4, name: 'Archive', active: false }
        ];
    }

    createFolder(name) {
        const newFolder = {
            id: this.folders.length + 1,
            name: name,
            active: false
        };
        this.folders.push(newFolder);
        this.setActiveFolder(newFolder.id);
    }

    setActiveFolder(folderId) {
        this.folders.forEach(folder => folder.active = folder.id === folderId);
    }

    getActiveFolder() {
        return this.folders.find(folder => folder.active);
    }
}

class Editor {
    constructor(noteManager) {
        this.noteManager = noteManager;
        this.undoStack = [];
        this.redoStack = [];
        this.editorTitle = document.querySelector('.editor-title');
        this.editorContent = document.querySelector('.editor-content');
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.editorTitle.addEventListener('input', (e) => {
            if (this.noteManager.activeNote) {
                this.noteManager.activeNote.title = e.target.textContent.trim();
                renderNotesList();
            }
        });

        this.editorContent.addEventListener('input', debounce((e) => {
            this.saveContent(e.target.textContent);
        }, 300));
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
if (noteManager.notes.length > 0) {
    editor.editorTitle.textContent = noteManager.notes[0].title;
}

const editor = new Editor(noteManager);

document.addEventListener('DOMContentLoaded', () => {
    renderFoldersList(folderManager);
    renderNotesList(noteManager);
    initializeEventListeners();
});

// Event Listeners
function initializeEventListeners() {
    document.querySelector('.folder-list').addEventListener('click', (e) => {
        const folderItem = e.target.closest('.folder-item');
        if (folderItem) {
            const folderId = Number(folderItem.dataset.id);
            folderManager.setActiveFolder(Number(folderItem.dataset.id));
            renderFoldersList(folderManager);
            renderNotesList(noteManager);

            const activeFolderNotes = noteManager.getNotesByFolder(folderId);
            if (activeFolderNotes.length > 0) {
                noteManager.setActiveNote(activeFolderNotes[0].id);
                updateEditor(noteManager.activeNote);
            } else {
                clearEditor();
            }
        }
    });

    document.querySelector('.note-list').addEventListener('click', (e) => {
        const noteItem = e.target.closest('.note-item');
        if (noteItem) {
            const noteId = Number(noteItem.dataset.id);
            noteManager.setActiveNote(noteId);
            updateEditor(noteManager.activeNote);
            renderNotesList(noteManager);
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
            editor.editorTitle.textContent = newNote.title;
            editor.editorContent.textContent = newNote.content;
    });
}

function updateEditor(note) {
    if (note) {
        editor.editorTitle.textContent = note.title;
        editor.editorContent.textContent = note.content;
    } else {
        clearEditor();
    }
}

function clearEditor() {
    editor.editorTitle.textContent = 'New Note';
    editor.editorContent.textContent = '';
}