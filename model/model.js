'use strict';
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { send } = require("process");

const db_name = path.join(__dirname, "../data",'trabookos.db');

exports.findBooks = (option, callback, bookIdArray = [], userEmail = "") => {
    let where;
    if (option.includes('/sales')){
        where = "book.sale<>0";
    }

    else if (option.includes('/ebooks')){
        where = "book.ebook = 1";
    }

    else if (option.includes('/bestsellers')){
        where = " periexei.posothta > 100 ";
    }

    else if (option.includes('/newbooks')){
        let curYear = new Date().getFullYear();
        where = "book.year LIKE '%" + curYear + "%'";
        if(new Date().getMonth()<2){
            where = where + "OR book.year LIKE '%" + (curYear-1) + "%'";
        }
    }

    else if (option.includes('/awarded')){
        where = "book.awards IS NOT Null";
    }

    else if (option == 'writer' || option == "search"){
        where = ''
        for(let i=0; i < bookIdArray.length; i++){
            if(i !== 0) {
                where = where + ' OR '
            }
            where = where + " book.book_id='"+bookIdArray[i]+"'";
        }
    }

    else if (option.includes('/greek-lit')){
        where = 'original_lang = "Ελληνικά"';
    }

    else if (option.includes('/world-lit')){
        where = 'original_lang <> "Ελληνικά"';
    }

    else if (option.includes('/children')){
        where = "(age = 'Παιδιά' OR age = 'Για νέους')";
    }

    else if (option.includes("/favourites")) {
        where = "wishlist.email = '" + userEmail + "'";
    }

    else if (option.includes("/scientific")) {
        where = "category = 'Επιστημονικό Βιβλίο'";
    }

    else if (option.includes("/hobbies")) {
        where = "category = 'Πρακτικοί Οδηγοί - Χόμπι'";
    }

    else if (option.includes("/science")) {
        where = "category = 'Επιστημονικό' OR category = 'Πρακτικοί Οδηγοί - Χόμπι'";
    }

    else if (option.includes("/comics")) {
        where = "category = 'Graphic Novel'";
    }

    //

    if (option.includes("/novel")) {
        where = where + " AND (category = 'Μυθιστόρημα' OR category = 'Νουβέλα')" 
    }

    else if (option.includes("/pezografia")) {
        where = where + " AND (category = 'Πεζογραφία' OR category = 'Δοκίμιο' OR category = 'Αφήγημα' OR category = 'Διηγήματα')" 
    }

    else if (option.includes("/poetry")) {
        where = where + " AND (category = 'Ποίηση')" 
    }

    else if (option.includes("/bios")) {
        where = where + "AND (anhkei.genre = 'Βιογραφία' OR anhkei.genre = 'Μαρτυρίες')";
    }

    else if (option.includes("/fairytales")) {
        where = where + " AND (category = 'Παραμύθι')" 
    }

    else if (option.includes("/children-books")) {
        where = where + " AND age = 'Παιδιά'" 
    }

    else if (option.includes("/teen-books")) {
        where = where + " AND age = 'Για νέους'" 
    }
    
    if ((option == 'writer' || option == "search") && bookIdArray.length == 0) {
        callback(null, []);
    }
    else {
        let sql;
        
        if (option.includes("/bestsellers")) {
            sql = "SELECT book.book_id,book.title,book.price,book.image,writer.name,writer.writer_id,sale FROM periexei JOIN (book JOIN (grafei JOIN writer on grafei.writer_id=writer.writer_id) on book.book_id=grafei.book_id) on periexei.book_id=book.book_id WHERE " + where +" ORDER BY book.book_id DESC";
        }
        else if (option.includes("/bios")) {
            sql ="SELECT book.book_id,book.title,book.price,book.image,writer.name,writer.writer_id,sale FROM anhkei JOIN (book JOIN (grafei JOIN writer on grafei.writer_id=writer.writer_id) on book.book_id=grafei.book_id) on anhkei.book_id=book.book_id WHERE "+ where +" ORDER BY book.book_id DESC";
        }
        else if (option.includes("/favourites")) {
            sql ="SELECT book.book_id,book.title,book.price,book.image,writer.name,writer.writer_id,sale FROM wishlist JOIN (book JOIN (grafei JOIN writer on grafei.writer_id=writer.writer_id) on book.book_id=grafei.book_id) on wishlist.book_id=book.book_id WHERE "+ where +" ORDER BY book.book_id DESC";
        }
        else {
            sql ="SELECT book.book_id,book.title,book.price,book.image,writer.name,writer.writer_id,sale FROM book JOIN (grafei JOIN writer on grafei.writer_id=writer.writer_id) on book.book_id=grafei.book_id WHERE "+ where +" ORDER BY book.book_id DESC";
        }
        

        const db = new sqlite3.Database(db_name);
        db.all(sql, (err, rows) => {
            db.close();
            if (err) {
                console.log(err);
                callback(err, null)
            }
            else {
                let toSentArray = [];
                let index = 0;
                for(let i=0; i < rows.length; i++){
                    let writerJSON = {}
                    writerJSON.id = rows[i]['writer_id:1'];
                    writerJSON.name = rows[i].name;
                    if((rows[index].book_id == rows[i].book_id) && i !== 0){
                        toSentArray[toSentArray.length - 1].writers.push(writerJSON);
                    }
                    else{
                        rows[i].writers = [];
                        rows[i].writers.push(writerJSON);
                        if(rows[i].sale !== 0){
                            rows[i].realPrice = (rows[i].price * (1 - (rows[i].sale/100))).toFixed(2); 
                        }
                        toSentArray.push(rows[i]);
                    }
                }
                callback(null, toSentArray);
            }
        });
    }
}

