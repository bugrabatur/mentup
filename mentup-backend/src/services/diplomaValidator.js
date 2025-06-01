const { DiplomaRegistry } = require('../models');

async function validateDiplomaInfo({ tc, name, surname, diploma_number }) {
  const record = await DiplomaRegistry.findOne({ where: { tc } });

  if (!record) {
    return { success: false, error: 'TC bulunamadı' };
  }

  if (record.name.trim().toLowerCase() !== name.trim().toLowerCase()) {
    return { success: false, error: 'İsim uyuşmuyor.' };
  }
  
  if (record.surname.trim().toLowerCase() !== surname.trim().toLowerCase()) {
    return { success: false, error: 'Soyisim uyuşmuyor.' };
  }  

  if (record.diploma_number !== diploma_number) {
    return { success: false, error: 'Diploma numarası uyuşmuyor' };
  }

  return { success: true };
}

module.exports = { validateDiplomaInfo };
