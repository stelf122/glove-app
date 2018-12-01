var {User} = require('../server/models/user');

require('../server/db/mongoose')

var user = new User({
    phone: '+380930000000'
});

user.save().then((doc) => {
    console.log(doc);
}, (e) => {
    console.log(e);
});