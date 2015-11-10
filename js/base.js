function getSearchTerm()
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == 'q')
        {
            return sParameterName[1];
        }
    }
}

$(document).ready(function() {

    var search_term = getSearchTerm(),
        $search_modal = $('#mkdocs_search_modal');

    if(search_term){
        $search_modal.modal();
    }

    // make sure search input gets autofocus everytime modal opens.
    $search_modal.on('shown.bs.modal', function () {
        $search_modal.find('#mkdocs-search-query').focus();
    });

    // 调整第一个h1标题与文档顶部的距离
    $('div[role="main"] h1:first-child').css('margin-top', '15px');

    // Highlight.js
    hljs.initHighlightingOnLoad();
    $('table').addClass('table table-striped table-hover');

    $('body').scrollspy({
        target: '.bs-sidebar',
    });
    $('.bs-sidebar').on('activate.bs.scrollspy', function () {
        // 显示/隐藏二级目录
        $('.bs-sidenav li.main span.main-set').text('+');
        var obj = $('.bs-sidenav li.active');
        if (obj.hasClass('main')) {
            $('.bs-sidenav li.sub').hide();
            var parent_id = obj.children('a').attr('href').substr(1);
            $('.bs-sidenav li.parent_' + parent_id).show();
            $('.bs-sidenav span.parent_' + parent_id).text('-');
        } else if (obj.hasClass('sub')) {
            $('.bs-sidenav li.sub').hide();
            obj.nextUntil('li.main').show();
            obj.show();
            obj.prevUntil('li.main').show();
            var parent_obj = null;
            if (obj.prev().hasClass('main'))
                parent_obj = obj.prev();
            else
                parent_obj = obj.prevUntil('li.main').prev();
            parent_obj.children('a').children('span.main-set').text('-');
        }
    });

    /* Prevent disabled links from causing a page reload */
    $("li.disabled a").click(function() {
        event.preventDefault();
    });
});