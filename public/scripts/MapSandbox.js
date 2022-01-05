
document.addEventListener('map_setup_complete', () => {
    console.log('STEP 4');
    province_object_metadata.debug = true;
    Array.from(document.getElementsByTagName('select')).forEach(selection_object =>  {
        console.log('Select found');
        Object.keys(map_metadata.nation_info).forEach(nation_id => {
            let value_object = document.createElement('option');
            value_object.value=nation_id;
            value_object.innerHTML=map_metadata.nation_info[nation_id].full_name;
            selection_object.appendChild(value_object);
            console.log(`added value for ${nation_id}`); 
        });
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
        province_editor.querySelector('#province_owner').value = '';
        province_editor.querySelector('#province_is_key').checked = false;
        province_editor.querySelector('#province_troops').checked = false;
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
        province_editor.querySelector('#province_troops').disabled = (relevant_province_info.region_type == 'water') || !(relevant_province_info.owner);
        province_editor.querySelector('#cop_x').disabled = false;
        province_editor.querySelector('#cop_y').disabled = false;
        
        province_editor.querySelector('#province_full_name').value = relevant_province_info.full_name;
        province_editor.querySelector('#province_owner').value = (relevant_province_info.owner)?relevant_province_info.owner:'N/A';
        province_editor.querySelector('#province_is_key').checked = map_metadata.key_provinces.includes(selected_province_id);
        province_editor.querySelector('#province_troops').checked = (relevant_province_info.troop_presence);
        province_editor.querySelector('#cop_x').value = relevant_province_info.token_location.x;
        province_editor.querySelector('#cop_y').value = relevant_province_info.token_location.y;
    
        relevant_province_info.neighbors.forEach(neighbor_province_id => {
            addNeighborListing(neighbor_province_id);
        });        
    }
    
    var edit_mode = 'province_edit';
    var original_province_id = null;
    document.addEventListener('province_select', (event_data) => {
        switch(edit_mode){
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
                    edit_mode = 'province_edit'
                    emptyProvinceStateList('disabled');
                    changeMultipleProvinceStates(Object.keys(province_objects), 'enabled');
                }
                break;
        }
    });
    

    province_editor.addEventListener('edit_province_neighbors', () =>  {
        switch(edit_mode){
            case 'province_edit':
                edit_mode = 'neighbor_edit';
                original_province_id = selected_province_id
                focusProvince(selected_province_id);
                break;
            case 'neighbor_edit':
                edit_mode = 'province_edit'
                emptyProvinceStateList('disabled');
                changeMultipleProvinceStates(Object.keys(province_objects), 'enabled');
                break;
        }
    })
})

function editProvinceNeighbors(){
    document.getElementById('province_editor_controls').dispatchEvent(new CustomEvent('edit_province_neighbors'))
}


function exportMetadata(){

}