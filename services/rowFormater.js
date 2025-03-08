const rowErrorsValidator = async (row, rowCounter, query) => {
  if (typeof row.Name !== "string") {
    errors.push({ row: rowCounter, column: 1 });
  }

  const regexForEdad = /^[1-9]\d{0,2}$/;
  if (typeof row.Edad === "number" || regexForEdad.test(row.Edad)) {
    row.Edad = parseInt(row.Edad);
  }

  //   const regexForNums = /^\d+(,\d+)*$/; OFICIAL
  const regexForNums = /^\d+$/;
  if (!regexForNums.test(row.Nums)) {
    errors.push({ row: rowCounter, column: 3 });
  } else {
    // row.Nums = row.Nums.split(",").map(Number); OFICIAL
    row.Nums = row.Nums.split("").map(Number);
  }

  return { row };
};

module.exports = rowErrorsValidator;
