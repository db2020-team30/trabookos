//"use strict";


//Γραμμές 4-35 από το stackoverflow: https://stackoverflow.com/questions/20325763/browser-sessionstorage-share-between-tabs
// transfers sessionStorage from one tab to another
// var sessionStorage_transfer = function(event) {
//     if(!event) { event = window.event; } // ie suq
//     if(!event.newValue) return;          // do nothing if no value to work with
//     if (event.key == 'getSessionStorage') {
//       // another tab asked for the sessionStorage -> send it
//       console.log("sending",JSON.stringify(sessionStorage))
//       localStorage.setItem('sessionStorage', JSON.stringify(sessionStorage));
//       // the other tab should now have it, so we're done with it.
//       //localStorage.removeItem('sessionStorage'); // <- could do short timeout as well.
//     } else if (event.key == 'sessionStorage' && !sessionStorage.length) {
//       // another tab sent data <- get it
//       var data = JSON.parse(event.newValue);
//       for (var key in data) {
//         sessionStorage.setItem(key, data[key]);
//       }
//     }
//   };
  
  // listen for changes to localStorage
//   if(window.addEventListener) {
//     window.addEventListener("storage", sessionStorage_transfer, false);
//   } else {
//     window.attachEvent("onstorage", sessionStorage_transfer);
//   };
  
  
  // Ask other tabs for session storage (this is ONLY to trigger event)
//   if (!sessionStorage.length) {
//     localStorage.setItem('getSessionStorage', 'foobar');
//     localStorage.removeItem('getSessionStorage', 'foobar');
//   };



//Check if hover is possible
if ('ontouchstart' in window || 'ontouch' in window) {
    document.body.classList.add('touch-device');
  } 
else {
    document.body.classList.add('non-touch-device');
} 

//---------------Navigation bar-------------------

var escapeBtn = document.getElementById("escape");
var mainNav = document.querySelector(".main-nav");
var hamBtn = document.getElementById("ham-btn");
var panelOverlay = document.querySelector(".panel-overlay");

var dropdowns = document.querySelectorAll(".dropdown");
var dropdownBtns = document.querySelectorAll(".dropdown-btn");
var dropdownContents = document.querySelectorAll(".dropdown-container");
var dropdownBtn2 = document.querySelectorAll(".drop-btn2");
var dropdown2 = document.querySelectorAll(".dropdown-2");
var dropdownContent2 = document.querySelectorAll(".dropdown-container-2");
var i;

//Small screens:

escapeBtn.addEventListener("click", function() {
    panelOverlay.classList.remove("overlay-active");
    dropdownBtns.forEach(item => item.classList.remove("active-mobile"));
    mainNav.classList.replace("mobile-open", "default");
    document.querySelectorAll(".mobile-open").forEach(item => item.classList.remove("mobile-open"));
    document.querySelectorAll(".active-mobile-2").forEach(item => item.classList.remove(".active-mobile-2"));
});

hamBtn.addEventListener("click", function() {
    mainNav.classList.replace("default", "mobile-open");
    panelOverlay.classList.add("overlay-active");
});

panelOverlay.addEventListener("click", function() {
    panelOverlay.classList.remove("overlay-active");
    dropdownBtns.forEach(item => item.classList.remove("active-mobile"));
    mainNav.classList.replace("mobile-open", "default");
    document.querySelectorAll(".mobile-open").forEach(item => item.classList.remove("mobile-open"));
    document.querySelectorAll(".active-mobile-2").forEach(item => item.classList.remove("active-mobile-2"));
});

dropdownBtns.forEach(item => item.addEventListener("click", function() {
    if (window.innerWidth <= 1024) {
        item.classList.toggle("active-mobile");
        item.nextElementSibling.classList.toggle("mobile-open");
    }
}));

dropdownBtn2.forEach(item => item.addEventListener("click", function() {
        if (window.innerWidth <= 1024) {
            this.classList.toggle("active-mobile-2");
            item.nextElementSibling.classList.toggle("mobile-open");
        }
    })
);

//Big screens:

function openDropdown1() {
    if (window.innerWidth > 1024) {
        this.firstElementChild.classList.add("active");
        this.firstElementChild.nextElementSibling.classList.add("open");
        this.firstElementChild.nextElementSibling.querySelectorAll("i").forEach(item => item.classList.replace("fa-caret-down", "fa-caret-right"));
    }
}

