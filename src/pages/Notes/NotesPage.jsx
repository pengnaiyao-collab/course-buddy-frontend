import React, { useState } from 'react';

const NotesPage = () => {
    const [notes, setNotes] = useState([]);
    const [currentNote, setCurrentNote] = useState({ title: '', content: '', tags: [] });
    const [searchTerm, setSearchTerm] = useState('');

    const handleNoteChange = (e) => {
        const { name, value } = e.target;
        setCurrentNote({ ...currentNote, [name]: value });
    };

    const addNote = () => {
        setNotes([...notes, currentNote]);
        setCurrentNote({ title: '', content: '', tags: [] });
    };

    const handleTagChange = (tags) => {
        setCurrentNote({ ...currentNote, tags });
    };

    const searchNotes = () => {
        return notes.filter(note => note.title.includes(searchTerm) || note.content.includes(searchTerm));
    };

    return (
        <div>
            <h1>Notes</h1>
            <input 
                type="text" 
                placeholder="Search notes..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
            />
            <div>
                <h2>Your Notes</h2>
                <ul>
                    {searchNotes().map((note, index) => (
                        <li key={index}>{note.title}</li>
                    ))}
                </ul>
            </div>
            <div>
                <h2>Edit Note</h2>
                <input 
                    type="text" 
                    name="title" 
                    placeholder="Note Title" 
                    value={currentNote.title} 
                    onChange={handleNoteChange} 
                />
                <textarea 
                    name="content" 
                    placeholder="Note Content" 
                    value={currentNote.content} 
                    onChange={handleNoteChange} 
                />
                {/* Implement tagging and sharing functions as needed */}
                <button onClick={addNote}>Add Note</button>
            </div>
        </div>
    );
};

export default NotesPage;