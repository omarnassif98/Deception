document.addEventListener('map_setup_complete', () => {
    console.log('STEP 4');
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
    enableProvinces(Object.keys(province_objects));
    document.addEventListener('province_select', (event_data) => {
        let province_editor = document.getElementById('province_editor_controls');
        province_editor.querySelector('#selected_province_id').innerHTML = event_data.detail;
        let relevant_province_info = map_metadata.province_info[event_data.detail];

        province_editor.querySelector('#province_full_name').disabled = false;
        province_editor.querySelector('#province_owner').disabled = (relevant_province_info.region_type == 'water');
        province_editor.querySelector('#province_is_key').disabled = (relevant_province_info.region_type == 'water');
        province_editor.querySelector('#province_troops').disabled = (relevant_province_info.region_type == 'water') || !(relevant_province_info.owner);
        province_editor.querySelector('#cop_x').disabled = false;
        province_editor.querySelector('#cop_y').disabled = false;
        
        province_editor.querySelector('#province_full_name').value = relevant_province_info.full_name;
        province_editor.querySelector('#province_owner').value = (relevant_province_info.owner)?relevant_province_info.owner:'N/A';
        province_editor.querySelector('#province_is_key').checked = map_metadata.key_provinces.includes(event_data.detail);
        province_editor.querySelector('#province_troops').checked = (relevant_province_info.troop_presence);
        province_editor.querySelector('#cop_x').value = relevant_province_info.token_location.x;
        province_editor.querySelector('#cop_y').value = relevant_province_info.token_location.y;
    })
})
