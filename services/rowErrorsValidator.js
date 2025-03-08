const rowErrorsValidator = async (row, rowCounter) => {
  const errors = [];
  const regexForNombre =
    /^[A-Za-zÀ-ÖØ-öø-ÿ'´¨ˆ˜]+(?:\s[A-Za-zÀ-ÖØ-öø-ÿ'´¨ˆ˜]+)*$/;
  if (typeof row.Name !== "string" || !regexForNombre.test(row.Name)) {
    errors.push({ row: rowCounter, column: 1 });
  }

  const regexForEdad = /^[1-9]\d{0,2}$/;
  if (typeof row.Edad !== "number" || !regexForEdad.test(row.Edad)) {
    errors.push({ row: rowCounter, column: 2 });
  }

  //const regexForNums = /^\d+(,\d+)*$/; OFICIAL
  const regexForNums = /^\d+$/;
  if (!regexForNums.test(row.Nums)) {
    errors.push({ row: rowCounter, column: 3 });
  }

  return { errors };
};

module.exports = { rowErrorsValidator };
