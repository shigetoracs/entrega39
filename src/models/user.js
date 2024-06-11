import { Schema, model } from "mongoose";
import cartModel from "./cart.js";

const userSchema = new Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    index: true,
  },
  rol: {
    type: String,
    default: "user",
  },
  cart_id: {
    type: Schema.Types.ObjectId,
    ref: "carts",
  },
});

userSchema.pre("save", async function (next) {
  try {
    const newCart = await cartModel.create({ products: [] });
    console.log(newCart);
    this.cart_id = newCart._id;
  } catch (e) {
    next(e);
  }
});

userSchema.pre("find", async function (next) {
  try {
    const prods = await cartModel.findOne({ _id: "65eaad7377b9e0652a86d7b7" });
    console.log(prods);
    this.populate("cart_id");
  } catch (e) {
    next(e);
  }
});

export const userModel = model("users", userSchema);
