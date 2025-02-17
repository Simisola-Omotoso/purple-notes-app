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

let undoStack = [];
let redoStack = [];

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
const toolbarButtons = document.querySelectorAll('.toolbar-button');

window.onload = () => {
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
        editorContent.innerHTML = savedContent;
    }
};

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
        debouncedSave(e.target.textContent);
        localStorage.setItem('editorContent', editorContent.innerHTML);
        saveContentToServer(editorContent.innerHTML);
    });

    editorContent.addEventListener('focus', () => {
        editorContent.classList.add('focused');
    });

    editorContent.addEventListener('blur', () => {
        saveContent(editorContent.innerHTML);
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
        setActiveFolder(newFolder);
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

function saveContent(content) {
    localStorage.setItem('editorContent', content);
    saveContentToServer(content);
    saveContentToHistory(content);
    lastSavedContent = content;
}

function saveContentToServer(content) {
    fetch('/api/saveContent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function saveContentToHistory(content) {
    if (content !== lastSavedContent) {
        undoStack.push(content);
        redoStack.length = 0;
    }
}

const debouncedSave = debounce((content) => {
    saveContent(content);
}, 300);

function undo() {
    if (undoStack.length > 0) {
        const lastContent = undoStack.pop();
        redoStack.push(editorContent.textContent);
        editorContent.textContent = lastContent;
        saveNoteContent(lastContent);
    } else {
        alert('No more actions to undo.');
    }
}

function redo() {
    if (redoStack.length > 0) {
        const redoContent = redoStack.pop();
        undoStack.push(editorContent.textContent);
        editorContent.textContent = redoContent;
        saveNoteContent(redoContent);
    } else {
        alert('No more actions to redo.');
    }
}

toolbarButtons.forEach(button => {
    button.addEventListener('click', () => {
        const command = button.textContent.trim();
        switch (command) {
            case '↩':
                undo();
                break;
            case '↪':
                redo();
                break;
        }
    })
});

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

function executeCommand(command, value = null) {
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
                if (url) {
                    executeCommand('createLink', url);
                }
                break;
            case 'S':
                // Implement save functionality here
                alert('Save note implemented yet.');
                break;
            case '↩':
                // Implement undo functionality here
                alert('Undo functionality not implemented yet.');
                break;
            case '↪':
                // Implement redo functionality here
                alert('Redo functionality not implemented yet.');
                break;
            default:
                break;
        }
    })
})

setInterval(() => {
    const content = editorContent.innerHTML;
    localStorage.setItem('editorContent', content);
}, 5000);

function initializeApp() {
    renderFoldersList();
    refreshNotesList();
    initializeEventListeners();
}

document.addEventListener('DOMContentLoaded', initializeApp);