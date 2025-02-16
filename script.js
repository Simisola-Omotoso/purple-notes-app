// Data structures to store notes & folders

let folders = [
    { id: 1, name: 'Personal', active: true },
    { id: 2, name: 'Work', active: false },
    { id: 3, name: 'Projects', active: false },
    { id: 4, name: 'Archive', active: false },
];

let notes = [
    {
        id: 1,
        title: 'Meeting Notes',
        content: "Today's meeting covered several key points...",
        date: '2/15/2025',
        folderId: 1
    },
    {
        id: 2,
        title: 'Project Ideas',
        content: '',
        date: '2/15/2025',
        folderId: 1
    },
    {
        id: 3,
        title: 'Shopping List',
        content: '',
        date: '2/15/2025',
        folderId: 1
    },
    {
        id: 4,
        title: 'Travel Plans',
        content: '',
        date: '2/15/2025',
        folderId: 1
    }
];

let activeNote = notes[0];

// DOM Elements

const folderList = document.querySelector('.folder-list');
const noteList = document.querySelector('.note-list');
const editorTitle = document.querySelector('.editor-title');
const editorContent = document.querySelector('.editor-content');
const searchBar = document.querySelector('.search-bar');
const addFolderBtn = document.querySelector('.sidebar-header');
const addNoteBtn = document.querySelector('.notes-header');
const toolbarButtons = document.querySelector('.toolbar-button');

// Event Listeners

function initializeEventListeners() {
    // Folder selection
    folderList.addEventListener('click', (e) => {
        const folderItem = e.target.closest('folder-item');
        if (folderItem) {
            setActiveFolder(folderItem);
        }
    });

    // Note selection
    noteList.addEventListener('click', (e) => {
        const noteItem = e.target.closest('note-item');
        if (noteItem) {
            setActiveFolder(noteItem);
        }
    });

    // Search functionality
    searchBar.addEventListener('input', (e) => {
        filterNotes(e.target.value);
    });

    // Add new folder
    addFolderBtn.addEventListener('click', createNewFolder);

    // Add new note
    addNoteBtn.addEventListener('click', createNewNote);

    // Toolbar buttons
    toolbarButtons.forEach(button => {
        button.addEventListener('click', handleToolbarAction);
    });

    // Editor content changes
    editorContent.addEventListener('input', () => {
        saveNoteContent(editorContent.textContent);
    });
}

// Functions
function setActiveFolder(folderElement) {
    // Remove active class from all folders
    document.querySelectorAll('.folder-item').forEach(folder => {
        folder.classList.remove('active');
    });

    // Add active class to selected folder
    folderElement.classList.add('active');

    // Update folders data structure and refresh notes list
    const folderName = folderElement.textContent.trim();
    folders.forEach(folder => {
        folder.active = folder.name === folderName;
    });

    refreshNotesList();
}

function setActiveNote(noteElement) {
    const noteTitle = noteElement.querySelector('.note-title').textContent;
    activeNote = notes.find(note => note.title === noteTitle);

    // Update editor
    editorTitle.textContent = activeNote.title;
    editorContent.textContent = activeNote.content;

    // Update visual selection
    document.querySelectorAll('.note-item').forEach(note => {
        note.classList.remove('active');
    });
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
        const newFolder = {
            id: folders.length + 1,
            name: folderName,
            active: false
        };
        folders.push(newFolder);
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
    notes.push(newNote);
    renderNotesList();
}

function handleToolbarAction(e) {
    const action = e.currentTarget.querySelector('i').classList[1];

    switch(action) {
        case 'fa-bold':
            document.execCommand('bold', false);
            break;
        case 'fa-italic':
            document.execCommand('italic', false);
            break;
        case 'fa-link':
            const url = prompt('Enter URL:');
            if (url) {
                document.execCommand('createLink', false, url);
            }
            break;
        case 'fa-bars':
            document.execCommand('insertUnorderedList', false);
            break;
    }
}

function saveNoteContent(content) {
    if (activeNote) {
        activeNote.content = content;
        // Here you would typically implement auto-save to localStorage or backend
    }
}

function refreshNotesList() {
    const activeFolder = folders.find(folder => folder.active);
    const folderNotes = notes.filter(note => note.folderId === activeFolder.id);
    renderNotesList(folderNotes);
}

function renderNotesList(notesToRender) {
    noteList.innerHTML = notesToRender.map(note => `
        <li class="note-item ${note.id === activeNote.id ? 'active' : ''}">
            <div class="note-title">${note.title}</div>
            <div class="note-date">${note.date}</div>
        </li>
    `).join('');
}

function renderFoldersList() {
    folderList.innerHTML = folders.map(folder => `
        <li class="folder-item ${folder.active ? 'active' : ''}">
            <i class="far fa-folder"></i>
            ${folder.name}
        </li>
    `).join('');
}

// Initialize app