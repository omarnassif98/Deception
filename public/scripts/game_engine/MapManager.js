//This script is responsible for:
// a) fetching and loading the map svg
// b) fetching and applying the map metadata
// c) handling viewBox related user input

let province_objects = {};
var map_metadata = null;
let user_settings = {'scroll_sensitivity' : 0.01};
let graphics = {'tank' : null, 'star' : null};
let graphic_holder = {'tank' : {}, 'star' : {}};
let province_object_metadata = {'enabled':[], 'disabled':[]}
function setup_game(){
    loadMap().then().then(loadMetadata).then(loadExtraGraphics).then(() => document.dispatchEvent(new CustomEvent('map_setup_complete')));
}

//This function loads in the map svg
//  It also sets up the event listeners needed for user interaction
function loadMap(){
    let map_wrapper = document.getElementById('game_area');
    return new Promise((resolve) => {
        get_text_resource('/graphics/europa.svg').then(raw_svg => {
            let parser = new DOMParser();
            let map_dom = parser.parseFromString(raw_svg, 'image/svg+xml');
            let content = map_dom.getElementById('gameMap');
            console.log('release curtain');
            releaseCurtain('game_curtain');
            map_wrapper.appendChild(content);
            
            
            
            let initial_viewBox = content.getAttribute('viewBox').split(' ');
            let view_settings = {'x' : 0, 'y' : 0, 'max_x' : parseInt(initial_viewBox[2]), 'max_y' : parseInt(initial_viewBox[3]), 'zoom_level' : 0.5};
            //The following sub-function ensures that a viewBox of the same aspect ratio as the rendered object is used 
            let calculateProjections = () => {
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
            
            let calculateMaxZoom = () => {

                let projection_factors = {'x' : (map_wrapper.clientWidth**2)/(map_wrapper.clientWidth*view_settings.max_x), 'y' : (map_wrapper.clientHeight**2)/(map_wrapper.clientHeight*view_settings.max_y)};
                let correct_factor = (projection_factors.x > projection_factors.y)?projection_factors.x:projection_factors.y;
                view_settings.zoom_max = 1/correct_factor;
            };
            
            calculateProjections();
            calculateMaxZoom();
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
                        view_settings.x = clamp(view_settings.x + (mouse_settings.last_tracked_mouse_pos.x - event_data.offsetX), 0, view_settings.max_x - view_settings.width);
                        view_settings.y = clamp(view_settings.y + (mouse_settings.last_tracked_mouse_pos.y - event_data.offsetY), 0, view_settings.max_y - view_settings.height);
                        content.setAttribute('viewBox', `${view_settings.x} ${view_settings.y} ${view_settings.width} ${view_settings.height}`);
                        mouse_settings.last_tracked_mouse_pos.x = event_data.offsetX;
                        mouse_settings.last_tracked_mouse_pos.y = event_data.offsetY;
                    }
                }});
                
                //triggered at the end of the panning process
                let resetPan = () => {
                    mouse_settings.mouse_down = false;
                    mouse_settings.user_is_panning = false;
                }
                
                content.addEventListener('mouseup', resetPan);
                content.addEventListener('mouseleave', resetPan);
                window.addEventListener('resize', () => {
                    calculateProjections()
                    calculateMaxZoom()
                });
                
                //zoom is modified by scrolling, clamped between 100% and 15%
                content.addEventListener('wheel', (event_data) => {
                    view_settings.zoom_level = clamp(view_settings.zoom_level + event_data.deltaY * user_settings.scroll_sensitivity, 0.15, view_settings.zoom_max)
                    calculateProjections();
                });
                
                //Path objects in svg are serialized
                content.querySelectorAll('path').forEach(province_object => {
                    province_objects[province_object.id] = province_object;
                    
                    province_object.addEventListener('mouseup', () => {
                        if(!mouse_settings.user_is_panning && (province_object_metadata.enabled.includes(province_object.id) || province_object_metadata.debug)){
                            document.dispatchEvent(new CustomEvent('province_select', {'detail':province_object.id}));                        }
                    });
                    
                });
            console.log('STEP 1');
            resolve();
        })
    });
}


