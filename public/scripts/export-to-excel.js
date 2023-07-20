// var XLSX = require('xlsx');

const exportButton = document.getElementById('exportButton');

function html_table_to_excel(type) {
    var data = document.getElementById('reportTable');
    var file = XLSX.utils.table_to_book(data, { sheet: "Sheet JS" });
    XLSX.write(file, { bookType: type, bookSST: true, type: 'base64' });
    XLSX.writeFile(file, 'report_file.' + (type || 'xlsx'));
}

// Add a click event listener to the export button
exportButton.addEventListener('click', function () {
    html_table_to_excel('xlsx');
});