function closeDropdown1() {
    if (window.innerWidth > 1024) {
        this.firstElementChild.classList.remove("active");
        this.firstElementChild.nextElementSibling.classList.remove("open");
        this.firstElementChild.nextElementSibling.querySelectorAll("i").forEach(item => item.classList.replace("fa-caret-right", "fa-caret-down"));
    }
}

function openDropdown2() {
    if (window.innerWidth > 1024) {
        this.firstElementChild.classList.add("active-2");
        this.lastElementChild.classList.add("open");
    }
}

function closeDropdown2(){
    if (window.innerWidth > 1024) {
        this.firstElementChild.classList.remove("active-2");
        this.lastElementChild.classList.remove("open");
    }
}

dropdowns.forEach(item => item.addEventListener("mouseover", openDropdown1));
dropdowns.forEach(item => item.addEventListener("mouseout", closeDropdown1));

dropdown2.forEach(item => item.addEventListener("mouseover", openDropdown2));
dropdown2.forEach(item => item.addEventListener("mouseout", closeDropdown2));

//------------Changes for touch devices-----------

if (document.body.getAttribute("class") === "touch-device") {
    let iconBox = document.querySelectorAll(".icon-box");
    iconBox.forEach(item => item.classList.add("icon-box-mobile"));
}

//------------------Cart panel--------------------

const cartLink = document.querySelector("#cart-link");
const cartHead = document.querySelector("#cart-panel span");
const cartMain = document.querySelector("#cart-panel div");
const tameioBtn = document.querySelector("#go-to-cart-btn");
const pricePrinted = document.querySelector("#price");

cartLink.addEventListener("mouseover", function() {
    cartHead.innerHTML = clicks + " προϊόντα";
    if (clicks === 0) {
        tameioBtn.style.display = 'none';
        pricePrinted.style.display = "none";
    }
    else {
        tameioBtn.style.display = "block";
        pricePrinted.style.display = "block";
        if (totalPrice >= 10){
            pricePrinted.innerHTML = "Σύνολο: " + totalPrice.toPrecision(4) + "&#8364;";
        }
        else {
            pricePrinted.innerHTML = "Σύνολο: " + totalPrice.toPrecision(3) + "&#8364;";
        }
    }
    if (clicks === 0) {
        cartMain.innerHTML = "Κανένα προϊόν στο καλάθι σας."
    }
});

//----------------------Cart Initialiser--------------------------
const cartButtons = document.querySelectorAll('.cart-button');
const totalBooksCounter = document.getElementById('total-books-counter');
const productAddedAlert = document.getElementById('product-added-alert');
let productClicks = {}; //to count no. of clicks per cart button
let savedIds;
let savedArray = [];
let clicks = 0;
let totalPrice = 0;
let savedBookInfo = [];

