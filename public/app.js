function noFile() {
    if (document.getElementById("imageUpload").value == "") {
        document.getElementById("error-message").textContent = "No file selected!";
        return false;
    }

    document.getElementById("error-message").textContent = "";
    return true
}