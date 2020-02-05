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

bot.onText(/\/pedidos/, (msg, match) => {
  console.log('user id', msg.from.id);
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

bot.onText(/quero (\D+)/, (msg, match) => {
  bot.sendMessage(msg.chat.id, "Isso é um NaN, man! Só aceito dígito pra pedir tapioca", { reply_to_message_id: msg.message_id });
});

bot.onText(/Quero (\D+)/, (msg, match) => {
  bot.sendMessage(msg.chat.id, "Isso é um NaN, man! Só aceito dígito pra pedir tapioca", { reply_to_message_id: msg.message_id });
});

bot.onText(/\/cobrar/, (msg) => {
  bot.sendMessage(msg.chat.id, "Ei galera, esquece de pagar não =) ");
  bot.sendMessage(msg.chat.id, "PicPay? " + "https://picpay.me/renanbandeira/2.0");
  bot.sendMessage(msg.chat.id, "Nubank? " + "https://nubank.com.br/pagar/p7t4/Y0o8CQgqcr");
  bot.sendMessage(msg.chat.id, "MercadoPago? " + "http://mpago.la/3FHdLZ");
  bot.sendMessage(msg.chat.id, "Se quiser deixar um valor de saldo pra pedidos, pode ficar à vontade tb :)");
});

bot.on('location', (msg) => {
  console.log('received live location');
  bot.sendMessage(msg.chat.id, "Seu pedido está indo até você");
});

bot.onText(/\/quero/, (msg, match) => {
  const textMessage = msg.text || '';
  if (textMessage === '\/quero' || textMessage === '\/quero@tapioca_bot') {
    login();
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log('user is signed in');
        operations.addOrder(msg, 1, ordersRef, bot);
      } else {
        console.log('user is signed out');
      }
    });
  }
});

bot.onText(/\/pedir (\d+) (.+)/, (msg, match) => {
  if (msg.from.id != 174773484) {
    console.log('Usuário não é o admin');
    return;
  }
  login();
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log('user is signed in');
      operations.addOrder(msg, match[1], ordersRef, bot, match[2]);
    } else {
      console.log('user is signed out');
    }
  });
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

bot.onText(/Quero (\d+)/, (msg, match) => {
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

module.exports = (req, res) => {
  res.status(200).send("Bot is UP");
};
