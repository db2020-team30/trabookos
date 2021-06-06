const btnNewAdmin = document.querySelector('#NewAdmin');
const NewAdmForm = document.querySelector('.new-admin');
const btnChangePass = document.querySelector('#ChangePass');
const NewPassForm = document.querySelector('.new-pass');
const CloseBtnAdm=document.querySelector('#btnCloseAdmin');
const CloseBtnPass=document.querySelector('#btnClosePass');

if (btnNewAdmin) {
    btnNewAdmin.addEventListener('click',function(){
        if(NewAdmForm.getAttribute('class')=='PopUpForm new-admin'){
            NewAdmForm.setAttribute('class','PopUpForm new-admin not-displayed');
        } else{
            NewAdmForm.setAttribute('class','PopUpForm new-admin');
            NewPassForm.setAttribute('class','PopUpForm new-pass not-displayed');
        }
    });

    btnChangePass.addEventListener('click',function(){
        if(NewPassForm.getAttribute('class')=='PopUpForm new-pass'){
            NewPassForm.setAttribute('class','PopUpForm new-admin not-displayed');
        }else{
            NewPassForm.setAttribute('class','PopUpForm new-pass');
            NewAdmForm.setAttribute('class','PopUpForm new-admin not-displayed');
        }
    });

    CloseBtnAdm.addEventListener('click',function(){
        NewAdmForm.setAttribute('class','PopUpForm new-admin not-displayed');
    });

    CloseBtnPass.addEventListener('click',function(){
        NewPassForm.setAttribute('class','PopUpForm new-pass not-displayed');
    });

    window.onclick = function(event) {
        if (event.target == NewAdmForm) {
            NewAdmForm.setAttribute('class','PopUpForm not-displayed');
        }
        if (event.target == NewPassForm) {
            NewPassForm.setAttribute('class','PopUpForm not-displayed');
        }
    };


}