exports.findBook = (bookId,callback) => {
    let sql ="SELECT * FROM (book JOIN (grafei JOIN writer on grafei.writer_id=writer.writer_id) on book.book_id=grafei.book_id) WHERE book.book_id=?";
    let db = new sqlite3.Database(db_name);
    db.all(sql,[bookId], (err, rows) => {
        db.close();
        if (err) {
            callback(err, null)
        }
        else {
            let writersNameArray = [];
            let writersId = [];
            let writersArray = [];
            let writerJSON = {};
            rows.forEach(item => {
               if (!writersId.includes(item.writer_id)) {
                writersNameArray.push(item.name);
                   writersId.push(item.writer_id);
               } 
            });
            let details = rows[0];
            for(let i = 0; i < writersId.length; i++){
                writerJSON.id=writersId[i];
                writerJSON.name=writersNameArray[i]
                writersArray.push(writerJSON)
            }
            details.writers = writersArray;
            sql ="SELECT * FROM (book JOIN (exei JOIN subject on exei.subj=subject.subj) on book.book_id=exei.book_id) WHERE book.book_id=?";
            db = new sqlite3.Database(db_name);
            db.all(sql,[bookId], (err, result) => {
                db.close();
                if (err) {
                    callback(err, null)
                }
                else {
                    let subjArray = [];
                    result.forEach(item => {
                        if (!subjArray.includes(item.subj)) {
                            subjArray.push(item.subj)
                        } 
                    });
                    details.Subjects = subjArray; 
                    sql ="SELECT * FROM (book JOIN (anhkei JOIN genre on anhkei.genre=genre.genre) on book.book_id=anhkei.book_id) WHERE book.book_id=?";
                    db = new sqlite3.Database(db_name);
                    db.all(sql,[bookId], (err, genreData) => {
                        db.close();
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            let genreArray = [];
                            genreData.forEach(item => {
                                if (!genreArray.includes(item.genre)) {
                                    genreArray.push(item.genre)
                                } 
                            });
                            details.Genres = genreArray; 
                            details.name = null;
                            details.bio = null;
                            details.writer_id = null;
                            //Μεταφράζουμε για να είναι έτοιμο για εκτύπωση (το λεξικό είναι στη γραμμή 5)
                            let toPrint = {};
                            toPrint['Κωδικός'] = details.book_id;
                            toPrint['Ξένος Τίτλος'] = details.foreign_title;
                            toPrint['ISBN'] = details.ISBN;
                            toPrint['Γλώσσα'] = details.lang;
                            toPrint['Γλώσσα πρωτοτύπου'] = details.original_lang;
                            toPrint['Λογοτεχνική σειρά'] = details.series;
                            toPrint['Αριθμός'] = details.no_of_series;
                            toPrint['Σελίδες'] = details.pages;
                            toPrint['Έκδοση'] = details.ekdosi;
                            toPrint['Έτος έκδοσης'] = details.year;
                            toPrint['Ηλικιακή ομάδα'] = details.age;
                            toPrint['Κατηγορία'] = details.category;
                            toPrint['Βραβεία'] = details.awards;
                            toPrint['Βάρος'] = details.weight;
                            toPrint['Δέσιμο'] = details.desimo; 
                            toPrint['Διαστάσεις'] = details.dimentions;
                            toPrint['Εικονογράφηση'] = details.illustrator;
                            toPrint['Επιμέλεια'] = details.epimeleia;
                            toPrint['Μεταφραστής'] = details.translator;

                            if(details.sale !== 0){
                                details.realPrice = (details.price * (1 - (details.sale/100))).toFixed(2);
                            }
                            callback(null, details, toPrint);
                        }
                    })
                    
                }
            })
        }
    });
}

