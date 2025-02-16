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