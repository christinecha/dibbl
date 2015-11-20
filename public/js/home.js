$('#search').on('submit', function(e){
  e.preventDefault();
  var query = $("#query").val();
  var time = $("#query-time").val();
  location.href = "/search" + query + time;
  return false;
});
