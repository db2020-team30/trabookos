const btnMoreInfo = document.querySelector('#more-info');
const MoreInfo = document.querySelector('.book-tables');
const btnLessInfo = document.querySelector('#less-info');

btnMoreInfo.addEventListener('click',function(){
    btnMoreInfo.setAttribute('class','not-displayed');
    MoreInfo.setAttribute('class','book-tables');
});

btnLessInfo.addEventListener('click',function(){
    btnMoreInfo.removeAttribute('class');
    MoreInfo.setAttribute('class','book-tables not-displayed');
});