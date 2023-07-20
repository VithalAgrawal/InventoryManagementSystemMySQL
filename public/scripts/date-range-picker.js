
document.addEventListener('DOMContentLoaded', function () {
    // Get the date range picker element
    var dateRangePicker = document.getElementById('transactionDateRange');
    var itemCode = dateRangePicker.dataset.itemcode;

    flatpickr(dateRangePicker, {
        mode: 'range',
        dateFormat: 'Y-m-d',
        onClose: function (selectedDates, dateStr, instance) {
            const startdate = new Date(+selectedDates[0]);
            const offset = startdate.getTimezoneOffset();
            if (offset < 0) {
                startdate.setHours(12, 0, 0);
            }
            var startDate =  startdate.toISOString().substring(0, 10);
            startDate = startDate.split('T')[0];

            const enddate = new Date(+selectedDates[1]);
            const offset2 = enddate.getTimezoneOffset();
            if (offset2 < 0) {
                enddate.setHours(12, 0, 0);
            }
            var endDate =  enddate.toISOString().substring(0, 10);
            endDate = endDate.split('T')[0];

            // Send GET request to backend with start and end dates
            fetch(`/transaction/${itemCode}/${startDate}/${endDate}`, {
                method: 'GET',
            }).then(response => {
                if (response.ok) {
                    window.location.assign(`/transaction/${itemCode}/${startDate}/${endDate}`);
                    return;
                }
                else {
                    alert('Could not get data for the item at this moment!');
                }
            }).catch(error => {
                console.log(error);
                alert('Could not send request--try again later!');
            });
        }
    });
});