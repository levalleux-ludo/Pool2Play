import { expect } from 'chai';
import { getMessage } from './../src/message';

describe('verify message service', function() {
    it('get message', function() {
      let result = getMessage();
      expect(result).equal(`Hello from ${process.env.APP_ID}`);
    }); 
    it('change env and get message', function() {
        const app_id = "987654321";
        process.env.APP_ID = app_id;
        let result = getMessage();
        expect(result).equal(`Hello from ${app_id}`);
    }); 
});
