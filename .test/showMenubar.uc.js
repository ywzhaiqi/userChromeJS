
(function(){

    let button = document.createElement('button');
    button.setAttribute('label', '菜单栏');
    button.setAttribute('tooltiptext', '显示菜单栏');
    button.setAttribute('image', '');
    button.addEventListener('command', function(){
        var menubar = document.getElementById('toolbar-menubar');
        if (menubar.hasAttribute('inactive')) {
            menubar.removeAttribute('inactive')
        } else {
            menubar.setAttribute('inactive', 'true')
        }
    }, false);

    let helpBtn = document.getElementById('PanelUI-help');
    helpBtn.parentNode.insertBefore(button, helpBtn);
})()