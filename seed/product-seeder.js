var Product = require('../models/product');

var mongoose = require('mongoose');
mongoose.connect('127.0.0.1:27017/my-shopping');

var products = [new Product({
        imagePath: '/images/Tom Clancy\'s Rainbow Six Siege.jpg',
        title: 'Tom Clancy\'s Rainbow Six Siege',
        description: 'Tom Clancy\'s Rainbow Six Siege is a tactical shooter video game developed by Ubisoft Montreal and published by Ubisoft.Itwas released worldwide on December 2015for Microsoft Windows,PlayStation 4 and Xbox One.',
        price: 12
    }),
    new Product({
        imagePath: "/images/Call of Duty_WWII.jpg",
        title: 'Call of Duty: WWII',
        description: 'Call of Duty: WWII is a first-person shooter video game developed by Sledgehammer Games and published by Activision. It is the fourteenth main installment in the Call of Duty series and was released worldwide on November 3, 2017 for Microsoft Windows, PlayStation 4 and Xbox One.',
        price: 20
    }),
    new Product({
        imagePath: "/images/Battlefield 4.jpg",
        title: 'Battlefield 4',
        description: 'Battlefield 4 is a first-person shooter video game developed by video game developer EA DICE and published by Electronic Arts. It is a sequel to 2011\'s Battlefield 3 and was released on October 29,2013 in North America,October 31,2013,in Australia,November 1,2013,in Europe and New Zealand and November 7,2013,in Japan for Microsoft Windows,PlayStation 3,PlayStation 4,Xbox 360 and Xbox One.',
        price: 17
    }),
    new Product({
        imagePath: "/images/Overwatch.jpg",
        title: 'Overwatch',
        description: 'Overwatch is a team-based multiplayer online first-person shooter video game developed and published by Blizzard Entertainment. It was released in May 2016 for Windows, PlayStation 4, and Xbox One.',
        price: 15
    }),
    new Product({
        imagePath: "/images/Counter-Strike_Global Offensive.jpg",
        title: 'Counter-Strike: Global Offensive',
        description: 'ounter-Strike: Global Offensive (CS:GO) is a multiplayer first-person shooter video game developed by Hidden Path Entertainment and Valve Corporation. It is the fourth game in the Counter-Strike series and was released for Microsoft Windows, OS X, Xbox 360, and PlayStation 3 in August 2012, with the Linux version released in September 2014.',
        price: 7
    }),
    new Product({
        imagePath: "/images/Left 4 Dead 2.jpg",
        title: 'Left 4 Dead 2',
        description: 'Left 4 Dead 2 is a cooperative first-person shooter video game developed and published by Valve Corporation. The sequel to Turtle Rock Studios\'s Left 4 Dead,the game released for Microsoft Windows and Xbox 360 in November 2009,and for OS X in October 2010,and for Linux in July 2013.',
        price: 8
    }),
];

var done = 0;

for (var i = 0; i < products.length; i++) {
    products[i].save(function(err, result) {
        done++;
        if (done === products.length)
            exit();
    });
}

function exit() {
    mongoose.disconnect();
}