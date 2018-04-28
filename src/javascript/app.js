// Fallbacks

(function($) {
  const $span = $('<span class="fa" style="display:none"></span>').appendTo('body');
  if ($span.css('fontFamily') !== 'FontAwesome') {
    $('head').append('<link href="~/assets/shared/css/vendor/font-awesome-4.7.0.min.css" rel="stylesheet">');
  }
  $span.remove();
})(window.jQuery);
