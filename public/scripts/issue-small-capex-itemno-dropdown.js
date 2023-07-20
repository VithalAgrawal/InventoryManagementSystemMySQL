
const item_code = document.querySelectorAll(".code");

async function reloadPage() {
    const itemCode = itemcode.value;
    try {
        const response = await fetch(`/smallcapexissue/${itemCode}`, {
            method: 'GET',
        });
        if (response.ok) {
            window.location.assign(`/smallcapexissue/${itemCode}`);
            return;
        }
        else {
            alert('Could not get data for the item at this moment!');
        }
    } catch (error) {
        console.log(error);
        alert('Could not send request--try again later!');
    }
}


for (itemcode of item_code) {
    itemcode.addEventListener('change', reloadPage);
}
