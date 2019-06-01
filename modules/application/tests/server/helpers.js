'use strict';

const should = require('should');
const Promise = require('promise');
const debug = require('debug')('test');

exports.testRequiredError = (document, field, errorsLength) => {
  document[field] = null;

  return Promise.resolve(document.save())
    .then( () => {
      return Promise.reject(new Error(field +' required validation failed'));
    }).catch((err) => {
      debug(err);
      should.exist(err);
      Object.keys(err.errors).length.should.be.exactly(errorsLength ? errorsLength : 1);
      err.errors.should.have.property(field);
    });
};

exports.testUniqueError = (document, field) => {

  return Promise.resolve(document.save())
    .then( () => {
      return Promise.reject(new Error(field +' unique validation failed'));
    }).catch((err) => {
      should.exist(err);
    });
};


exports.streamResponseParser = (res, callback) => {
  //res.setEncoding('binary');
  res.data = '';
  res.on('data', function (chunk) {
    res.data += chunk;
  });
  res.on('end', function () {
    callback(null, JSON.parse(res.data));
  });
};

exports.endRequest = (req) => {
  return new Promise((resolve, reject) => {
    req.end( (err, res) => {
      if (err) {
        debug(err);
        if(res && res.body) {          
          return reject(new Error(JSON.stringify(res.body)));
        }
        return reject(err);
      }
      resolve(res);
    });
  });
};

exports.getCaptcha = (agent) => {
  const req = agent.get('/api/auth/captcha?test=true');
  return exports.endRequest(req);
};

exports.signIn = (agent, credentials, status = 200) => {
  const req = agent.post('/api/login')
    .send(credentials)
    .expect(status);
  return exports.endRequest(req);
};

exports.logOut = (agent) => {
  const req = agent.post('/api/logout');
  return exports.endRequest(req);
};

//alias for logOut method
exports.signOut = exports.logOut;

exports.signUp = (agent, user, status = 200) => {
  const req = agent.post('/api/signup')
    .send(user)
    .expect(status);
  return exports.endRequest(req);

};

exports.matchRegExp = (subString, result) => {
  const patt = new RegExp(subString);
  return patt.test(result);
};
