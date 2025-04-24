// JS для контактов

// Функция для генерации мягкого случайного цвета
function getSoftColor(seed) {
  // Простая генерация "мягкого" цвета на основе первой буквы
  const colors = [
    '#e0e7ff', '#ffe0ec', '#e0fff4', '#fffbe0', '#e0f7fa', '#f3e0ff', '#eaffd9', '#ffd9e6', '#d9eaff', '#f0fff4'
  ];
  if (!seed) return colors[0];
  const code = seed.charCodeAt(0);
  return colors[code % colors.length];
}

// Отрисовка одной плитки контакта
function renderContactTile(contact) {
  const firstLetter = contact.first_name ? contact.first_name[0].toUpperCase() : '?';
  const bgColor = getSoftColor(firstLetter);
  return `
    <div class="contact-tile" style="background:${bgColor}" data-id="${contact.id}">
      <div class="contact-avatar">${firstLetter}</div>
      <div class="contact-info">
        <div class="contact-name">${contact.first_name} ${contact.last_name || ''}</div>
        <div class="contact-email">${contact.email}</div>
      </div>
      <div class="contact-actions">
        <button class="edit-contact" data-id="${contact.id}">✎</button>
        <button class="full-contact" data-id="${contact.id}">ℹ️</button>
        <button class="delete-contact" data-id="${contact.id}">🗑</button>
      </div>
    </div>
  `;
}

// Загрузка всех контактов
async function loadContacts() {
  const list = document.getElementById('contacts-list');
  list.innerHTML = '<div>Загрузка...</div>';
  try {
    const resp = await fetch('/contacts');
    const data = await resp.json();
    if (Array.isArray(data) && data.length > 0) {
      list.innerHTML = data.map(renderContactTile).join('');
    } else {
      list.innerHTML = '<div>Нет контактов</div>';
    }
  } catch (e) {
    list.innerHTML = '<div>Ошибка загрузки</div>';
  }
}

document.addEventListener('DOMContentLoaded', loadContacts);

// Глобальная функция для обновления контактов (используется из menu.js)
window.refreshContacts = loadContacts;

// Делегирование событий для редактирования и удаления
const contactList = document.getElementById('contacts-list');
if (contactList) {
  contactList.addEventListener('click', async function(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    if (btn.classList.contains('edit-contact')) {
      openEditContactPopup(id);
    } else if (btn.classList.contains('delete-contact')) {
      document.getElementById('btn-confirm-delete').setAttribute('data-id', id);
      openPopup('popup-confirm-delete');
    } else if (btn.classList.contains('full-contact')) {
      // Показать полные данные контакта
      const resp = await fetch(`/contacts/${id}`);
      if (resp.ok) {
        const contact = await resp.json();
        showFullContact(contact);
      }
    }
  });
}

// Открыть попап и заполнить форму с задержкой для гарантии DOM
async function openEditContactPopup(id) {
  openPopup('popup-create-contact');
  // Ждем 100ms чтобы DOM точно был готов
  setTimeout(async () => {
    const resp = await fetch(`/contacts/${id}`);
    if (resp.ok) {
      const contact = await resp.json();
      fillContactForm(contact);
      const popupH2 = document.querySelector('#popup-create-contact h2');
      if (popupH2) popupH2.innerText = 'Редактировать контакт';
      createForm.setAttribute('data-edit-id', id);
    }
  }, 100);
}

// Шаблон для отображения полных данных контакта
function showFullContact(contact) {
  const list = document.getElementById('contacts-list');
  list.innerHTML = renderFullContact(contact);
  // Добавить обработчик на кнопку назад
  const btnBack = document.getElementById('btn-back-to-list');
  if (btnBack) {
    btnBack.onclick = () => loadContacts();
  }
}

function renderFullContact(contact) {
  return `
    <div class="full-contact-card">
      <button id="btn-back-to-list">← Назад</button>
      <h2>${contact.first_name} ${contact.last_name || ''}</h2>
      <div><b>Email:</b> ${contact.email}</div>
      <div><b>День рождения:</b> ${contact.birthday || ''}</div>
      <div><b>Телефоны:</b> ${Array.isArray(contact.phone_numbers) && contact.phone_numbers.length ? contact.phone_numbers.map(pn => `${pn.number} (${pn.label||pn.type||''})`).join(', ') : '-'}</div>
      <div><b>Группы:</b> ${Array.isArray(contact.groups) && contact.groups.length ? contact.groups.map(gr => gr.name || gr).join(', ') : '-'}</div>
      <div><b>Дополнительно:</b> ${contact.extra_info || '-'}</div>
      <div><b>ID:</b> ${contact.id}</div>
    </div>
  `;
}

