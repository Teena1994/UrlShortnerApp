
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../index');
var mocksuccessUrl = 'https://www.google.com/search?q=dogs';
var mockfailureUrl = 'https://en.wikipedia.org/wiki/Human';
const expect = chai.expect;

chai.use(chaiHttp);

/*
* Test the /POST route
*/
describe('POST API to check and fetch short url for the provided long url - success scenario', () => {
  it('should return a 200 status code and expected response', (done) => {
    chai.request(server)
      .post('/api/shortenUrl')
      .query({ url: mocksuccessUrl })
      .end((err, res) => {

        expect(res).to.have.status(200);

        if (err) {
          done(err); 
        } else {
          chai.expect(res).to.have.status(200);
          chai.expect(res.body).to.be.an('object');
          chai.expect(res.body).to.have.property('success').to.equal(true);
          chai.expect(res.body).to.have.property('shortUrl').to.be.a('string');
          chai.expect(res.body).to.have.property('orginalUrl').to.equal(mocksuccessUrl);
          chai.expect(res.body).to.have.property('updatedDate').to.be.a('string');
          done();
        }
      });
  });
});

describe('POST API to check and fetch short url for the provided long url - error scenario', () => {
  it('should return a 400 status code and expected response', (done) => {
    chai.request(server)
      .post('/api/shortenUrl')
      .query({ url: mockfailureUrl })
      .end((err, res) => {

        expect(res).to.have.status(400);

        if (err) {
          done(err); 
        } else {
          chai.expect(res).to.have.status(400);
          chai.expect(res.body).to.be.an('object');
          chai.expect(res.body).to.have.property('success').to.equal(false);
          chai.expect(res.body).to.have.property('error_message');
          chai.expect(res.body).to.have.property('error_code');
          done();
        }
      });
  });
});