// JS для попапов

// Универсальные функции для попапов
function openPopup(id) {
  document.querySelectorAll('.popup').forEach(p => {
    p.style.display = 'none';
    const form = p.querySelector('form');
    if (form) form.reset();
  });
  const popup = document.getElementById(id);
  if (popup) {
    popup.style.display = 'block';
    // Фокус на первое поле
    setTimeout(() => {
      const firstInput = popup.querySelector('input,textarea');
      if (firstInput) firstInput.focus();
    }, 100);
  }
}

function closePopup(id) {
  const popup = document.getElementById(id);
  if (popup) {
    popup.style.display = 'none';
    const form = popup.querySelector('form');
    if (form) form.reset();
    // Очистка динамических телефонов и групп
    if (document.getElementById('phones-list')) document.getElementById('phones-list').innerHTML = '';
    if (document.getElementById('groups-list')) document.getElementById('groups-list').innerHTML = '';
    if (document.querySelector('[name="groups"]')) document.querySelector('[name="groups"]').value = '';
  }
}

// Динамические телефоны
const phonesList = document.getElementById('phones-list');
const addPhoneBtn = document.getElementById('add-phone-btn');
const phoneTypes = ['Мобільний', 'Домашній', 'Робочий', 'Інший'];
function addPhoneRow(value = '', type = 'Мобільний') {
  if (!phonesList) return;
  const idx = phonesList.children.length;
  const row = document.createElement('div');
  row.className = 'phone-row';
  // Исправленный pattern для всех браузеров
  row.innerHTML = `<div class='phone-input-wrap form-field'><input class='phone-input' type='tel' pattern='[0-9()+#* -]{2,31}' minlength='2' maxlength='31' inputmode='tel' value='${value}' placeholder='номер телефону' required><div class='phone-error field-error' data-field='phone_${idx}'></div></div><select class='phone-type'>${phoneTypes.map(t => `<option${t===type?' selected':''}>${t}</option>`).join('')}</select><button type='button' class='remove-phone-btn' title='Видалити'>✕</button>`;
  row.querySelector('.remove-phone-btn').onclick = () => row.remove();
  phonesList.appendChild(row);
}
if (addPhoneBtn) {
  addPhoneBtn.onclick = () => addPhoneRow();
}

// Кастомная inline-валидация для телефона и других полей
function showPhoneError(input) {
  const errorDiv = input.parentElement.querySelector('.phone-error, .field-error');
  if (input.validity.valueMissing) {
    errorDiv.textContent = 'Це поле обовʼязкове .. від двох символів 1-9 # * ( )';
  } else if (input.validity.patternMismatch) {
    errorDiv.textContent = 'Заповніть правильно: тільки цифри, +, -, (, ), #, *, пробіли, від 2 до 31 символа';
  } else if (input.validity.tooShort) {
    errorDiv.textContent = 'Мінімум 2 символи';
  } else if (input.validity.tooLong) {
    errorDiv.textContent = 'Максимум 31 символ';
  } else {
    errorDiv.textContent = '';
  }
}

function showCustomFieldError(input) {
  const errorDiv = input.parentElement.querySelector('.field-error');
  if (!errorDiv) return;
  if (input.name === 'first_name' || input.name === 'last_name') {
    if (input.validity.tooLong) {
      errorDiv.textContent = 'Це поле максимум 198 символів';
    } else {
      errorDiv.textContent = '';
    }
  } else if (input.name === 'extra_info') {
    if (input.validity.tooLong) {
      errorDiv.textContent = 'Це поле максимум 500 символів';
    } else {
      errorDiv.textContent = '';
    }
  }
}

