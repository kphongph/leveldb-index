var levelup = require('levelup');
var subindex = require('./index');

var db = levelup('./databases/pkcourse',{valueEncoding:'json'});
var ndb = subindex(levelup('./databases/pkcourse_n',{valueEncoding:'json'}));

// 13438

var createIndex = function(_db,cb) {
  _db.ensureIndex('schooltime',function(key,value,emit) {
    emit(value.SchoolTimeID);
  },function() {
    console.log('indexed');
    cb();
  });
};

var count = function(db,cb) {
  var count = 0;
  db.createReadStream().on('data',function(data) {
    count++;
  }).on('end',function() {
    cb(count);
  });
}

var dropindex = function(db,view,cb) {
  db.dropIndex(view,function() {
    cb();
  });
}

createIndex(ndb,function() {
  copy(db,ndb,function() {
    console.log('end copy');
    count(ndb,function(c) {
      console.log('ndb',c);
    });
    count(ndb.indexDb,function(c) {
      console.log('ndb.indexDb',c);
    });
  });
});

var copy = function(src,tar,cb) {
  console.log('copy');
  var count = 0;
  var end = false;
  src.createReadStream().on('data',function(data) {
    count++;
    tar.put(data.key,data.value,function(err,result) {
      count--;
      if(count===0 && end) {
        cb();
      }
    });
  }).on('end',function() {
    end=true;
  });
}

