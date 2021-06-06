// ------------Homepage Containers----------------
const bookContainers = document.querySelectorAll(".book-container");
const newBooks = document.querySelectorAll("#new-books-container .book-box");
const bestSellers = document.querySelectorAll("#bestsellers-container .book-box");

//---------First 4 books show after load----------
let newBooksCounter = 1;
for (let i=0; i < 4 * newBooksCounter; i++) {
    newBooks[i].classList.add("displayed-book");
}

let bestsellersCounter = 1;
for (let i=0; i < 4 * bestsellersCounter; i++) {
    bestSellers[i].classList.add("displayed-book");
}

//---------------Creating arrows------------------
bookContainers.forEach(item => {
    //Previous Button
    let previous = document.createElement("button");
    previous.innerHTML = "<";
    previous.classList.add("prev-btn");
    item.appendChild(previous);
    previous.onclick = prevFunction;

    //Next Button
    let next = document.createElement("button");
    next.innerHTML = ">";
    next.classList.add("next-btn");
    next.onclick = nextFunction;

    let btnBlock = document.createElement("div");
    btnBlock.classList.add("btn-div");
    btnBlock.appendChild(previous);
    btnBlock.appendChild(next);
    item.appendChild(btnBlock);
});

function prevFunction() {
    let container;
    if (this.parentNode.parentNode.id == "new-books-container") {
        container = newBooks;
    }
    else {
        container = bestSellers;
    }
    for (let i = 0; i < container.length; i++) {
        if (container[i].getAttribute("class").includes("displayed-book")) {
            container.forEach(item => item.classList.remove("displayed-book"))
            //Το i μας δείχνει το index του πρώτου βιβλίου που εμφανιζόταν έως τώρα
            //Αν είναι 8, θέλουμε πρώτο βιβλίο που θα εμφανιστεί να είναι το 4.
            //Αν είναι 4, θέλουμε το 0 και αν είναι το 0 θέλουμε το 8.
            //Άρα το πρώτο βιβλίο που πρέπει να εμφανιστεί τώρα είναι το (i + 8) % 12 (αφού όλα τα βιβλία είναι 12)
            displayBooks((i + 8) % 12, container);
            break;
        }
    }
}

function nextFunction() {
    let container;
    if (this.parentNode.parentNode.id == "new-books-container") {
        container = newBooks;
    }
    else {
        container = bestSellers;
    }
    for (let i = 0; i < container.length; i++) {
        if (container[i].getAttribute("class").includes("displayed-book")) {
            container.forEach(item => item.classList.remove("displayed-book"))
            //Το i μας δείχνει το index του πρώτου βιβλίου που εμφανιζόταν έως τώρα
            //Άρα το πρώτο βιβλίο που πρέπει να εμφανιστεί τώρα είναι το (i + 4) % 12 (αφού όλα τα βιβλία είναι 12)
            displayBooks((i + 4) % 12, container);
            break;
        }
    }
}

function displayBooks(firstBookIndex, container) {
    for (let i = firstBookIndex; i < firstBookIndex + 4; i++) {
        container[i].classList.add("displayed-book");
    }
}