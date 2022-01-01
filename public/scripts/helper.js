function get_text_resource(url){
    return new Promise((resolve) => {
        fetch(url).then(res => res.text().then(txt => resolve(txt)))
    })
}