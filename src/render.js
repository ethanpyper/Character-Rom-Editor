const prev_button = document.getElementById("prevButton");
const next_button = document.getElementById("nextButton");

const current_char_dom = document.getElementById("current_char");

const preview_img = document.getElementById("preview_img");

const { remote } = require('electron');

const { dialog } = remote;

const fs = require("fs");

var character_arr = [];
var current_char_val = 0;

var width = 16,
    height = 16,
    buffer = new Uint8ClampedArray(width * height * 4); // have enough bytes

// create off-screen canvas element
var canvas = document.createElement('canvas'),
ctx = canvas.getContext('2d');

canvas.width = width;
canvas.height = height;

// create imageData object
var idata = ctx.createImageData(width, height);

var copied_char = [];

window.onload = function init_program() { 
  for (i = 0; i < 256; i++) {
    character_arr.push(new Array(256).fill(0));
  }
  console.log(character_arr.length);

  createDrawArea();
} 

function createDrawArea() { 
    var table = document.getElementById("button_table")

    //Create table header
    var table_head = '<thead><tr><th></th>'
    //ADD TABLE HEADERS IN FOR LOOP HERE
    for (i = 0; i<width; i++){
        var temp = "<th>" + i.toString() + "</th>"
        table_head = table_head.concat(temp)
    }

    table_head = table_head.concat("</thead></tr>")

    table.insertAdjacentHTML('beforeend',table_head)

    var table_rows = "<tbody>"
    // Create Table body
    var total_count= 0;
    for (i = 0; i<width; i++){
        var temp_row_header = "<th>" + i.toString() + "</th>"
        table_rows = table_rows.concat("<tr>" + temp_row_header)

        var start_row_content ='<td><button class="button"'
        var temp_row_content = ""
        for (j = 0; j<height; j++){
            temp_row_content = temp_row_content.concat(start_row_content)
            var temp_id = 'id="' + total_count.toString() + '"'
            temp_row_content = temp_row_content.concat(temp_id + ' onmouseover="toggleBit(this.id, event)"></button></td>')
            total_count++;
        }
        table_rows = table_rows.concat(temp_row_content)
        table_rows = table_rows.concat("</tr>")
    }

    table.insertAdjacentHTML('beforeend', table_rows)

  } 

current_char_dom.addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        if(current_char_dom.value< 0){
            current_char_dom.value = 0
        } else if(current_char_dom.value>255){
            current_char_dom.value = 255
        }
        current_char_val = current_char_dom.value;
        draw_char(current_char_val);
    }
  });

function toggleBit(id, e){
    var button = document.getElementById(id);
    var curr_char = character_arr[current_char_val];
    var butt_val = parseInt(id, 10);
    console.log(e)
    if(e.buttons == 1){
        if(button.className == "button is-dark"){
            button.className = "button";
            curr_char[butt_val] = 0;
        }
        else{
            button.className = "button is-dark";
            curr_char[butt_val] = 1;
        }
    }
    draw_preview();
}

function next_char(){
    if(current_char_val<255){
        current_char_val++;
        current_char_dom.value = current_char_val
        draw_char(current_char_val);
    }
}

function prev_char(){
    if(current_char_val>0){
        current_char_val--;
        current_char_dom.value = current_char_val
        draw_char(current_char_val);
    }
}

function clear_char(){
    var curr_char = character_arr[current_char_val];
    curr_char.fill(0);
    draw_char(current_char_val);
}

function draw_char(char_pos){
    var temp_char = character_arr[char_pos]
    for(i = 0; i<256; i++){
        var button = document.getElementById(i);
        if(temp_char[i] == 1){
            button.className = "button is-dark"
        }else{
            button.className = "button";
        }
    }
    draw_preview();
}

function draw_preview(){
    var curr_char = character_arr[current_char_val];
    for(var y = 0; y < height; y++) {
        for(var x = 0; x < width; x++) {
            var pos = (y * width + x) * 4; // position in buffer based on x and y
            var char_array_pos = (y * width + x)
            if(curr_char[char_array_pos] == 1){
                buffer[pos  ] = 0;           // some R value [0, 255]
                buffer[pos+1] = 0;           // some G value
                buffer[pos+2] = 0;           // some B value
                buffer[pos+3] = 255;           // set alpha channel
            } else{
                buffer[pos  ] = 255;           // some R value [0, 255]
                buffer[pos+1] = 255;           // some G value
                buffer[pos+2] = 255;           // some B value
                buffer[pos+3] = 255;           // set alpha channel
            }
        }
    }

    // set our buffer as source
    idata.data.set(buffer);

    // update canvas with new data
    ctx.putImageData(idata, 0, 0);

    var dataUri = canvas.toDataURL(); // produces a PNG file

    preview_img.src = dataUri;
}

async function save_char_file(){
    const {filePath}  = await dialog.showSaveDialog({
        buttonLabel: 'Save',
        defaultPath: `${Date.now()}.char`
        });

        var temp_arr = []

        for(i=0; i<256; i++){
            for(j=0; j<256; j++){
                temp_arr.push(character_arr[i][j])
            }
        }

        const buffer = Buffer.from(temp_arr)
        console.log(buffer)

        if (filePath) {
        fs.writeFile(filePath, buffer, () => console.log('File saved successfully!'));
        }    
}

async function load_char_file(){
    const {filePaths}  = await dialog.showOpenDialog({
        buttonLabel: 'Load',
        properties: ['openFile']
        });
        console.log(filePaths[0]);

    if (filePaths[0]) {
        var tmp_data;
        fs.readFile(filePaths[0], function (err, data) {
        if (err) {
            return console.error(err);
        }
        
        console.log(data[0]);
    
        for(i=0; i<256; i++){
            for(j=0; j<256; j++){
                var x = (i*256)+j
                character_arr[i][j] = data[x];
            }
        }
        console.log(character_arr)
        draw_char(current_char_val);
        });
    }      

}

async function export_char_file(){
    const {filePath}  = await dialog.showSaveDialog({
        buttonLabel: 'Export',
        });

        var temp_arr = []

        for(i=0; i<256; i++){
            for(j=0; j<256; j++){
                if((j+1)%16 === 0){
                    temp_arr.push(character_arr[i][j]+" ")
                }
                else{
                    temp_arr.push(character_arr[i][j])
                }
            }
        }

        const mem = temp_arr.join("");
        console.log(mem)

        console.log(mem)

        if (filePath) {
            fs.writeFile((filePath+".mem"), mem, () => console.log('File exported successfully!'));
        }
}

function copy_char(){
    copied_char = Array.from(character_arr[current_char_dom.value]);
}

function paste_char(){
    character_arr[current_char_dom.value] = Array.from(copied_char);
    draw_char(current_char_val);
}