$('#nav').load('/nav');

$('.notifications-icon').on('click', function(){
  $('.menu').hide();
  $('.notifications').toggle();
});

$('.menu-icon').on('click', function(){
  $('.notifications').hide();
  $('.menu').toggle();
});

$('.page-nav').on('click', function(){
  var page = $(this).attr('data-page');
  var pageId = '#' + page;
  $('.menu').hide();
  $('.page').hide();
  $(pageId).show();
});
