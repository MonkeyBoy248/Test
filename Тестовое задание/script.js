const catalogueInner = document.querySelector('.catalogue__inner');
const catalogueContainer = document.querySelector('.catalogue__container');
const usersList = catalogueInner.querySelector('.catalogue__users-list');
const navigationContainer = document.querySelector('.navigation__container');
const navigationCatalogue = document.querySelector('.navigation__item_catalogue');
const navigationFavorite = document.querySelector('.navigation__item_favorite');
const favoriteContainer = document.querySelector('.favorite__container');
const favoriteEmpty = document.querySelector('.favorite__empty');
const favoritePhotos = document.querySelector('.favorite__photos');

class Favorite {
    constructor(src, title, popUpSrc) {
        this.src = src;
        this.title = title;
        this.popUpSrc = popUpSrc;
    }
}

let favoriteImages;
!localStorage.favorites ? favoriteImages = [] : favoriteImages = JSON.parse(localStorage.getItem('favorites'));

window.addEventListener('load', () => {
    fetch('https://json.medrating.org/users/')
    .then(response => response.json())
    .catch(() => showError("catalogue__error-container"))
    .then(function appendUsers(data){
        let preloaderContainer = document.querySelector('.catalogue__preloader-container');
        hidePreloader(preloaderContainer);
        for(let i of data){
            let id = i.id;
            let name = i.name;
            if(name != undefined){
                createUserTemplate(name, id, "user");
            }
            
        }
    })
    showEmptyMessage();
})

navigationContainer.addEventListener('click', (e) => {
    let target = e.target;
    if(target == navigationCatalogue && navigationFavorite.classList.contains('active')){
       toggleActiveClass(navigationFavorite, navigationCatalogue, favoriteContainer, catalogueContainer);
    }else{
        toggleActiveClass(navigationCatalogue, navigationFavorite, catalogueContainer, favoriteContainer);
    }
})

usersList.addEventListener('click', (e) => {
    let target = e.target;
    if(target.closest('li').matches('.catalogue__user-item')){
        target.closest('li').querySelector('.catalogue__albums-list').innerHTML = '';
        fetchAlbums(target.closest("li").getAttribute("userid"), target.closest("li"),  target.closest('li').querySelector('.catalogue__albums-list'));
    }else if(target.closest('div').matches('.album__info')){
        fetchPhotos(target.closest("li").getAttribute("albumid"), target.closest("li"), target.closest("li").querySelector('.album__inner'));
           
    }else if(target.classList.contains('fav')){ 
        favoritePhotos.innerHTML = '';
        let favoriteButtons = [...catalogueInner.getElementsByClassName('fav')];
        let imagesTitles = [...catalogueInner.getElementsByClassName('image__title')];
        let images = [...catalogueInner.getElementsByClassName('img')];
        let popUpImages = [...catalogueInner.getElementsByClassName('pop-up__img')];
        if(target.classList.contains('added')){
            for(let i of favoriteImages){
                if(i.title == imagesTitles[favoriteButtons.indexOf(target)].innerHTML){
                    favoriteImages.splice(favoriteImages.indexOf(i), 1);
                    updateLocalStorage();
                    target.setAttribute('src', './resourses/star_empty.png');
                    target.classList.remove('added');
                    showEmptyMessage();
                }
            }
            for(let j of favoriteImages){
                fillFavoriteTemplate(j.src, j.popUpSrc, favoritePhotos, j.title, "./resourses/star_active.png");
            }
        }else{
            target.classList.add('added');
            favoriteImages.push(new Favorite(images[favoriteButtons.indexOf(target)].getAttribute('src'), imagesTitles[favoriteButtons.indexOf(target)].innerHTML, popUpImages[favoriteButtons.indexOf(target)].getAttribute('src')));
            updateLocalStorage();
            for(let i of favoriteImages){
                fillFavoriteTemplate(i.src, i.popUpSrc, favoritePhotos, i.title, "./resourses/star_active.png");
                favoriteEmpty.style.display = 'none';
                target.setAttribute('src', './resourses/star_active.png');
            }  
        }
    }
    else if(target.closest('div').matches('.image')){
        let images = [...document.getElementsByClassName('image')];
        let popUp = [...document.getElementsByClassName('pop-up__container')];
        showPopUp(popUp[images.indexOf(target.closest('div'))]);
    }else if(target.matches(".pop-up__close-btn")){
        let closeButtons = [...document.getElementsByClassName('pop-up__close-btn')];
        let popUp = [...document.getElementsByClassName('pop-up__container')];
        closePopUp(popUp[closeButtons.indexOf(target)]);
    }
})

for(let i of favoriteImages){
    fillFavoriteTemplate(i.src, i.popUpSrc, favoritePhotos, i.title, "./resourses/star_active.png");
}