if (localStorage.getItem("savedIds") !== null){
    savedIds = localStorage.getItem("savedIds");
    savedArray = savedIds.split(",");
    for (let book of savedArray) {
        if (localStorage.getItem(book)) {
            savedBookInfo.push(JSON.parse(localStorage.getItem(book)));
        }
    }
    cartMain.innerHTML = "";

    savedBookInfo.forEach(item => {
        if( item !==null){
            clicks += item.bookClicks;
            cartId = "add-cart" + item.id;
            productClicks[cartId.slice(8,13)] = item.bookClicks;
            let cover = document.createElement("img");
            let acover= document.createElement("a");
            acover.setAttribute('href','/book/'+item.id);
            cover.setAttribute("src", item.bookCover);

            let removeBtn = document.createElement("div");
            removeBtn.setAttribute("class", "remove-item");
            removeBtn.setAttribute("id", "remove-" + cartId);
            removeBtn.innerHTML = "&times";

            let cartDiv = document.createElement("div");
            cartDiv.setAttribute("class", "each-book-div");
            cartDiv.appendChild(acover);
            acover.appendChild(cover);
            cartDiv.appendChild(removeBtn);

            let infoDiv = document.createElement("div");
            infoDiv.setAttribute("class", "info-div");
            infoDiv.setAttribute("id", cartId + "-info");

            let titleDiv = document.createElement("div");
            let aTitle = document.createElement("a");
            aTitle.setAttribute("class", "book-title");
            aTitle.setAttribute("href", "/book/" + item.id);
            aTitle.innerHTML = item.title;
            titleDiv.appendChild(aTitle);
            infoDiv.appendChild(titleDiv);

            let writerDiv = document.createElement("div");
            let aWriter = document.createElement("a");
            aWriter.setAttribute("class", "red-link");
            let writerNumArr=item.writer_id.split('/') 
            aWriter.setAttribute("href", "/writer/" + writerNumArr[writerNumArr.length-1]);
            writerDiv.appendChild(aWriter);
            aWriter.innerHTML = item.writer;
            infoDiv.appendChild(writerDiv);

            let pricesSpan = document.createElement("span");
            let oldPriceSpan = document.createElement("span");
            let newPriceSpan = document.createElement("span");
            let br = document.createElement("br");
            if(item.oldPrice !== item.price){
                oldPriceSpan.setAttribute("class", "old-price");
                oldPriceSpan.innerHTML = item.oldPrice + "&#8364;";
                pricesSpan.appendChild(oldPriceSpan);
                pricesSpan.appendChild(br);
            }
            newPriceSpan.innerHTML = item.price + "&#8364;";
            pricesSpan.appendChild(newPriceSpan);
            infoDiv.appendChild(pricesSpan);

            let timesClicked = document.createElement("div");
            timesClicked.innerHTML = "x" + productClicks[cartId.slice(8,13)];
            infoDiv.appendChild(timesClicked);

            totalPrice += productClicks[cartId.slice(8,13)] * item.price;
            
            cartDiv.appendChild(infoDiv);
            cartMain.appendChild(cartDiv);

            removeBtn.addEventListener("click", function(){
                let divToDelete = this.parentNode;
                cartBtnId = removeBtn.getAttribute("id").slice(7);
                clicks = clicks - productClicks[cartBtnId.slice(8,13)];
                let productPrice = Number(divToDelete.lastElementChild.lastElementChild.previousElementSibling.lastElementChild.innerHTML.slice(0,-1));
                totalPrice = totalPrice - productClicks[cartBtnId.slice(8,13)] * productPrice;
                productClicks[cartBtnId.slice(8,13)] = 0;
                
                if (clicks === 0) {
                    cartMain.innerHTML = "Κανένα προϊόν στο καλάθι σας."
                    tameioBtn.style.display = "none";
                    pricePrinted.style.display = "none";
                }
                cartHead.innerHTML = clicks + " προϊόντα";
                totalBooksCounter.innerHTML = clicks;
                if (totalPrice >= 10){
                    pricePrinted.innerHTML = "Σύνολο: " + totalPrice.toPrecision(4) + "&#8364;";
                }
                else {
                    pricePrinted.innerHTML = "Σύνολο: " + totalPrice.toPrecision(3) + "&#8364;";
                }
                if(divToDelete.parentNode){
                    divToDelete.parentNode.removeChild(divToDelete);
                }
                savedArray.splice(savedArray.indexOf(item.id.slice(8,13)),1);
                localStorage.setItem("savedIds", savedArray.join(","));
                localStorage.removeItem(item.id.slice(8,13))
            });
        }
    })
}


totalBooksCounter.innerHTML = clicks;

//---------------------Add book to cart---------------------------

