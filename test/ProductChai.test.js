import mongoose from "mongoose";
import userModel from "../src/models/product.js";
import chai from "chai";
const expect = chai.expect;

await mongoose.connect(
  `mongodb+srv://lautarogerman3:coderhouse@cluster0.d91x4c9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
);

describe("Test CRUD de productos en la ruta /api/products", function () {
  before(() => {
    console.log("Arrancando el test");
  });
  beforeEach(() => {
    console.log("Comienza el test!");
  });

  it("Obtener todos los productos mediante el metodo GET", async () => {
    const products = await userModel.find();

  
    expect(products).not.to.be.deep.equal([]); 
  

  it("Obtener un producto dado su id mediante el metodo GET", async () => {
    const product = await userModel.findById("65ea8714a7f0b8549e4514ea");
    expect(product).to.have.property("_id");
  });


})
}
)