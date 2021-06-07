'use strict';
/** You can define other models as well, e.g. postgres */
const model = require('../model/model.js');
var path = require('path');

var dir= path.join(__dirname,'public');
const dictPath = {"/novel":"Μυθιστόρημα - Νουβέλα", "/pezografia": "Πεζογραφία - Δοκίμια", "/poetry":"Ποίηση", "/bios":"Βιογραφίες - Μαρτυρίες", "/fairytales": "Παραμύθια - Εικονογραφημένα", "/children-books": "Παιδικά βιβλία", "/teen-books": "Εφηβικά - Νεανικά", "/scientific": "Επιστημονικά βιβλία", "/hobbies": "Πρακτικοί Οδηγοί - Χόμπι"};
const dictTabName = {"/sales": "Προσφορές", "/ebooks": "E-books", "/bestsellers": "Best Sellers", "/newbooks": "Νέες Κυκλοφορίες", "/awarded": "Βιβλία με βραβεύσεις", "/greek-lit": "Ελληνική Λογοτεχνία", "/world-lit": "Παγκόσμια Λογοτεχνία", "/children": "Παιδικά - Νεανικά", "/favourites": "Λίστα Αγαπημένων", "/science": "Επιστήμη - Χόμπι", "/comics": "Κόμιξ"}


//Τα βιβλία θα πηγαίνουν στον client σε 20άδες, άρα φτιάχνουμε τις αριθμήσεις των σελίδων με την bookPagesNumbers
//bookLength: το μέγεθος του πίνακα των συνολικών βιβλίων που γύρισε η βάση δεδομένων
function bookPagesNumbers(bookLength) {
    let pageNumbers = [];
    for (let i=0; i<bookLength/20; i++) {
        pageNumbers[i] = i+1;
    }
    return pageNumbers;
}

function limitResults(books,pagenum){
    let end = pagenum * 20;
    let booksToSent;
    if(end>books.length){
        end=books.length;
    }
    let start = end;
    while( start % 20){
        start=start-1;
    }
    if(start==end){
        start=start-20;
    }
    booksToSent = books.splice(start,end);
    return booksToSent;
}

exports.renderHome = (req, res) => {
    console.log("renderHome");
    model.findBooks("/newbooks", (err, book_rows) => {
        if (err) {
          res.send(err);
        } 
        else {
            if (req.session.MyTrabookosSession) {
                model.findFavourites(req.session.MyTrabookosSession, (err, favArray) => {
                    if (err) {
                        res.send(err);
                    } 
                    else {
                        let favIds = [];
                        favArray.forEach(item => favIds.push(item.book_id));
                        book_rows.forEach(item => {
                            if (favIds.includes(item.book_id)) {
                                item.fav = "liked";
                            }
                        })
                        model.findBooks("/bestsellers", (err, bestsellersRows) => {
                            if (err) {
                              res.send(err);
                            } 
                            else {
                                bestsellersRows.forEach(item => {
                                    if (favIds.includes(item.book_id)) {
                                        item.fav = "liked";
                                    }
                                })
                                model.findPosts((err, postRows) => {
                                    if (err) {
                                        res.send(err)
                                    }
                                    else {
                                        let temp;
                                        postRows.forEach(item => {
                                            temp = item.post_text.split(" ");
                                            if (temp.length > 65) {
                                                //Κόβουμε τον πίνακα ώστε να μην βγαίνουν μεγάλα άρθρα στην αρχική
                                                temp = temp.splice(0, 65).join(" ");
                                                item.post_text = temp;
                                                item.shortened = true;
                                            }
                                        });
                                        res.render('index', {user: req.session.MyTrabookosSession, newBooks: book_rows.slice(0, 12), bestsellers: bestsellersRows.slice(0, 12), articles: postRows});
                                    }
                                }, 2);
                            }
                        })
                    }
                })
            }
            else {
                model.findBooks("/bestsellers", (err, bestsellersRows) => {
                    if (err) {
                      res.send(err);
                    } 
                    else {
                        model.findPosts((err, postRows) => {
                            if (err) {
                                res.send(err)
                            }
                            else {
                                let temp;
                                postRows.forEach(item => {
                                    temp = item.post_text.split(" ");
                                    if (temp.length > 65) {
                                        //Κόβουμε τον πίνακα ώστε να μην βγαίνουν μεγάλα άρθρα στην αρχική
                                        temp = temp.splice(0, 65).join(" ");
                                        item.post_text = temp;
                                        item.shortened = true;
                                    }
                                });
                                res.render('index', {newBooks: book_rows.slice(0, 12), bestsellers: bestsellersRows.slice(0, 12), articles: postRows});
                            }
                        }, 2);
                    }
                })
            }
        }
    });
}