cartButtons.forEach(item => item.addEventListener("click", function(event) {
        if (clicks === 0){
            cartMain.innerHTML = "";
        }
        clicks += 1;
        cartId = item.getAttribute("id");
        if (productClicks[cartId.slice(8,13)]) {
            productClicks[cartId.slice(8,13)] += 1;
        }
        else {
            productClicks[cartId.slice(8,13)] = 1;
        }

        event.preventDefault();
                
        totalBooksCounter.innerHTML = clicks;
        productAddedAlert.style.display = "block";
        setTimeout(function(){productAddedAlert.style.display = "none";}, 1500);

        if (productClicks[cartId.slice(8,13)]==1) {
            let temp_link = item.parentNode.previousElementSibling.getAttribute("src");
            let cover = document.createElement("img");
            let acover= document.createElement("a");
            acover.setAttribute('href','/book/'+cartId.slice(8,13));
            cover.setAttribute("src", temp_link);

            let removeBtn = document.createElement("div");
            removeBtn.setAttribute("class", "remove-item");
            removeBtn.setAttribute("id", "remove-" + cartId);
            removeBtn.innerHTML = "&times";

            let cartDiv = document.createElement("div");
            cartDiv.setAttribute("class", "each-book-div");
            cartDiv.appendChild(acover);
            acover.appendChild(cover);
            cartDiv.appendChild(removeBtn);
            removeBtn.addEventListener("click", function(){
                let divToDelete = this.parentNode;
                cartBtnId = removeBtn.getAttribute("id").slice(7);
                clicks = clicks - productClicks[cartBtnId.slice(8,13)];
                let productPrice = Number(divToDelete.lastElementChild.lastElementChild.previousElementSibling.lastElementChild.innerHTML.slice(0,-1));
                totalPrice = totalPrice - productClicks[cartBtnId.slice(8,13)] * productPrice;
                productClicks[cartBtnId.slice(8,13)] = 0;
                
                if (clicks === 0) {
                    cartMain.innerHTML = "Κανένα προϊόν στο καλάθι σας."
                    tameioBtn.style.display = "none";
                    pricePrinted.style.display = "none";
                }
                cartHead.innerHTML = clicks + " προϊόντα";
                totalBooksCounter.innerHTML = clicks;
                if (totalPrice >= 10){
                    pricePrinted.innerHTML = "Σύνολο: " + totalPrice.toPrecision(4) + "&#8364;";
                }
                else {
                    pricePrinted.innerHTML = "Σύνολο: " + totalPrice.toPrecision(3) + "&#8364;";
                }
                if(divToDelete.parentNode){
                    divToDelete.parentNode.removeChild(divToDelete);
                }
                savedArray.splice(savedArray.indexOf(item.id.slice(8,13)),1);
                localStorage.setItem("savedIds", savedArray.join(","));
                localStorage.removeItem(item.id.slice(8,13))
            });

            let infoDiv = document.createElement("div");
            infoDiv.setAttribute("class", "info-div");
            infoDiv.setAttribute("id",'add-cart' + cartId.slice(8,13) + "-info");

            let info = item.parentNode.parentNode.nextElementSibling;
            infoDiv.innerHTML = info.innerHTML;
            let bookPrice = Number(infoDiv.lastElementChild.lastElementChild.innerHTML.slice(0,-1));
            let oldbookPrice = Number(infoDiv.lastElementChild.firstElementChild.innerHTML.slice(0,-1));
            totalPrice += bookPrice;

            let timesClicked = document.createElement("div");
            timesClicked.innerHTML = "x" + productClicks[cartId.slice(8,13)];
            infoDiv.appendChild(timesClicked);
            
            cartDiv.appendChild(infoDiv);
            cartMain.appendChild(cartDiv);
            let bookJson = {
                id: cartId.slice(8,13),
                price: bookPrice, 
                bookCover: temp_link, 
                title: infoDiv.firstElementChild.firstElementChild.innerText, 
                writer: infoDiv.firstElementChild.nextElementSibling.firstElementChild.innerText,
                writer_id:infoDiv.firstElementChild.nextElementSibling.firstElementChild.href,
                bookClicks: productClicks[cartId.slice(8,13)],
                oldPrice: oldbookPrice
            };
            savedArray.push(bookJson.id);
            localStorage.setItem("savedIds", savedArray.join(","));
            localStorage.setItem(bookJson.id, JSON.stringify(bookJson));
        }
        else {
            let productDiv = document.querySelector("#add-cart" + cartId.slice(8,13) + "-info");
            console.log(productDiv,"#add-cart" + cartId.slice(8,13) + "-info")
            productDiv.lastChild.innerHTML = "x" + productClicks[cartId.slice(8,13)];
            totalPrice += Number(productDiv.lastElementChild.previousElementSibling.lastElementChild.innerHTML.slice(0,-1));
            let tempInfo = JSON.parse(localStorage.getItem(cartId.slice(8,13)));
            tempInfo.bookClicks = productClicks[cartId.slice(8,13)];
            localStorage.setItem(cartId.slice(8,13), JSON.stringify(tempInfo));
        }
    })
);

//---------Login Dialogue-----------
const openLogin = document.querySelector("#user-link");
const closeBtn = document.querySelector(".close-btn");
const loginWindow = document.querySelector("#login-window");

if (closeBtn) {
    closeBtn.onclick = function(){
        loginWindow.style.display = "none";
    };
}

if (openLogin) {
    openLogin.onclick = function(){
        loginWindow.style.display = "block";
    };
}