exports.findWriter = (writerId,callback) => {
    let sql ="SELECT * FROM writer JOIN grafei on writer.writer_id = grafei.writer_id WHERE writer.writer_id=?";
    let db = new sqlite3.Database(db_name);
    db.all(sql, [writerId], (err, rows) => {
        db.close();
        if (err) {
            callback(err, null)
        }
        else {
            callback(null, rows)
        }
    })
}

exports.findAllWriters = (callback, where='') =>{
    let sql ="SELECT writer_id,name,image FROM writer " + where;
    let db = new sqlite3.Database(db_name);
    db.all(sql, (err, rows) => {
        db.close();
        if (err) {
            callback(err, null)
        }
        else {
            callback(null, rows)
        }
    })
}

exports.searchIds = (chunk, callback) => {
    let sql ="SELECT DISTINCT book.book_id from (book LEFT JOIN exei on book.book_id = exei.book_id) LEFT JOIN anhkei on book.book_id = anhkei.book_id WHERE book.book_id = '" + chunk + "' or isbn =  '" + chunk + "' or title LIKE '%" + chunk + "%' or genre = '" + chunk + "' or foreign_title LIKE '%" + chunk + "%' or category = '" + chunk + "' or subj = '%" + chunk + "%'";
    let db = new sqlite3.Database(db_name);
    db.all(sql, (err, rows) => {
        db.close();
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, rows);
        }
    })
}