exports.renderNews = (req, res) => {
    console.log("renderNews");
    model.findPosts((err ,ans) => {
        if(err){
            res.send(err);
        } else {
            res.render('news', {layout : 'second-layout', user: req.session.MyTrabookosSession, tabImage : "/images/news-background.jpg", pageName: "Νέα - Εκδηλώσεις", articles: ans});
        }
    })
}

exports.renderHouse = (req, res) => {
    console.log("renderHouse");
    res.render('house', {layout : 'second-layout', user: req.session.MyTrabookosSession, tabImage: "/images/house-background.jpg"});
}

exports.renderWriters = (req, res) => {

    model.findAllWriters((err, writers_rows) => {
        res.render('info-container',{layout : 'second-layout', user: req.session.MyTrabookosSession, writersArray: writers_rows, tabImage : "/images/writers-background.jpg", pageName: "Συγγραφείς"});
    })
}

exports.renderFindBooks = (req, res) => {
    let option = req.originalUrl;
    model.findBooks(option,(err, book_rows) => {
        if (err) {
          res.send(err);
        } 
        else {

            let image, page;
            let url=req.baseUrl;
            if (req.baseUrl) { 
                if(req.baseUrl.includes("?")){
                    url=req.baseUrl.slice(0,req.baseUrl.indexOf("?"))
                }
                image = "/images" + url + "-background.jpg";
                page = url;
            }
            else {
                if(req.url.includes("?")){
                    url=req.url.slice(0,req.url.indexOf("?"));
                }else{
                    url=req.url;
                }
                image = "/images" + url + "-background.jpg";
                page =url;
            }

            if (book_rows.length !== 0) {
                model.findFilters((err, subjArray, genreArray, seriesArray, ageArray, greek, foreign, categoryArray, desimoArray) => {
                    if (err) {
                        res.send(err);
                    } 
                    else {
                        if (req.session.MyTrabookosSession) {
                            model.findFavourites(req.session.MyTrabookosSession, (err, favArray) => {
                                if (err) {
                                    res.send(err);
                                } 
                                else {
                                    let favIds = [];
                                    favArray.forEach(item => favIds.push(item.book_id));
                                    book_rows.forEach(item => {
                                        if (favIds.includes(item.book_id)) {
                                            item.fav = "liked";
                                        }
                                    })
                                    let pagenums = bookPagesNumbers(book_rows.length);
                                    if(book_rows.length !== 0){
                                        if(req.query.pagenum){
                                            book_rows=limitResults(book_rows,req.query.pagenum);
                                    }else{
                                        book_rows=limitResults(book_rows,1);
                                        }
                                    }
                                    res.render('info-container', {layout : 'second-layout',
                                        tabImage: image, pageName: dictTabName[page], user: req.session.MyTrabookosSession, 
                                        books: book_rows, pageNo: pagenums, subjects: subjArray, genres: genreArray, 
                                        series: seriesArray, ages: ageArray, greek_lit: greek, world_lit: foreign, 
                                        categories: categoryArray, desimo: desimoArray, baseUrl: page, pageUrl: req.url, category: dictPath[req.url]
                                    });
                                }
                            })    
                        }
                        //Όταν έχουμε βιβλία, αλλά δεν είναι συνδεδεμένος ο χρήστης:
                        else {
                            let pagenums = bookPagesNumbers(book_rows.length);
                            if(book_rows.length !== 0){
                                if(req.query.pagenum){
                                    book_rows=limitResults(book_rows,req.query.pagenum);
                                }else{
                                    book_rows=limitResults(book_rows,1);
                                    }
                                }
                            res.render('info-container', {layout : 'second-layout',
                                tabImage: image, pageName: dictTabName[page], user: req.session.MyTrabookosSession, 
                                books: book_rows, pageNo: pagenums, subjects: subjArray, genres: genreArray, 
                                series: seriesArray, ages: ageArray, greek_lit: greek, world_lit: foreign, 
                                categories: categoryArray, desimo: desimoArray, baseUrl: page, pageUrl: req.url, category: dictPath[req.url]
                            });
                        }
                    }
                }, book_rows, req.session.MyTrabookosSession)
            } 

            //Όταν δεν βρεθούν βιβλία:
            else {
                if (err) {
                    res.send(err);
                } 
                else {
                    res.render('info-container', {layout : 'second-layout', 
                        tabImage: image, pageName: dictTabName[page], 
                        baseUrl: page, pageUrl: req.url, category: dictPath[req.url], user: req.session.MyTrabookosSession
                    });   
                }
            }

        }
    }, [], req.session.MyTrabookosSession);
}

