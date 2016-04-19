/* create size function */
Object.size = function (obj) {
  var size = 0, key;

  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }

  return size;
};

/* bash escape color codes */
var bash_colors = {
  NC: '\\e[0m',
  Black: '\\e[0;30m',
  Red: '\\e[0;31m',
  Green: '\\e[0;32m',
  Yellow: '\\e[0;33m',
  Blue: '\\e[0;34m',
  Purple: '\\e[0;35m',
  Cyan: '\\e[0;36m',
  White: '\\e[0;37m',
  BBlack: '\\e[1;30m',
  BRed: '\\e[1;31m',
  BGreen: '\\e[1;32m',
  BYellow: '\\e[1;33m',
  BBlue: '\\e[1;34m',
  BPurple: '\\e[1;35m',
  BCyan: '\\e[1;36m',
  BWhite: '\\e[1;37m'
};

/* color scheme */
var tango = {
  NC: '#eee',
  Black: '#283235',
  Red: '#cc0000',
  Green: '#4d9806',
  Yellow: '#b58711',
  Blue: '#3464a3',
  Purple: '#734d72',
  Cyan: '#06989a',
  White: '#d3d7cf',
  BBlack: '#555753',
  BRed: '#ef2929',
  BGreen: '#8ae234',
  BYellow: '#fce94f',
  BBlue: '#729fcf',
  BPurple: '#ad7fa8',
  BCyan: '#34e2e2',
  BWhite: '#eeeeee'
};

// groups { var name, var colorscheme, segments { name, code, output, color }, method output_zcolors, method output_bash }

// A section of stylized input and output
function segment(name, code, output, color) {
  this.name = name;     // name of segment
  this.code = code;     // terminal input
  this.output = output; // terminal output
  this.color = color;   // color alias for output
}

// A group of segments
function group(name, colorscheme, segments) {
  this.name = name;                     // name of segment
  this.segments = segments;             // terminal output
  this.colorscheme = colorscheme;       // color scheme for output
  this.output_zcolors = output_zcolors;  // stitch together ouputs
  this.output_bash = output_bash;        // stitch together ouputs
}

function output_zcolors() {
  var r = "";
  for (var name in this.segments) {
    r += '\\[${' + segments[name].color + '\\]}' + segments[name].code;
  }
  return r;
}

function output_bash() {
  var r = "";
  for (var name in this.segments) {
    r += '\\[' + bash_colors[segments[name].color] + '\\]' + segments[name].code;
  }
  return r;
}

// build the color selector and actions of it
function init_colorizer(segment) {
  $("#color-selectors").append('<li><a href="' + tango.NC + '" id="' + segment.name + '-first">' + segment.output + '</a>\n<ul id="' + segment.name + '-colorz" class="segment"></ul></li>');
  // build select boxes
  for (var name in tango) {
    $('#' + segment.name + '-colorz').append('<li><a href="' + tango[name] + '" class="' + name + '" title="' + name + '">' + segment.output + '</a></li>');
    $('#' + segment.name + '-colorz li:last-child a').css("color", tango[name]);
  }
  // set change action
  $('#' + segment.name + '-colorz a').click(function () {
    $('#' + segment.name + '-colorz a').removeClass("selected");
    $(this).addClass("selected");
    $(segment.name).css("color", $(this).attr("href"));
    $("#" + segment.name + "-first").css("color", $(this).attr("href"));
    $("#" + segment.name + "-first").attr("class", $(this).attr("class"));

    // Set new color in the object
    segment.color = $(this).attr("title");

    // set appended textbox values to visible textbox
    $('#ps1-output').val('PS1="' + ps1.output_zcolors() + '"');
    $('#ps1-bash-output').val('PS1="' + ps1.output_bash() + '"');
  });
  random_color(segment.name);
}

function random_color(name) {
  r = Math.ceil(Math.random() * Object.size(bash_colors));
  $('#' + name + '-colorz li:nth-child(' + r + ') a').addClass("selected").click();
}

function random_colors() {
  for (var name in segments) {
    random_color(name);
  }
}

var segments = {
  user: new segment('user', '\\u', 'user', 'NC'),
  at: new segment('at', '@', '@', 'NC'),
  host: new segment('host', '\\h', 'host', 'NC'),
  colon: new segment('colon', ':', ':', 'NC'),
  wd: new segment('wd', '\\w', '~/working/directory', 'NC'),
  dollar: new segment('dollar', '$ ', '$ ', 'NC'),
  text_output: new segment('text_output', '', 'text output', 'NC')
};

var ps1 = new group("PS1", tango, segments);

$(function () {
  // initalize all colorizers as defined by var things
  for (var name in segments) {
    init_colorizer(segments[name]);
  }

  // select all on click
  $("#ps1-output, #ps1-bash-output").click(function () {
    $(this).select();
  });
  $("#random-colors").click(function () {
    random_colors();
  });

  var fgPicker = $('#foreground-picker').colorpicker();
  var bgPicker = $('#background-picker').colorpicker();

  fgPicker.on('changeColor', function(e) {
      $('body')[0].style.color = e.color.toHex();
  });

  bgPicker.on('changeColor', function(e) {
      $('body')[0].style.backgroundColor = e.color.toHex();
  });

  $('#reset-colors').click(function(){
    $('body').css({ 'background-color': '#272b30', 'color': '#c8c8c8'});
  });

});