//Slideshow
const slideshowImg = document.querySelectorAll("#slideshow a");
if (slideshowImg.length > 0) {

    //Create divs that show the slideshow position and allow user control on the slideshow
    for (i=0; i<slideshowImg.length; i++) {
        let slideDiv = document.createElement("div");
        slideDiv.classList.add("slide-div");
        document.querySelector("#pos-div").appendChild(slideDiv);
    }

    i=0;
    const posDivs = Array.apply(null, document.querySelectorAll(".slide-div"));

    slideshowNext();
    let slideMove = setInterval(slideshowNext, 5000);

    posDivs.forEach(item => item.addEventListener("click", function(){
        clearInterval(slideMove);
        i = posDivs.indexOf(item);
        slideshowNext();
        slideMove = setInterval(slideshowNext, 5000);
    }));

    function slideshowNext() {
        slideshowImg.forEach(item => item.classList.add("hidden"));
        slideshowImg[i].classList.remove("hidden");
        posDivs.forEach(item => item.classList.remove("selected"));
        posDivs[i].classList.add("selected");
        i=i+1;
        if (i == slideshowImg.length) {
            i=0;
        }
    }
};

//---------Go-to-top button (https://www.w3schools.com/howto/howto_js_scroll_to_top.asp)-------
//Get the button:
const topBtn = document.getElementById("top-btn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};
const mobileSearchBtn = document.querySelector("#mobile-search-btn");

function scrollFunction() {
  if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
    topBtn.style.display = "block";
    document.querySelector("header").classList.add("compressed");
    //Next line fixes the bug of non-stop moving at changing point
    document.querySelector("body").classList.add("scrolled-down");
  } else {
    topBtn.style.display = "none";
    document.querySelector("header").classList.remove("compressed");
    document.querySelector("body").classList.remove("scrolled-down");
  }
}

topBtn.onclick = function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
};

//---------Mobile search button to reveal search bar------------
const orangeNav = document.querySelector("#orangeNav");
document.querySelector("#mobile-search-btn").addEventListener("click", function() { 
    orangeNav.classList.toggle("displayed");
});


// --------------------Add to favourites------------------------
const hearts = document.querySelectorAll(".heart-input");
hearts.forEach(item => item.addEventListener("change", function() {
    fetch("/change-favourites/" + item.id.slice(5,10) + "/" + item.checked);
}));

// --------------------Add action to formFilters------------------------
const formFilters = document.querySelector("#formFilters");
if(formFilters){
    if(!window.location.href.includes('search') && !window.location.href.includes('filters')){
        formFilters.action = window.location.href +'/filters';
    }else{
        let uri_dec = decodeURIComponent(window.location.href)
        if(window.location.href.includes('filters')){
            uri_dec.slice(0,uri_dec.indexOf('?'))
            formFilters.action = uri_dec.slice(0,uri_dec.indexOf('?'));
        }else{
            formFilters.action = '/search/filters';
        }
        uri_dec=uri_dec.slice(uri_dec.indexOf('?')+1)
        uri_Arr=uri_dec.split('&');
        let inp;
        uri_Arr.forEach( item => {
            tempArr=item.split('=');
            console.log(tempArr)
            if(tempArr[0]=='search'){
                inp = document.createElement('input');
                inp.type= "hidden"
                inp.name= tempArr[0]
                inp.value= tempArr[1]
                formFilters.appendChild(inp);
            }else{
                if(tempArr[0]!==("pagenum")){
                    console.log(tempArr)
                    if(tempArr[0].includes('Ελληνικά')){
                        let temp_checked=document.getElementById('greek');
                        temp_checked.checked=true;
                    } else if(tempArr[0].includes('foreign')){
                        let temp_checked=document.getElementById('foreign');
                        temp_checked.checked=true;
                    } else{
                        tempArr[0]=tempArr[0].slice(0,tempArr[0].indexOf('|'));
                        let temp_checked=document.getElementById(tempArr[0]);
                        temp_checked.checked=true;
                    }
                }
            }
        })
    }
}

// ---------------------------------new userForm-----------------------------------

const newUserForm = document.querySelector("#newUserForm");