exports.renderBookDetails = (req, res) => {

    model.findBook(req.params.bookId, (err, details, toPrint) => {
        if (err) {
          res.send(err);
        } 
        else {
            let basePage;
            if (details.original_lang == "Ελληνική Λογοτεχνία") {
                basePage = "Ελληνική Λογοτεχνία";
            }
            else {
                basePage = "Παγκόσμια Λογοτεχνία";
            }
            res.render('book-details', {layout : 'second-layout', user: req.session.MyTrabookosSession, allDetails: details, infoToPrint: toPrint, 
                category: details.category, pageName: basePage, specificItem: details.title});
        }
    });
}

exports.renderFindWriter = (req, res) => {

    model.findWriter(req.params.writerId, (err, details) => {
        if (err) {
          res.send(err);
        } 
        else {
            let bookIdArray=[];
            details.forEach( item => { 
                bookIdArray.push(item.book_id);
            })
            model.findBooks('writer', (err, book_rows) => {
                if (err) {
                    res.send(err);
                } 
                else {
                    res.render('solo-writer', {layout : 'second-layout', user: req.session.MyTrabookosSession, writerDetails: details[0], books: book_rows, category:"Συγγραφείς", specificItem: details[0].name, filtersOff: "1"});
                }  
            }, bookIdArray);
        }
    })
}


exports.renderSearch = (req, res) => {

    let searchVal = req.query.search
    model.searchIds(searchVal, (err, rows) => {
        if (err) {
            res.send(err);
        } 
        else {
            let bookIds = [];
            rows.forEach( item => {
                bookIds.push(item.book_id);
            })
            model.findBooks('search', (err, book_rows) => {
                if (err) {
                    res.send(err);
                } 
                else {
                    model.findAllWriters((err, writers) => {
                        if (err) {
                            res.send(err);
                        } 
                        else {
                            //Αν η βάση γυρίσει βιβλία:
                            if (book_rows.length !== 0){
                                model.findFilters((err, subjArray, genreArray, seriesArray, ageArray, greek, foreign, categoryArray, desimoArray) => {
                                    if (err) {
                                        res.send(err);
                                    } 
                                    else {
                                        let pagenums = bookPagesNumbers(book_rows.length);
                                        if(book_rows.length !== 0){
                                            if(req.query.pagenum){
                                                book_rows=limitResults(book_rows,req.query.pagenum);
                                            }else{
                                                book_rows=limitResults(book_rows,1);
                                            }
                                        }
                                        res.render('info-container', {layout : 'second-layout', user: req.session.MyTrabookosSession, writersArray: writers, books: book_rows, pageNo: pagenums, subjects: subjArray, genres: genreArray, series: seriesArray, ages: ageArray, greek_lit: greek, world_lit: foreign, categories: categoryArray, desimo: desimoArray, pageName: "Αναζήτηση"});
                                    }
                                }, book_rows)
                            }
                            //Αν δεν υπάρχουν τα βιβλία που ζητήθηκαν:
                            else {
                                res.render('info-container', {layout : 'second-layout', user: req.session.MyTrabookosSession, writersArray: writers, pageName: "Αναζήτηση"});
                            }
                        }
                    }, "WHERE name LIKE '%" + searchVal + "%'")
                }
            }, bookIds)
        }
    })
}

