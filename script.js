// Configuração e inicialização das partículas
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar tema
    initTheme();
    // Inicializar grupos de tarefas
    initTaskGroups();
    // Inicializar partículas
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 80,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: '#3b82f6'
            },
            shape: {
                type: 'circle',
                stroke: {
                    width: 0,
                    color: '#000000'
                },
                polygon: {
                    nb_sides: 5
                }
            },
            opacity: {
                value: 0.5,
                random: true,
                anim: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: true,
                    speed: 2,
                    size_min: 0.1,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#3b82f6',
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: 'none',
                random: true,
                straight: false,
                out_mode: 'out',
                bounce: false,
                attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 1200
                }
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: {
                    enable: true,
                    mode: 'grab'
                },
                onclick: {
                    enable: true,
                    mode: 'push'
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 140,
                    line_linked: {
                        opacity: 1
                    }
                },
                bubble: {
                    distance: 400,
                    size: 40,
                    duration: 2,
                    opacity: 8,
                    speed: 3
                },
                repulse: {
                    distance: 200,
                    duration: 0.4
                },
                push: {
                    particles_nb: 4
                },
                remove: {
                    particles_nb: 2
                }
            }
        },
        retina_detect: true
    });

    // Funcionalidade de grupos de tarefas
    function initTaskGroups() {
        const groupInput = document.getElementById('groupInput');
        const addGroupBtn = document.getElementById('addGroupBtn');
        const groupsContainer = document.getElementById('groupsContainer');
        const editGroupModal = document.getElementById('editGroupModal');
        const editGroupInput = document.getElementById('editGroupInput');
        const saveGroupBtn = document.getElementById('saveGroupBtn');
        const editCloseModal = document.querySelector('.edit-close-modal');
        const deleteCloseModal = document.querySelector('.delete-close-modal');
        const importBtn = document.getElementById('importBtn');
        const importModal = document.getElementById('importModal');
        const importCloseModal = document.querySelector('.import-close-modal');
        const importFileInput = document.getElementById('importFileInput');
        const selectedFileName = document.getElementById('selectedFileName');
        const cancelImportBtn = document.getElementById('cancelImportBtn');
        const confirmImportBtn = document.getElementById('confirmImportBtn');
        const importMessage = document.getElementById('importMessage');
        const deleteGroupModal = document.getElementById('deleteGroupModal');
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        
        let currentEditingGroup = null;
        let currentDeletingGroup = null;
        
        // Carregar grupos do localStorage
        loadGroups();
        
        // Configurar botão de importação
        importBtn.addEventListener('click', function() {
            // Resetar o estado do modal de importação
            importFileInput.value = '';
            selectedFileName.textContent = 'Nenhum arquivo selecionado';
            importMessage.textContent = 'Selecione um arquivo JSON para importar um grupo de tarefas.';
            importMessage.style.color = '';
            confirmImportBtn.disabled = true;
            
            // Exibir o modal
            importModal.classList.add('active');
        });
        
        // Atualizar nome do arquivo selecionado
        importFileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                selectedFileName.textContent = file.name;
                confirmImportBtn.disabled = false;
            } else {
                selectedFileName.textContent = 'Nenhum arquivo selecionado';
                confirmImportBtn.disabled = true;
            }
        });
        
        // Fechar modal de importação
        importCloseModal.addEventListener('click', function() {
            importModal.classList.remove('active');
        });
        
        // Cancelar importação
        cancelImportBtn.addEventListener('click', function() {
            importModal.classList.remove('active');
        });
        
        // Confirmar importação
        confirmImportBtn.addEventListener('click', function() {
            if (importFileInput.files.length > 0) {
                const file = importFileInput.files[0];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    try {
                        const jsonData = JSON.parse(e.target.result);
                        processImport(jsonData);
                    } catch (error) {
                        importMessage.textContent = 'Erro ao importar: Formato de arquivo inválido.';
                        importMessage.style.color = 'var(--danger-color)';
                        console.error('Erro na importação:', error);
                    }
                };
                
                reader.readAsText(file);
            }
        });
        
        // Fechar modal de importação ao clicar fora
        window.addEventListener('click', function(e) {
            if (e.target === importModal) {
                importModal.classList.remove('active');
            }
        });
        
        // Adicionar novo grupo
        addGroupBtn.addEventListener('click', addGroup);
        
        // Adicionar grupo ao pressionar Enter
        groupInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addGroup();
            }
        });
        
        // Fechar modais
        editCloseModal.addEventListener('click', function() {
            editGroupModal.classList.remove('active');
        });
        
        deleteCloseModal.addEventListener('click', function() {
            deleteGroupModal.classList.remove('active');
            currentDeletingGroup = null;
        });
        
        // Salvar edição do grupo
        saveGroupBtn.addEventListener('click', function() {
            if (currentEditingGroup && editGroupInput.value.trim() !== '') {
                const groupTitle = currentEditingGroup.querySelector('.group-title');
                groupTitle.textContent = editGroupInput.value.trim();
                editGroupModal.classList.remove('active');
                saveGroups();
            }
        });
        
        // Adicionar eventos de delegação para os grupos
        groupsContainer.addEventListener('click', function(e) {
            const target = e.target;
            
            // Editar grupo
            if (target.closest('.edit-group-btn')) {
                const group = target.closest('.task-group');
                const groupTitle = group.querySelector('.group-title').textContent;
                
                currentEditingGroup = group;
                editGroupInput.value = groupTitle;
                editGroupModal.classList.add('active');
            }
            
            // Excluir grupo
            if (target.closest('.delete-group-btn')) {
                const group = target.closest('.task-group');
                currentDeletingGroup = group;
                deleteGroupModal.classList.add('active');
            }
            
            // Exportar grupo
            if (target.closest('.export-group-btn')) {
                const group = target.closest('.task-group');
                exportGroup(group);
            }
            
            // Adicionar tarefa
            if (target.closest('.add-task-btn')) {
                const group = target.closest('.task-group');
                const taskInput = group.querySelector('.task-input-field');
                const taskText = taskInput.value.trim();
                
                if (taskText !== '') {
                    const taskList = group.querySelector('.task-list');
                    createTaskItem(taskList, taskText, false);
                    taskInput.value = '';
                    saveGroups();
                }
            }
            
            // Marcar tarefa como concluída
            if (target.classList.contains('task-checkbox')) {
                const taskText = target.nextElementSibling;
                taskText.classList.toggle('completed', target.checked);
                saveGroups();
            }
            
            // Excluir tarefa
            if (target.closest('.delete-btn')) {
                const taskItem = target.closest('.task-item');
                taskItem.remove();
                saveGroups();
            }
        });
        
        // Configurar botões do modal de exclusão
        cancelDeleteBtn.addEventListener('click', function() {
            deleteGroupModal.classList.remove('active');
            currentDeletingGroup = null;
        });
        
        confirmDeleteBtn.addEventListener('click', function() {
            if (currentDeletingGroup) {
                currentDeletingGroup.remove();
                saveGroups();
                deleteGroupModal.classList.remove('active');
                currentDeletingGroup = null;
            }
        });
        
        // Fechar os modais ao clicar fora deles
        window.addEventListener('click', function(e) {
            if (e.target === editGroupModal) {
                editGroupModal.classList.remove('active');
            }
            if (e.target === deleteGroupModal) {
                deleteGroupModal.classList.remove('active');
                currentDeletingGroup = null;
            }
        });
        
        function addGroup() {
            const groupName = groupInput.value.trim();
            
            if (groupName !== '') {
                createGroup(groupName);
                groupInput.value = '';
                saveGroups();
            }
        }
        
        function createGroup(name, groupId = generateId()) {
            const group = document.createElement('div');
            group.className = 'task-group';
            group.dataset.groupId = groupId;
            
            group.innerHTML = `
                <div class="group-header">
                    <h2 class="group-title">${name}</h2>
                    <div class="group-actions">
                        <button class="export-group-btn"><i class="fas fa-file-export"></i></button>
                        <button class="edit-group-btn"><i class="fas fa-edit"></i></button>
                        <button class="delete-group-btn"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div class="task-input group-task-input">
                    <input type="text" class="task-input-field" placeholder="Adicionar nova tarefa...">
                    <button class="add-task-btn">Adicionar</button>
                </div>
                <ul class="task-list"></ul>
            `;
            
            groupsContainer.appendChild(group);
            return group;
        }
        
        function createTaskItem(taskList, text, completed) {
            // Criar elemento de lista
            const li = document.createElement('li');
            li.className = 'task-item';
            
            // Criar checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = completed;
            
            // Criar texto da tarefa
            const span = document.createElement('span');
            span.className = 'task-text' + (completed ? ' completed' : '');
            span.textContent = text;
            
            // Criar botão de exclusão
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            
            // Montar o item da tarefa
            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteBtn);
            
            // Adicionar à lista
            taskList.appendChild(li);
            return li;
        }
        
        function saveGroups() {
            const groups = [];
            
            // Coletar todos os grupos e suas tarefas
            document.querySelectorAll('.task-group').forEach(function(group) {
                const groupId = group.dataset.groupId;
                const groupName = group.querySelector('.group-title').textContent;
                const tasks = [];
                
                // Coletar tarefas do grupo
                group.querySelectorAll('.task-item').forEach(function(item) {
                    const text = item.querySelector('.task-text').textContent;
                    const completed = item.querySelector('.task-checkbox').checked;
                    
                    tasks.push({
                        text: text,
                        completed: completed
                    });
                });
                
                groups.push({
                    id: groupId,
                    name: groupName,
                    tasks: tasks
                });
            });
            
            // Salvar no localStorage
            localStorage.setItem('taskGroups', JSON.stringify(groups));
        }
        
        function loadGroups() {
            const groups = JSON.parse(localStorage.getItem('taskGroups')) || [];
            
            // Limpar container de grupos, exceto o grupo padrão se não houver grupos salvos
            if (groups.length > 0) {
                groupsContainer.innerHTML = '';
            }
            
            // Adicionar grupos salvos
            if (groups.length > 0) {
                groups.forEach(function(group) {
                    const groupElement = createGroup(group.name, group.id);
                    const taskList = groupElement.querySelector('.task-list');
                    
                    // Adicionar tarefas ao grupo
                    group.tasks.forEach(function(task) {
                        createTaskItem(taskList, task.text, task.completed);
                    });
                });
            }
        }
        
        function generateId() {
            return 'group_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        
        function exportGroup(group) {
            const groupName = group.querySelector('.group-title').textContent;
            const groupId = group.dataset.groupId;
            const tasks = [];
            
            // Obter todas as tarefas do grupo
            group.querySelectorAll('.task-item').forEach(task => {
                const isCompleted = task.querySelector('.task-checkbox').checked;
                const taskText = task.querySelector('.task-text').textContent;
                tasks.push({
                    text: taskText,
                    completed: isCompleted
                });
            });
            
            // Criar objeto JSON para exportação
            const exportData = {
                id: groupId,
                name: groupName,
                tasks: tasks
            };
            
            // Converter para string JSON formatada
            const jsonString = JSON.stringify(exportData, null, 2);
            
            // Criar arquivo para download
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Criar link de download e acionar clique
            const a = document.createElement('a');
            a.href = url;
            a.download = `${groupName.replace(/\s+/g, '_')}.json`;
            document.body.appendChild(a);
            a.click();
            
            // Limpar
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        }
        
        function importGroup(groupData) {
            // Verificar se o grupo já existe pelo ID
            const existingGroup = document.querySelector(`.task-group[data-group-id="${groupData.id}"]`);
            if (existingGroup) {
                if (!confirm(`Um grupo com o nome "${groupData.name}" já existe. Deseja substituí-lo?`)) {
                    return;
                }
                existingGroup.remove();
            }
            
            // Criar o novo grupo
            const groupElement = createGroup(groupData.name, groupData.id);
            const taskList = groupElement.querySelector('.task-list');
            
            // Adicionar tarefas ao grupo
            if (groupData.tasks && Array.isArray(groupData.tasks)) {
                groupData.tasks.forEach(task => {
                    createTaskItem(taskList, task.text, task.completed);
                });
            }
            
            // Salvar grupos atualizados
            saveGroups();
            
            // Feedback
            alert(`Grupo "${groupData.name}" importado com sucesso!`);
        }

        function processImport(groupData) {
            // Verificar se os dados são válidos
            if (!groupData || !groupData.name || !groupData.id || !Array.isArray(groupData.tasks)) {
                importMessage.textContent = 'Erro ao importar: Estrutura de dados inválida.';
                importMessage.style.color = 'var(--danger-color)';
                return;
            }
            
            // Verificar se o grupo já existe pelo ID
            const existingGroup = document.querySelector(`.task-group[data-group-id="${groupData.id}"]`);
            if (existingGroup) {
                importMessage.textContent = `Um grupo com o nome "${groupData.name}" já existe. Deseja substituí-lo?`;
                importMessage.style.color = 'var(--accent-color)';
                
                // Configurar o botão de confirmação para substituir o grupo
                const originalText = confirmImportBtn.textContent;
                confirmImportBtn.textContent = 'Substituir';
                
                // Armazenar o manipulador original para removê-lo depois
                const originalHandler = confirmImportBtn.onclick;
                
                // Definir o novo manipulador
                confirmImportBtn.onclick = function() {
                    // Remover o grupo existente
                    existingGroup.remove();
                    
                    // Criar o novo grupo
                    createGroupFromData(groupData);
                    
                    // Restaurar o botão e fechar o modal
                    confirmImportBtn.textContent = originalText;
                    confirmImportBtn.onclick = originalHandler;
                    importModal.classList.remove('active');
                };
                
                // Configurar o botão cancelar para restaurar o estado original
                cancelImportBtn.onclick = function() {
                    confirmImportBtn.textContent = originalText;
                    confirmImportBtn.onclick = originalHandler;
                    importModal.classList.remove('active');
                };
                
                // Também resetar se o modal for fechado
                importCloseModal.onclick = function() {
                    confirmImportBtn.textContent = originalText;
                    confirmImportBtn.onclick = originalHandler;
                    importModal.classList.remove('active');
                };
                
                return;
            }
            
            // Se não houver conflito, criar o grupo diretamente
            createGroupFromData(groupData);
            importModal.classList.remove('active');
        }
        
        function createGroupFromData(groupData) {
            // Criar o novo grupo
            const groupElement = createGroup(groupData.name, groupData.id);
            const taskList = groupElement.querySelector('.task-list');
            
            // Adicionar tarefas ao grupo
            if (groupData.tasks && Array.isArray(groupData.tasks)) {
                groupData.tasks.forEach(task => {
                    createTaskItem(taskList, task.text, task.completed);
                });
            }
            
            // Salvar grupos atualizados
            saveGroups();
        }
    }
});

// Funcionalidade do checklist
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const root = document.documentElement;
    const icon = themeToggle.querySelector('i');
    
    // Verificar se há uma preferência salva
    const savedTheme = localStorage.getItem('theme');
    
    // Aplicar tema salvo ou usar o padrão (escuro)
    if (savedTheme === 'light') {
        root.classList.add('light-theme');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
    
    // Adicionar evento de clique ao botão de alternância
    themeToggle.addEventListener('click', function() {
        // Alternar classe no elemento root
        root.classList.toggle('light-theme');
        
        // Alternar ícone
        if (root.classList.contains('light-theme')) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        } else {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        }
    });
}