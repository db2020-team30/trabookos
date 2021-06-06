const btnNewPost = document.querySelector('#btnNew-post');
const NewPostForm = document.querySelector('.PopUpForm');
const CloseBtn = document.querySelector('.close-btn');
const deleteBtns = document.querySelectorAll('.delete');

if (btnNewPost) {    
    btnNewPost.addEventListener('click',function(){
        if(NewPostForm.getAttribute('class')=='PopUpForm not-displayed'){
            NewPostForm.setAttribute('class','PopUpForm');
        }else{
            NewPostForm.setAttribute('class','PopUpForm not-displayed');
        }
    });

    CloseBtn.addEventListener('click',function(){
        NewPostForm.setAttribute('class','PopUpForm not-displayed');
    });

    window.onclick = function(event) {
        if (event.target == NewPostForm) {
            NewPostForm.setAttribute('class','PopUpForm not-displayed');
        }
    };
    deleteBtns.forEach(item => {
        let id = item.getAttribute("id").slice(7);
        item.addEventListener("click", () => {fetch("/delete/" + id)})
    });
}