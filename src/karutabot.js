const TeleBot = require("telebot");
const csv = require("csvtojson");
const fs = require("fs");
const gamemaster = require("./gamemaster.js");

const bot = new TeleBot(process.argv[2])

bot.on("text", function (msg) {
  console.log(`[text] ${msg.chat.id} ${msg.text}`);

  user_id = msg.from.id;
  name = msg.from.first_name;
  text = msg.text;

  gm = gamemaster.get(msg.chat.id);
  g = gm[0];
  s = gm[1];

  mondai = g.mondai();
  fuda = msg.text;

  if (fuda.toUpperCase() == mondai["location"].toUpperCase()) succ = true;
  else succ = false;

  s.add(user_id, name, mondai["num"], succ);
});

bot.on("/answer", function (msg) {
  chat_id = msg.chat.id;
  gm = gamemaster.get(chat_id);
  g = gm[0];
  s = gm[1];
  max_mondai = gm[2];

  mondai = g.mondai();
  console.log(mondai);
  if (mondai) {
    seikai = s.succ(mondai["num"]);
    if (seikai.length == 0) {
      bot.sendMessage(chat_id, "正解者はまだいません");
      return;
    }

    var i = 0;
    seikai.forEach((u) => {
      if (i < 10) {
        if (i == 0) {
          msg = `${i + 1}位 ${u["name"]} さん！おめでとうございます！`;
          f = u["time"];
        } else {
          delta = (u["time"] - f) / 1000;
          msg += `\n${i + 1}位 ${u["name"]} さん +${delta}秒`;
        }
      }

      i++;
    });
    bot.sendMessage(chat_id, msg);
  }
  bot.sendPhoto(chat_id, g.seikai(), {
    caption: `${mondai["name"]}\n正解は [${mondai["location"]}]でした`,
  });
});

bot.on("/score", function (msg) {
  _score(msg.chat.id);
});

function _score(chat_id) {
  s = gamemaster.get(chat_id)[1];

  msg = "スコア\n";
  rank = 0;
  score = -1;
  s.total().forEach((u) => {
    if (score != u["score"]) rank += 1;
    msg += `${rank}位 ${u["score"]}点 ${u["name"]}\n`;
    score = u["score"];
  });

  bot.sendMessage(chat_id, msg);
}

function _nextMondai(chat_id) {
  g = gamemaster.get(chat_id)[0];
  max_mondai = gamemaster.get(chat_id)[2];

  mondai = g.next();

  var num = mondai["num"];
  if (num > max_mondai) {
    bot.sendMessage(chat_id, "全問終了です！\nお疲れ様でした〜");
    _score(chat_id, context);
    return;
  }

  if (num == max_mondai) msg = "最後の問題です！";
  else msg = `${num}問目！`;
  bot.sendMessage(chat_id, msg);

  board_path = "output.png";
  g.draw(board_path, function () {
    caption = mondai["name"];
    promise = bot.sendPhoto(chat_id, board_path, { caption: caption });
    return promise.catch((error) => {
      console.log("[error]", error);
      bot.sendMessage(chat_id, `😿 An error ${error} occurred, try again.`);
    });
  });
}

bot.on("/next", function (msg) {
  _nextMondai(msg.chat.id);
});

bot.on("/start", function (msg) {
  chat_id = msg.chat.id;
  max_mondai = 47;

  bot.sendMessage(
    chat_id,
    `ゲームを開始しますー
${max_mondai}問勝負です。
英字数字の２文字でお答えください。
(例: A1)
`
  );

  gamemaster.start(chat_id, "IngressKaruta", 4, max_mondai, function ready() {
    _nextMondai(chat_id);
  });
});

bot.start();
