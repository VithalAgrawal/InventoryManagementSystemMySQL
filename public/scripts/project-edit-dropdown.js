const cp_no = document.querySelectorAll(".cpno");

async function reloadPage() {
    const cpNo = cpno.value;
    try {
        const uri = `${cpNo}`;
        const encodedUri = encodeURIComponent(uri);
        const response = await fetch(`/smallcapexprojectedit/${encodedUri}`, {
            method: 'GET',
        });
        if (response.ok) {
            window.location.assign(`/smallcapexprojectedit/${encodedUri}`);
            return;
        }
        else {
            alert('Could not get data for the project at this moment!');
        }
    } catch (error) {
        console.log(error);
        alert('Could not send request--try again later!');
    }
}


for (cpno of cp_no) {
    cpno.addEventListener('change', reloadPage);
}