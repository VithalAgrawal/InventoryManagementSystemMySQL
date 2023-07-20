// Get the table
var table = document.getElementById("reportTable");

// Get all the table rows except the header
var rows = table.getElementsByTagName("tr");
for (var i = 1; i < rows.length; i++) {
    var valueCell = rows[i].getElementsByTagName("td")[5]; // Assuming the value is in the second cell (index 1)

    // Get the value from the cell
    var value = parseInt(valueCell.innerHTML);

    // Apply conditional classes based on the value
    if (value <= 0) {
        rows[i].classList.add("red");
    } else if (value <= 5) {
        rows[i].classList.add("yellow");
    } else {
        rows[i].classList.add("green");
    }
}
