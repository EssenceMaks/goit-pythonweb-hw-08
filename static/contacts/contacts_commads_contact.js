// Меню команд для контактов: создать, случайные, удалить все

window.createContact = function createContact() {
  // Открыть форму создания контакта
  const form = document.getElementById('create-contact-form');
  if (form) {
    form.reset();
    form.removeAttribute('data-edit-id');
    window.openPopup('create-contact-popup');
  }
};

window.createRandomContacts = async function createRandomContacts(count = 5) {
  if (!confirm(`Створити ${count} випадкових контактів?`)) return;
  await fetch(`/contacts/random?count=${count}`);
  if (typeof fetchAndRenderContactsInner === 'function') fetchAndRenderContactsInner({});
};

window.deleteAllContacts = async function deleteAllContacts() {
  if (!confirm('Видалити всі контакти?')) return;
  await fetch('/contacts/all', { method: 'DELETE' });
  if (typeof fetchAndRenderContactsInner === 'function') fetchAndRenderContactsInner({});
};

// Пример использования:
// <button onclick="createContact()">Створити контакт</button>
// <button onclick="createRandomContacts()">Створити випадкові контакти</button>
// <button onclick="deleteAllContacts()">Видалити всі контакти</button>