usersList.addEventListener('mouseover', (e) =>{
    let target = e.target;
    if(target.closest('div').matches('.image')){
        target.closest('div').querySelector('.image__title').style.display = 'block';  
    }       
})

usersList.addEventListener('mouseout', (e) =>{
    let target = e.target;
    if(target.closest('div').matches('.image')){
        target.closest('div').querySelector('.image__title').style.display = 'none';
    }   
})

favoritePhotos.addEventListener('click', (e) => {
    let target = e.target;
    let images = [...favoritePhotos.getElementsByClassName('img')];
    let popUp = [...favoritePhotos.getElementsByClassName('pop-up__container')];
    let favoriteButtons = [...catalogueInner.getElementsByClassName('fav')];
    let imagesTitles = [...catalogueInner.getElementsByClassName('image__title')];
    let allImages = [...catalogueInner.getElementsByClassName('img')];
    if(target.matches(".fav")){
        for(i of favoriteImages){
            if(target.closest("div").querySelector(".favorite__image-title").innerHTML == i.title){
                favoriteImages.splice(favoriteImages.indexOf(i), 1);
                updateLocalStorage();
                console.log(favoriteImages);
                showEmptyMessage();
            }
        }
        for(let i = 0; i < allImages.length; i++){
            setEmptyStar(imagesTitles, favoriteButtons)
        }
        favoritePhotos.innerHTML = " ";
        for(let j of favoriteImages){
            fillFavoriteTemplate(j.src, j.popUpSrc, favoritePhotos, j.title, "./resourses/star_active.png");
        }
       
    }
    else if(target.matches('.img')){
        showPopUp(popUp[images.indexOf(target)]);
    }else if(target.matches(".pop-up__close-btn")){
        let closeButtons = [...favoritePhotos.getElementsByClassName('pop-up__close-btn')];
        closePopUp(popUp[closeButtons.indexOf(target)]);
    }

})

function showEmptyMessage(){
    if(favoriteImages.length == 0){
        favoriteEmpty.style.display = 'flex';
    }
}

function toggleActiveClass(currentActive, targetActive, currentOpenedContainer, targetOpenedContainer){
    currentActive.classList.remove('active');
    targetActive.classList.add('active');
    currentOpenedContainer.classList.remove('open');
    targetOpenedContainer.classList.add('open');
}

function fetchAlbums(id, target, toggledBlock){
    createPreloaderTemplate(target);
    let allLi = [...document.getElementsByClassName('catalogue__user-item')];
    fetch(`https://json.medrating.org/albums?userId=${id}`)
    .then(resp => resp.json())
    .catch(function showAlbumError() {   
        styleErrorButton(target.querySelector(".error-container"), target, "error-container")
    })
    .then(function appendAlbums(data) {
        let preloaderContainer = document.querySelector('.preloader-container');
        hidePreloader(preloaderContainer);
        toggledBlock.classList.toggle('active');
        for(let i of data){
            let id = i.id;
            let title = i.title;
            createAlbumTemplate(title, allLi.indexOf(target), id, "album");
            styleButton(target, 'catalogue__albums-list');               
        }
    })  
}

function fetchPhotos(albumId, target, toggledBlock){
    createPreloaderTemplate(target);
    fetch(`https://json.medrating.org/photos?albumId=${albumId}`)
    .then(resp => resp.json())
    .catch(function showGalleryError() {
        styleErrorButton(target.querySelector(".error-container"), target, "error-container");
        toggledBlock.querySelector(".images__container").style.display = "none";        
    })
    .then(function appendGallery(data) {
        let preloaderContainer = target.querySelector('.preloader-container');
        hidePreloader(preloaderContainer);
        toggledBlock.classList.toggle('active');
        toggledBlock.querySelector(".images__container").classList.toggle('active');
        function favIconCheck(){
            for(let i of data){
                let url = i.thumbnailUrl;
                let title = i.title;
                let fullSize = i.url;
                fillGalleryTemplate(url, fullSize, target.querySelector(".images__inner"), title, "./resourses/star_empty.png");
                styleButton(target, "images__container")
                let favoriteButtons = [...document.getElementsByClassName('fav')];
                let imagesTitles = [...document.getElementsByClassName('image__title')];
                setActiveStar(imagesTitles, favoriteButtons);
            }
        }
        favIconCheck();
    })
}

function updateLocalStorage(){
    localStorage.setItem('favorites', JSON.stringify(favoriteImages));
}

function setActiveStar(titles, buttons){
    let names = [];
    for(let i of favoriteImages){
        names.push(i.title);
    }
    for(let j = 0; j < titles.length; j++){
        if(names.indexOf(titles[j].innerHTML) != -1){
                buttons[j].setAttribute("src", "./resourses/star_active.png")
                buttons[j].classList.add("added");
        }
    }
}

