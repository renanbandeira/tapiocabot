const TelegramBot = require('node-telegram-bot-api');
const firebase = require('firebase');


const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, {polling: true});
const operations = require('./functions');

const firebaseConfig = require('./security/firebaseConfig');
const auth = {
  email: process.env.EMAIL,
  password: process.env.PASSWORD
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

function login() {
  return firebase.auth().signInWithEmailAndPassword(auth.email, auth.password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.error("Error while singing in: " + error.code);
    console.error(error.message);
  });
}

const ref = firebase.database().ref();
const ordersRef = ref.child("orders");

/*
function listOrders(msg) {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  let date = formatDate(today);
  if (today.getHours() >= 8) {
    date = formatDate(tomorrow);
  }

  ordersRef.child(date).once('value').then(function(snapshot) {
    const orders = snapshot.val() || [];
    console.log(orders);
    let ordersString = "Pedidos (" + date + ")";
    orders.forEach(order => {
      ordersString += "\n" + order.name + " - " + order.qty;
    });
    bot.sendMessage(msg.chat.id, ordersString);
  });
}


function addOrder(msg, orderQty) {
  const userName = msg.from.first_name;
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  let date = formatDate(today);
  if (today.getHours() < 8) {
    bot.sendMessage(msg.chat.id, "Então, vou dar um jeitinho pra reservar pra ti ainda hoje (" +
      date +")");
  } else {
    date = formatDate(tomorrow);
    bot.sendMessage(msg.chat.id, "Blz ma, vou registrar pra amanhã (" +
      date +")");
  }

  ordersRef.child(date).push().set({
    name: userName,
    qty: orderQty
  });

  ordersRef.child(date).once('value').then(function(snapshot) {
    const orders = snapshot.val() || [];
    console.log(orders);
    let ordersString = "Pedidos (" + date + ")";
    orders.forEach(order => {
      ordersString += "\n" + order.name + " - " + order.qty;
    });
    bot.sendMessage(msg.chat.id, ordersString);
  });
}

*/

bot.onText(/\/pedidos/, (msg, match) => {
  login();
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log('user is signed in');
      operations.listOrders(msg, ordersRef, bot);
    } else {
      console.log('user is signed out');
    }
  });
});

bot.onText(/\/quero (\D+)/, (msg, match) => {
  bot.sendMessage(msg.chat.id, "Isso é um NaN, man! Só aceito dígito pra pedir tapioca", { reply_to_message_id: msg.message_id });
});

bot.onText(/\/cobrar/, (msg) => {
  bot.sendMessage(msg.chat.id, "Ei galera, esquece de pagar não =) " + "https://picpay.me/renanbandeira");
});

bot.on('location', (msg) => {
  console.log('received live location');
  bot.sendMessage(msg.chat.id, "Seu pedido está indo até você");
});

bot.onText(/\/quero (\d+)/, (msg, match) => {
  login();
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log('user is signed in');
      operations.addOrder(msg, match[1], ordersRef, bot);
    } else {
      console.log('user is signed out');
    }
  });
});
