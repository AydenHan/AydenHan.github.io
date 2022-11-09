function getGenshinUID(data) {
    var uid = jQuery("#genshin-uid").val()
    if (uid == '') {
        uid = data
    }
    document.location.href="https://enka.network/u/" + uid
}