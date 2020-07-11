const prev_button = document.getElementById("prevButton");
const next_button = document.getElementById("nextButton");

const current_char_dom = document.getElementById("current_char");

const preview_img = document.getElementById("preview_img");

const { remote } = require('electron');

const { dialog } = remote;

const fs = require("fs");

var character_arr = [];
var current_char_val = 0;

var width = 8,
    height = 8,
    buffer = new Uint8ClampedArray(width * height * 4); // have enough bytes

// create off-screen canvas element
var canvas = document.createElement('canvas'),
ctx = canvas.getContext('2d');

canvas.width = width;
canvas.height = height;

// create imageData object
var idata = ctx.createImageData(width, height);



window.onload = function populate_character_arr() { 
  for (i = 0; i < 256; i++) {
    character_arr.push(new Array(64).fill(0));
  }
  console.log(character_arr.length);
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

function toggleBit(id){
    var button = document.getElementById(id);
    var curr_char = character_arr[current_char_val];
    var butt_val = parseInt(id, 10);
    if(button.className == "button is-dark"){
        button.className = "button";
        curr_char[butt_val] = 0;
    }
    else{
        button.className = "button is-dark";
        curr_char[butt_val] = 1;
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
    for(i = 0; i<64; i++){
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
            for(j=0; j<64; j++){
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
            for(j=0; j<64; j++){
                var x = (i*64)+j
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
            for(j=0; j<64; j++){
                temp_arr.push(character_arr[i][j])
            }
        }

        const string = temp_arr.join("");
        console.log(string)

        mem_1 = string.slice(0,4096)
        mem_2 = string.slice(4096,8192)
        mem_3 = string.slice(8192,12288)
        mem_4 = string.slice(12288,16384)

        console.log(mem_1)

        if (filePath) {
            fs.writeFile((filePath+"_1.mem"), mem_1, () => console.log('File exported successfully!'));
        }
        if (filePath) {
            fs.writeFile((filePath+"_2.mem"), mem_2, () => console.log('File exported successfully!'));
        }
        if (filePath) {
            fs.writeFile((filePath+"_3.mem"), mem_3, () => console.log('File exported successfully!'));
        }
        if (filePath) {
            fs.writeFile((filePath+"_4.mem"), mem_4, () => console.log('File exported successfully!'));
        }
}