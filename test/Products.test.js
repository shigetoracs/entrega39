import mongoose from "mongoose";
import userModel from "../src/models/product.js";
import Assert from "assert";

const assert = Assert.strict;

await mongoose.connect(
  `mongodb+srv://lautarogerman3:coderhouse@cluster0.d91x4c9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
);

describe("Test CRUD de los productos en la ruta /api/products", function () {
  before(() => {
    console.log("Comienza el test de CRUD");
  });

  beforeEach(() => {
    console.log("arranca test individual");
  });

  it("Obtener todos los productos mediante el metodo GET", async () => {
    const products = await userModel.find();

    assert.strictEqual(Array.isArray(products), true);
  });
  it("Obtener un producto dado su id mediante el metodo GET", async () => {
    const product = await userModel.findById("65ea8714a7f0b8549e4514ea");
    assert.ok(product._id);
  })
})

  