exports.logIn = (req, res) => {
    req.on('data', (chunk) => {
        chunk=chunk.toString();
        let reqBodyJson=JSON.parse(chunk)
        model.findVisitor(reqBodyJson.email, reqBodyJson.pass, (err,userName,admin) =>{
            if(err) {
                console.log(err);
                res.redirect('/');
            } else {
                if( userName == null){
                    res.redirect('/');
                } else {
                    req.session.MyTrabookosSession = userName;
                    if(admin == 'admin'){
                        req.session.MyTrabookosSessionAdminSide = admin;
                    }
                    res.send('ok');
                }
            }
        })
    })
}

exports.logout = (req, res) => {
    if(req.session.MyTrabookosSession) { 
        req.session.destroy((err) =>    {
            if(err){
                console.log('failedToDestroy')
            }else {
                console.log('destroyed');
            }
        });
    }
    res.redirect('/')
}

exports.newUser = (req, res) => {
    model.createNewUser(req.body, (err , ans) => {
        if (err){
            console.log('failedCreateNewUser');
            res.send(err);
        } else {
            res.send('ok');
        }
    })
}

exports.changeFavourites = (req, res) => {
    if (req.params.checked == "true") {
        model.addToFavourites(req.params.bookId, req.session.MyTrabookosSession, (err) => {
            if (err) {
                console.log('failedToFavourite');
                res.send(err);
            }
            else {
                console.log('Added to favourites');
                res.send("ok");
            }
        })
    }
    else {
        model.removeFavourite(req.params.bookId, req.session.MyTrabookosSession, (err) => {
            if (err) {
                console.log('failedToDeleteFavourite');
                res.send(err);
            }
            else {
                console.log('Removed from favourites');
                res.send("ok");
            }
        })
    }
}

exports.newPost = (req, res) => {
    model.createNewPost(req.body, (err , ans) => {
        if(err){
            console.log('New Post Failed');
            res.send(err);
        } 
        else {
            res.redirect("/admin/posts");
        }
    })
}

exports.renderAdmin = (req, res) => {
    res.redirect("/posts");
}

exports.renderAdminPosts = (req, res) => {
    model.findPosts((err ,ans) => {
        if(err){
            console.log('findPosts');
            res.send(err);
        } else {
            res.render('admin-posts', {layout : 'admin-layout', user: req.session.MyTrabookosSession, posts: ans, adminPosts: 1});
        }
    })
}

exports.renderPostDelete = (req, res) => {
    model.deletePost(req.params.postId, (err) => {
        if(err) {
            console.log('deletePost');
            res.send(err);
        } else {
            res.redirect("/posts");
        }
    })
}

exports.renderAdminUsers = (req, res) => {
    model.findAdminUsers((err ,ans) => {
        if(err){
            console.log('findUsers');
            res.send(err);
        } else {
            res.render('admin-users', {layout : 'admin-layout', user: req.session.MyTrabookosSession, admins: ans, adminUsers: 1});
        }
    })
}

exports.renderAdminBooks = (req, res) => {
    model.findAdminBooks((err ,ans) => {
        if(err) {
            res.send(err);
        } else {
            res.render('admin-books', {layout : 'admin-layout', user: req.session.MyTrabookosSession, books: ans, adminBooks: 1});
        }
    })
}

exports.newAdmin = (req, res) => {
    model.createNewAdmin(req.body, (err , ans) => {
        if(err){
            console.log('New Admin Failed');
            res.send(err);
        } 
        else {
            res.redirect("/admin/admins");
        }
    })
}

