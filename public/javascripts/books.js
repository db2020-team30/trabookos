const btnNewBook = document.querySelector('#btnNew-Book');
const NewBookForm = document.querySelector('.PopUpForm');
const CloseBtn=document.querySelector('.close-btn');
const ebookbtns=document.querySelectorAll('.ebookbtn');
const entypo=document.querySelector('.book-properties');
const EbookSpan=document.querySelector('#Ebookbtns span');

ebookbtns[0].addEventListener('click',function(){
    if(entypo.getAttribute('class')=='book-properties'){
        entypo.setAttribute('class','book-properties not-displayed');
        EbookSpan.innerHTML='Ebook';
    }
    else{
        entypo.setAttribute('class','book-properties');
        EbookSpan.innerHTML='Έντυπο';
    }
});

ebookbtns[1].addEventListener('click',function(){
    if(entypo.getAttribute('class')=='book-properties'){
        entypo.setAttribute('class','book-properties not-displayed');
        EbookSpan.innerHTML='Ebook';
    }
    else{
        entypo.setAttribute('class','book-properties');
        EbookSpan.innerHTML='Έντυπο';
    }
});

btnNewBook.addEventListener('click',function(){
    if(NewBookForm.getAttribute('class')=='PopUpForm not-displayed'){
        NewBookForm.setAttribute('class','PopUpForm');
    }else{
        NewBookForm.setAttribute('class','PopUpForm not-displayed');
    }
});

CloseBtn.addEventListener('click',function(){
    NewBookForm.setAttribute('class','PopUpForm not-displayed');
});

window.onclick = function(event) {
    if (event.target == NewBookForm) {
        NewBookForm.setAttribute('class','PopUpForm not-displayed');
    }
};