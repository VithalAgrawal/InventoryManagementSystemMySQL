
const exportButton = document.getElementById('exportButton');

function html_table_to_excel(type) {
   var data = document.querySelectorAll('.reportTable');
   let worksheet_tmp1 = XLSX.utils.table_to_sheet(data[0]);
   let worksheet_tmp2 = XLSX.utils.table_to_sheet(data[1]);
   let a = XLSX.utils.sheet_to_json(worksheet_tmp1, { header: 1 })
   let b = XLSX.utils.sheet_to_json(worksheet_tmp2, { header: 1 })
   a = a.concat(['']).concat(b)

   let worksheet = XLSX.utils.json_to_sheet(a, { skipHeader: true })

   const new_workbook = XLSX.utils.book_new()
   XLSX.utils.book_append_sheet(new_workbook, worksheet, "worksheet")
   XLSX.writeFile(new_workbook, ('file.xlsx'))
}

// Add a click event listener to the export button
exportButton.addEventListener('click', function () {
   html_table_to_excel('xlsx');
});