function loadMetadata(){
    return new Promise((resolve) => {
        get_text_resource('/game_files/europa.json').then(data => {
            map_metadata = JSON.parse(data);
            console.log(map_metadata);
            Object.keys(map_metadata.province_info).forEach(province_id => {
                if (map_metadata.province_info[province_id].owner != 'N/A'){
                    province_objects[province_id].style.fill = map_metadata.nation_info[map_metadata.province_info[province_id].owner].color;
                    province_objects[province_id].style.stroke = map_metadata.nation_info[map_metadata.province_info[province_id].owner].stroke_color;
                }
            })
            for(nation_id in map_metadata.nation_info){
                map_metadata.nation_info[nation_id].troops_deployed.forEach(province_id => {
                    //It may be smarter to do this later
                    // Firstly, because the graphic for troops aren't even loaded yet
                    // Secondly, because there's no guarantee that the game is on turn 1

                })
            }
            console.log('STEP 2');
            resolve();
        });
    });
}

function loadExtraGraphics(){
    let map_object = document.getElementById('gameMap');
    let star_graphic_holder = document.createElementNS("http://www.w3.org/2000/svg","g");
    star_graphic_holder.id = 'star_token_holder';
    map_object.append(star_graphic_holder);
    return new Promise((resolve) => {
        console.log(map_metadata);
        get_text_resource('/graphics/star.svg').then(raw_svg => {
            let parser = new DOMParser();
            let map_dom = parser.parseFromString(raw_svg, 'image/svg+xml');
            graphics.star = map_dom.getElementById('star');
            map_metadata.key_provinces.forEach(province_id => {
                try{
                    let star_object = graphics.star.cloneNode(deep=true);
                    star_object.setAttribute('x', map_metadata.province_info[province_id].token_location.x);
                    star_object.setAttribute('y', map_metadata.province_info[province_id].token_location.y);
                    star_graphic_holder.append(star_object);
                    graphic_holder.star[province_id] = star_object;
                }catch{
                    console.log(`${province_id} is not really a province`);
                }
            })
            console.log('STEP 3');
            resolve();
        });
    });
}

function removeProvinceState(province_id, state, update_list = true){
    console.log(`${province_id} is no longer ${state}`);
    let province_to_disable = province_objects[province_id];
    province_to_disable.classList.remove(state + '_province');
    if(update_list){
        console.log(province_id + ' list has been removed from ' + state + ' list');
        province_object_metadata[state] = province_object_metadata[state].filter(state_province_id => state_province_id != province_id);
    }
}

function emptyProvinceStateList(state){
    province_object_metadata[state].forEach(province_id => removeProvinceState(province_id, state,false));
    province_object_metadata[state] = [];
}

function changeProvinceState(province_id, state){
    province_objects[province_id].classList.add(state + '_province');
    province_object_metadata[state].push(province_id);
}

function changeMultipleProvinceStates(province_list, state){
    emptyProvinceStateList(state);
    province_list.forEach(province_id => changeProvinceState(province_id, state));
}

function focusProvince(province_id){
    let non_disabled = [...map_metadata.province_info[province_id].neighbors];
    changeMultipleProvinceStates(non_disabled, 'enabled');
    non_disabled.push(province_id);
    changeMultipleProvinceStates(Array.from(Object.keys(map_metadata.province_info)).filter(other_province_id => !non_disabled.includes(other_province_id)), 'disabled');
}




function updateProvinceRender(province_id){
    let relevant_province_info = map_metadata.province_info[province_id];
    console.log(relevant_province_info);
    province_objects[province_id].style.fill = (relevant_province_info.owner == 'N/A')?null:map_metadata.nation_info[relevant_province_info.owner].color;
    province_objects[province_id].style.stroke = (relevant_province_info.owner == 'N/A')?null:map_metadata.nation_info[relevant_province_info.owner].stroke_color
    
    if(!graphic_holder.star[province_id] && map_metadata.key_provinces.includes(province_id)){
        createAdditionalStar(province_id);
    }else if(graphic_holder.star[province_id] && !map_metadata.key_provinces.includes(province_id)){
        deleteStar(province_id);
    }else if(graphic_holder.star[province_id]){
        graphic_holder.star[province_id].setAttribute('x', relevant_province_info.token_location.x);
        graphic_holder.star[province_id].setAttribute('y', relevant_province_info.token_location.y);
    }
}

window.addEventListener('load', setup_game);