exports.filters = (req, res) => {
    let option =req.originalUrl.slice(0,req.originalUrl.indexOf('?'));
    option=option.replace("/filters","");
    let optionArr = option.split('/')

    //Αν η αναζήτηση γίνεται μέσω της μπάρας search:
    if(option.includes('search')){
        let searchVal = req.query.search
        model.searchIds(searchVal, (err, rows) => {
            if (err) {
                console.log(err);
                res.send(err);
            } 
            else {
                let bookIds = [];
                rows.forEach( item => {
                    bookIds.push(item.book_id);
                })
                model.findBooks('search', (err, book_rows) => {
                    if (err) {
                        console.log(err);
                        res.send(err);
                    } else{
                        bookIds = [];
                        book_rows.forEach( item => {
                            bookIds.push(item.book_id);
                        })
                        searchfilters(book_rows,req.query,(err, book_rows) =>{
                            if(err){
                                console.log(err);
                                res.send(err);
                            }
                            else{
                                bookIds = [];
                                book_rows.forEach( item => {
                                    bookIds.push(item.book_id);
                                })
                                model.findFilters((err, subjArray, genreArray, seriesArray, ageArray, greek, foreign, categoryArray, desimoArray) => {
                                    if (err) {
                                        console.log(err);
                                        res.send(err);
                                    } 
                                    else {
                                        //Όταν ο χρήστης είναι συνδεδεμένος, φαίνεται ποια βιβλία έχει προσθέσει στη wishlist:
                                        if (req.session.MyTrabookosSession) {
                                            model.findFavourites(req.session.MyTrabookosSession, (err, favArray) => {
                                                if (err) {
                                                    console.log(err);
                                                    res.send(err);
                                                } 
                                                else {
                                                    let favIds = [];
                                                    favArray.forEach(item => favIds.push(item.book_id));
                                                    book_rows.forEach(item => {
                                                        if (favIds.includes(item.book_id)) {
                                                            item.fav = "liked";
                                                        }
                                                    })
                                                    let pagenums = bookPagesNumbers(book_rows.length);
                                                    if(book_rows.length !== 0){
                                                        if(req.query.pagenum){
                                                            book_rows=limitResults(book_rows,req.query.pagenum);
                                                    }else{
                                                        book_rows=limitResults(book_rows,1);
                                                        }
                                                    }
                                                    res.render('info-container', {layout : 'second-layout', user: req.session.MyTrabookosSession,  books: book_rows, pageNo: pagenums, subjects: subjArray, genres: genreArray, series: seriesArray, ages: ageArray, greek_lit: greek, world_lit: foreign, categories: categoryArray, desimo: desimoArray, pageName: "Αναζήτηση"});
                                                }
                                            })
                                        //Όταν δεν είναι συνδεδεμένος η παραπάνω διεργασία δεν χρειάζεται:
                                        } else{
                                            let pagenums = bookPagesNumbers(book_rows.length);
                                            if(book_rows.length !== 0){
                                            if(req.query.pagenum){
                                                book_rows=limitResults(book_rows,req.query.pagenum);
                                            }else{
                                                book_rows=limitResults(book_rows,1);
                                            }
                                        }
                                            res.render('info-container', {layout : 'second-layout', user: req.session.MyTrabookosSession,  books: book_rows, pageNo: pagenums, subjects: subjArray, genres: genreArray, series: seriesArray, ages: ageArray, greek_lit: greek, world_lit: foreign, categories: categoryArray, desimo: desimoArray, pageName: "Αναζήτηση"});
                                        }
                                    }
                                },book_rows)
                            }
                        })
                    }
                }, bookIds, req.session.MyTrabookosSession)
            }
        })
    }                 
    //Όταν πατιέται κάποιο συγκεκριμένο tab (πχ Ελληνική Λογοτεχνία), αλλά πατηθεί και κάποιο φίλτρο:
    else {
        model.findBooks(option,(err, books) => {
            if (err){
                console.log(err);
                res.send(err);
            }
            else{
                let image, page;
                image = "/images/" + optionArr[1] + "-background.jpg";
                page = '/' + optionArr[1];
                searchfilters(books,req.query,(err, book_rows) =>{
                    if(err){
                        console.log(err);
                        res.send(err);
                    }
                    else{
                        let bookIds = [];
                        book_rows.forEach( item => {
                            bookIds.push(item.book_id);
                        })
                        model.findFilters((err, subjArray, genreArray, seriesArray, ageArray, greek, foreign, categoryArray, desimoArray) => {
                            if (err) {
                                console.log(err);
                                res.send(err);
                            } 
                            else {
                                if (req.session.MyTrabookosSession) {
                                    model.findFavourites(req.session.MyTrabookosSession, (err, favArray) => {
                                        if (err) {
                                            console.log(err);
                                            res.send(err);
                                        } 
                                        else {
                                            let favIds = [];
                                            favArray.forEach(item => favIds.push(item.book_id));
                                            book_rows.forEach(item => {
                                                if (favIds.includes(item.book_id)) {
                                                    item.fav = "liked";
                                                }
                                            })
                                            let pagenums = bookPagesNumbers(book_rows.length);
                                            if(book_rows.length !== 0){
                                                if(req.query.pagenum){
                                                    book_rows=limitResults(book_rows,req.query.pagenum);
                                            }else{
                                                book_rows=limitResults(book_rows,1);
                                                }
                                            }

                                            res.render('info-container', {layout : 'second-layout',
                                                tabImage: image, pageName: dictTabName[page], user: req.session.MyTrabookosSession, 
                                                books: book_rows, pageNo: pagenums, subjects: subjArray, genres: genreArray, 
                                                series: seriesArray, ages: ageArray, greek_lit: greek, world_lit: foreign, 
                                                categories: categoryArray, desimo: desimoArray, baseUrl: page, pageUrl: req.url, category: dictPath[req.url]
                                            })
                                        }
                                    })
                                }
                                else{
                                    let pagenums = bookPagesNumbers(book_rows.length);
                                    if(book_rows.length !== 0){
                                        if(req.query.pagenum){
                                            book_rows=limitResults(book_rows,req.query.pagenum);
                                    }else{
                                        book_rows=limitResults(book_rows,1);
                                        }
                                    }
                                    res.render('info-container', {layout : 'second-layout',
                                        tabImage: image, pageName: dictTabName[page], user: req.session.MyTrabookosSession, 
                                        books: book_rows, pageNo: pagenums, subjects: subjArray, genres: genreArray, 
                                        series: seriesArray, ages: ageArray, greek_lit: greek, world_lit: foreign, 
                                        categories: categoryArray, desimo: desimoArray, baseUrl: page, pageUrl: req.url, category: dictPath[req.url]
                                    })
                                }
                            }
                        },book_rows)   
                    }
                })
            }
        }, [], req.session.MyTrabookosSession)
    }
}

function searchfilters(books, searchParams,callback){

    let params= Object.keys(searchParams);

    if (params.includes('search')){
        params.slice(params.indexOf('search'),1);
    }
    for(let i=0; i<params.length; i++){
        let tempArr = params[i].split('|');
        let tempJSON = {}
        tempJSON.name = tempArr[0];
        tempJSON.cat = tempArr[1];
        params[i] = tempJSON;
    }
    model.searchFilters(books, params,(err,book_rows) => {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, book_rows)
        }
    })
}

exports.renderNewAdminPassword = (req, res) => {
    model.newPassword(req.body, req.session.MyTrabookosSession, (err) => {
        if(err) {
            res.send(err);
        } else {
            res.redirect(req.url);
        }
    })
}

exports.renderRegister = (req, res) => {
    console.log("renderRegister");
    res.render('register', {layout : 'second-layout', user: req.session.MyTrabookosSession, pageName: "Ολοκλήρωση αγοράς"});
}

exports.newOrder = (req, res) => {
    console.log("newOrder");
    model.newOrder(req.MyTrabookosSession, books, (err) => {
        if(err) {
            res.send(err);
        } else {
            res.redirect(req.url);
        }
    });
}