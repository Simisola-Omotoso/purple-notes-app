// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Global State
let undoStack = [];
let redoStack = [];
let lastSavedContent = "";

let folders = [
    { id: 1, name: 'Personal', active: true },
    { id: 2, name: 'Work', active: false },
    { id: 3, name: 'Projects', active: false },
    { id: 4, name: 'Archive', active: false },
];

let notes = [
    { id: 1, title: 'Meeting Notes', content: '', date: '2/15/2025', folderId: 1 },
    { id: 2, title: 'Project Ideas', content: '', date: '2/15/2025', folderId: 1 },
];

let activeNote = notes[0];

// DOM Elements
const folderList = document.querySelector('.folder-list');
const noteList = document.querySelector('.note-list');
const editorTitle = document.querySelector('.editor-title');
const editorContent = document.querySelector('.editor-content');
const searchBar = document.querySelector('.search-bar');
const addFolderBtn = document.querySelector('.sidebar-header');
const addNoteBtn = document.querySelector('.notes-header .add-button');
const toolbarButtons = document.querySelectorAll('.toolbar-button');

// Load Editor Content on Page Load
window.onload = () => {
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) editorContent.innerHTML = savedContent;
};

// Event Listeners
function initializeEventListeners() {
    folderList.addEventListener('click', (e) => {
        const folderItem = e.target.closest('.folder-item');
        if (folderItem) setActiveFolder(folderItem);
    });

    noteList.addEventListener('click', (e) => {
        const noteItem = e.target.closest('.note-item');
        if (noteItem) setActiveNote(noteItem);
    });

    searchBar.addEventListener('input', (e) => filterNotes(e.target.value));

    addFolderBtn.addEventListener('click', createNewFolder);
    addNoteBtn.addEventListener('click', createNewNote);

    toolbarButtons.forEach(button => {
        button.addEventListener('click', handleToolbarAction);
    });

    editorTitle.addEventListener('input', (e) => updateNoteTitle(e));

    editorContent.addEventListener('input', handleEditorInput);
    editorContent.addEventListener('focus', () => editorContent.classList.add('focused'));
    editorContent.addEventListener('blur', () => saveContent(editorContent.innerHTML));
}

// Handle Editor Input
const debouncedSave = debounce((content) => saveContent(content), 300);

function handleEditorInput(e) {
    debouncedSave(e.target.innerHTML);
}

// Folder & Notes Logic
function setActiveFolder(folderElement) {
    document.querySelectorAll('.folder-item').forEach(folder => folder.classList.remove('active'));
    folderElement.classList.add('active');

    const folderName = folderElement.textContent.trim();
    folders.forEach(folder => folder.active = folder.name === folderName);

    refreshNotesList();
}

function setActiveNote(noteElement) {
    const noteTitle = noteElement.querySelector('.note-title').textContent;
    activeNote = notes.find(note => note.title === noteTitle);

    editorTitle.textContent = activeNote.title;
    editorContent.innerHTML = activeNote.content;

    document.querySelectorAll('.note-item').forEach(note => note.classList.remove('active'));
    noteElement.classList.add('active');
}

function filterNotes(searchTerm) {
    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    renderNotesList(filteredNotes);
}

function createNewFolder() {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
        folders.push({ id: folders.length + 1, name: folderName, active: false });
        renderFoldersList();
    }
}

function createNewNote() {
    const activeFolder = folders.find(folder => folder.active);
    const newNote = {
        id: notes.length + 1,
        title: 'Untitled',
        content: '',
        date: new Date().toLocaleDateString(),
        folderId: activeFolder.id
    };

    notes.unshift(newNote);
    activeNote = newNote;
    editorTitle.textContent = newNote.title;
    editorContent.innerHTML = newNote.content;

    refreshNotesList();
}

// Editor & Undo/Redo Logic
function updateNoteTitle(event) {
    if (activeNote) {
        activeNote.title = event.target.textContent.trim();
        refreshNotesList();
    }
}

function saveContent(content) {
    localStorage.setItem('editorContent', content);
    saveContentToServer(content);
    saveContentToHistory(content);
    lastSavedContent = content;
}

function saveContentToServer(content) {
    fetch('/api/saveContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
    }).then(response => response.json())
      .then(data => console.log('Success:', data))
      .catch(error => console.error('Error:', error));
}

function saveContentToHistory(content) {
    if (content !== lastSavedContent) {
        undoStack.push(content);
        redoStack.length = 0;
    }
}

function undo() {
    if (undoStack.length > 0) {
        const lastContent = undoStack.pop();
        redoStack.push(editorContent.innerHTML);
        editorContent.innerHTML = lastContent;
        saveContent(lastContent);
    } else {
        alert('No more actions to undo.');
    }
}

function redo() {
    if (redoStack.length > 0) {
        const redoContent = redoStack.pop();
        undoStack.push(editorContent.innerHTML);
        editorContent.innerHTML = redoContent;
        saveContent(redoContent);
    } else {
        alert('No more actions to redo.');
    }
}

// Toolbar Actions
function handleToolbarAction(e) {
    const action = e.currentTarget.dataset.action;
    switch (action) {
        case 'bold': document.execCommand('bold', false); break;
        case 'italic': document.execCommand('italic', false); break;
        case 'underline': document.execCommand('underline', false); break;
        case 'unordered-list': document.execCommand('insertUnorderedList', false); break;
        case 'ordered-list': document.execCommand('insertOrderedList', false); break;
        case 'link':
            const url = prompt('Enter URL:');
            if (url) document.execCommand('createLink', false, url);
            break;
        case 'undo': undo(); break;
        case 'redo': redo(); break;
    }
}

// UI Rendering
function refreshNotesList() {
    const activeFolder = folders.find(folder => folder.active);
    const folderNotes = notes.filter(note => note.folderId === activeFolder.id);
    renderNotesList(folderNotes);
}

function renderNotesList(notesToRender) {
    noteList.innerHTML = notesToRender.map(note => `
        <li class="note-item ${note === activeNote ? 'active' : ''}">
            <div class="note-title">${note.title}</div>
            <div class="note-preview">${note.content.substring(0, 50)}...</div>
            <div class="note-date">${note.date}</div>
        </li>
    `).join('');
}

function renderFoldersList() {
    folderList.innerHTML = folders.map(folder => `
        <li class="folder-item ${folder.active ? 'active' : ''}">${folder.name}</li>
    `).join('');
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    renderFoldersList();
    refreshNotesList();
    initializeEventListeners();
});