document.querySelector("#newUserForm button").addEventListener('click', ()=>{
    let toSent = {}
    let name=document.querySelector("#name");
    let email=document.querySelector("#email2");
    let user=document.querySelector("#usernamel2");
    let dob=document.querySelector("#dob");
    let pass=document.querySelector("#password2");
    let newsletter=document.querySelector("#agreement");
    let flag=true;
    [name,email,user,dob,pass,newsletter].forEach( item => {
        if(!item.checkValidity()){
            flag=false;
        }
    })
    if(flag){
        toSent.name=name.value;
        toSent.email=email.value;
        toSent.user=user.value;
        toSent.dob=dob.value;
        toSent.pass=pass.value;
        toSent.newsletter=newsletter.value;
        let toSentString =JSON.stringify(toSent)
        fetch('/newuser',
        {
            method: 'POST',
            body: toSentString,
            headers: {'Content-Type': 'text/html'}
        }).then(response => response.text()).then(res => {
            if(res=='ok'){
                window.location.reload(true);
            } else{
                document.querySelector("#all-input-error").setAttribute('class','display-none');
                document.querySelector("#email-exist-error").removeAttribute('class');
            }
        })
    }else{
        document.querySelector("#all-input-error").removeAttribute('class');
    }
})


document.querySelector("#loginbtn").addEventListener('click', ()=>{
    let toSent = {}
    let email=document.querySelector("#email");
    let pass=document.querySelector("#password");
    let flag=true;
    [email,pass].forEach( item => {
        if(!item.checkValidity()){
            flag=false;
        }
    })
    if(flag){
        toSent.email=email.value;
        toSent.pass=pass.value;
        let toSentString =JSON.stringify(toSent)
        fetch('/login', {
            method: 'POST',
            body: toSentString,
            headers: {'Content-Type': 'text/html'}
        }).then(response => response.text()).then(res => {
            if(res=='ok'){
                window.location.reload(true);
            } else{
                document.querySelector("#all-input-login-error").setAttribute('class','display-none');
                document.querySelector("#wrong-data").removeAttribute('class');
            }
        })
    }else{
        document.querySelector("#all-input-login-error").removeAttribute('class');
        document.querySelector("#wrong-data").setAttribute('class','display-none');
    }
})



//-----------------------------------------pagenumbers---------------------------------------//
let curPageNum;
let uri_decNum = decodeURIComponent(window.location.href);

if(!uri_decNum.includes("pagenum")){
    curPageNum=1;
    if(uri_decNum.includes("?")){
        uri_decNum = uri_decNum +"&pagenum="
    }
    else{
        uri_decNum = uri_decNum +"?pagenum="
    }
}else{
    uri_decNumSliced=uri_decNum.slice(uri_decNum.indexOf('?')+1)
    uri_decNumSliced=uri_decNumSliced.split('&');
    let queryurl=[];
    uri_decNumSliced.forEach( item => {
        console.log(item)
        if(item.includes('pagenum')){
            let tempArr =item.split('=');
            curPageNum = tempArr[1];
        }else{
            queryurl.push(item);
        }
    })  
    let txt;
    if(queryurl.length==0){
        txt="pagenum=";
    }
    else{
        txt="&pagenum=";
    }
    uri_decNum=uri_decNum.slice(0,uri_decNum.indexOf('?')+1)+queryurl.join('&') + txt;
}

let itemNum;
document.querySelectorAll(".page-numbers div").forEach( item => {
    let pageToFetch;
    if( item.innerHTML.includes('lt;')){
        if(curPageNum == 1){
            pageToFetch=1;
        } else{
            pageToFetch=parseInt(curPageNum) -1;
        }
    }else if( item.innerHTML.includes('gt;')){
        pageToFetch =parseInt(curPageNum) + 1
    } else{
        pageToFetch=item.innerHTML.substring(1);
        itemNum=parseInt(pageToFetch);
        if(parseInt(curPageNum) == itemNum){
            item.setAttribute('class','curPage');
        }
    }
    if(!(itemNum == parseInt(curPageNum) && item.innerHTML.includes('gt;')) && !(parseInt(curPageNum)==1 && item.innerHTML.includes('lt;'))){
        item.addEventListener('click', () => { window.location.href=uri_decNum + pageToFetch.toString()})
    }
})


// ----------------------------------------- filters btn mobile----------------------------------

if(document.querySelector(".mobile-filters-btn")){
    document.querySelector(".mobile-filters-btn").addEventListener('click',() => {
        const mobileFilters =document.querySelector(".mobile-filters");
        if(mobileFilters.getAttribute('class') == "mobile-filters"){
            mobileFilters.setAttribute('class',"mobile-filters activate-filters")
        }else{
            mobileFilters.setAttribute('class',"mobile-filters")
        }
    })
}