document.addEventListener('input', function(e) {
  if (e.target.matches('input[type="tel"]')) {
    e.target.value = e.target.value.replace(/[^0-9+\-()#* ]/g, '');
    showPhoneError(e.target);
  }
  if (e.target.name === 'first_name' || e.target.name === 'last_name' || e.target.name === 'extra_info') {
    showCustomFieldError(e.target);
  }
});
document.addEventListener('blur', function(e) {
  if (e.target.matches('input[type="tel"]')) {
    showPhoneError(e.target);
  }
  if (e.target.name === 'first_name' || e.target.name === 'last_name' || e.target.name === 'extra_info') {
    showCustomFieldError(e.target);
  }
}, true);

// Динамические группы (UI-заготовка)
const groupsList = document.getElementById('groups-list');
const addGroupBtn = document.getElementById('add-group-btn');
const groupVariants = ['Сімʼя', 'Друзі', 'Робота', 'Спорт', 'Інше'];
function addGroupLabel(name) {
  if (!groupsList) return;
  const label = document.createElement('span');
  label.className = 'group-label';
  label.innerHTML = `${name}<button type='button' class='remove-group-btn' title='Видалити'>✕</button>`;
  label.querySelector('.remove-group-btn').onclick = () => {
    label.remove();
    updateGroupsInput();
  };
  groupsList.appendChild(label);
  updateGroupsInput();
}
function updateGroupsInput() {
  const input = document.querySelector('[name="groups"]');
  if (input && groupsList) {
    input.value = Array.from(groupsList.children).map(l => l.textContent.replace('✕','').trim()).join(', ');
  }
}
if (addGroupBtn) {
  addGroupBtn.onclick = () => {
    // UI: показать дропдаун, пока просто prompt
    const name = prompt('Назва групи', groupVariants[0]);
    if (name && !Array.from(groupsList.children).some(l => l.textContent.includes(name))) {
      addGroupLabel(name);
    }
  };
}

// Аватар-ромб: буква имени
const firstNameInput = document.querySelector('[name="first_name"]');
const avatarLetter = document.getElementById('contact-avatar-letter');
if (firstNameInput && avatarLetter) {
  firstNameInput.addEventListener('input', () => {
    avatarLetter.textContent = (firstNameInput.value[0] || 'A').toUpperCase();
  });
}

// === Обработка ошибок формы контакта ===
function showFieldError(field, message) {
  const errorDiv = document.querySelector('.field-error[data-field="' + field + '"]');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.classList.add('active');
    // Подсветить поле
    const input = document.querySelector('[name="' + field + '"]');
    if (input) input.classList.add('invalid-field');
  }
}
function clearFieldError(field) {
  const errorDiv = document.querySelector('.field-error[data-field="' + field + '"]');
  if (errorDiv) {
    errorDiv.textContent = '';
    errorDiv.classList.remove('active');
    // Убрать подсветку
    const input = document.querySelector('[name="' + field + '"]');
    if (input) input.classList.remove('invalid-field');
  }
}
function clearAllFieldErrors() {
  document.querySelectorAll('.field-error').forEach(div => {div.textContent = '';div.classList.remove('active');});
  document.querySelectorAll('.invalid-field').forEach(i => i.classList.remove('invalid-field'));
}
// Очистка ошибок при вводе
['input','change'].forEach(evt => {
  document.addEventListener(evt, function(e) {
    if (e.target.name) clearFieldError(e.target.name);
  });
});
// Перехват сабмита формы контакта
const contactForm = document.getElementById('create-contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    clearAllFieldErrors();
    // HTML5 валидация
    if (!contactForm.checkValidity()) {
      Array.from(contactForm.elements).forEach(el => {
        if (!el.validity.valid) {
          if (el.type === 'tel') showPhoneError(el);
          else if (el.name === 'first_name' || el.name === 'last_name' || el.name === 'extra_info') showCustomFieldError(el);
          else showFieldError(el.name, el.validationMessage);
        }
      });
      return;
    }
    const formData = new FormData(contactForm);
    // Собираем телефоны
    const phones = Array.from(document.querySelectorAll('.phone-row .phone-input')).map(input => ({number: input.value, type: input.closest('.phone-row').querySelector('.phone-type').value}));
    formData.delete('phones');
    // Собираем группы
    const groups = document.querySelector('[name="groups"]').value;
    // Формируем payload
    const payload = Object.fromEntries(formData.entries());
    payload.phone_numbers = phones;
    payload.groups = groups;
    try {
      const resp = await fetch(contactForm.action || window.location.pathname, {
        method: contactForm.method || 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (!resp.ok) {
        // Обработка ошибок валидации
        if (data.detail) {
          if (Array.isArray(data.detail)) {
            data.detail.forEach(err => {
              const field = err.loc && err.loc.length ? err.loc[err.loc.length-1] : 'form';
              showFieldError(field, err.msg);
            });
          } else {
            showFieldError('form', data.detail);
          }
        }
      } else {
        // Успех: закрыть попап, сбросить форму и ошибки
        contactForm.reset();
        clearAllFieldErrors();
        closePopup('popup-create-contact');
        // Можно обновить список контактов
      }
    } catch (err) {
      showFieldError('form', 'Ошибка сети, попробуйте еще раз.');
    }
  });
}

window.openPopup = openPopup;
window.closePopup = closePopup;
window.addPhoneRow = addPhoneRow;
window.addGroupLabel = addGroupLabel;
window.updateGroupsInput = updateGroupsInput;
