// ... existing code ...

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
            folderManager.setActiveFolder(folderId); // Set the active folder
            renderFoldersList(folderManager); // Render folders
            renderNotesList(noteManager); // Render notes for the active folder
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
            renderNotesList(noteManager); // Render notes
        }
    });
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
    const activeFolder = folderManager.getActiveFolder();
    const filteredNotes = noteManager.getNotesByFolder(activeFolder?.id);
    
    noteList.innerHTML = filteredNotes.map(note => `
        <li class="note-item ${note === noteManager.activeNote ? 'active' : ''}" data-id="${note.id}">
            <div class="note-title">${note.title}</div>
            <div class="note-date">${note.date}</div>
        </li>
    `).join('');
}

// ... existing code ...
