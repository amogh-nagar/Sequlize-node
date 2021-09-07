const Product = require("../models/product");
const Cart = require("../models/cart");
const Order = require("../models/order");

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  console.log("Id: ", prodId);
  // Product.findAll({where:{id:prodId}})
  Product.findByPk(prodId)
    .then((product) => {
      console.log(product);
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts();
    })
    .then((products) => {
      res.render("shop/cart", {
        path: "cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  let fetchedcart;
  req.user
    .getCart()
    .then((cart) => {
      fetchedcart = cart;
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products) => {
      let product;
      console.log(products);
      if (products.length > 0) {
        product = products[0];
      }
      let newquantity = 1;
      if (product) {
        newquantity = product.cartItem.quantity;
        newquantity++;
        return fetchedcart.addProduct(product, {
          through: { quantity: newquantity },
        });
      }
      return Product.findByPk(prodId).then((product) => {
        return fetchedcart.addProduct(product, {
          through: { quantity: newquantity },
        });
      });
    })
    .then((response) => {
      console.log(response);
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products) => {
      let product = products[0];
      if (product.cartItem.quantity === 1) {
        return product.cartItem.destroy();
      } else {
        product.cartItem.quantity--;
        return product.cartItem.save();
      }
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({include:["products"]})
    .then((orders) => {
      console.log(orders);
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders:orders
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postorder = (req, res, next) => {
  let prods, fetchedcart;
  req.user
    .getCart()
    .then((cart) => {
      fetchedcart = cart;
      return cart.getProducts();
    })
    .then((products) => {
      prods = products;
      return req.user.createOrder();
    })
    .then((order) => {
      return order.addProducts(
        prods.map((prod) => {
          prod.orderItem = {
            quantity: prod.cartItem.quantity,
          };
          return prod;
        })
      );
    })
    .then((result) => {
      return fetchedcart.setProducts(null);
    })
    .then((result) => {
      res.redirect("/orders");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};
