class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.selectedTodos = new Set();
        this.theme = localStorage.getItem('theme') || 'dark';
        this.draggedElement = null;
        this.dropZones = [];
        this.modalIsOpen = false;

        this.init();
    }

    init() {
        this.initTheme();
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    initTheme() {
        this.applyTheme(this.theme);
        
        const themeToggle = document.getElementById('themeToggle');
        themeToggle?.addEventListener('click', () => {
            this.theme = this.theme === 'dark' ? 'light' : 'dark';
            this.applyTheme(this.theme);
            localStorage.setItem('theme', this.theme);
        });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeIcon = document.querySelector('#themeToggle .icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    bindEvents() {
        const todoInput = document.getElementById('todoInput');
        const addButton = document.getElementById('addButton');
        
        addButton.addEventListener('click', () => this.addTodo());
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentFilter = btn.dataset.filter;
                this.updateFilterButtons();
                this.render();
            });
        });

        document.getElementById('backButton')?.addEventListener('click', () => {
            window.location.href = '../index.html';
        });

        document.getElementById('completeSelected')?.addEventListener('click', () => {
            this.completeSelectedTodos();
        });

        const deleteSelectedBtn = document.getElementById('deleteSelected');
        if (deleteSelectedBtn) {
            deleteSelectedBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                console.log('Delete selected clicked, size:', this.selectedTodos.size);
                if (this.selectedTodos.size > 0 && !this.modalIsOpen) {
                    const selectedIds = Array.from(this.selectedTodos);
                    console.log('Selected IDs:', selectedIds);
                    this.showConfirmModal(`Biztosan törölni szeretnéd a kiválasztott ${selectedIds.length} feladatot?`, () => {
                        console.log('Executing delete for IDs:', selectedIds);
                        this.todos = this.todos.filter(t => !selectedIds.includes(t.id));
                        this.selectedTodos.clear();
                        this.saveTodos();
                        this.render();
                        this.updateStats();
                        this.updateBulkActions();
                    });
                }
            }, { once: false });
        }

        document.getElementById('cancelAction')?.addEventListener('click', () => {
            this.hideConfirmModal();
        });

        document.getElementById('confirmAction')?.addEventListener('click', () => {
            console.log('Confirm clicked, has pendingAction:', !!this.pendingAction);
            if (this.pendingAction) {
                const actionToExecute = this.pendingAction;
                this.pendingAction = null;
                this.hideConfirmModal();
                setTimeout(() => {
                    console.log('Executing action');
                    actionToExecute();
                }, 0);
            }
        });

        document.getElementById('confirmModal')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.hideConfirmModal();
            }
        });

        // Ctrl+A: összes kiválasztása, Escape: kijelölés törlése
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                this.selectAllTodos();
            }
            if (e.key === 'Escape') {
                this.clearSelection();
            }
        });
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();
        
        if (!text) return;

        const todo = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
            order: this.todos.length
        };

        this.todos.push(todo);
        this.saveTodos();
        this.render();
        this.updateStats();
        
        input.value = '';
        input.focus();

        setTimeout(() => {
            const newTodoElement = document.querySelector(`[data-id="${todo.id}"]`);
            if (newTodoElement) {
                newTodoElement.style.animation = 'slideInLeft 0.3s ease';
            }
        }, 100);
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
            this.updateStats();
        }
    }

    deleteTodo(id) {
        this.showConfirmModal('Biztosan törölni szeretnéd ezt a feladatot?', () => {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.render();
            this.updateStats();
        });
    }

    moveTodoUp(id) {
        const index = this.todos.findIndex(t => t.id === id);
        if (index > 0) {
            [this.todos[index], this.todos[index - 1]] = [this.todos[index - 1], this.todos[index]];
            this.saveTodos();
            this.render();
        }
    }

    moveTodoDown(id) {
        const index = this.todos.findIndex(t => t.id === id);
        if (index < this.todos.length - 1) {
            [this.todos[index], this.todos[index + 1]] = [this.todos[index + 1], this.todos[index]];
            this.saveTodos();
            this.render();
        }
    }

    toggleSelection(id) {
        if (this.selectedTodos.has(id)) {
            this.selectedTodos.delete(id);
        } else {
            this.selectedTodos.add(id);
        }
        
        this.updateBulkActions();
        this.updateTodoSelection();
    }

    selectAllTodos() {
        const visibleTodos = this.getFilteredTodos();
        visibleTodos.forEach(todo => this.selectedTodos.add(todo.id));
        this.updateBulkActions();
        this.updateTodoSelection();
    }

    clearSelection() {
        this.selectedTodos.clear();
        this.updateBulkActions();
        this.updateTodoSelection();
    }

    completeSelectedTodos() {
        this.selectedTodos.forEach(id => {
            const todo = this.todos.find(t => t.id === id);
            if (todo) todo.completed = true;
        });
        
        this.clearSelection();
        this.saveTodos();
        this.render();
        this.updateStats();
    }

    deleteSelectedTodos() {
        const idsToDelete = Array.from(this.selectedTodos);
        this.todos = this.todos.filter(t => !idsToDelete.includes(t.id));
        this.clearSelection();
        this.saveTodos();
        this.render();
        this.updateStats();
    }

    // Húzd és dobd sorrendezés
    initDragAndDrop() {
        const todoList = document.getElementById('todoList');
        const todoItems = document.querySelectorAll('.todo-item');
        
        todoItems.forEach(item => {
            item.setAttribute('draggable', 'true');
            
            item.addEventListener('dragstart', (e) => {
                this.draggedElement = item;
                this.draggedId = item.dataset.id;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', item.dataset.id);
            });
            
            item.addEventListener('dragend', (e) => {
                item.classList.remove('dragging');
                this.clearDragIndicators();
                this.draggedElement = null;
                this.draggedId = null;
            });
        });
        
        // Lista szintű drag-and-drop kezelés
        if (todoList) {
            todoList.addEventListener('dragover', (e) => {
                e.preventDefault();
                
                if (!this.draggedElement) return;
                
                const listRect = todoList.getBoundingClientRect();
                const mouseY = e.clientY;
                const edgeThreshold = 50;
                
                this.clearDragIndicators();
                
                // Speciális kezelés: lista teteje (50px zóna)
                if (mouseY < listRect.top + edgeThreshold) {
                    const firstItem = todoList.querySelector('.todo-item:not(.dragging)');
                    if (firstItem) {
                        firstItem.style.marginTop = '40px';
                        firstItem.style.transition = 'margin 0.2s ease';
                    }
                    return;
                }
                
                // Speciális kezelés: lista alja (50px zóna)
                if (mouseY > listRect.bottom - edgeThreshold) {
                    const items = Array.from(todoList.querySelectorAll('.todo-item:not(.dragging)'));
                    const lastItem = items[items.length - 1];
                    if (lastItem) {
                        lastItem.style.marginBottom = '40px';
                        lastItem.style.transition = 'margin 0.2s ease';
                    }
                    return;
                }
                
                // Normál eset: két elem közé húzás
                const afterElement = this.getDragAfterElement(todoList, mouseY);
                
                if (afterElement == null) {
                    const items = Array.from(todoList.querySelectorAll('.todo-item:not(.dragging)'));
                    const lastItem = items[items.length - 1];
                    if (lastItem) {
                        lastItem.style.marginBottom = '40px';
                        lastItem.style.transition = 'margin 0.2s ease';
                    }
                } else {
                    afterElement.style.marginTop = '40px';
                    afterElement.style.transition = 'margin 0.2s ease';
                }
            });
            
            todoList.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (!this.draggedElement) return;
                
                const listRect = todoList.getBoundingClientRect();
                const mouseY = e.clientY;
                const edgeThreshold = 50;
                
                this.clearDragIndicators();
                
                // Első pozícióba dobjuk
                if (mouseY < listRect.top + edgeThreshold) {
                    const firstItem = todoList.querySelector('.todo-item:not(.dragging)');
                    if (firstItem) {
                        this.reorderTodos(this.draggedId, firstItem.dataset.id, false);
                    }
                    return;
                }
                
                // Utolsó pozícióba dobjuk
                if (mouseY > listRect.bottom - edgeThreshold) {
                    const items = Array.from(todoList.querySelectorAll('.todo-item:not(.dragging)'));
                    const lastItem = items[items.length - 1];
                    if (lastItem) {
                        this.reorderTodos(this.draggedId, lastItem.dataset.id, true);
                    }
                    return;
                }
                
                // Normál eset: két elem közé
                const afterElement = this.getDragAfterElement(todoList, mouseY);
                
                if (afterElement == null) {
                    const items = Array.from(todoList.querySelectorAll('.todo-item:not(.dragging)'));
                    const lastItem = items[items.length - 1];
                    if (lastItem) {
                        this.reorderTodos(this.draggedId, lastItem.dataset.id, true);
                    }
                } else {
                    this.reorderTodos(this.draggedId, afterElement.dataset.id, false);
                }
            });
        }
    }
    
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.todo-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    clearDragIndicators() {
        document.querySelectorAll('.todo-item').forEach(i => {
            i.style.marginTop = '';
            i.style.marginBottom = '';
            i.style.transition = '';
        });
    }

    // Újrarendezés: elem eltávolítása és beszúrása új helyre
    reorderTodos(draggedId, targetId, insertAfter) {
        const draggedIndex = this.todos.findIndex(t => t.id === draggedId);
        const targetIndex = this.todos.findIndex(t => t.id === targetId);
        
        if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) return;
        
        const [draggedTodo] = this.todos.splice(draggedIndex, 1);
        let newTargetIndex = this.todos.findIndex(t => t.id === targetId);
        const insertIndex = insertAfter ? newTargetIndex + 1 : newTargetIndex;
        this.todos.splice(insertIndex, 0, draggedTodo);
        
        this.saveTodos();
        this.render();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            case 'pending':
                return this.todos.filter(todo => !todo.completed);
            default:
                return this.todos;
        }
    }

    updateFilterButtons() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === this.currentFilter);
        });
    }

    render() {
        const todoList = document.getElementById('todoList');
        const emptyState = document.getElementById('emptyState');
        const filteredTodos = this.getFilteredTodos();
        
        if (filteredTodos.length === 0) {
            todoList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        todoList.style.display = 'flex';
        emptyState.style.display = 'none';
        
        todoList.innerHTML = filteredTodos.map(todo => this.createTodoHTML(todo)).join('');
        
        this.bindTodoEvents();
        this.initDragAndDrop();
        this.updateTodoSelection();
    }

    createTodoHTML(todo) {
        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <div class="todo-content">
                    <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" data-id="${todo.id}">
                        ${todo.completed ? '✓' : ''}
                    </div>
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <div class="todo-actions">
                        <button class="todo-btn move-btn move-up" data-id="${todo.id}" title="Fel">
                            ▲
                        </button>
                        <button class="todo-btn move-btn move-down" data-id="${todo.id}" title="Le">
                            ▼
                        </button>
                        <button class="todo-btn delete-btn" data-id="${todo.id}" title="Törlés">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    bindTodoEvents() {
        document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.toggleTodo(id);
            });
        });

        document.querySelectorAll('.move-up').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = e.target.dataset.id;
                this.moveTodoUp(id);
            });
        });

        document.querySelectorAll('.move-down').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = e.target.dataset.id;
                this.moveTodoDown(id);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = e.target.dataset.id;
                this.deleteTodo(id);
            });
        });

        document.querySelectorAll('.todo-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    const id = item.dataset.id;
                    this.toggleSelection(id);
                }
            });
        });
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = total - completed;

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('pendingTasks').textContent = pending;
    }

    updateBulkActions() {
        const bulkActions = document.getElementById('bulkActions');
        const selectedCount = document.getElementById('selectedCount');
        
        if (this.selectedTodos.size > 0) {
            bulkActions.style.display = 'block';
            selectedCount.textContent = `${this.selectedTodos.size} kiválasztva`;
        } else {
            bulkActions.style.display = 'none';
        }
    }

    updateTodoSelection() {
        document.querySelectorAll('.todo-item').forEach(item => {
            const isSelected = this.selectedTodos.has(item.dataset.id);
            item.style.transform = isSelected ? 'translateX(8px) scale(0.98)' : '';
            item.style.background = isSelected ? 'var(--shadow-light)' : '';
        });
    }

    showConfirmModal(message, action) {
        if (this.modalIsOpen) {
            console.log('Modal already open, ignoring');
            return;
        }
        
        const modal = document.getElementById('confirmModal');
        const messageElement = document.getElementById('confirmMessage');
        
        messageElement.textContent = message;
        this.pendingAction = action;
        this.modalIsOpen = true;
        modal.classList.add('show');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hideConfirmModal() {
        const modal = document.getElementById('confirmModal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            this.modalIsOpen = false;
        }, 100);
        
        this.pendingAction = null;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .catch(err => console.log('SW registration failed:', err));
    });
}
