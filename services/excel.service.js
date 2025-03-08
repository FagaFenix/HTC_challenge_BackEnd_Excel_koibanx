const xlsx = require("xlsx");
const fs = require("fs");
const ExcelJS = require("exceljs");
const { Transform } = require("stream");

const parseExcel = async (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const jsonData = xlsx.utils.sheet_to_json(sheet);

      // Delete file after processing
      //   fs.unlink(filePath, (err) => {
      //     if (err) {
      //       console.error("Error al eliminar el archivo:", err);
      //       reject(err);
      //       return;
      //     }
      //     resolve(jsonData);
      //   });
      resolve(jsonData);
    } catch (error) {
      reject(error);
    }
  });
};
const parseExcelV2 = async (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const stream = xlsx.stream.to_json(sheet, { raw: false });

      const transformStream = new Transform({
        writableObjectMode: true, // Allows writing JS objects instead of buffers
        transform(row, encoding, callback) {
          // Process each row (modify as needed)
          row.Nums = row.Nums ? row.Nums.split("").map(Number) : [];
          row.Edad = parseInt(row.Edad);
          callback(null, JSON.stringify(row) + "\n"); // Pass formatted row to the next step
        },
      });

      stream.pipe(transformStream).pipe(process.stdout);

      // Delete file after processing
      //   fs.unlink(filePath, (err) => {
      //     if (err) {
      //       console.error("Error al eliminar el archivo:", err);
      //       reject(err);
      //       return;
      //     }
      //     console.log("Archivo eliminado correctamente");
      //     resolve(jsonData);
      //   });

      resolve(stream);
    } catch (error) {
      reject(error);
    }
  });
};

const createExcelStream = async (filePath) => {
  const writeStream = fs.createWriteStream(filePath);
  for (let i = 0; i < 1e8; i++) {
    const overWatermark = writeStream.write(`${i},1\n*`);
    if (overWatermark) {
      await new Promise((resolve) => writeStream.once("drain", resolve));
    }
  }
  writeStream.end();
};

const readBigExcelFiles = async (filePath) => {
  const readStream = fs.createReadStream(filePath);
  let sum = 0;
  let unprocessed = "";
  readStream.on("data", (chunk) => {
    // console.log({ chunk });
    let chunkString = unprocessed + chunk.toString();
    unprocessed = "";
    let startIndex = 0;
    for (let ch = startIndex; ch < chunkString.length; ch++) {
      if (chunkString[ch] === "\n") {
        const line = chunkString.slice(startIndex, ch);
        // console.log({ line });
        // const idx = line.indexOf(",");
        // console.log({ idx });
        // const cost = line.slice(idx + 1);
        // console.log({ cost });
        // sum += parseFloat(cost);
        sum++;
        startIndex = ch + 1;
      }
    }
    console.log({ chunkString });
    if (chunkString[chunkString.length - 1] !== "\n") {
      unprocessed = chunkString.slice(startIndex);
    }
  });
  readStream.on("end", () => {
    console.log(unprocessed);
  });
};

const processLargeExcelStreamV2 = async (filePath) => {
  const workbook = new ExcelJS.stream.xlsx.WorkbookReader(filePath);
  let sum = 0;
  let finalJson = [];
  console.log({ workbook });
  const _workbook = await workbook.read();
  console.log({ _workbook });
  for await (const worksheet of await workbook.read()) {
    console.log({ worksheet });
    for await (const row of worksheet) {
      console.log({ row });
      if (!row.hasValues) continue;

      const name = row.getCell(1).text;
      const age = row.getCell(2).value;
      const nums = row.getCell(3).text.split(",").map(Number);
      console.log({ name, age, nums });
      // Assuming the "nums" column contains comma-separated numbers, sum them
      const numsArray = nums.split(",").map(Number);
      sum++;
      finalJson.push({ name, age, nums: numsArray });
    }
  }
  //   console.log("Total sum:", sum);
  return finalJson;
};

const processLargeExcelStream = async (filePath, batchSize = 5000) => {
  const ExcelJS = require("exceljs");
  console.log("🚀 Streaming data row by row...");

  const workbook = new ExcelJS.stream.xlsx.WorkbookReader(filePath);
  await workbook.xlsx.readFile(filePath); // Load the file

  console.log({ workbook });
  const worksheet = workbook.worksheets; // Get first sheet
  console.log({ worksheet });
  let batch = [];
  let rowCount = 0;
  let batchNumber = 1;

  for (const row of worksheet.eachRow({ includeEmpty: false })) {
    const rowData = {
      name: row.getCell(1).value,
      age: row.getCell(2).value,
      nums: row.getCell(3).value,
    };

    console.log(rowData);
    batch.push(rowData);
    rowCount++;

    // Insert in batches
    if (batch.length >= batchSize) {
      console.log(
        `✅ Inserting batch ${batchNumber} (${batch.length} rows) into MongoDB...`
      );
      //   await ExcelModel.create({ batchNumber, data: batch });
      batch = [];
      batchNumber++;
    }
  }

  // Insert remaining rows
  if (batch.length > 0) {
    console.log(
      `✅ Inserting final batch (${batch.length} rows) into MongoDB...`
    );
    // await ExcelModel.create({ batchNumber, data: batch });
  }

  console.log(`✅ Done! Processed ${rowCount} rows.`);
};

function transformJsonData(jsonData, query) {
  console.log({ jsonData });
  let transformedJsonData = [...jsonData];
  try {
    setTimeout(() => {
      transformedJsonData = transformedJsonData.map(
        ({ Nombre, Edad, Nums }) => {
          let transformedData = { Nombre, Edad };

          if (Nums !== undefined && query.nums) {
            transformedData.Nums = Nums.toString().split("").map(Number);
          }
          return transformedData;
        }
      );
    }, 50000);
  } catch (error) {}
  return transformedJsonData;
}

module.exports = {
  parseExcel,
  transformJsonData,
  processLargeExcelStream,
  readBigExcelFiles,
  createExcelStream,
  processLargeExcelStreamV2,
  parseExcelV2,
};
