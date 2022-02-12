function createAdditionalStar(province_id){
    console.log(`creating star for ${province_id}`);
    let star_object = graphics.star.cloneNode(deep=true);
    star_object.setAttribute('x', map_metadata.province_info[province_id].token_location.x);
    star_object.setAttribute('y', map_metadata.province_info[province_id].token_location.y);
    document.getElementById('star_token_holder').append(star_object);
    graphic_holder.star[province_id] = star_object;
}

function deleteStar(province_id){
    graphic_holder.star[province_id].remove();
    delete graphic_holder.star[province_id];
}



function updateProvinceMetadata(province_id, new_data, change_in_province_status = false){
    map_metadata.province_info[province_id] = {...map_metadata.province_info[province_id], ...new_data};
    if(change_in_province_status){
        if(document.getElementById('province_is_key').checked){
            map_metadata.key_provinces.push(province_id);
        }else{
            map_metadata.key_provinces = map_metadata.key_provinces.filter(key_province_id => key_province_id != province_id);
        }
    }
}

document.addEventListener('map_setup_complete', () => {
    console.log('STEP 4');
    province_object_metadata.debug = true;
    let owner_selector = document.getElementById('province_owner');
    Object.keys(map_metadata.nation_info).forEach(nation_id => {
        let value_object = document.createElement('option');
        value_object.value=nation_id;
        value_object.innerHTML=map_metadata.nation_info[nation_id].full_name;
        owner_selector.appendChild(value_object);
    });
    changeMultipleProvinceStates(Object.keys(province_objects), 'enabled');
    var selected_province_id = null;
    let province_editor = document.getElementById('province_editor_controls');
    
    function addNeighborListing(neighbor_province_id){
        let neighbor_object = document.createElement('li');
        neighbor_object.setAttribute('prov_id', neighbor_province_id);
        neighbor_object.innerHTML = map_metadata.province_info[neighbor_province_id].full_name;
        province_editor.querySelector('#province_neighbors_list').appendChild(neighbor_object);
    }

    function removeNeighborListing(neighbor_province_id){
        Array.from(province_editor.querySelector('#province_neighbors_list').children).forEach(neighbor_object => {
            if(neighbor_object.getAttribute('prov_id') == neighbor_province_id){
                neighbor_object.remove();
            }
        })
    }
    
    function populateProvinceEditor(event_province_id){
        selected_province_id = event_province_id;
        province_editor.querySelector('#selected_province_id').innerHTML = selected_province_id;
        
        let relevant_province_info = null;
    
        province_editor.querySelector('#province_full_name').value = '';
        province_editor.querySelector('#province_owner').value = 'N/A';
        province_editor.querySelector('#province_is_key').checked = false;
        province_editor.querySelector('#province_troops').value = 'N/A';
        province_editor.querySelector('#cop_x').value = '';
        province_editor.querySelector('#cop_y').value = '';
        while(province_editor.querySelector('#province_neighbors_list').children.length > 0){
            province_editor.querySelector('#province_neighbors_list').firstChild.remove()
        }
        
        try{        
            relevant_province_info = map_metadata.province_info[selected_province_id];
        }catch{
            alert('No metadata present for province, you should make some');
            return;
        }
        province_editor.querySelector('#province_full_name').disabled = false;
        province_editor.querySelector('#province_owner').disabled = (relevant_province_info.region_type == 'water');
        province_editor.querySelector('#province_is_key').disabled = (relevant_province_info.region_type == 'water');
        province_editor.querySelector('#province_troops').disabled = (relevant_province_info.region_type == 'water') || !((relevant_province_info.owner) && (map_metadata.key_provinces.includes(selected_province_id)));
        province_editor.querySelector('#cop_x').disabled = false;
        province_editor.querySelector('#cop_y').disabled = false;
        
        province_editor.querySelector('#province_full_name').value = relevant_province_info.full_name;
        province_editor.querySelector('#province_owner').value = relevant_province_info.owner;
        province_editor.querySelector('#province_is_key').checked = map_metadata.key_provinces.includes(selected_province_id);
        province_editor.querySelector('#province_troops').value = relevant_province_info.troop_presence;
        province_editor.querySelector('#cop_x').value = relevant_province_info.token_location.x;
        province_editor.querySelector('#cop_y').value = relevant_province_info.token_location.y;
    
        relevant_province_info.neighbors.forEach(neighbor_province_id => {
            addNeighborListing(neighbor_province_id);
        });        
    }
    
    var current_edit_mode = 'province_edit';
    var original_province_id = null;
    var paint_nation_id = 'N/A';
    let create_radio = (nation_id, custom_label = null) => {
        let wrapper_div = document.createElement('div');
        wrapper_div.classList.add('radio_input_wrapper');
        let nation_radio_button = document.createElement('input');
        nation_radio_button.setAttribute('type', 'radio');
        nation_radio_button.setAttribute('name', 'nation_radio');
        nation_radio_button.addEventListener('click', () => paint_nation_id = nation_id);
        let nation_radio_label = document.createElement('span');
        nation_radio_label.innerHTML = (custom_label)?custom_label:map_metadata.nation_info[nation_id].full_name;
        wrapper_div.appendChild(nation_radio_button);
        wrapper_div.appendChild(nation_radio_label);
        document.getElementById('add_muliple_provinces').appendChild(wrapper_div);
    }
    create_radio('N/A', 'Unclaimed');
    Object.keys(map_metadata.nation_info).forEach(nation_id => {create_radio(nation_id)});
    document.addEventListener('province_select', (event_data) => {
        switch(current_edit_mode){
            case 'province_edit':
                populateProvinceEditor(event_data.detail);
                break;
            case 'neighbor_edit':
                if(event_data.detail != original_province_id){
                    if (province_object_metadata.enabled.includes(event_data.detail)){
                        removeProvinceState(event_data.detail, 'enabled');
                        changeProvinceState(event_data.detail, 'disabled');
                        removeNeighborListing(event_data.detail);
                        map_metadata.province_info[original_province_id].neighbors = map_metadata.province_info[original_province_id].neighbors.filter(neighbor_id => neighbor_id != event_data.detail)
                    }else{
                        removeProvinceState(event_data.detail, 'disabled');
                        changeProvinceState(event_data.detail, 'enabled');
                        addNeighborListing(event_data.detail);
                        map_metadata.province_info[original_province_id].neighbors.push(event_data.detail);
                    }
                }else{
                    current_edit_mode = 'province_edit'
                    emptyProvinceStateList('disabled');
                    changeMultipleProvinceStates(Object.keys(province_objects), 'enabled');
                }
                break;
            case 'multiple_province_edit':
                updateProvinceMetadata(event_data.detail, {'owner' : paint_nation_id});
                updateProvinceRender(event_data.detail);
                break;
        }
    });
    

    province_editor.addEventListener('input_mode_change', (event) =>  {
        if(current_edit_mode == event.detail){
            emptyProvinceStateList('disabled');
            changeMultipleProvinceStates(Object.keys(province_objects), 'enabled');
            selected_province_id = original_province_id;
            current_edit_mode = 'province_edit';
            return;
        }
        switch(event.detail){
            case 'neighbor_edit':
                original_province_id = selected_province_id;
                focusProvince(selected_province_id);
                break;
            case 'multiple_province_edit':
                emptyProvinceStateList('disabled');
                break;
        }
        current_edit_mode = event.detail;
    });

    province_editor.addEventListener('save_province_edits', () => {
        let new_province_data = {
            'owner' : province_editor.querySelector('#province_owner').value,
            'full_name' : province_editor.querySelector('#province_full_name').value,
            'troop_presence' : (province_editor.querySelector('#province_troops').value != 'N/A')?province_editor.querySelector('#province_troops').value:null,
            'token_location' : {'x' : province_editor.querySelector('#cop_x').value, 'y' : province_editor.querySelector('#cop_y').value}
        };
        
        updateProvinceMetadata(selected_province_id, new_province_data, !(province_editor.querySelector('#province_is_key').checked && map_metadata.key_provinces.includes(selected_province_id)))
        updateProvinceRender(selected_province_id);
        document.dispatchEvent(new CustomEvent('province_select', {'detail':selected_province_id}));
    });

    let stronghold_visualizer = document.getElementById('key_visualize');
    stronghold_visualizer.disabled = false;
    stronghold_visualizer.addEventListener('click', () => {
        if(stronghold_visualizer.checked){
            Object.keys(province_objects).forEach(other_province_id => {
                if(!graphic_holder.star[other_province_id]){
                    createAdditionalStar(other_province_id);
                }
            });
        }else{
            Object.keys(graphic_holder.star).forEach(star_province_id => deleteStar(star_province_id));
            Object.keys(map_metadata.key_provinces).forEach(star_province_id => createAdditionalStar(star_province_id));
        }
    })
})



function modifyProvince(){
    document.getElementById('province_editor_controls').dispatchEvent(new CustomEvent('save_province_edits'));
}