// Функция для заполнения формы контакта (редактирование)
function fillContactForm(contact) {
  console.log('fillContactForm data:', contact);
  createForm.reset();
  createForm.removeAttribute('data-edit-id');
  createForm.first_name.value = contact.first_name || '';
  console.log('first_name value:', createForm.first_name.value);
  createForm.last_name.value = contact.last_name || '';
  console.log('last_name value:', createForm.last_name.value);
  createForm.email.value = contact.email || '';
  console.log('email value:', createForm.email.value);
  createForm.birthday.value = contact.birthday ? contact.birthday.slice(0,10) : '';
  console.log('birthday value:', createForm.birthday.value);
  // Телефоны
  const phonesList = document.getElementById('phones-list');
  if (phonesList) {
    phonesList.innerHTML = '';
    let phones = contact.phone_numbers;
    if (typeof phones === 'string') {
      phones = phones.split(',').map(s => ({number: s.trim(), label: 'Мобільний'})).filter(p => p.number);
    }
    if (!Array.isArray(phones) || !phones.length) phones = [{number: '', label: 'Мобільний'}];
    phones.forEach(pn => {
      if (typeof pn === 'string') pn = {number: pn, label: 'Мобільний'};
      addPhoneRow(pn.number || '', pn.label || pn.type || 'Мобільний');
    });
  }
  // Группы
  const groupsList = document.getElementById('groups-list');
  if (groupsList) {
    groupsList.innerHTML = '';
    let groups = contact.groups;
    if (typeof groups === 'string') groups = groups.split(',').map(g=>g.trim()).filter(Boolean);
    if (!Array.isArray(groups)) groups = [];
    groups.forEach(gr => {
      if (typeof window.addGroupLabel === 'function') {
        window.addGroupLabel(gr);
      }
    });
    if (typeof window.updateGroupsInput === 'function') window.updateGroupsInput();
  }
  createForm.extra_info.value = contact.extra_info || '';
  console.log('extra_info value:', createForm.extra_info.value);
  const popupH2 = document.querySelector('#popup-create-contact h2');
  if (popupH2) popupH2.innerText = 'Редактировать контакт';
}
window.fillContactForm = fillContactForm;

// Динамическое добавление номера телефона
function addPhoneRow(number = '', label = 'Мобільний') {
  const phonesList = document.getElementById('phones-list');
  if (!phonesList) return;
  const div = document.createElement('div');
  div.className = 'phone-number-row';
  div.innerHTML = `
    <div class="phone-input-wrap">
      <input type="tel" required minlength="2" maxlength="32" pattern="[0-9 +()\-]*" placeholder="Номер телефону" value="${number}">
      <div class="phone-error"></div>
    </div>
    <select>
      <option value="Мобільний"${label==='Мобільний'?' selected':''}>Мобільний</option>
      <option value="Домашній"${label==='Домашній'?' selected':''}>Домашній</option>
      <option value="Робочий"${label==='Робочий'?' selected':''}>Робочий</option>
      <option value="Інший"${label==='Інший'?' selected':''}>Інший</option>
    </select>
    <button type="button" class="remove-phone-btn">✕</button>
  `;
  phonesList.appendChild(div);
  div.querySelector('.remove-phone-btn').onclick = () => div.remove();
}
window.addPhoneRow = addPhoneRow;

// Кастомная inline-валидация для телефона
function showPhoneError(input) {
  const errorDiv = input.parentElement.querySelector('.phone-error');
  if (input.validity.patternMismatch) {
    errorDiv.textContent = 'Заповніть правильно: тільки цифри, +, -, (, ), пробіли';
  } else if (input.validity.valueMissing) {
    errorDiv.textContent = 'Це поле обовʼязкове';
  } else {
    errorDiv.textContent = '';
  }
}
document.addEventListener('input', function(e) {
  if (e.target.matches('input[type="tel"]')) {
    e.target.setCustomValidity('');
    showPhoneError(e.target);
  }
});
document.addEventListener('blur', function(e) {
  if (e.target.matches('input[type="tel"]')) {
    showPhoneError(e.target);
  }
}, true);

// Добавление номера по кнопке
const addPhoneBtn = document.getElementById('add-phone-btn');
if (addPhoneBtn && !addPhoneBtn.hasAttribute('data-init')) {
  addPhoneBtn.onclick = () => addPhoneRow();
  addPhoneBtn.setAttribute('data-init', '1');
}

// При открытии формы по умолчанию хотя бы один номер
if (window.createForm) {
  window.createForm.addEventListener('reset', () => {
    setTimeout(() => {
      const phonesList = document.getElementById('phones-list');
      if (phonesList) {
        phonesList.innerHTML = '';
        addPhoneRow();
      }
    }, 10);
  });
}

// Создание контакта через форму
const createForm = document.getElementById('create-contact-form');
if (createForm) {
  // Счетчик попыток для даты рождения
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

    // Проверка валидности всей формы
    if (!createForm.checkValidity()) {
      e.preventDefault();
      // Все ошибки будут показаны inline
      return;
    }

    e.preventDefault();
    const formData = new FormData(createForm);
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    // Собираем телефоны как массив объектов {number, label}
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
    // Если нет ни одного номера, всё равно отправляем пустой массив
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
        loadContacts();
      } else {
        let errText = 'Ошибка сохранения контакта';
        try {
          const err = await resp.json();
          if (err.detail) {
            if (Array.isArray(err.detail)) {
              // FastAPI валидация
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
      alert('Ошибка сети: ' + (e.message || ''));
    }
  });
}

// Подтверждение удаления
const btnDelete = document.getElementById('btn-confirm-delete');
if (btnDelete) {
  btnDelete.addEventListener('click', async function() {
    const id = btnDelete.getAttribute('data-id');
    if (!id) return;
    try {
      const resp = await fetch(`/contacts/${id}`, { method: 'DELETE' });
      if (resp.ok) {
        closePopup('popup-confirm-delete');
        loadContacts();
      } else {
        alert('Ошибка удаления');
      }
    } catch {
      alert('Ошибка сети');
    }
  });
}
