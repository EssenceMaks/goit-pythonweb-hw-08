// contacts_delete.js
// Логика подтверждения и удаления контакта

const btnDelete = document.getElementById('btn-confirm-delete');
if (btnDelete) {
  btnDelete.addEventListener('click', async function() {
    const id = btnDelete.getAttribute('data-id');
    if (!id) return;
    try {
      const resp = await fetch(`/contacts/${id}`, { method: 'DELETE' });
      if (resp.ok) {
        closePopup('popup-confirm-delete');
        window.resetContactsUI();
        window.fetchAndRenderContacts();
      } else {
        alert('Помилка видалення');
      }
    } catch {
      alert('Помилка мережі');
    }
  });
}
