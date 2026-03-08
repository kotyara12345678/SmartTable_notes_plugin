/**
 * Notes Plugin для SmartTable
 *
 * Плагин для создания и хранения заметок.
 * Открывается в отдельном модальном окне.
 *
 * @package com.smarttable.notes-plugin
 * @version 1.0.0
 */

export function activate(api) {
  console.log('[NotesPlugin] Активирован!');

  // ID для хранения заметок
  const STORAGE_KEY = 'notes-plugin-data';

  /**
   * Загрузить заметки из хранилища
   */
  function loadNotes() {
    const saved = api.storage.get(STORAGE_KEY);
    return saved || [];
  }

  /**
   * Сохранить заметки в хранилище
   */
  function saveNotes(notes) {
    api.storage.set(STORAGE_KEY, notes);
    console.log('[NotesPlugin] Заметки сохранены:', notes.length);
  }

  /**
   * Создать HTML для заметки
   */
  function createNoteElement(note, onDelete) {
    const noteEl = document.createElement('div');
    noteEl.className = 'note-item';
    noteEl.innerHTML = `
      <div class="note-header">
        <input type="text" class="note-title" value="${escapeHtml(note.title || 'Без названия')}" placeholder="Название заметки">
        <button class="note-delete-btn" title="Удалить заметку">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"/>
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
        </button>
      </div>
      <textarea class="note-content" placeholder="Введите текст заметки...">${escapeHtml(note.content || '')}</textarea>
      <div class="note-footer">
        <span class="note-date">${formatDate(note.date)}</span>
      </div>
    `;

    const titleInput = noteEl.querySelector('.note-title');
    const contentTextarea = noteEl.querySelector('.note-content');
    const deleteBtn = noteEl.querySelector('.note-delete-btn');

    titleInput.addEventListener('input', () => {
      note.title = titleInput.value;
      note.date = new Date().toISOString();
      saveNotes(getAllNotes());
      updateFooter(noteEl, note.date);
    });

    contentTextarea.addEventListener('input', () => {
      note.content = contentTextarea.value;
      note.date = new Date().toISOString();
      saveNotes(getAllNotes());
      updateFooter(noteEl, note.date);
    });

    deleteBtn.addEventListener('click', () => {
      if (confirm('Удалить эту заметку?')) {
        onDelete();
        noteEl.remove();
      }
    });

    return noteEl;
  }

  /**
   * Получить все заметки из DOM
   */
  function getAllNotes() {
    const notesContainer = document.querySelector('.notes-list');
    if (!notesContainer) return [];

    const noteElements = notesContainer.querySelectorAll('.note-item');
    const notes = [];

    noteElements.forEach(el => {
      const title = el.querySelector('.note-title').value;
      const content = el.querySelector('.note-content').value;
      const dateEl = el.querySelector('.note-date');
      const date = dateEl ? dateEl.dataset.timestamp : new Date().toISOString();

      notes.push({ title, content, date });
    });

    return notes;
  }

  /**
   * Обновить дату в футере заметки
   */
  function updateFooter(noteEl, date) {
    const footer = noteEl.querySelector('.note-footer');
    if (footer) {
      footer.innerHTML = `<span class="note-date" data-timestamp="${date}">${formatDate(date)}</span>`;
    }
  }

  /**
   * Форматирование даты
   */
  function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Экранирование HTML
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Открыть окно с заметками
   */
  function openNotesWindow() {
    console.log('[NotesPlugin] Открытие окна заметок');

    const notes = loadNotes();

    const modalContent = document.createElement('div');
    modalContent.className = 'notes-modal';
    modalContent.innerHTML = `
      <div class="notes-window">
        <div class="notes-header">
          <h2 class="notes-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            Заметки
          </h2>
          <button class="notes-close-btn" title="Закрыть">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="notes-toolbar">
          <button class="notes-add-btn" id="addNoteBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Новая заметка
          </button>
          <span class="notes-count">Заметок: ${notes.length}</span>
        </div>

        <div class="notes-list">
          ${notes.length === 0 ? '<div class="notes-empty">Нет заметок. Создайте первую!</div>' : ''}
        </div>
      </div>
    `;

    const notesList = modalContent.querySelector('.notes-list');
    notes.forEach((note, index) => {
      const noteEl = createNoteElement(note, () => {
        const newNotes = getAllNotes();
        newNotes.splice(index, 1);
        saveNotes(newNotes);
        updateCount(modalContent);
        if (newNotes.length === 0) {
          notesList.innerHTML = '<div class="notes-empty">Нет заметок. Создайте первую!</div>';
        }
      });
      notesList.appendChild(noteEl);
    });

    const addBtn = modalContent.querySelector('#addNoteBtn');
    addBtn.addEventListener('click', () => {
      const newNote = {
        title: '',
        content: '',
        date: new Date().toISOString()
      };

      const noteEl = createNoteElement(newNote, () => {
        const newNotes = getAllNotes();
        const index = newNotes.findIndex(n => n.date === newNote.date);
        if (index > -1) {
          newNotes.splice(index, 1);
          saveNotes(newNotes);
          updateCount(modalContent);
        }
      });

      const emptyMsg = notesList.querySelector('.notes-empty');
      if (emptyMsg) emptyMsg.remove();

      notesList.appendChild(noteEl);
      noteEl.querySelector('.note-title').focus();

      const currentNotes = getAllNotes();
      saveNotes(currentNotes);
      updateCount(modalContent);
    });

    const closeBtn = modalContent.querySelector('.notes-close-btn');
    closeBtn.addEventListener('click', () => {
      api.ui.closeModals();
    });

    api.ui.showModal(modalContent);

    console.log('[NotesPlugin] Окно заметок открыто');
  }

  /**
   * Обновить счётчик заметок
   */
  function updateCount(modalContent) {
    const countEl = modalContent.querySelector('.notes-count');
    const notesList = modalContent.querySelector('.notes-list');
    const noteCount = notesList.querySelectorAll('.note-item').length;
    if (countEl) {
      countEl.textContent = `Заметок: ${noteCount}`;
    }
  }

  // === ПЛАВАЮЩАЯ КНОПКА (независимо от ribbon) ===
  function createFloatingButton() {
    // Проверяем, нет ли уже кнопки
    const existing = document.getElementById('notes-plugin-float-btn');
    if (existing) return existing;

    const floatBtn = document.createElement('button');
    floatBtn.id = 'notes-plugin-float-btn';
    floatBtn.title = 'Открыть заметки';
    floatBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #107c41 0%, #0d5c33 100%);
      color: white;
      border: none;
      box-shadow: 0 4px 12px rgba(16, 124, 65, 0.4);
      cursor: pointer;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    `;
    floatBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px;">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10,9 9,9 8,9"/>
      </svg>
    `;
    
    floatBtn.addEventListener('click', openNotesWindow);
    
    floatBtn.addEventListener('mouseenter', () => {
      floatBtn.style.transform = 'scale(1.1) rotate(5deg)';
      floatBtn.style.boxShadow = '0 6px 20px rgba(16, 124, 65, 0.6)';
    });
    
    floatBtn.addEventListener('mouseleave', () => {
      floatBtn.style.transform = 'scale(1) rotate(0deg)';
      floatBtn.style.boxShadow = '0 4px 12px rgba(16, 124, 65, 0.4)';
    });
    
    document.body.appendChild(floatBtn);
    console.log('[NotesPlugin] Плавающая кнопка добавлена');
    
    return floatBtn;
  }

  // Создаём плавающую кнопку при активации
  const floatingButton = createFloatingButton();

  console.log('[NotesPlugin] Плагин готов к работе (независимый режим)');

  // Возвращаем объект для деактивации
  return {
    deactivate: () => {
      console.log('[NotesPlugin] Деактивирован');
      // Удаляем плавающую кнопку
      if (floatingButton) {
        floatingButton.remove();
      }
    },

    getNotes: loadNotes,
    openNotes: openNotesWindow
  };
}
