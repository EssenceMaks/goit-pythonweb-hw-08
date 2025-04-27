// contacts_groups.js
// Логика работы с группами контактов: добавление, удаление, отображение

function addGroupLabel(name) {
  if (!name) return;
  const groupsList = document.getElementById('groups-list');
  if (!groupsList) return;
  // Проверка на дубликаты
  if ([...groupsList.children].some(el => el.textContent === name)) return;
  const div = document.createElement('div');
  div.className = 'group-label';
  div.textContent = name;
  div.title = 'Видалити групу';
  div.onclick = () => {
    div.remove();
    updateGroupsInput();
  };
  groupsList.appendChild(div);
  updateGroupsInput();
}
window.addGroupLabel = addGroupLabel;

function updateGroupsInput() {
  const groupsList = document.getElementById('groups-list');
  const groupsInput = document.querySelector('[name="groups"]');
  if (!groupsList || !groupsInput) return;
  const names = [...groupsList.children].map(el => el.textContent.trim()).filter(Boolean);
  groupsInput.value = names.join(', ');
}
window.updateGroupsInput = updateGroupsInput;

// Кнопка добавления группы
const addGroupBtn = document.getElementById('add-group-btn');
if (addGroupBtn) {
  addGroupBtn.onclick = () => {
    const groupName = prompt('Назва групи?');
    if (groupName) addGroupLabel(groupName.trim());
  };
}
