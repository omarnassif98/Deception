function setCurtainMessage(curtain_id, message){
    document.querySelector(`#${curtain_id} > span`).innerHTML = message;
} 

function releaseCurtain(curtain_id){
    console.log('releasing curtain');
    let curtain = document.getElementById(curtain_id)
    curtain.style.display = 'none';
    if(curtain.hasAttribute('conent')){
        document.getElementById(curtain.getAttribute('content')).style.display = 'block';
    }
}