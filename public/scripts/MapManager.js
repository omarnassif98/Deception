//This script is responsible for:
// a) fetching and loading the map svg
// b) fetching and applying the map metadata
// c) handling viewBox related user input

let province_objects = {};
var map_metadata = null;
let user_settings = {'scroll_sensitivity' : 0.01};
var tank_graphic = null;
let tank_graphic_holder = null;
function setup_game(){
    load_map().then().then(apply_metadata).then(load_extra_graphics);
}

//This function loads in the map svg
//  It also sets up the event listeners needed for user interaction
function load_map(){
    let map_wrapper = document.getElementById('game_area');
    return new Promise((resolve) => {
        get_text_resource('/graphics/europa.svg').then(raw_svg => {
            let parser = new DOMParser();
            let map_dom = parser.parseFromString(raw_svg, 'image/svg+xml');
            let content = map_dom.getElementById('gameMap');
            map_wrapper.appendChild(content);
            
            //Path objects in svg are serialized
            content.querySelectorAll('path').forEach(province_object => {
                province_objects[province_object.id] = province_object;
            });
            
            let initial_viewBox = content.getAttribute('viewBox').split(' ');
            let view_settings = {'x' : 0, 'y' : 0, 'max_x' : parseInt(initial_viewBox[2]), 'max_y' : parseInt(initial_viewBox[3]), 'zoom_level' : 0.5};
            //The following sub-function ensures that a viewBox of the same aspect ratio as the rendered object is used 
            let calculate_projections = () => {
                //firstly, the projection factors of the DOM object's width and height on the graphic's width and height respectively are taken
                //if any of the factors are over a value of 1, that is an indicator that the DOM object's component is larger than that of the graphic 
                let projection_factors = {'x' : (map_wrapper.clientWidth**2)/(map_wrapper.clientWidth*view_settings.max_x), 'y' : (map_wrapper.clientHeight**2)/(map_wrapper.clientHeight*view_settings.max_y)};
                
                //the width and height are then divided by the bigger factor
                //if not, then the correct factor is subsituded with the value 1
                //the result is that the viewBox will never extend out of the bounds of the map
                let correct_factor = (projection_factors.x > 1 || projection_factors.y > 1)?((projection_factors.x>=projection_factors.y)?projection_factors.x:projection_factors.y):1;
                view_settings.width = map_wrapper.clientWidth/correct_factor * view_settings.zoom_level;
                view_settings.x = (view_settings.x + view_settings.width > view_settings.max_x)?view_settings.max_x-view_settings.width:view_settings.x;
                view_settings.height = map_wrapper.clientHeight/correct_factor * view_settings.zoom_level;
                view_settings.y = (view_settings.y + view_settings.height > view_settings.max_y)?view_settings.max_y-view_settings.height:view_settings.y;
                content.setAttribute('viewBox', `${view_settings.x} ${view_settings.y} ${view_settings.width} ${view_settings.height}`);
            }

            calculate_projections();
            
            
            let mouse_settings = {'mouse_down' : false, 'user_is_panning' : false, 'last_tracked_mouse_pos' : {'x' : null, 'y' : null}}

            //ensures that the value is between the minimum and maximum 
            let clamp = (val, min, max) => {
                return Math.min(Math.max(val,min),max);
            }

            //triggers at the start of the panning process
            content.addEventListener('mousedown', (event_data) => {
                mouse_settings.mouse_down = true;
                mouse_settings.last_tracked_mouse_pos.x = event_data.offsetX;
                mouse_settings.last_tracked_mouse_pos.y = event_data.offsetY;
            });

            //triggers when panning
            content.addEventListener('mousemove', (event_data) => {
            if(mouse_settings.mouse_down){
                if(!mouse_settings.user_is_panning && Math.sqrt((mouse_settings.last_tracked_mouse_pos.x - event_data.offsetX)**2 + (mouse_settings.last_tracked_mouse_pos.y - event_data.offsetY)**2) > 50){
                    mouse_settings.user_is_panning = true;
                    mouse_settings.last_tracked_mouse_pos.x = event_data.offsetX;
                    mouse_settings.last_tracked_mouse_pos.y = event_data.offsetY;
                }else if(mouse_settings.user_is_panning){
                    console.log(`Clamping:\n\tx between 0 and ${view_settings.max_x-view_settings.width}\n\ty between 0 and ${view_settings.max_y-view_settings.height}`);
                    view_settings.x = clamp(view_settings.x + (mouse_settings.last_tracked_mouse_pos.x - event_data.offsetX), 0, view_settings.max_x - view_settings.width);
                    view_settings.y = clamp(view_settings.y + (mouse_settings.last_tracked_mouse_pos.y - event_data.offsetY), 0, view_settings.max_y - view_settings.height);
                    content.setAttribute('viewBox', `${view_settings.x} ${view_settings.y} ${view_settings.width} ${view_settings.height}`);
                    mouse_settings.last_tracked_mouse_pos.x = event_data.offsetX;
                    mouse_settings.last_tracked_mouse_pos.y = event_data.offsetY;
                }
            }});

            //triggered at the end of the panning process
            let reset_pan = () => {
                mouse_settings.mouse_down = false;
                mouse_settings.user_is_panning = false;
            }

            content.addEventListener('mouseup', reset_pan);
            content.addEventListener('mouseleave', reset_pan);
            window.addEventListener('resize', calculate_projections);

            //zoom is modified by scrolling
            content.addEventListener('wheel', (event_data) => {
                console.log(event_data.deltaY);
                view_settings.zoom_level = clamp(view_settings.zoom_level + event_data.deltaY * user_settings.scroll_sensitivity, 0.15, 1)
                calculate_projections();
            });
            console.log('STEP 1');
            resolve();
        })
    });
}


function apply_metadata(){
    return new Promise((resolve) => {
        get_text_resource('/game_files/europa.json').then(data => {
            map_metadata = JSON.parse(data);
            console.log(map_metadata);
            for(nation_id in map_metadata.nation_info){
                map_metadata.nation_info[nation_id].provinces.forEach(province_id => {
                    province_objects[province_id].style.fill = map_metadata.nation_info[nation_id].color;
                })
                map_metadata.nation_info[nation_id].troops_deployed.forEach(province_id => {
                    console.log(`${province_id} has a troop in ${nation_id}`);
                })
            }
            console.log('STEP 2');
            resolve();
        });
    });
}

function load_extra_graphics(){
    let map_object = document.getElementById('gameMap');
    let star_graphic_holder = document.createElementNS("http://www.w3.org/2000/svg","g");
    map_object.append(star_graphic_holder);
    return new Promise((resolve) => {
        console.log(map_metadata);
        get_text_resource('/graphics/star.svg').then(raw_svg => {
            let parser = new DOMParser();
            let map_dom = parser.parseFromString(raw_svg, 'image/svg+xml');
            let content = map_dom.getElementById('star');
            map_metadata.key_provinces.forEach(province_id => {
                let star_object = content.cloneNode(deep=true);
                console.log(`${province_id}`)
                console.log(`${map_metadata.province_info[province_id].region_type} tile`);
                star_object.setAttribute('x', map_metadata.province_info[province_id].token_location.x);
                star_object.setAttribute('y', map_metadata.province_info[province_id].token_location.y);
                star_graphic_holder.append(star_object);
            })
            console.log('STEP 3');
            resolve();
        });
    });
}

window.addEventListener('load', setup_game)