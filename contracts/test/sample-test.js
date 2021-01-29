const { expect } = require("chai");
const { deployContracts } = require("../scripts/utils");

describe("Greeter", function() {
    it("Should return the new greeting once it's changed", async function() {
        const [greeter] = await deployContracts({ 'Greeter': ["Hello, world!", 12] });

        expect(await greeter.greet()).to.equal("Hello, world!");
        expect((await greeter.nonce()).eq(12)).to.be.true;

        await greeter.setGreeting("Hola, mundo!");
        expect(await greeter.greet()).to.equal("Hola, mundo!");
    });
});