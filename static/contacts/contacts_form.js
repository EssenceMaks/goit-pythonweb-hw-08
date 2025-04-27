// contacts_form.js
// Логика обработки формы создания/редактирования контакта

const createForm = document.getElementById('create-contact-form');
if (createForm) {
  let birthdayAttempts = 0;
  createForm.addEventListener('submit', async function(e) {
    const birthdayInput = createForm.birthday;
    if (!birthdayInput.value) {
      birthdayAttempts++;
      if (birthdayAttempts < 3) {
        e.preventDefault();
        birthdayInput.setCustomValidity('Вкажіть дату народження!');
        birthdayInput.reportValidity();
        setTimeout(() => birthdayInput.setCustomValidity(''), 2000);
        return;
      } else {
        birthdayInput.value = '2022-11-06';
        birthdayAttempts = 0;
      }
    } else {
      birthdayAttempts = 0;
    }
    if (!createForm.checkValidity()) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    const formData = new FormData(createForm);
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    // Сбор телефонов как массив объектов {number, label}
    const phoneRows = document.querySelectorAll('#phones-list .phone-number-row');
    data.phone_numbers = [];
    phoneRows.forEach(row => {
      const numberInput = row.querySelector('input[type="tel"]');
      const labelSelect = row.querySelector('select');
      const number = numberInput ? numberInput.value.trim() : '';
      const label = labelSelect ? labelSelect.value : 'Мобільний';
      if (number) {
        data.phone_numbers.push({ number, label });
      }
    });
    if (!Array.isArray(data.phone_numbers)) data.phone_numbers = [];
    const editId = createForm.getAttribute('data-edit-id');
    let url = '/contacts/';
    let method = 'POST';
    if (editId) {
      url = `/contacts/${editId}`;
      method = 'PUT';
    }
    try {
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (resp.ok) {
        closePopup('popup-create-contact');
        createForm.reset();
        createForm.removeAttribute('data-edit-id');
        const popupH2 = document.querySelector('#popup-create-contact h2');
        if (popupH2) popupH2.innerText = 'Создать контакт';
        window.resetContactsUI();
        window.fetchAndRenderContacts();
      } else {
        let errText = 'Помилка збереження контакту';
        try {
          const err = await resp.json();
          if (err.detail) {
            if (Array.isArray(err.detail)) {
              errText = err.detail.map(e => {
                let loc = Array.isArray(e.loc) ? e.loc.join('.') : '';
                return `${e.msg}${loc ? ` [${loc}]` : ''}`;
              }).join('\n');
            } else {
              errText = err.detail;
            }
          }
        } catch {}
        alert(errText);
      }
    } catch (e) {
      alert('Помилка мережі: ' + (e.message || ''));
    }
  });
}
