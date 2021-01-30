import { RootController } from '../src/api.controllers/rootController';
import { TestController } from '../src/api.controllers/testController';
import { ApiServer } from './../src/server';
import chai from 'chai';
import chaiHttp from 'chai-http';
import 'mocha';

chai.use(chaiHttp);
const expect = chai.expect;

describe('Hello API Request', () => {
    const testController = new TestController();
    const rootController = new RootController();
    const server = new ApiServer([rootController, testController]);
    server.start();

  it('GET test', () => {
    return chai.request(server.app).get('/test')
      .then(res => {
        chai.expect(res.body).to.eql({message: "OK"});
      })
  })

  it('GET root', () => {
    return chai.request(server.app).get('')
      .then(res => {
        chai.expect(res.text).to.eql(`Hello from ${process.env.APP_ID}`);
      })
  })

})