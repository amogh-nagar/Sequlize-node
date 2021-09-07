const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const sequelize = require("./util/database");
const app = express();

const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const OrderItem = require("./models/order-item");

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const Order = require("./models/order");

// db.execute("SELECT * FROM products")
//   .then((data) => {
//     console.log(data[0]);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      //sequelize object
      req.user = user;

      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
User.hasMany(Order)
Order.belongsTo(User)
Order.belongsToMany(Product,{through:OrderItem})
Product.belongsToMany(Order,{through:OrderItem})


sequelize
    // .sync({ force: true })
  .sync()
  .then((result) => {
    // console.log(result);
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: "Mamta", email: "m@gmail.com" });
    }
    return user;
  })
  .then((user) => {
    // console.log(user);
    Cart.findByPk(1).then((cart) => {
      if (!cart) {
        return user.createCart();
      }
      return cart;
    });
  })
  .then((cart) => {
    app.listen(3000, () => {
      console.log("Conected!");
    });
  })
  .catch((err) => {
    console.log(err);
  });
