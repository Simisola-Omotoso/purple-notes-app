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
let activeDivider = null;
let startX = 0;
let startWidths = {};

const sidebarDivider = document.getElementById('sidebar-divider');
const notesDivider = document.getElementById('notes-divider');

const sidebar = document.querySelector('.sidebar');
const notesSection = document.querySelector('.notes-section');
const editorSection = document.querySelector('.editor');

const minWidths = { sidebar: 150, notes: 150, editor: 250 };

function startDrag(e, divider) {
    isDragging = true;
    activeDivider = divider;
    startX = e.clientX;
    startWidths = {
        sidebar: sidebar.offsetWidth,
        notes: notesSection.offsetWidth,
        editor: editorSection.offsetWidth
    };
    document.body.style.userSelect = 'none'; // Prevent text selection
}

function onDrag(e) {
    if (!isDragging) return;
    
    requestAnimationFrame(() => {
        const dx = e.clientX - startX;

        if (activeDivider === sidebarDivider) {
            const newSidebarWidth = Math.max(minWidths.sidebar, startWidths.sidebar + dx);
            const newNotesWidth = Math.max(minWidths.notes, startWidths.notes - dx);

            sidebar.style.width = `${newSidebarWidth}px`;
            notesSection.style.width = `${newNotesWidth}px`;

            localStorage.setItem('sidebarWidth', newSidebarWidth);
            localStorage.setItem('notesWidth', newNotesWidth);
        } else if (activeDivider === notesDivider) {
            const newNotesWidth = Math.max(minWidths.notes, startWidths.notes + dx);
            const newEditorWidth = Math.max(minWidths.editor, startWidths.editor - dx);

            notesSection.style.width = `${newNotesWidth}px`;
            editorSection.style.width = `${newEditorWidth}px`;

            localStorage.setItem('notesWidth', newNotesWidth);
            localStorage.setItem('editorWidth', newEditorWidth);
        }
    });
}

function stopDrag() {
    isDragging = false;
    document.body.style.userSelect = ''; // Restore text selection
}

// Attach event listeners
sidebarDivider.addEventListener('mousedown', (e) => startDrag(e, sidebarDivider));
notesDivider.addEventListener('mousedown', (e) => startDrag(e, notesDivider));

document.addEventListener('mousemove', onDrag);
document.addEventListener('mouseup', stopDrag);

// Load saved widths
window.addEventListener('load', () => {
    const savedSidebarWidth = localStorage.getItem('sidebarWidth');
    const savedNotesWidth = localStorage.getItem('notesWidth');
    const savedEditorWidth = localStorage.getItem('editorWidth');

    if (savedSidebarWidth) sidebar.style.width = `${savedSidebarWidth}px`;
    if (savedNotesWidth) notesSection.style.width = `${savedNotesWidth}px`;
    if (savedEditorWidth) editorSection.style.width = `${savedEditorWidth}px`;
});

function formatText(headingType) {
    const editorContent = document.querySelector('.editor-content');
    const selection = window.getSelection();

    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();

        if (selectedText) {
            const headingElement = document.createElement(headingType);
            headingElement.textContent = selectedText;
            range.deleteContents();
            range.insertNode(headingElement);
        }
    }
}

// Debounce
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}