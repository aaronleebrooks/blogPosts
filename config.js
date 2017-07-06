exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://aaron:aaron@ds145292.mlab.com:45292/blogposts';
exports.PORT = process.env.PORT || 8080;