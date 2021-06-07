'use strict';

const express = require('express');
const router = express.Router();


const controller = require('../controller/book-controller');

router.get('/', controller.renderHome);
router.get(/filters$/, controller.filters);
router.get('/news', controller.renderNews);
router.get('/house', controller.renderHouse);
router.get('/writers', controller.renderWriters);
router.get(['/newbooks', '/bestsellers', '/sales', '/ebooks', '/awarded', '/greek-lit', 
    '/world-lit', '/children', '/science', '/comics'], controller.renderFindBooks);
router.get('/book/:bookId', controller.renderBookDetails);
router.get('/writer/:writerId', controller.renderFindWriter);
router.get('/search', controller.renderSearch);
router.get(['/novel', '/pezografia', '/poetry', '/bios', '/fairytales', '/children-books', '/teen-books', '/scientific', '/hobbies'], controller.renderFindBooks);
router.post('/login', controller.logIn);
router.get('/logout',CheckLogIn, controller.logout);
router.get('/favourites', CheckLogIn, controller.renderFindBooks);
router.post('/newuser', controller.newUser);
router.post('/newPost',CheckLogIn , CheckAdmin, controller.newPost);
router.post('/newAdmin',CheckLogIn , CheckAdmin, controller.newAdmin);
router.get("/change-favourites/:bookId/:checked", CheckLogIn, controller.changeFavourites);
router.get('/admin',CheckLogIn , CheckAdmin, controller.renderAdmin);
router.get('/posts',CheckLogIn , CheckAdmin, controller.renderAdminPosts);
router.get('/admins',CheckLogIn , CheckAdmin, controller.renderAdminUsers);
router.get('/books',CheckLogIn , CheckAdmin, controller.renderAdminBooks);
router.get('/banners',CheckLogIn , CheckAdmin, controller.renderAdmin);
router.get('/stats',CheckLogIn , CheckAdmin, controller.renderAdmin);
router.post('/newAdminPassword',CheckLogIn , CheckAdmin, controller.renderNewAdminPassword);
router.get('/delete/:postId',CheckLogIn , CheckAdmin, controller.renderPostDelete);
router.get('/register', controller.renderRegister);
router.get('/newOrder', controller.newOrder);


function CheckLogIn (req,res,next,) {
    if(req.session.MyTrabookosSession == undefined) {
        console.log('not-logged-in')
        res.redirect("/");
    } 
    else {
        console.log('logged-in')
        next()
    }
}

function CheckAdmin (req,res,next,) {
    if(req.session.MyTrabookosSessionAdminSide == undefined) {
        console.log('not-logged-in')
        res.redirect("/");
    } 
    else {
        console.log('logged-in')
        next()
    }
}

module.exports = router;
