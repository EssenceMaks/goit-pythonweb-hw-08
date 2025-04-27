// contacts_phone.js
// Динамическое добавление и валидация номеров телефонов

function addPhoneRow(number = '', label = 'Мобільний') {
  const phonesList = document.getElementById('phones-list');
  if (!phonesList) return;
  const div = document.createElement('div');
  div.className = 'phone-number-row';
  div.innerHTML = `
    <div class="phone-input-wrap">
      <input type="tel" required minlength="2" maxlength="32" placeholder="Номер телефону" value="${number}">
      <select>
        <option value="Мобільний"${label==='Мобільний'?' selected':''}>Мобільний</option>
        <option value="Домашній"${label==='Домашній'?' selected':''}>Домашній</option>
        <option value="Робочий"${label==='Робочий'?' selected':''}>Робочий</option>
        <option value="Інший"${label==='Інший'?' selected':''}>Інший</option>
      </select>
      <button type="button" class="remove-phone-btn">✕</button>
    </div>
  `;
  phonesList.appendChild(div);
  div.querySelector('.remove-phone-btn').onclick = () => div.remove();
}
window.addPhoneRow = addPhoneRow;

function showPhoneError(input) {
  const errorDiv = input.parentElement.querySelector('.phone-error');
  if (!errorDiv) return;
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
