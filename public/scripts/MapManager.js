//This script is responsible for:
// a) fetching and loading the map svg
// b) fetching and applying the map metadata
// c) handling viewBox related user input

let province_objects = {};
var map_metadata = null;
const gcd = function(a, b){
    if(!b){
        return a;
    }
    return gcd(b, a % b);
}

function setup_game(){
    load_map().then(apply_metadata);
}

function load_map(){
    let map_wrapper = document.getElementById('game_area');
    return new Promise((resolve) => {
        get_text_resource('/graphics/europa.svg').then(raw_svg => {
            let parser = new DOMParser();
            let map_dom = parser.parseFromString(raw_svg, 'image/svg+xml');
            let content = map_dom.getElementById('gameMap');
            content.setAttribute('width', '100%');
            content.setAttribute('height', '100%');
            content.setAttribute('preserveAspectRatio', 'none');
            content.setAttribute('viewBox', `0 0 ${map_wrapper.clientWidth} ${map_wrapper.clientHeight}`);
            
            map_wrapper.appendChild(content);
            
            content.querySelectorAll('path').forEach(province_object => {
                province_objects[province_object.id] = province_object;
            })
            
            window.addEventListener('resize', function(){
                content.setAttribute('viewBox', `0 0 ${map_wrapper.clientWidth} ${map_wrapper.clientHeight}`);
            });
            
            console.log('STEP 1');
            resolve();
        })
    });
}

function apply_metadata(){
    console.log('STEP 2');
    return new Promise((resolve) => {
        get_text_resource('/game_files/europa.json').then(data => {
            map_metadata = JSON.parse(data);
            console.log(map_metadata);
            for(nation_id in map_metadata.nation_info){
                console.log(`Now coloring ${nation_id}`);
                map_metadata.nation_info[nation_id].provinces.forEach(province_id => {
                    console.log(`${province_id} is ${map_metadata.nation_info[nation_id].color}`);
                    province_objects[province_id].style.fill = map_metadata.nation_info[nation_id].color;
                })
            }
            resolve();
        });
    });
}

window.addEventListener('load', setup_game)