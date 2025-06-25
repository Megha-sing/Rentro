const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const {default: mongoose} = require('mongoose');
const multer = require('multer');

const DB_PATH = "mongodb+srv://root:root@codehike.ecoyqup.mongodb.net/airbnb?retryWrites=true&w=majority&appName=codeHike"

const path = require('path');

const rootDir = require('./utils/pathUtil');
const authRouter = require('./routes/authRouter');
const storeRouter = require('./routes/storeRouter');
const hostRouter = require('./routes/hostRouter');
const errorsController = require('./controllers/errors');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const store = new MongoDBStore({
    uri: DB_PATH,
    collection: 'session'
})

app.use(express.static(path.join(rootDir, 'public')));
app.use('/uploads', express.static(path.join(rootDir, "uploads")));
app.use('/host/uploads', express.static(path.join(rootDir, "uploads")));
app.use('/homes/uploads', express.static(path.join(rootDir, "uploads")));

app.use(express.urlencoded());

const randomString = (lenght) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for(let i = 0; i < lenght; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result; 
}

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, randomString(10) + '-' + file.originalname);
    }
});


const multerOptions = {
    // dest: 'uploads/'
    storage, fileFilter
}

// const docsStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "rules/");
//     },
//     filename: (req, file, cb) => {
//         cb(null, randomString(10) + '-' + file.originalname);
//     }
// });

// const docsFilter = (req, file, cb) => {
//     if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' ||
//         file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
//         cb(null, true);
//     } else {
//         cb(null, false);
//     }
// }

// const multerOptionsDocs = {
//     storage: docsStorage, fileFilter: docsFilter
// }

app.use(multer(multerOptions).single('photo'));
// app.use(multer(multerOptionsDocs).single('document'));

app.use(session({
    secret: 'codeHike',
    resave: false,
    saveUninitialized: true,
    store: store,
}))

// Alternative to session 
// app.use((req, res, next) => {
//     req.isLoggedIn = req.session.isLoggedIn;
//     next();
// })

app.use(authRouter);
app.use(storeRouter);
app.use('/host', (req, res, next) => {
    if(req.session.isLoggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
});
app.use('/host', hostRouter);

app.use(errorsController.pageNotFound);

const PORT = 3000;

mongoose.connect(DB_PATH).then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on: http://localhost:${PORT}`);
    });
}).catch(err => {
    console.log('Error while connecting to Mongo', err);
})