exports.findFilters = (callback, bookIdArray) => {
    let where = ''
    for(let i=0; i < bookIdArray.length; i++){
        if(i !== 0) {
            where = where + ' OR '
        }
        where = where + " book.book_id='" + bookIdArray[i].book_id + "'";
    }

    let sql ="SELECT DISTINCT exei.subj FROM exei JOIN book on exei.book_id=book.book_id where" + where;
    let db = new sqlite3.Database(db_name);
    db.all(sql, (err, subjs) => {
        db.close();
        if (err) {
            callback(err, null, null, null, null, null, null, null);
        }
        else {
            if (subjs.length !== 0) {
                subjs.forEach(item => item.id = item.subj.replace(/ /g, "_"));
            }
            let sql ="SELECT DISTINCT anhkei.genre FROM anhkei JOIN book on anhkei.book_id=book.book_id where" + where;
            let db = new sqlite3.Database(db_name);
            db.all(sql, (err, genreArray) => {
                db.close();
                if (err) {
                    callback(err, null, null, null, null, null, null, null);
                }
                else {
                    if (genreArray.length !== 0) {
                        genreArray.forEach(item => item.id = item.genre.replace(/ /g, "_"));
                    }
                    let sql ="SELECT DISTINCT series FROM book where" + where;
                    let db = new sqlite3.Database(db_name);
                    db.all(sql, (err, seriesArray) => {
                        db.close();
                        if (err) {
                            callback(err, null, null, null, null, null, null, null);
                        }
                        else {
                            let toBeErased = [];
                            seriesArray.forEach(item => {
                                if (item.series)
                                    item.id = item.series.replace(/ /g, "_");
                                else {
                                    toBeErased.push(item);
                                }
                            });

                            toBeErased.forEach( item => {
                                seriesArray.splice(seriesArray.indexOf(item), 1);
                            })

                            let sql ="SELECT DISTINCT age FROM book where" + where;
                            let db = new sqlite3.Database(db_name);
                            db.all(sql, (err, ageArray) => {
                                db.close();
                                if (err) {
                                    callback(err, null, null, null, null, null, null, null);
                                }
                                else {
                                    let toBeErased = [];
                                    ageArray.forEach(item => {
                                        if (item.age)
                                            item.id = item.age.replace(/ /g, "_");
                                        else {
                                            toBeErased.push(item);
                                        }
                                    });

                                    toBeErased.forEach( item => {
                                        ageArray.splice(ageArray.indexOf(item), 1);
                                    })
                                    let sql ="SELECT DISTINCT original_lang FROM book where" + where;
                                    let db = new sqlite3.Database(db_name);
                                    db.all(sql, (err, langArray) => {
                                        db.close();
                                        if (err) {
                                            callback(err, null, null, null, null, null, null, null);
                                        }
                                        else {
                                            let toBeErased = [];
                                            langArray.forEach(item => {
                                                if (item.original_lang)
                                                    item.id = item.original_lang.replace(/ /g, "_");
                                                else {
                                                    toBeErased.push(item);
                                                }
                                            });

                                            toBeErased.forEach( item => {
                                                langArray.splice(langArray.indexOf(item), 1);
                                            })
                                            let greek = 0;
                                            let foreign = 0;
                                            langArray.forEach(item => {
                                                if (item.original_lang == "Ελληνικά") {
                                                    greek = 1;
                                                }
                                                else {
                                                    foreign = 1;
                                                }
                                            })
                                            let sql ="SELECT DISTINCT category FROM book where" + where;
                                            let db = new sqlite3.Database(db_name);
                                            db.all(sql, (err, categoryArray) => {
                                                db.close();
                                                if (err) {
                                                    callback(err, null, null, null, null, null, null, null);
                                                }
                                                else {
                                                    let toBeErased = [];
                                                    categoryArray.forEach(item => {
                                                        if (item.category)
                                                            item.id = item.category.replace(/ /g, "_");
                                                        else {
                                                            toBeErased.push(item);
                                                        }
                                                    });

                                                    toBeErased.forEach( item => {
                                                        categoryArray.splice(categoryArray.indexOf(item), 1);
                                                    })

                                                    let sql ="SELECT DISTINCT desimo FROM book where" + where;
                                                    let db = new sqlite3.Database(db_name);
                                                    db.all(sql, (err, desimoArray) => {
                                                        db.close();
                                                        if (err) {
                                                            callback(err, null, null, null, null, null, null, null);
                                                        }
                                                        else {
                                                            let toBeErased = [];
                                                            desimoArray.forEach(item => {
                                                                if (item.desimo)
                                                                    item.id = item.desimo.replace(/ /g, "_");
                                                                else {
                                                                    toBeErased.push(item);
                                                                }
                                                            });

                                                            toBeErased.forEach( item => {
                                                                desimoArray.splice(desimoArray.indexOf(item), 1);
                                                            })

                                                            callback(null, subjs, genreArray, seriesArray, ageArray, greek, foreign, categoryArray, desimoArray);
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

exports.findVisitor= (email,pass,callback) => {
    let sql ="SELECT email FROM visitor where email=? AND password=? ";
    let db = new sqlite3.Database(db_name);
    db.get(sql,[email,pass], (err, username) => {
        db.close();
        if (err) {
            callback(err, null,null);
        }
        else {
            if(username){
                sql ="SELECT email FROM admin where email=?";
                let db = new sqlite3.Database(db_name);
                db.get(sql,[email], (err, useremail) => {
                    db.close();
                    if (err) {
                        callback(err, null,null);
                    }
                    else{
                        if('hi',useremail){
                            callback(null,username.email, 'admin');
                        }
                        else{
                            callback(null, username.email,null);
                        }
                    }
                })
            }
            else {
                callback(null,null,null);
            }
        }
    })
}
exports.createNewUser = (body, callback) => {
    let sql ="INSERT INTO visitor(email,username,password) VALUES('" + body.email + "', '" + body.user + "', '" + body.pass + "')";
    let db = new sqlite3.Database(db_name);
    try{
        let news;
        db.run(sql,(error) => {
            console.log(error);
        });
        db.close();
        if (body.newsletter){
            news=1;
        }
        else{
            news=0;
        }
        sql ="INSERT INTO user(email, newsletter, birthdate, fullname) VALUES(?,?,?,?)" ;
        db = new sqlite3.Database(db_name);
        db.run(sql,[body.email,news,body.dob,body.user],(error) => {
            console.log(error);
        })
        db.close();
        callback(null,'success');
    } catch(error){
        db.close();
        console.log(error);
        callback('failed',null);
    }
}

exports.addToFavourites = (bookId, email, callback) => {
    let sql ="INSERT INTO wishlist VALUES (?, ?)";
    let db = new sqlite3.Database(db_name);
    try {
        db.run(sql, [email, bookId]);
        db.close;
        callback(null);
    }
    catch (err) {
        callback(err);
    }

}

exports.removeFavourite = (bookId, email, callback) => {
    let sql ="DELETE FROM wishlist WHERE email=? AND book_id=?";
    let db = new sqlite3.Database(db_name);
    try {
        db.run(sql, [email, bookId]);
        db.close;
        callback(null);
    }
    catch (err) {
        db.close;
        callback(err);
    }
}

exports.findFavourites = (email, callback) => {
    let sql ="SELECT wishlist.book_id FROM wishlist JOIN book on wishlist.book_id=book.book_id WHERE email=?";
    let db = new sqlite3.Database(db_name);
    try {
        db.all(sql, [email], (err, rows) => {
            db.close;
            callback(null, rows);
        });
    }
    catch (err) {
        db.close;
        callback(err, null);
    }
}

exports.findPosts = (callback, limit) => {
    let sql ="SELECT * FROM post ORDER BY post_id DESC";
    if (limit) {
        sql = sql + " LIMIT " + limit;
    }
    let db = new sqlite3.Database(db_name);
    try {
        db.all(sql, (err, rows) => {
            if (err) {
                callback(err, null);
            }
            db.close;
            callback(null, rows);
        });
    }
    catch (err) {
        db.close;
        callback(err, null);
    }
}

exports.findAdminBooks = (callback) => {
    let sql ="SELECT * FROM book ORDER BY book_id";
    let db = new sqlite3.Database(db_name);
    try {
        db.all(sql, (err, rows) => {
            if (err) {
                callback(err, null);
            }
            db.close;
            callback(null, rows);
        });
    }
    catch (err) {
        db.close;
        callback(err, null);
    }
}

exports.createNewPost = (body, callback) => {
    let sql ="INSERT INTO post(title, upotitlos, eidos, image, post_text, admin_mail) VALUES (?,?,?,?,?,?)";
    let db = new sqlite3.Database(db_name);
    try {
        db.run(sql, [body.title, body.subtitle, body.post_type, body.input_img, body.article_text, 'art@yahoo.gr'])
        db.close();
        callback(null,'New Post Created');
    } catch(error){
        db.close();
        console.log(error);
        callback('Fail',null);
    }
}

exports.createNewAdmin = (body, callback) => {
    let sql ="INSERT INTO VISITOR(email, username, password) VALUES (?,?,?)";
    let db = new sqlite3.Database(db_name);
    try {
        db.run(sql, [body.email, body.username, body.password])
        db.run("INSERT INTO ADMIN VALUES (?)", [body.email])
        db.close();

        callback(null,'New Admin Created');
    } catch(error){
        db.close();
        console.log(error);
        callback('Fail',null);
    }
}

exports.findAdminUsers = (callback) => {
    let sql ="SELECT admin.email, visitor.username, visitor.password FROM admin JOIN visitor on admin.email = visitor.email";
    let db = new sqlite3.Database(db_name);
    try {
        db.all(sql, (err, rows) => {
            if (err) {
                callback(err, null);
            }
            db.close;
            callback(null, rows);
        });
    }
    catch (err) {
        db.close;
        callback(err, null);
    }
}

exports.deletePost = (postId, callback) => {
    let sql ="DELETE FROM post WHERE post_id=?";
    let db = new sqlite3.Database(db_name);
    try {
        db.run(sql, [postId]);
        db.close;
        callback(null);
    }
    catch (err) {
        db.close;
        callback(err);
    }
}

exports.searchFilters = (books, params, callback) => {
    let ArrSubj = [];
    let ArrGenre = [];
    let ArrDesimo = [];
    let ArrLang = [];
    let ArrAge = [];
    let ArrSeries = [];
    let ArrCat = [];

    params.forEach( item => {
        if(item.cat == 'subj'){
            ArrSubj.push(item.name.replace('_',' '));
        }
        else if (item.cat == 'genre'){
            ArrGenre.push(item.name.replace('_',' '));
        }else if (item.cat == 'desimo'){
            ArrDesimo.push(item.name.replace('_',' '));
        }else if (item.cat == 'original_lang'){
            if(item.name == "Ελληνικά"){
                ArrLang.push('=');
            }else {
                ArrLang.push('<>');
            }
        }else if (item.cat == 'age'){
            ArrAge.push(item.name.replace(/_/g,' '));
        }else if (item.cat == 'series'){
            ArrSeries.push(item.name.replace(/_/g,' '));
        }else if (item.cat == 'category'){
            ArrCat.push(item.name.replace(/_/g,' '));
        }
    })
    let where=" where ("

    books.forEach( item =>{
        where = where +" book.book_id= '" + item.book_id +"' OR"
    })

    where=where.slice(0,-2);
    where=where+" ) ";

    if(ArrDesimo.length !==0 || ArrAge.length !==0 || ArrSeries.length !==0 || ArrCat.length !==0 || ArrLang.length !==0){
        where=where+" AND ( ";
    }
    let counter=0;
    ArrDesimo.forEach( item =>{
        if(counter !==0){
            where=where+" AND"
        }
        counter++;
        where=where+" book.desimo='"+ item +"' ";
    })
    ArrAge.forEach( item =>{
        if(counter !==0){
            where=where+" AND"
        }
        counter++;
        where=where+"  book.age='"+ item +"' ";
    })
    ArrSeries.forEach( item =>{
        if(counter !==0){
            where=where+" AND"
        }
        counter++;
        where=where+"  book.series='"+ item +"' ";
    })
    ArrCat.forEach( item =>{
        if(counter !==0){
            where=where+" AND"
        }
        counter++;
        where=where+"  book.category='"+ item +"' ";
    })
    ArrLang.forEach( item =>{
        if(counter !==0){
            where=where+" AND"
        }
        counter++;
        where=where+"  book.original_lang"+ item +"'Ελληνικά' ";
    })

    if(ArrDesimo.length !==0 || ArrAge.length !==0 || ArrSeries.length !==0 || ArrCat.length !==0 || ArrLang.length !==0){
        where=where+" ) ";
    }
     
    let sql ="SELECT book.book_id ";
    if(ArrSubj.length !== 0){
        sql=sql+' , exei.subj ' 
    }
    if( ArrGenre.length !==0){
        sql=sql+", anhkei.genre "
    }
    sql=sql+' FROM (book '
    let exeiSql='';
    let anhkeiSql='';
    if(ArrSubj.length !== 0){
        exeiSql='  JOIN exei on book.book_id = exei.book_id  ';
    }
    if( ArrGenre.length !==0){
        anhkeiSql=' JOIN anhkei on book.book_id = anhkei.book_id  ';
    }
    if(ArrSubj.length == 0 && ArrGenre.length ==0){
        sql=sql+')'+ where + " ORDER BY book.book_id DESC";
    }else{
        if(!ArrSubj.length == 0 && !ArrGenre.length ==0){
            sql=sql + exeiSql +') ' + anhkeiSql + where + " ORDER BY book.book_id DESC";
        }
        else{
            sql=sql + exeiSql + anhkeiSql +') ' + where + " ORDER BY book.book_id DESC";
        }
    }
    let db = new sqlite3.Database(db_name);
    db.all(sql,(err, rows) => {
        if(err){
            console.log(err);
            callback(err,null);
        }
        else{
            let booksIds=[];
            books.forEach(item =>{
                booksIds.push(item.book_id);
            })
            let i;
            rows.forEach( item => {
                if(booksIds.includes(item.book_id)){
                    i = booksIds.indexOf (item.book_id);
                    if(!books[i].subjects){
                        books[i].subjects = []
                        books[i].genres = []
                    }
                    if(item.subj){
                        if(!books[i].subjects.includes(item.subj)){
                            books[i].subjects.push(item.subj)
                        }
                    }
                    if(item.genre){
                        if(!books[i].genres.includes(item.genre)){
                            books[i].genres.push(item.genre)
                        }
                    }
                }
            })
            let booksToDelete=[];
            books.forEach( item => {
                let flag='keep';
                if(item.subjects == undefined){
                    booksToDelete.push(item);
                } else{
                    if( item.genres.length < ArrGenre.length){
                        booksToDelete.push(item);
                    }else{
                        for(i=0; i<ArrGenre.length; i++){
                            if(!item.genres.includes(ArrGenre[i])){
                                flag='delete';
                            }
                        }
                        if( item.subjects.length < ArrSubj.length){
                            booksToDelete.push(item);
                        }else{
                            for(i=0; i<ArrSubj.length; i++){
                                if(!item.subjects.includes(ArrSubj[i])){
                                    flag='delete';
                                }
                            }
                        }
                    }
                    if(flag=='delete'){
                        booksToDelete.push(item);
                    }
                }
            })
            booksToDelete.forEach( item => {
                books.splice(books.indexOf(item),1);
            })
            callback(null,books)
        }
    })
}

exports.newPassword = (body, email, callback) => {
    let sql ="UPDATE VISITOR SET password=? WHERE email=?";
    let db = new sqlite3.Database(db_name);
    db.get("SELECT password FROM visitor where email='" + email + "'", (err, ans) => {
        if (err) {
            db.close();
            callback(err);
        }
        else {
            if (body.old_password == ans.password) {
                db.run(sql, [body.new_password, email])
                db.close();
                callback(null);
            }
            else {
                db.close();
                callback("wrongPassword");
            }
        }
    })
}

exports.newOrder = (email, books, callback) => {
    dateOfOrder = new Date()
    let sql ="INSERT INTO order VALUES (?, ?)";
    let db = new sqlite3.Database(db_name);
    db.run("SELECT password FROM visitor where email='" + email + "'", (err, ans) => {
        if (err) {
            db.close();
            callback(err);
        }
        else {
            if (body.old_password == ans.password) {
                db.run(sql, [body.new_password, email])
                db.close();
                callback(null);
            }
            else {
                db.close();
                callback("wrongPassword");
            }
        }
    })
}