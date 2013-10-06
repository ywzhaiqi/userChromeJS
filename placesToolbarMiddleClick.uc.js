
// 禁用书签栏文件夹的鼠标中键打开所有标签页

location == "chrome://browser/content/browser.xul" && (function(){
    var placesToolbar = document.getElementById("PlacesToolbarItems");
    placesToolbar.addEventListener("click", function(event){
        var target = event.target;
        if(event.button == 1 && target.className == "bookmark-item" && target.getAttribute("type") == "menu"){
            event.preventDefault();
            event.stopPropagation();
        }
    }, true);
})()