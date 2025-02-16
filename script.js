function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

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
        content: '',
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
let contentHistory = [];

const folderList = document.querySelector('.folder-list');
const noteList = document.querySelector('.note-list');
const editorTitle = document.querySelector('.editor-title');
const editorContent = document.querySelector('.editor-content');
const searchBar = document.querySelector('.search-bar');
const addFolderBtn = document.querySelector('.sidebar-header');
const addNoteBtn = document.querySelector('.notes-header .add-button'); // More specific selector
const toolbarButtons = document.querySelector('.toolbar-button');

function initializeEventListeners() {
    folderList.addEventListener('click', (e) => {
        const folderItem = e.target.closest('.folder-item');
        if (folderItem) {
            setActiveFolder(folderItem);
        }
    });

    noteList.addEventListener('click', (e) => {
        const noteItem = e.target.closest('.note-item');
        if (noteItem) {
            setActiveNote(noteItem);
        }
    });

    searchBar.addEventListener('input', (e) => {
        filterNotes(e.target.value);
    });

    addFolderBtn.addEventListener('click', createNewFolder);

    addNoteBtn.addEventListener('click', createNewNote);

    toolbarButtons.forEach(button => {
        button.addEventListener('click', handleToolbarAction);
    });

    editorContent.addEventListener('input', (e) => {
        const content = e.target.textContent;
        contentHistory.push(content);
        debouncedSave(content);
    });

    editorContent.addEventListener('focus', () => {
        editorContent.classList.add('focused');
    });

    editorContent.addEventListener('blur', () => {
        editorContent.classList.remove('focused');
    });

    const debouncedSave = debounce((content) => {
        saveNoteContent(content);
    }, 300);

    editorContent.addEventListener('input', (e) => {
        debouncedSave(e.target.textContent);
    });

    editorTitle.addEventListener('input', (e) => {
        if (activeNote) {
            activeNote.title = e.target.textContent.trim();
            refreshNotesList();
        }
    });
}

function setActiveFolder(folderElement) {
    document.querySelectorAll('.folder-item').forEach(folder => {
        folder.classList.remove('active');
    });

    folderElement.classList.add('active');

    const folderName = folderElement.textContent.trim();
    folders.forEach(folder => {
        folder.active = folder.name === folderName;
    });

    refreshNotesList();
}

function setActiveNote(noteElement) {
    const noteTitle = noteElement.querySelector('.note-title').textContent;
    activeNote = notes.find(note => note.title === noteTitle);

    editorTitle.textContent = activeNote.title;
    editorContent.textContent = activeNote.content;

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

    notes.unshift(newNote);

    activeNote = newNote;

    editorTitle.textContent = newNote.title;
    editorContent.textContent = newNote.content;

    refreshNotesList();
}

function handleToolbarAction(e) {
    const action = e.currentTarget.dataset.action;

    switch(action) {
        case 'bold':
            document.execCommand('bold', false);
            break;
        case 'italic':
            document.execCommand('italic', false);
            break;
        case 'underline':
            document.execCommand('underline', false);
            break;
        case 'unordered-list':
            document.execCommand('insertUnorderedList', false);
            break;
        case 'ordered-list':
            document.execCommand('insertOrderedList', false);
            break;
        case 'link':
            const url = prompt('Enter URL:');
            if (url) {
                document.execCommand('createLink', false, url);
            }
            break;
        case '↩':
            if (contentHistory.length > 0) {
                const lastContent = contentHistory.pop();
                editorContent.textContent = lastContent;
                saveNoteContent(lastContent);
            } else {
                alert('No more actions to undo.');
            }
            break;
    }
}

function saveNoteContent(content) {
    if (activeNote) {
        activeNote.content = content;
        activeNote.date = new Date().toLocaleDateString();
        refreshNotesList();
    }
}

function refreshNotesList() {
    const activeFolder = folders.find(folder => folder.active);
    const folderNotes = notes.filter(note => note.folderId === activeFolder.id);
    renderNotesList(folderNotes);
}

function renderNotesList(notesToRender = notes) {
    noteList.innerHTML = notesToRender.map(note => `
        <li class="note-item ${note === activeNote ? 'active' : ''}">
            <div class="note-title">${note.title}</div>
            <div class="note-preview">${note.content.substring(0, 50)}${note.content.length > 50 ? '...' : ''}</div>
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

function updateNoteTitle(event, noteId) {
    const newTitle = event.target.textContent.trim();
    const noteToUpdate = notes.find(note => note.id === parseInt(noteId));
    if (noteToUpdate && newTitle) {
        noteToUpdate.title = newTitle;
        refreshNotesList();
    } else {
        event.target.textContent = noteToUpdate.title;
    }
}

function executeCommand(command) {
    document.execCommand(command, false, null);
}

toolbarButtons.forEach(button => {
    button.addEventListener('click', () => {
        const command = button.textContent.trim();
        switch (command) {
            case 'B':
                executeCommand('bold');
                break;
            case 'I':
                executeCommand('italic');
                break;
            case '_':
                executeCommand('underline');
                break;
            case '•':
                executeCommand('insertUnorderedList');
                break;
            case '1.':
                executeCommand('insertOrderedList');
                break;
            case '🔗':
                const url = prompt('Enter the link URL:');
                executeCommand('createLink', url);
                break;
            case 'S':
                // Implement save functionality here
                alert('Save note implemented yet.');
                break;
            default:
                break;
        }
    })
})

function initializeApp() {
    renderFoldersList();
    refreshNotesList();
    initializeEventListeners();
}

document.addEventListener('DOMContentLoaded', initializeApp);