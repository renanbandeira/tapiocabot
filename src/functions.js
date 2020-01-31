function formatDate(date) {
  return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
}

function getOrdersFromDay(msg, ordersRef, bot, date) {
  ordersRef.child(date).once('value').then(function(snapshot) {
    const orders = snapshot.val() || {};
    console.log('orders', orders);
    let ordersString = "Pedidos (" + date + ")";
    let total = 0;
    if (Object.keys(orders).length === 0) {
      ordersString += "\n Sem pedidos para essa data";
    }
    Object.keys(orders).forEach(orderKey => {
      ordersString += "\n" + orderKey + " - " + orders[orderKey];
      total += orders[orderKey];
    });
    ordersString += "\n\n Total: " + total + " tapiocas";
    bot.sendMessage(msg.chat.id, ordersString);
  });
}

module.exports = {
  listOrders: function(msg, ordersRef, bot) {
    const today = new Date();
    const tomorrow = new Date();
    let date = formatDate(today);
    let dateShouldBeDifferentThanToday = today.getHours() >= 12;
    if (today.getDay() >= 5) {
      dateShouldBeDifferentThanToday = true;
      const nextDay = 8 - today.getDay();
      tomorrow.setDate(today.getDate() + nextDay);
    } else {
      dateShouldBeDifferentThanToday = dateShouldBeDifferentThanToday || today.getDay() === 0;
      tomorrow.setDate(today.getDate() + 1);
    }
    if (dateShouldBeDifferentThanToday) {
      date = formatDate(tomorrow);
    }
    getOrdersFromDay(msg, ordersRef, bot, date);
  },
  addOrder: function(msg, orderQty, ordersRef, bot, user) {
    let qty = Number(orderQty);
    const userName = user ? user : msg.from.first_name;
    const today = new Date();
    const tomorrow = new Date();
    let dayString = 'amanhã';
    let date = formatDate(today);
    let dateShouldBeDifferentThanToday = today.getHours() >= 12;
    let msgToAnswer = "Então, vou dar um jeitinho pra reservar pra ti ainda hoje (";
    if (today.getDay() >= 5) {
      dateShouldBeDifferentThanToday = true;
      const nextDay = 8 - today.getDay();
      dayString = 'segunda';
      tomorrow.setDate(today.getDate() + nextDay);
    } else {
      dateShouldBeDifferentThanToday = dateShouldBeDifferentThanToday || today.getDay() === 0;
      tomorrow.setDate(today.getDate() + 1);
    }
    if (dateShouldBeDifferentThanToday) {
      date = formatDate(tomorrow);
      msgToAnswer = "Blz ma, vou registrar pra " + dayString + " (";
    }
    if (qty <= 0) {
      qty = null;
      bot.sendMessage(msg.chat.id, "Tranquilo, man. Vou cancelar teu pedido");
    } else if (qty > 30){
      bot.sendMessage(msg.chat.id, "Vai, guloso..a produção não dá pra fazer tanto assim não =/ Máx: 30");
      return;
    } else {
      bot.sendMessage(msg.chat.id, msgToAnswer + date + ")");
    }
    ordersRef.child(date).child(userName).set(qty, function(error) {
      if (!error) {
        getOrdersFromDay(msg, ordersRef, bot, date);
      } else {
        console.log('error 2', error);
      }
    });
    // getOrdersFromDay(msg, ordersRef, bot, date);
  }
}