function setEmptyStar(titles, buttons){
    let names = [];
    for(let i of favoriteImages){
        names.push(i.title);
    }
    for(let j = 0; j < titles.length; j++){
        if(names.indexOf(titles[j].innerHTML) == -1){
            buttons[j].setAttribute("src", "./resourses/star_empty.png")
            buttons[j].classList.remove("added");
        }
    }
}

function showPopUp(targetElement){
    targetElement.style.display = 'flex';
    document.body.classList.add("lock");
}

function closePopUp(targetElement){
    targetElement.style.display = 'none';
    document.body.classList.remove("lock");
}

function createUserTemplate(name, id, errorType) {
    let userLi = `<li class="catalogue__user-item" userid=${id}>
    <div class="catalogue__item-info">
        <span class="catalogue__list-icon icon">
        <img src="./resourses/open_list.svg">
        </span>
        <h3 class="catalogue__user-name">${name}</h3>
    </div>
    <ul class="catalogue__albums-list">
    </ul>
    ${createErrorTemplate(errorType)}
    </li>
    `
    usersList.insertAdjacentHTML('beforeend', userLi);
}

function createErrorTemplate(targetBlockType) {
    return `<div class="${targetBlockType}__error error-container">
        <div class="${targetBlockType}__inner error-inner">
            <img src="./resourses/error.png" alt="" class="error-img">
            <span class="error-text">
                <h3>Сервер не отвечает</h3>
                <p>Уже работаем над этим</p>
            </span>
        </div>
    </div>`
}

function createPreloaderTemplate(target) {
    let preloader =  ` <div class="preloader-container">
        <div class="preloader-inner">
            <img src="./resourses/loader.gif" alt="" class="preloader-img" />
        </div>
    </div>`

    target.insertAdjacentHTML('beforeend', preloader);
}

function createAlbumTemplate(title, index, albumId, errorType) {
    let albumUl = document.getElementsByClassName('catalogue__albums-list');
        let albumLi = `
        <li class="album" albumid=${albumId}>
            <div class="album__inner">
                <div class="album__info">
                    <span class="album__icon icon">
                    <img src="./resourses/open_list.svg">
                    </span>
                    <span class="album__name">${title}</span>
                </div>
                <div class="images__container">
                    <div class="images__inner"></div>
                </div>
                ${createErrorTemplate(errorType)}
                </div>
        </li>
        `
        
    albumUl[index].insertAdjacentHTML('beforeend', albumLi);
}

function fillGalleryTemplate(url, fullSize, elem, title, src) {
    let galleryContainer = `
    <div class="pop-up__container">
    <span class="pop-up__close"><img src="./resourses/close_modal.png" alt="" class='pop-up__close-btn'></span>
    <div class="pop-up__image">
     <img src="${fullSize}" alt="" class="pop-up__img">
    </div>
    </div>
        <div class="image">
            <span class="image__favorite-btn fav__button"><img src="${src}" alt="" class="fav"></span>
            <img src="${url}" alt="" class="image__picture img">
            <div class="image__title">${title}</div>
        </div>`
    elem.insertAdjacentHTML('beforeend', galleryContainer);
}

function fillFavoriteTemplate(url, fullSize, elem, title, src) {
    let favoriteContainer = `
    <div class="pop-up__container">
    <span class="pop-up__close"><img src="./resourses/close_modal.png" alt="" class='pop-up__close-btn'></span>
    <div class="pop-up__image">
   <img src="${fullSize}" alt="" class="pop-up__img">
    </div>
    </div>
        <div class="favorite__images image">
            <span class="favorite__favorite-btn fav__button"><img src="${src}" alt="" class="fav"></span>
            <img src="${url}" alt="" class="img">
            <div class="favorite__image-title">${title}</div>
        </div>`
    elem.insertAdjacentHTML('beforeend', favoriteContainer);
}

function styleButton(target, element) {
    if(target.querySelector(`.${element}`).classList.contains('active')){
        target.querySelector('.icon img').setAttribute("src", "./resourses/close_list.svg");
    }else{
        target.querySelector('.icon img').setAttribute("src", "./resourses/open_list.svg");        
    }
}

function styleErrorButton(toggletarget, target, element){
    toggletarget.classList.toggle("active");
    target.querySelector('.icon img').setAttribute("src", "./resourses/close_list.svg");
    styleButton(target, element);  
}

function hidePreloader(targetContainer){
    setTimeout(() => {
        targetContainer.remove()
    }, 200); 
}

function showError(errorTargetContainer){
    let errorContainer = document.querySelector(`.${errorTargetContainer}`);
    errorContainer.style.display = 'block';
}


