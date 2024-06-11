import { Router } from "express";
import cartModel from "../models/cart.js";

const cartRouter = Router();

cartRouter.get("/", async (req, res) => {
  try {
    const carts = await cartModel.find({});
    res.status(200).render("templates/cart", { cart: carts[0] });
  } catch (error) {
    res
      .status(500)
      .send(`Error interno del servidor al obtener IDs de carritos: ${error}`);
  }
});

cartRouter.post("/", async (req, res) => {
  try {
    const mensaje = await cartModel.create({ products: [] });
    res.status(201).send(mensaje);
  } catch (e) {
    res.status(500).send(`Error interno del servidor al crear carrito: ${e}`);
  }
});
cartRouter.get("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await cartModel.findOne({ _id: cartId });
    res.status(200).send(cart);
  } catch (error) {
    res
      .status(500)
      .send(`Error interno del servidor al consultar carrito: ${error}`);
  }
});

cartRouter.post("/:cid/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const { quantity } = req.body;
    const cart = await cartModel.findById(cartId);
    
    const existe = cart.products.findIndex(
      (product) => product.id_prod == productId
    );
    if (existe != -1) {
      cart.products[existe].quantity = quantity;
    } else {
      cart.products.push({ id_prod: productId, quantity: quantity });
    }
    const mensaje = await cartModel.findByIdAndUpdate(cartId, cart);
    res.status(200).send(mensaje);
  } catch (error) {
    res
      .status(500)
      .send(`Error interno del servidor al crear producto: ${error}`);
  }
});

cartRouter.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const cart = await cartModel.findById(cartId);
    const index = cart.products.findIndex(
      (product) => product.id_prod == productId
    );
    if (index !== -1) {
      cart.products.splice(index, 1);
      await cartModel.findByIdAndUpdate(cartId, cart);
      res.status(200).send("Producto eliminado del carrito correctamente.");
    } else {
      res.status(404).send("Producto no encontrado en el carrito.");
    }
  } catch (error) {
    res
      .status(500)
      .send("Error interno del servidor al eliminar producto: ", error);
  }
});

cartRouter.put("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const { products } = req.body;
    const cart = await cartModel.findById(cartId);
    cart.products = products;
    const updatedCart = await cartModel.findByIdAndUpdate(cartId, cart, {
      new: true,
    });
    res.status(200).send(updatedCart);
  } catch (e) {
    res
      .status(500)
      .send("Error interno del servidor al actualizar carrito: ", e);
  }
});

cartRouter.put("/:cid/products/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const { quantity } = req.body;
    const cart = await cartModel.findById(cartId);
    const index = cart.products.findIndex(
      (product) => product.id_prod == productId
    );
    if (index !== -1) {
      cart.products[index].quantity = quantity;
      await cartModel.findByIdAndUpdate(cartId, cart);
      res.status(200).send("Cantidad de productos actualizada correctamente. ");
    } else {
      res.status(404).send("Producto no encontrado en el carrito.");
    }
  } catch (e) {
    res
      .status(500)
      .send(
        "Error interno del servidor al actualizar cantidad de producto: ",
        e
      );
  }
});

cartRouter.delete("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await cartModel.findById(cartId);
    cart.products = [];
    await cartModel.findByIdAndUpdate(cartId, cart);
    res
      .status(200)
      .send("Todos los productos han sido eliminados del carrito.");
  } catch (e) {
    res
      .status(500)
      .send(
        "Error interno del servidor al eliminar productos del carrito: ",
        e
      );
  }
});

export default cartRouter;
