const mongoose = require('mongoose');

// const loginSchema = new mongoose.Schema({

//     first_name: {
//         type: String,
//         required: true
//     },
//     last_name: {
//         type: String,
//         required: true
//     },
//     email: {
//         type: String,
//         required: true
//     },
//     gender: {
//         type: String,
//         required: true
//     },

// })

const Signup = new mongoose.Schema({

    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword: {
        type: String,
        required: true
    },
    promocode: {
        type: String,
    }

})

// const collection = new mongoose.model('user', loginSchema);
const data = new mongoose.model('signup', Signup);

// module.exports = collection;
module.exports = data;