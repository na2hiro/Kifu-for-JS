var dropdown = document.getElementById("dropdown");
var bundle = new URLSearchParams(location.search).get("bundle");
if (bundle === null) bundle = dropdown.querySelector("option").value;
if (bundle !== "") {
    document.write('<script src="../bundle/' + bundle + '.min.js" charset="utf-8"><' + "/script>");
}

dropdown.value = bundle;
