(function(){
var table;

// called when the window size changes--adjust the grid size accordingly
var sizeDataTable = function() {
  $(".dataTables_scrollBody").css("height", 
    window.innerHeight - ($("thead").height() + 2));
  $("#data").DataTable().columns.adjust().draw();
};

var showError = function(msg) {
  document.getElementById("errorWrapper").style.display = "block";
  document.getElementById("errorMask").style.display = "block";
  document.getElementById("error").innerText = msg;
  document.getElementById("data").style.display = "none";
};

var showFilterUI = function(idx, col) {
  var filter = document.getElementById("filterValues");
  filter.innerHTML = "";
  if (col.col_type === "character") {
    var input = document.createElement("input");
    input.type = "text";
    filter.appendChild(input);
  } else if (col.col_type === "factor") {
    var sel = document.createElement("select");
    var all = document.createElement("option");
    all.value = "";
    all.innerText = "All";
    sel.appendChild(all);
    for (var i = 0; i < col.col_vals.length; i++) {
      var opt = document.createElement("option");
      opt.value = i + 1;
      opt.innerText = col.col_vals[i];
      sel.appendChild(opt);
    }
    sel.addEventListener("change", function(evt) {
    });
    sel.addEventListener("click", function(evt) {
      evt.stopPropagation();
    });
    filter.appendChild(sel);
  } else if (col.col_type === "numeric") {
    // TODO: slider
    filter.innerText = col.col_min + " - " + col.col_max;
  }

  var filterUI = document.getElementById("filterUI");
  var thead = document.getElementById("data_cols");
  filterUI.style.display = "block";
};

var createHeader = function(idx, col) {
  var th = document.createElement("th");

  // add the title
  var title = document.createElement("div");
  title.innerText = col.col_name;
  th.appendChild(title);
  th.title = col.col_type;
  if (col.col_type === "numeric") {
    th.title += " with range " + col.col_min + " - " + col.col_max;
  } else if (col.col_type === "factor") {
    th.title += " with " + col.col_vals.length + " levels";
  }

  // add the filter controls
  if (col.col_type === "numeric" ||
      col.col_type === "factor" || 
      col.col_type === "character") {
    var filter = document.createElement("div");
    filter.className = "colFilter unfiltered";
    filter.style.display = "none";
    filter.innerText = "All";
    filter.tabIndex = 0;
    filter.addEventListener("click", function(evt) {
      showFilterUI(idx, col);
      evt.stopPropagation();
    });
    th.appendChild(filter);
  }
  return th;
};

var initDataTable = function() {
  // look up the query parameters
  var env = "", obj = "", cacheKey = "";
  var query = window.location.search.substring(1);
  var queryVars = query.split("&");
  for (var i = 0; i < queryVars.length; i++) {
    var queryVar = queryVars[i].split("=");
    if (queryVar[0] == "env") {
      env = queryVar[1];
    } else if (queryVar[0] == "obj") {
      obj = queryVar[1];
    } else if (queryVar[0] == "cache_key") {
      cacheKey = queryVar[1];
    }
  }
  $.ajax({
      url: "../grid_data?show=cols&" + window.location.search.substring(1)})
  .done(function(cols) {
    // parse result
    cols = $.parseJSON(cols);

    if (cols.error) {
      showError(cols.error);
      return;
    }

    // add each column
    var thead = document.getElementById("data_cols");
    for (var i = 0; i < cols.length; i++) {
      // create table header
      thead.appendChild(createHeader(i, cols[i]));
    }
    var scrollHeight = window.innerHeight - (thead.clientHeight + 2);

    // activate the data table
    table = $("#data").dataTable({
      "processing": true,
      "serverSide": true,
      "pagingType": "full_numbers",
      "pageLength": 25,
      "scrollY": scrollHeight + "px",
      "scrollX": true,
      "dom": "tS", 
      "deferRender": true,
      "ajax": {
        "url": "../grid_data", 
        "data": function(d) {
          d.env = env;
          d.obj = obj;
          d.cache_key = cacheKey;
          d.show = "data";
        },
        "error": function(jqXHR) {
          if (jqXHR.responseText[0] !== "{")
            showError(jqXHR.responseText);
          else
          {
            var result = $.parseJSON(jqXHR.responseText);
            if (result.error) {
              showError(result.error);
            } else {
              showError("The data could not be displayed.");
            }
          }
        },
       }
    });

    // listen for size changes
    window.addEventListener("resize", sizeDataTable);
  })
  .fail(function(jqXHR)
  {
    if (jqXHR.responseText[0] !== "{")
      showError(jqXHR.responseText);
    else
    {
      var result = $.parseJSON(jqXHR.responseText);

      if (result.error) {
        showError(result.error);
      } else {
        showError("The object could not be displayed.");
      }
    }
  });
};

$(document).ready(function() {
  // RStudio animates the window opening, so wait for window height to stop
  // changing for 10ms before drawing
  var height = window.innerHeight;
  var interval = window.setInterval(function() {
    if (height === window.innerHeight) {
      window.clearInterval(interval);
      initDataTable();
    } else {
      height = window.innerHeight;
    }
  }, 10);
});

// Exports -------------------------------------------------------------------

window.setFilterUIVisible = function(visible) {
  var thead = document.getElementById("data_cols");
  for (var i = 0; i < thead.children.length; i++) {
    if (thead.children[i].children.length > 1) {
      thead.children[i].children[1].style.display = visible ? "block" : "none";
    }
  }
  if (!visible) {
    // clear all the filter data
    $("#data").DataTable().columns().search("");
  }
  sizeDataTable();
};

})();
