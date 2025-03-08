// Function to parse Excel file to JSON using xlsx library
const excelToJson = async (file) => {
  try {
    const XLSX = require("xlsx");

    // Read the Excel file
    const workbook = XLSX.readFile(file);

    // Get the first worksheet
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Convert worksheet to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      raw: false, // Convert all cells to strings
      dateNF: "yyyy-mm-dd", // Format dates
      defval: "", // Default value for empty cells
      header: 1, // Use first row as headers
    });

    // Get headers from first row
    const headers = jsonData[0];

    // Map remaining rows to objects using headers
    const result = jsonData.slice(1).map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    return result;
  } catch (error) {
    throw new Error(`Error parsing Excel file: ${error.message}`);
  }
};

module.exports = excelToJson;
